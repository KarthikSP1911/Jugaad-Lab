# Jugaad Hinglish: what changed, and how to demo it

**Before** = commit `803e3a1`, the version the audit reviewed.
**After** = this working copy.

Four changes, each fixing a problem from the audit (`jugaad-lab-full-audit.pdf`):

| # | Change | Audit problem | Before | After |
| --- | --- | --- | --- | --- |
| 1 | CLI stops runaway programs | #5 Critical, #28 | An infinite loop hangs the terminal forever | Stops in about 1 s with error E0408; `--max-steps=N` to change |
| 2 | Standard library | #7 High, #30, #31 | 8 built-ins | 33 built-ins: maths, text, lists, sort, map, filter |
| 3 | Docs in Hindi and Hinglish | #37, #11 | English only, Latin-only fonts | English, Hinglish and हिंदी, with a switcher and a Devanagari font |
| 4 | AI helper in the playground | new | None | **Translate** Python/JS into Hinglish and **Fix it** for errors, with Gemini first and Groq as backup |
| 5 | Spelling variants accepted | #10 High | Only `jhooth`; `jhoot` is an "undefined name" error | `jhoot`, `jhuth`, `jhut`, `vapas`, `khali`, `nahin`, ... all work |

| | Before | After |
| --- | --- | --- |
| Tests | 582 | 690 (plus 2 live AI tests that run only with a key) |
| Typecheck, lint, build | pass | pass |

---

## Setup: both versions side by side

The changes are not committed yet, so `HEAD` is still the old version. A git worktree gives you a separate copy of it without touching your work:

```bash
git worktree add ../Jugaad-Lab-before 803e3a1
cd ../Jugaad-Lab-before
npm ci
npm run build
npm run dev -w @jugaad-hinglish/docs -- -p 3001     # old site on http://localhost:3001
```

In this folder (the new version):

```bash
npm run build
npm run dev -w @jugaad-hinglish/docs                # new site on http://localhost:3000
```

Run the CLI demos from the new folder; for the "before" runs, use `../Jugaad-Lab-before/packages/cli/dist/main.js`. When you are done, remove the old copy with `git worktree remove ../Jugaad-Lab-before`.

---

## Demo 1: an infinite loop no longer hangs the CLI

The most common beginner mistake is a loop that never ends. [demo/infinite-loop.hing](demo/infinite-loop.hing) forgets `i += 1`:

```text
rakho i = 0;
rakho kul = 0;
jabtak (i < 10) {
    kul = kul + i;
}
```

```bash
node packages/cli/dist/main.js run demo/infinite-loop.hing --lang=en
```

**Before:** nothing happens. The CPU spins and the terminal never comes back until you press Ctrl+C. Don't run this on stage without Ctrl+C ready.

**After:** it stops in about one second, with exit code 70:

```text
Error E0408 [step limit exceeded] at demo/infinite-loop.hing:5:5
        kul = kul + i;
        ^^^^^^^^^^^^^^
the program ran for more than 5000000 steps
```

5,000,000 steps is the same limit the browser playground uses, so a program now behaves the same in both places. `--max-steps=0` turns the limit off for long programs.

---

## Demo 2: a real program in one screen (standard library)

[tests/programs/stdlib.hing](tests/programs/stdlib.hing) is a marks report:

```text
rakho marks = { "Asha": 82, "Ravi": 67.5, "Meena": 91, "Kabir": 74 };
rakho naam = chhanto(chaabiyan(marks));
rakho ank = har(naam, kaam (n) { wapas marks[n]; });
bolo("Sabse zyada:", adhiktam(ank), "| sabse kam:", nyuntam(ank));
rakho topper = chuno(naam, kaam (n) { wapas marks[n] >= 80; });
```

```bash
node packages/cli/dist/main.js run tests/programs/stdlib.hing
```

**Before:** the first new function fails: `Error E0301 [undefined name] ... 'chaabiyan'`. You would have to write sorting, max and min by hand.

**After:**

```text
Bacche: Asha, Kabir, Meena, Ravi
Sabse zyada: 91 | sabse kam: 67.5
Ausat: 79
80 se upar: ["Asha", "Meena"] | Ravi hai? jhooth
SEB + KELA + AAM
1-do-1 nama 2
12 256 3 2 3
```

The 25 new built-ins have Hinglish names a beginner can guess:

| Maths | Text | Lists and strings |
| --- | --- | --- |
| `mod` absolute value, `vargmool` square root, `ghaat` power, `gol` round, `neeche` / `upar` floor / ceil, `adhiktam` / `nyuntam` max / min, `kismat(1, 6)` random | `todo` split, `milao` join, `bade` / `chhote` upper / lower case, `saaf` trim, `badlo` replace | `hai` contains, `kahan` index of, `kaato` slice, `ulta` reverse, `chhanto` sort, `har` map, `chuno` filter, `daalo` insert, `hatao` remove, `chaabiyan` keys |

The playground's autocomplete and syntax colouring know all of them. Type `chh` and press Ctrl+Space.

---

## Demo 3: the docs in three languages

Open http://localhost:3000/docs/tour.

1. **Before** (port 3001): English only. http://localhost:3001/hi/docs/tour is a 404.
2. **After:** the header has a switch, **English | Hinglish | हिंदी**. Click हिंदी: the same page opens at `/hi/docs/tour`, fully in Devanagari.
3. Click **Hinglish**: the same page in Roman Hindi (`/hinglish/docs/tour`).
4. Worth showing:
   - `/hi/docs/cheatsheet`: every keyword and built-in explained in Hindi.
   - `/hi/docs/errors`: a हिंदी column for all 41 error codes.
   - `/hi/docs/reference`: the whole language spec in Hindi.

Code examples stay in Roman letters in every language (`rakho`, `agar`, `bolo`), because that is what you type. Only the explanations change. A test fails if a translation goes missing or drifts from the English version.

---

## Demo 4: the AI helper (translate and auto-correct)

Open http://localhost:3000/playground and scroll below the editor to **AI helper · Gemini + Groq**.

**One-time setup:** paste a Gemini key and, as a backup, a Groq key, then click **Save keys**. Keys stay in this browser only and go straight to Google or Groq, never into the site's code or this repository.

### 4a. Translate Python into Hinglish

Choose **Translate to Hinglish**, paste:

```python
nums = [5, 3, 8]
for n in sorted(nums):
    print(n * 2)
print("total", sum(nums))
```

Click **Translate**. A recorded run (it fell back to Groq because Gemini was overloaded at that moment):

```text
rakho nums = [5, 3, 8];
rakho sorted_nums = chhanto(nums);
rakho n = 0;
chalo (rakho i = 0; i < lambai(sorted_nums); i += 1) {
    n = sorted_nums[i];
    bolo(n * 2);
}
rakho total = 0;
chalo (rakho i = 0; i < lambai(nums); i += 1) {
    total = total + nums[i];
}
bolo("total", total);

- Sorted list banane ke liye chhanto ka upyog kiya;
- Sorted list ke har element ko 2 se guna karke bolo se print kiya;
- Original list ka sum manual loop se calculate kiya;
```

Click **Use this code**, then **Run**. It prints `6`, `10`, `16` (one per line), then `total 16`, the same as the Python.

You can also type a description instead of code, e.g. *"ask for 5 marks and print the average"*.

### 4b. Fix broken code (auto-correct)

Paste [demo/broken.hing](demo/broken.hing) into the editor and press **Run**. It has three beginner mistakes:

```text
rakho total = 10
agar total > 5 { bolo(totl); }
```

Choose **Fix it** and click **Fix my code**. A recorded run (Gemini):

```text
rakho total = 10;
agar (total > 5) { bolo(total); }

- Statements mein semicolon zaroori hai, isliye rakho total = 10 ke baad ; lagaya.
- agar ke baad condition ko parentheses ( ) mein rakhna compulsory hai.
- Variable ka naam totl galat tha, usko sahi karke total kiya.
```

### What makes it trustworthy (say this to judges)

- **Checked by the real compiler.** Every AI answer goes through Jugaad Hinglish's own `check()` before you see it. If it doesn't compile, the AI gets the exact errors back and one more try. The panel shows **✓ Yeh code compile hota hai** only when it really does.
- **Never overwrites your code.** It's a suggestion until you click **Use this code**.
- **Teaches, doesn't just patch.** The notes explain each change in Hinglish.
- **Doesn't hallucinate features.** The prompt is built from the real keyword table and built-in list, so it doesn't invent `++` or for-each.
- **Keeps working when a model is down.** It tries 3 Gemini models, then 2 Groq models, with 30 s per try. Overloaded (503), rate-limited (429) and retired (404) models are skipped automatically.
- **Free when there's nothing to fix.** If the program compiles and the last run worked, it says so without calling the AI.

---

## Demo 5: write it the way you spell it

Roman Hindi has no fixed spelling: one student writes `jhooth`, another `jhoot` or `jhuth`. Before, only one spelling worked. [demo/spellings.hing](demo/spellings.hing) uses the "wrong" ones on purpose:

```text
kaam pass_hai(marks) {
    agar (marks >= 33) { vapas sach; } varna { vapas jhoot; }
}
rakho result = khali;
agar (nahin pass_hai(20)) { result = "fail"; }
bolo(result, pass_hai(75), jhuth == jhut);
```

```bash
node packages/cli/dist/main.js run demo/spellings.hing
```

**Before:** a wall of errors. `vapas`, `varna`, `jhoot`, `khali` and `nahin` are unknown names or syntax errors.

**After:**

```text
fail sach sach
```

Accepted spellings (each means exactly the same as the main one):

| Main | Also accepted |
| --- | --- |
| `jhooth` | `jhoot`, `jhuth`, `jhut`, `jhoothh` |
| `wapas` | `vapas`, `waapas`, `vaapas` |
| `warna` | `varna` |
| `sach` | `sachh`, `sacch` |
| `khaali` | `khali` |
| `nahi` | `nahin`, `nhi` |
| `ya` | `yaa` |
| `pakka` | `pakaa`, `pukka` |

Also show:

- **The output always uses the main spelling:** `bolo(shabd(jhoot));` prints `jhooth`, so results look the same whoever wrote the code.
- **In the playground**, `jhoot` is coloured as a keyword, just like `jhooth`.
- **On the cheatsheet** (`/docs/cheatsheet`), a new column lists the accepted spellings, in all three languages.

Why these and not more: every extra spelling becomes a reserved word that can't be used as a variable name. So the list only has spellings nobody would pick as a name. A test checks the whole corpus still runs.

---

## Honest limits (good to mention before someone asks)

- The AI helper needs internet and a key; the rest of the language works offline.
- **Fix it** checks that the fix *compiles*. A runtime error is fixed by the AI, but only re-running proves the fix.
- The Hindi translations should be reviewed by a native speaker before learners use them.
- The home page, the playground buttons and the compiler's own error messages are not translated. Errors stay in Hinglish with English in brackets.
- Built-in names (`chhanto`, `har`, `kismat`, ...) are proposals and can still be renamed before release.

## Where the code is

| Change | Main files |
| --- | --- |
| Step limit | [packages/cli/src/cli.ts](packages/cli/src/cli.ts), [packages/cli/src/repl.ts](packages/cli/src/repl.ts) |
| Standard library | [packages/core/src/runtime/stdlib/](packages/core/src/runtime/stdlib/), tests in [packages/core/test/stdlib.test.ts](packages/core/test/stdlib.test.ts) |
| Docs in three languages | [apps/docs/lib/i18n/](apps/docs/lib/i18n/), [docs/language-spec.hi.md](docs/language-spec.hi.md), [docs/language-spec.hinglish.md](docs/language-spec.hinglish.md) |
| AI helper | [apps/docs/lib/ai/](apps/docs/lib/ai/), [apps/docs/components/ai-helper.tsx](apps/docs/components/ai-helper.tsx), tests in [apps/docs/test/ai.test.ts](apps/docs/test/ai.test.ts) |
