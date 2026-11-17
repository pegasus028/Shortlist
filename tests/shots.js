/* Screenshots for the walkthrough deck: a simulated class of 30 against the mock backend.
   Serve the folder first (python3 -m http.server 8765), then: OUT=/path node tests/shots.js */
const { chromium } = require('playwright');
const { make } = require('./mock-gas');
const BASE = 'http://127.0.0.1:8765/', EXEC = 'https://script.google.com/macros/s/TEST/exec';
const OUT = process.env.OUT || '/tmp/sl-deck';
require('fs').mkdirSync(OUT, { recursive: true });
const gas = make(process.env.NOTES || '/home/claude/shortlist-private/Notes.gs');
const post = b => JSON.parse(gas.handle('POST', EXEC, JSON.stringify(b)));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const errors = [];

const IDS = ['c01','c02','c03','c04','c05','c06','c07','c08','c09','c10'];
const BASEV = { c03: 8.0, c04: 7.6, c10: 7.3, c09: 7.0, c07: 6.8, c06: 6.6, c01: 6.7, c08: 5.4, c05: 4.2, c02: 3.0 };
const rankFrom = (vals) => IDS.slice().sort((a, b) => vals[b] - vals[a]);
const noisy = (sd) => Object.fromEntries(IDS.map(id => [id, BASEV[id] + (rnd() - .5) * 2 * sd]));
const REASON = {
  c01: 'Fern started a real business and sold four hundred bags, and she changed the rule so the team now votes on money.',
  c02: 'Ton is honest about being lazy and about choosing the course for his parents, which shows some self-awareness at least.',
  c03: 'Mint saw workers miss treatment because the forms were only in Thai, so her motivation is specific and realistic.',
  c04: 'Win runs a support page with three thousand followers and learned to share work by giving each editor a clear goal.',
  c05: 'Ploy is friendly and fluent, and she clearly cares about other people and believes that teamwork is very important.',
  c06: 'Kong built a spreadsheet that cut waste by twenty per cent, and he told the teacher at once when he burned the motor.',
  c07: 'Beam is honest that he started late, and he finished a twelve-week statistics course to prove he can keep going.',
  c08: 'Namwan speaks with confidence and organised a successful sports day as class representative, so she seems a strong leader.',
  c09: 'Phum has taught at a temple school for two years and changed his habits after his mistake with the sports day.',
  c10: 'Praew has the strongest record in the pool, council president and debate semi-finalist, and she acted fast at the fair.'
};
const NAMES = ['Mind','June','Fah','Bam','Mew','Prang','Jane','Ice','Kwan','Nook','Benz','Pim','Aom','Eye','Gift','Earn','Ning','Pear','Tarn','Bow','Muk','Oil','Pang','First','Sai','Mook','Pan','Cream','Fon','Noon'];

async function ctxFor(browser, opts){
  const ctx = await browser.newContext(opts);
  await ctx.route('**/config.js*', r => r.fulfill({ contentType: 'application/javascript', body: `window.API_URL='${EXEC}';window.APP_URL='https://pegasus028.github.io/Shortlist/';` }));
  await ctx.route(EXEC + '**', async r => { const q = r.request(); r.fulfill({ contentType: 'application/json', body: gas.handle(q.method(), q.url(), q.postData()) }); });
  await ctx.addInitScript(() => { HTMLMediaElement.prototype.play = function(){ return new Promise(()=>{}); }; });
  return ctx;
}
async function phone(browser, name){
  const ctx = await ctxFor(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(name + ': ' + e.message));
  await p.goto(BASE + 'index.html'); return p;
}
const shot = (p, f) => p.screenshot({ path: OUT + '/' + f + '.png' });

(async () => {
  const browser = await chromium.launch();
  const bctx = await ctxFor(browser, { viewport: { width: 1920, height: 1080 } });
  const board = await bctx.newPage(); board.on('pageerror', e => errors.push('board: ' + e.message));
  await board.goto(BASE + 'board.html'); await sleep(500);

  // 27 classmates join by script; Mind, June and Fah (panel 3) use phones
  const others = NAMES.slice(3); const panelOf = {};
  others.forEach((n, i) => { let p = (Math.floor(i / 3) % 9) + 1; if (p >= 3) p++; panelOf[n] = String(p); post({ action: 'register', name: n, panel: panelOf[n] }); });
  const mind = await phone(browser, 'Mind'), june = await phone(browser, 'June');
  await mind.fill('#jName', 'Mind'); await mind.selectOption('#jPanel', '3');
  await shot(mind, 's01-join');
  await mind.click('#jGo');
  await june.fill('#jName', 'June'); await june.selectOption('#jPanel', '3'); await june.click('#jGo');
  post({ action: 'register', name: 'Fah', panel: '3' });
  await sleep(600); await shot(mind, 's02-lobby');
  await sleep(3200); await board.screenshot({ path: OUT + '/b01-lobby.png' });

  // Round 1
  await board.click('#r1Btn'); await sleep(400);
  for (const p of [mind, june]) await p.evaluate(() => poll());
  await sleep(800);
  await mind.evaluate(() => { S.deck = ['c03','c06','c04','c01','c09','c02','c05','c07','c10','c08']; S.r1.order = S.deck.slice(); S.cur = 0; save(); render(); });
  await sleep(300); await shot(mind, 's03-card');
  await mind.evaluate(() => { const b = document.querySelector('[data-one="0"]'); b.classList.add('playing'); b.textContent = '■ Stop'; });
  await mind.evaluate(() => document.querySelector('.qa').scrollIntoView({ block: 'start' })); await mind.evaluate(() => window.scrollBy(0, -70));
  await shot(mind, 's04-listen');
  await mind.evaluate(() => { S.cur = 2; S.r1.flags = ['c04']; save(); render(); });
  await mind.evaluate(() => document.querySelector('.toolrow').scrollIntoView({ block: 'end' })); await mind.evaluate(() => window.scrollBy(0, 120));
  await shot(mind, 's05-flag-rank');
  await mind.click('#helpBtn'); await sleep(300); await shot(mind, 's06-help'); await mind.evaluate(() => closeHelp());
  await mind.evaluate(() => { S.r1.order = ['c03','c06','c09','c07','c10','c01','c04','c08','c05','c02']; S.r1.moved = 5; save(); });
  await mind.click('[data-tab="rank"]'); await sleep(300); await shot(mind, 's07-ranking');
  await mind.click('#send'); await sleep(400);
  await june.evaluate(() => { S.r1.order = ['c10','c03','c04','c07','c06','c09','c01','c08','c05','c02']; S.r1.moved = 3; save(); }); await june.evaluate(() => sendR1(false));
  post({ action: 'individual', name: 'Fah', panel: '3', order: ['c04','c03','c01','c10','c09','c06','c07','c08','c05','c02'], flags: ['c08'], epoch: '1' });
  others.forEach((n, i) => { const o = rankFrom(noisy(2.2)); const fl = []; if (rnd() < .4) fl.push('c04'); if (rnd() < .3) fl.push('c08'); if (i % 9 !== 4) post({ action: 'individual', name: n, panel: panelOf[n], order: o, flags: fl, epoch: '1' }); });
  await sleep(3500); await board.screenshot({ path: OUT + '/b02-round1.png' });
  others.forEach((n, i) => { if (i % 9 === 4) post({ action: 'individual', name: n, panel: panelOf[n], order: rankFrom(noisy(2.2)), flags: [], auto: true, epoch: '1' }); });

  // Round 2
  await board.click('#stopBtn'); await sleep(300); await board.click('#r2Btn'); await sleep(400);
  for (const p of [mind, june]) await p.evaluate(() => poll());
  await sleep(1000);
  await mind.check('[data-mate="June"]'); await mind.check('[data-mate="Fah"]'); await sleep(300);
  await shot(mind, 's08-panel');
  await mind.evaluate(() => document.querySelector('.tbl').scrollIntoView({ block: 'start' })); await mind.evaluate(() => window.scrollBy(0, -250));
  await shot(mind, 's09-compare');
  await mind.click('#claim'); await sleep(600); await mind.waitForSelector('#pform');
  await june.evaluate(() => loadPanel()); await sleep(500);
  await mind.evaluate(() => { S.pform.order = ['c03','c06','c09','c07','c10','c01','c04','c08','c05','c02']; save(); render(); });
  await mind.evaluate(() => document.querySelector('#pform').scrollIntoView({ block: 'start' })); await mind.evaluate(() => window.scrollBy(0, -70));
  await shot(mind, 's10-head-ranking');
  await mind.fill('[data-reason="s"]', REASON.c03); await mind.fill('[data-reason="o2"]', REASON.c06); await mind.fill('[data-reason="o3"]', 'Phum has taught at a temple school for two years and changed his habit after he forgot to ask the head monk.');
  await mind.evaluate(() => document.querySelector('[data-reason="s"]').closest('.card').scrollIntoView({ block: 'start' })); await mind.evaluate(() => window.scrollBy(0, -70));
  await mind.evaluate(() => document.activeElement.blur());
  await shot(mind, 's11-reasons');
  for (const [id, rs] of [['c08', ['r4', 'r7']], ['c05', ['r1']], ['c02', ['r3']]]) for (const r of rs) await mind.click(`[data-rec="${id}|${r}"]`);
  await mind.evaluate(() => document.querySelector('[data-rec]').closest('.card').scrollIntoView({ block: 'start' })); await mind.evaluate(() => window.scrollBy(0, -70));
  await shot(mind, 's12-advice');
  await mind.click('#psend'); await sleep(700);
  // other panels
  for (let p = 1; p <= 10; p++) {
    if (p === 3) continue;
    const ms = others.filter(n => panelOf[n] === String(p));
    const sc = Object.fromEntries(IDS.map(id => [id, 0]));
    ms.forEach(n => { const rec = JSON.parse(gas.props['I:' + n.toLowerCase()]); rec.order.forEach((id, i) => sc[id] += 10 - i); });
    IDS.forEach(id => sc[id] += (rnd() - .5) * 6);
    const o = rankFrom(sc);
    post({ action: 'claimHead', panel: String(p), name: ms[0], epoch: '1' });
    post({ action: 'panel', panel: String(p), head: ms[0], members: ms, order: o, reasons: { s: REASON[o[0]], o2: REASON[o[1]], o3: REASON[o[2]] },
      recs: Object.fromEntries(o.slice(7).map((id, i) => [id, [['r1', 'r3'], ['r4'], ['r7', 'r5']][i]])), epoch: '1' });
  }
  await june.evaluate(() => loadPanel()); await sleep(600);
  await june.evaluate(() => document.querySelector('.nomcard').closest('.card').scrollIntoView({ block: 'start' })); await june.evaluate(() => window.scrollBy(0, -70));
  await shot(june, 's13-submitted');
  await sleep(3500); await board.screenshot({ path: OUT + '/b03-round2.png' });

  // Round 3
  await board.click('#r3Btn'); await sleep(3500);
  await board.screenshot({ path: OUT + '/b04-leaderboard.png' });
  await board.click('[data-lb="ind"]'); await sleep(400); await board.screenshot({ path: OUT + '/b05-leaderboard-r1.png' }); await board.click('[data-lb="panel"]');
  await board.click('[data-v="mx"]'); await sleep(400); await board.screenshot({ path: OUT + '/b06-nominations.png' });
  await board.click('[data-v="agr"]'); await sleep(400); await board.screenshot({ path: OUT + '/b07-agreement.png' });
  await board.click('[data-v="apps"]'); await sleep(300); await board.click('[data-c="c06"]'); await sleep(500); await board.screenshot({ path: OUT + '/b08-applicant.png' });
  await board.click('#closeModal');
  await board.click('[data-v="dec"]'); await sleep(300);
  for (const id of ['c03', 'c06', 'c09']) await board.click(`[data-pick="${id}"]`);
  await board.click('[data-pick="c03"]'); await sleep(300); await board.screenshot({ path: OUT + '/b09-decision.png' });
  await board.click('#announce'); await sleep(2500); await board.screenshot({ path: OUT + '/b10-podium.png' });
  await board.click('#closePodium'); await board.click('[data-v="notes"]'); await sleep(300); await board.screenshot({ path: OUT + '/b11-notes-closed.png' });
  for (const p of [mind]) await p.evaluate(() => { poll(); loadBoard(); });
  await sleep(1200); await shot(mind, 's14-decision');
  console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no page errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(2); });
