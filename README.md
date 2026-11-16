# The Shortlist

Admissions-panel game for T.Chris's M6 *English as a Lingua Franca* class (follow-on to the MMI Practice Circuit).
The class becomes the admissions committee of the fictional **Horizon Scholars Programme**: ten applicants, three places,
and one scholarship for the best of the three.

- Student app: `index.html` → https://pegasus028.github.io/Shortlist/
- Teacher board (projector): `board.html` → https://pegasus028.github.io/Shortlist/board.html

## The lesson (about 35 minutes of play)

| Round | Time | Students | Board |
|---|---|---|---|
| Lobby | ~3 min | Join with a nickname and a panel number (1–10); read the briefing | Who has joined, by panel |
| 1 · Alone | 10 min | Read or listen (headphones) to ten applicants; 🚩 red flags; rank 1–10 (1st = scholarship + place, 2nd–3rd = places). Points 10, 9 … 1 | Rankings sent per panel |
| 2 · Panel | 10 min | Tick the two panel members; compare rankings (biggest split first); one member taps *I'll be head of panel*; the head agrees the panel ranking, writes three reasons (≥ 15 words: scholarship, place, place) and picks advice for the bottom 3 | Heads and nominations per panel |
| 3 · Committee | 10 min | Class discussion from the board | Leaderboard (panel or Round 1 points) · Nominations matrix · Agreement scale · Applicants (answers, audio, every panel's reasons and advice) · Decision → podium · Designer's notes |

Unsent rankings are sent automatically when the teacher stops a round or starts the next one. A head's unfinished
panel form is sent automatically too (marked `auto`).

## Teacher board controls

Minutes box · **Start Round 1 / 2 / 3** (the next one is highlighted) · Stop clock · Podium · Music on/off · Fullscreen · Reset.
*Decision* tab: click three applicants for places, click one again for the scholarship ★, then **Announce** (podium + phones).
*Designer's notes* tab: reveal who was built as the red flag and what each file was meant to show, with live stats.

There is no teacher PIN (same as Investigative Reporter): keep the board URL to yourself.

## Files

| File | What it is |
|---|---|
| `index.html` | Student app (one file) |
| `board.html` | Teacher board — **generated**: edit `tools/board-src.html`, then `python3 tools/build-board.py <InvestigativeReporter>/leaderboard.html` (copies the music, crowd, confetti and clapping hands from that board) |
| `config.js` | `API_URL` (Apps Script `/exec`) and `APP_URL` |
| `data/content.js` | Applicants, questions, criteria, red flags, advice options — all wording lives here |
| `data/tts.js` | Generated list of recorded clips |
| `audio/cNN-Q.mp3` | 30 recordings in Thai-accented English: Microsoft's Thai voices Premwadee (women) and Niwat (men), each applicant with their own pitch and pace (`CAST` in `tools/make-audio.py`) |
| `art/candidates/cNN.jpg` | Portraits, 600 × 750 (letter tiles show until a portrait exists) |
| `apps-script/Code.gs` | Backend (Script Properties, no Sheet). The private `Notes.gs` (designer's notes) lives only in the Apps Script project |
| `tools/content-check.js` | Word bands (28–38 per answer, 90–110 per applicant), 5 F / 5 M, no key data in public files |
| `tests/walk.js` | Playwright: board + six phones in two panels through all three rounds against a mock backend (`tests/mock-gas.js`) |

## Editing applicants

Change `data/content.js`, then:

```
node tools/content-check.js
pip install edge-tts
python3 tools/make-audio.py          # re-records changed answers (text or an applicant's voice in CAST)
```

Bump `?v=` on the script tags in `index.html` and `tools/board-src.html`, rebuild the board, commit. If the change alters
what an applicant was designed to show, update `Notes.gs` in the Apps Script project too (Save → Deploy → Manage
deployments → pencil → New version).

## Backend

Apps Script project **The Shortlist backend** (Execute as Me, Anyone). Keys: `state`, `I:<name>` (Round 1),
`H:<panel>` (head), `P:<panel>` (panel nominations). Reset deletes everything and raises the epoch, which sends phones back
to the join screen.

Applicants are fictional. Portraits are AI-generated (Gemini); voices are Microsoft's Thai neural voices (Premwadee, Niwat) via edge-tts.
