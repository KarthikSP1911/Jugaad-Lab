## Team Name
AI (Aimless Insomniacs)

## Track Number & Name
Track 3: Compile Me Maybe

## Problem Statement Name

## Idea
Jugaad Hinglish is a small programming language that uses Hindi keywords written
in English letters, such as `rakho` (variable), `agar` (if) and `kaam`
(function). It aims to make first steps in programming easier for people who
think in Hinglish, so they can focus on logic using familiar words.

Learners can write programs on their computer or try them in a browser
playground. Error messages appear in Hinglish and English and point to where the
problem is. Documentation with a language tour and cheat sheet helps them get
started.

```text
kaam factorial(n) { agar (n <= 1) { wapas 1; } wapas n * factorial(n-1); }
bolo(factorial(5));   // 120
```

## How to Run

### Prerequisites
- Node.js 24 or newer (includes npm)
- Git

### Installation
```sh
git clone https://github.com/KarthikSP1911/Jugaad-Lab.git
cd Jugaad-Lab
npm ci
npm run build
```

### Run a program
```sh
node packages/cli/dist/main.js run examples/hello.hing
node packages/cli/dist/main.js run examples/fizzbuzz.hing
```

### Start the interactive prompt (type `.exit` to quit)
```sh
node packages/cli/dist/main.js repl
```

### Start the documentation site and playground
```sh
npm run dev -w @jugaad-hinglish/docs
```
Then open http://localhost:3000.

### Run the tests
```sh
npm test
```
