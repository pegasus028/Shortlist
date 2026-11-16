/* node tools/content-check.js — structure and word bands for data/content.js */
global.window = global;
require('../data/content.js');
const S = window.SL; let err = 0, warn = 0;
const fail = m => { console.log('FAIL', m); err++; };
const words = s => s.trim().split(/\s+/).length;
if (S.questions.length !== 3) fail('need 3 questions');
if (S.candidates.length !== 10) fail('need 10 candidates');
const ids = new Set(), names = new Set();
let f = 0, m = 0, total = 0;
for (const c of S.candidates) {
  if (ids.has(c.id)) fail('dup id ' + c.id); ids.add(c.id);
  if (names.has(c.name)) fail('dup name ' + c.name); names.add(c.name);
  c.gender === 'F' ? f++ : m++;
  if (c.answers.length !== 3) fail(c.id + ' needs 3 answers');
  const w = c.answers.map(words), sum = w.reduce((a, b) => a + b, 0); total += sum;
  w.forEach((n, i) => { if (n < 28 || n > 38) fail(`${c.id} ${c.name} q${i + 1} ${n} words (28-38)`); });
  if (sum < 90 || sum > 110) fail(`${c.id} total ${sum} (90-110)`);
  if (/\b(color|favorite|center|organize|realize|apologize|program\b)/i.test(c.answers.join(' '))) fail(c.id + ' American spelling');
  console.log(`${c.id} ${c.name.padEnd(7)} ${c.gender} ${w.join('/')} = ${sum}`);
}
if (f !== 5 || m !== 5) fail(`gender ${f}F ${m}M (need 5/5)`);
if (S.recs.length < 8) fail('need at least 8 recommendations');
const forbidden = /(redflag|archetype|tier|designer|profile|note)\s*:/i;
if (forbidden.test(require('fs').readFileSync(__dirname + '/../data/content.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''))) fail('key-like field found in public content');
console.log(`total ${total} words; reading at 170 wpm = ${(total / 170).toFixed(1)} min`);
console.log(err ? `${err} error(s)` : 'content OK');
process.exit(err ? 1 : 0);
