/* The Shortlist backend — Apps Script web app (Execute as: Me, Access: Anyone).
   No Sheet: everything lives in Script Properties, one key per student and per panel, so 30 phones never queue.
   The designer's notes live in a second, PRIVATE script file Notes.gs (var NOTES = {...}); it is not in the repo.

   Keys: state            {phase, endsAt, running, epoch, decision, notes, phaseMin}
         I:<name>         one student's Round 1 ranking {name, panel, order[10], flags[], auto, at}
         H:<panel>        head of panel's name
         P:<panel>        the panel's submission {panel, head, members[], order[10], reasons{s,o2,o3}, recs{id:[rid]}, auto, at}

   GET  ?action=state | panel&panel=N | board
   POST (text/plain JSON) register, setPanel, individual, claimHead, panel, phase, stop, decision, notes, reset */
var P = PropertiesService.getScriptProperties();
var PHASES = ['lobby', 'r1', 'r2', 'r3', 'done'];

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function st_() {
  var s = P.getProperty('state');
  s = s ? JSON.parse(s) : {phase: 'lobby', endsAt: 0, running: false, epoch: '1', decision: null, notes: false};
  if (s.running && s.endsAt && Date.now() > s.endsAt) s.running = false;
  return s;
}
function save_(s) { P.setProperty('state', JSON.stringify(s)); }
function key_(name) { return 'I:' + String(name).toLowerCase(); }
function clean_(t, n) { return String(t == null ? '' : t).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }
function panelNo_(p) { p = String(parseInt(p, 10)); return /^(10|[1-9])$/.test(p) ? p : ''; }
function order_(a) {
  if (!a || a.length !== 10) return null;
  var seen = {}, o = [];
  for (var i = 0; i < 10; i++) { var id = String(a[i]); if (!/^c\d\d$/.test(id) || seen[id]) return null; seen[id] = 1; o.push(id); }
  return o;
}
function ids_(a, max) { var o = []; (a || []).forEach(function (x) { x = String(x); if (/^c\d\d$/.test(x) && o.indexOf(x) < 0) o.push(x); }); return o.slice(0, max); }
function all_() {
  var all = P.getProperties(), ind = [], pan = [], heads = {};
  for (var k in all) {
    try {
      if (k.indexOf('I:') === 0) ind.push(JSON.parse(all[k]));
      else if (k.indexOf('P:') === 0) pan.push(JSON.parse(all[k]));
      else if (k.indexOf('H:') === 0) heads[k.slice(2)] = all[k];
    } catch (err) {}
  }
  return {ind: ind, pan: pan, heads: heads};
}

function doGet(e) {
  var p = (e && e.parameter) || {}, a = p.action || 'state', s = st_();
  if (a === 'state') return out({ok: true, state: s, now: Date.now()});
  var A = all_();
  if (a === 'panel') {
    var pn = panelNo_(p.panel);
    var members = A.ind.filter(function (m) { return String(m.panel) === pn; });
    var sub = A.pan.filter(function (x) { return String(x.panel) === pn; })[0] || null;
    return out({ok: true, panel: pn, members: members, head: A.heads[pn] || null, submission: sub, state: s, now: Date.now()});
  }
  if (a === 'board') {
    var notes = (s.notes && typeof NOTES !== 'undefined') ? NOTES : null;
    return out({ok: true, state: s, individuals: A.ind, panels: A.pan, heads: A.heads, notes: notes, now: Date.now()});
  }
  return out({ok: false, error: 'unknown action'});
}

function doPost(e) {
  var b = {};
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ok: false, error: 'bad json'}); }
  var a = b.action, s = st_();
  // student actions carry the game epoch; a stale phone is told to start again
  if (['individual', 'setPanel', 'claimHead', 'panel'].indexOf(a) > -1 && b.epoch && String(b.epoch) !== String(s.epoch))
    return out({ok: true, stale: true, state: s, now: Date.now()});

  if (a === 'register' || a === 'setPanel') {
    var name = clean_(b.name, 20), pn = panelNo_(b.panel);
    if (!name || !pn) return out({ok: false, error: 'name and panel 1-10 needed'});
    var k = key_(name), cur = P.getProperty(k), rec = cur ? JSON.parse(cur) : {name: name, order: null, flags: []};
    rec.name = name; rec.panel = pn; rec.at = rec.at || Date.now();
    P.setProperty(k, JSON.stringify(rec));
    return out({ok: true, state: s, now: Date.now(), saved: rec});
  }
  if (a === 'individual') {
    var nm = clean_(b.name, 20), o = order_(b.order), pn2 = panelNo_(b.panel);
    if (!nm || !o) return out({ok: false, error: 'bad ranking'});
    var k2 = key_(nm), old = P.getProperty(k2), r2 = old ? JSON.parse(old) : {name: nm};
    r2.name = nm; r2.panel = pn2 || r2.panel; r2.order = o; r2.flags = ids_(b.flags, 10); r2.auto = !!b.auto; r2.at = Date.now();
    P.setProperty(k2, JSON.stringify(r2));
    return out({ok: true, now: Date.now()});
  }
  if (a === 'claimHead') {
    var pn3 = panelNo_(b.panel), who = clean_(b.name, 20);
    if (!pn3 || !who) return out({ok: false, error: 'panel and name needed'});
    var lock = LockService.getScriptLock(); lock.waitLock(8000);
    try {
      var h = P.getProperty('H:' + pn3);
      if (h && h.toLowerCase() !== who.toLowerCase()) return out({ok: false, head: h});
      P.setProperty('H:' + pn3, who);
      return out({ok: true, head: who});
    } finally { lock.releaseLock(); }
  }
  if (a === 'panel') {
    var pn4 = panelNo_(b.panel), hd = clean_(b.head, 20), o4 = order_(b.order);
    if (!pn4 || !hd || !o4) return out({ok: false, error: 'bad panel submission'});
    var cur4 = P.getProperty('H:' + pn4);
    if (cur4 && cur4.toLowerCase() !== hd.toLowerCase()) return out({ok: false, head: cur4});
    if (!cur4) P.setProperty('H:' + pn4, hd);
    var rs = b.reasons || {}, recs = {}, rin = b.recs || {};
    o4.slice(7).forEach(function (id) { recs[id] = (rin[id] || []).map(String).filter(function (x) { return /^r\d{1,2}$/.test(x); }).slice(0, 2); });
    var sub = {panel: pn4, head: hd, members: (b.members || []).map(function (m) { return clean_(m, 20); }).filter(String).slice(0, 4),
               order: o4, reasons: {s: clean_(rs.s, 600), o2: clean_(rs.o2, 600), o3: clean_(rs.o3, 600)}, recs: recs, auto: !!b.auto, at: Date.now()};
    P.setProperty('P:' + pn4, JSON.stringify(sub));
    return out({ok: true, now: Date.now()});
  }
  // ---- teacher actions ----
  if (a === 'phase') {
    if (PHASES.indexOf(b.phase) < 0) return out({ok: false, error: 'bad phase'});
    var m = Math.max(0, Math.min(60, Number(b.minutes) || 0));
    s.phase = b.phase; s.phaseMin = m; s.running = m > 0; s.endsAt = m > 0 ? Date.now() + m * 60000 : 0;
    save_(s); return out({ok: true, state: s, now: Date.now()});
  }
  if (a === 'stop') { s.running = false; s.endsAt = Math.min(s.endsAt || Date.now(), Date.now()); save_(s); return out({ok: true, state: s, now: Date.now()}); }
  if (a === 'decision') {
    var offers = ids_(b.offers, 3), sch = String(b.scholar || '');
    if (offers.length && offers.indexOf(sch) < 0) return out({ok: false, error: 'scholar must be one of the offers'});
    s.decision = offers.length ? {offers: offers, scholar: sch} : null; save_(s); return out({ok: true, state: s});
  }
  if (a === 'notes') { s.notes = !!b.on; save_(s); return out({ok: true, state: s}); }
  if (a === 'reset') {
    var ep = String(Number(s.epoch || 1) + 1);
    P.deleteAllProperties();
    save_({phase: 'lobby', endsAt: 0, running: false, epoch: ep, decision: null, notes: false});
    return out({ok: true});
  }
  return out({ok: false, error: 'unknown action'});
}
