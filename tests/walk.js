/* Full class walk: teacher board + 6 phones in two panels, against the mock backend.
   node tests/walk.js   (serve the folder first: python3 -m http.server 8765) */
const { chromium } = require('playwright');
const { make } = require('./mock-gas');
const BASE = 'http://127.0.0.1:8765/', EXEC = 'https://script.google.com/macros/s/TEST/exec';
const OUT = process.env.OUT || '/tmp/sl-shots';
const gas = make(process.env.NOTES || '/home/claude/shortlist-private/Notes.gs');
require('fs').mkdirSync(OUT, { recursive: true });
const errors = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

async function ctxFor(browser, opts){
  const ctx = await browser.newContext(opts);
  await ctx.route('**/config.js*', r => r.fulfill({ contentType: 'application/javascript', body: `window.API_URL='${EXEC}';window.APP_URL='https://pegasus028.github.io/Shortlist/';` }));
  await ctx.route(EXEC + '**', async r => { const q = r.request(); r.fulfill({ contentType: 'application/json', body: gas.handle(q.method(), q.url(), q.postData()) }); });
  await ctx.addInitScript(() => {
    window.__plays = 0; window.__synth = 0;
    HTMLMediaElement.prototype.play = function(){ window.__plays++; const a = this; setTimeout(() => a.dispatchEvent(new Event('ended')), 50); return Promise.resolve(); };
    HTMLMediaElement.prototype.pause = function(){};
    try { speechSynthesis.speak = () => { window.__synth++; }; } catch (e) {}
  });
  return ctx;
}
async function phone(browser, name){
  const ctx = await ctxFor(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(name + ': ' + e.message));
  p.on('dialog', d => d.accept(d.type() === 'prompt' ? '5' : undefined));
  await p.goto(BASE + 'index.html'); return p;
}
async function overflow(p, label){ const w = await p.evaluate(() => document.documentElement.scrollWidth); check(w <= 390, `${label}: no horizontal overflow (${w})`); }

(async () => {
  const browser = await chromium.launch();
  const bctx = await ctxFor(browser, { viewport: { width: 1366, height: 768 } });
  const board = await bctx.newPage(); board.on('pageerror', e => errors.push('board: ' + e.message)); board.on('dialog', d => d.accept());
  await board.goto(BASE + 'board.html'); await sleep(800);

  const P3 = ['Ploy', 'Nam', 'Fern'], P5 = ['Mind', 'June', 'Pim'];
  const phones = {};
  for (const n of P3.concat(P5)) {
    const p = await phone(browser, n); phones[n] = p;
    await p.fill('#jName', n); await p.selectOption('#jPanel', P3.includes(n) ? '3' : '5'); await p.click('#jGo');
  }
  await sleep(3500);
  await phones.Ploy.screenshot({ path: OUT + '/p1-lobby.png', fullPage: true });
  await overflow(phones.Ploy, 'lobby');
  check((await board.textContent('main')).includes('Mind'), 'board lists joined students');

  // Round 1
  await board.click('#r1Btn'); await sleep(400);
  for (const p of Object.values(phones)) await p.evaluate(() => poll());
  await sleep(700);
  const ploy = phones.Ploy;
  check(await ploy.isVisible('.app-head'), 'Round 1 applicant card shows');
  await ploy.click('[data-one="0"]'); await sleep(300);
  check(await ploy.evaluate(() => window.__plays) >= 1 && await ploy.evaluate(() => window.__synth) === 0, 'Listen plays a recorded clip, not the browser voice');
  await ploy.click('[data-all]'); await sleep(500);
  check(await ploy.evaluate(() => window.__plays) >= 4, 'Play all plays three clips');
  await ploy.click('#flag');
  await ploy.selectOption('#rankSel', '1');
  await ploy.screenshot({ path: OUT + '/p2-card.png', fullPage: true });
  await overflow(ploy, 'applicant card');
  await ploy.click('[data-tab="rank"]'); await ploy.click('[data-dn="0"]'); await ploy.click('[data-up="5"]');
  await ploy.screenshot({ path: OUT + '/p3-ranking.png', fullPage: true });
  await overflow(ploy, 'ranking');
  for (const n of ['Ploy', 'Nam', 'Fern', 'Mind', 'June']) {
    const p = phones[n]; if (n === 'Nam' || n === 'Fern') await p.click('#flag');
    if (n !== 'Ploy') { await p.click('[data-tab="rank"]'); for (let k = 0; k < 4; k++) await p.click('[data-up="' + (3 + Math.floor(Math.random() * 6)) + '"]'); }
    await p.click('#send'); await sleep(250);
  }
  await sleep(500);
  check(Object.keys(gas.props).filter(k => k.startsWith('I:') && JSON.parse(gas.props[k]).order).length === 5, '5 rankings stored before the clock stops');
  await board.click('#stopBtn'); await sleep(300);
  for (const p of Object.values(phones)) await p.evaluate(() => poll());
  await sleep(1200);
  check(Object.keys(gas.props).filter(k => k.startsWith('I:') && JSON.parse(gas.props[k]).order).length === 6, 'Pim (never pressed send) was auto-sent when time stopped');
  await sleep(500); await board.screenshot({ path: OUT + '/b1-live.png' });

  // Round 2
  await board.click('#r2Btn'); await sleep(300);
  for (const p of Object.values(phones)) await p.evaluate(() => poll());
  await sleep(900);
  for (const n of P3) { const p = phones[n]; for (const m of P3.filter(x => x !== n)) await p.check('[data-mate="' + m + '"]'); }
  await phones.Mind.check('[data-mate="June"]'); await phones.Mind.check('[data-mate="Pim"]');
  await sleep(300);
  await phones.Nam.screenshot({ path: OUT + '/p4-compare.png', fullPage: true });
  await overflow(phones.Nam, 'panel compare');
  check(await phones.Nam.isVisible('.tbl'), 'comparison table shows three rankings');
  await phones.Ploy.click('#claim'); await sleep(500);
  await phones.Nam.evaluate(() => loadPanel()); await sleep(400);
  await phones.Nam.click('#claim').catch(() => {}); await sleep(400);
  check(await phones.Nam.evaluate(() => (PANEL && PANEL.head) === 'Ploy'), 'second claim is refused: Ploy stays head');
  const ph = phones.Ploy;
  await ph.waitForSelector('#pform');
  await ph.click('#psend'); await sleep(200);
  check(!Object.keys(gas.props).some(k => k === 'P:3'), 'panel form refuses to submit short reasons');
  const longText = 'She gave a specific example from her own life and showed what she learned, which is exactly the evidence the programme asks for.';
  for (const k of ['s', 'o2', 'o3']) await ph.fill('[data-reason="' + k + '"]', longText);
  for (const b of await ph.$$('.chip')) { const t = await b.getAttribute('data-rec'); if (/\|r(1|4)$/.test(t)) await b.click(); }
  await ph.screenshot({ path: OUT + '/p5-headform.png', fullPage: true });
  await overflow(ph, 'head form');
  await ph.click('#psend'); await sleep(600);
  check(!!gas.props['P:3'], 'Panel 3 nominations stored');
  const p3 = JSON.parse(gas.props['P:3'] || '{}');
  check(p3.members && p3.members.length === 3 && Object.keys(p3.recs).length === 3, 'Panel 3 has 3 members and advice for the bottom 3');
  // Panel 5: head claims, writes one reason, never submits -> auto-submit on stop
  await phones.Mind.click('#claim'); await sleep(500); await phones.Mind.waitForSelector('#pform');
  await phones.Mind.fill('[data-reason="s"]', 'Too short');
  await board.click('#stopBtn'); await sleep(300);
  await phones.Mind.evaluate(() => poll()); await sleep(900);
  check(!!gas.props['P:5'] && JSON.parse(gas.props['P:5']).auto === true, 'Panel 5 auto-submitted when the clock stopped');
  await phones.Fern.evaluate(() => loadPanel()); await sleep(400);
  await phones.Fern.screenshot({ path: OUT + '/p6-member-sees-sub.png', fullPage: true });
  check((await phones.Fern.textContent('main')).includes('Submitted by Ploy'), 'members see the submitted nominations');

  // Round 3
  await board.click('#r3Btn'); await sleep(900);
  await board.screenshot({ path: OUT + '/b2-leaderboard.png' });
  check((await board.$$('.lbrow')).length === 10, 'leaderboard lists 10 applicants');
  await board.click('[data-v="mx"]'); await sleep(200); await board.screenshot({ path: OUT + '/b3-matrix.png' });
  await board.click('[data-v="agr"]'); await sleep(200); await board.screenshot({ path: OUT + '/b4-agreement.png' });
  await board.click('[data-v="rf"]'); await sleep(200); await board.screenshot({ path: OUT + '/b4b-redflags.png' });
  {
    const want = await board.evaluate(() => { const m = {}; D.individuals.filter(x => x.order).forEach(x => (x.flags || []).forEach(id => (m[id] = m[id] || []).push(x.name))); return m; });
    const got = await board.$$eval('.rfrow', rs => rs.map(r => ({ id: r.querySelector('.nm').dataset.c, names: [...r.querySelectorAll('.chip')].map(c => c.firstChild.textContent) })));
    const ok = got.length === Object.keys(want).length && got.every(g => JSON.stringify(g.names.slice().sort()) === JSON.stringify((want[g.id] || []).slice().sort()));
    check(ok && got.length >= 1 && Object.values(want).flat().length === 3, 'Red flags tab lists each flagging student under the right applicant (' + JSON.stringify(got) + ')');
    check((await board.textContent('main')).includes('Flagged nobody'), 'Red flags tab names students who flagged nobody');
  }
  await board.click('[data-v="lb"]'); await sleep(200);
  await board.click('.lbrow >> nth=0'); await sleep(300); await board.screenshot({ path: OUT + '/b5-applicant.png' });
  await board.click('#closeModal');
  await board.click('[data-v="dec"]'); await sleep(200);
  for (const id of ['c03', 'c06', 'c09']) await board.click('[data-pick="' + id + '"]');
  await board.click('[data-pick="c06"]');
  await board.click('#announce'); await sleep(1600);
  await board.screenshot({ path: OUT + '/b6-podium.png' });
  check(await board.isVisible('#podium.show'), 'podium opens on announce');
  await board.setViewportSize({ width: 1920, height: 1080 }); await sleep(300); await board.screenshot({ path: OUT + '/b6-podium-1080.png' });
  await board.click('#closePodium');
  await board.click('[data-v="notes"]'); await board.click('#revealNotes'); await sleep(600);
  await board.screenshot({ path: OUT + '/b7-notes.png' });
  check((await board.textContent('main')).includes('flagged by'), 'designer notes revealed with red-flag stats');
  for (const p of Object.values(phones)) await p.evaluate(() => { poll(); loadBoard(); });
  await sleep(1000);
  await phones.June.screenshot({ path: OUT + '/p7-r3.png', fullPage: true });
  await overflow(phones.June, 'round 3');
  check((await phones.June.textContent('main')).includes('Scholarship'), 'phones show the decision');
  // dark mode
  await phones.June.click('#themeBtn'); await sleep(200); await phones.June.screenshot({ path: OUT + '/p8-dark.png', fullPage: true });
  // reset
  await board.click('#resetBtn'); await board.click('#resetBtn'); await sleep(600);
  await phones.June.evaluate(() => poll()); await sleep(800);
  check(await phones.June.isVisible('#jName'), 'reset sends phones back to the join screen');
  check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
