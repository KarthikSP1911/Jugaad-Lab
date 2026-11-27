import type { Lang } from '@jugaad-hinglish/core';

type CliLang = Extract<Lang, 'en' | 'hi'> | undefined;

interface Text {
  en: string;
  hi: string;
}

/** One line: both languages when none is chosen, as diagnostics do. */
export function line(text: Text, lang: Lang | undefined): string {
  if (lang === 'en') return text.en;
  return lang === 'hi' ? text.hi : `${text.hi} (${text.en})`;
}

/** Longer text, which would be unreadable twice over: English unless Hinglish is chosen. */
export function block(text: Text, lang: CliLang | Lang): string {
  return lang === 'hi' ? text.hi : text.en;
}

export const USAGE: Text = {
  en: `Jugaad Hinglish: run programs written with Hinglish keywords.

Usage:
  hinglish run <file.hing>      run a program (or just: hinglish <file.hing>)
  hinglish check <file.hing>    find mistakes without running
  hinglish [repl]               type code line by line
  hinglish --help | --version

Options:
  --lang=en|hi    language of messages (default: errors show both)

Examples:
  hinglish run examples/hello.hing
  hinglish check examples/hello.hing --lang=en

Exit codes:
  0 ok   64 wrong usage   65 compile errors   66 file not read   70 runtime error

Set NO_COLOR to turn colours off.
`,
  hi: `Jugaad Hinglish: Hinglish keywords wale program chalayein.

Istemal:
  hinglish run <file.hing>      program chalayein (ya sirf: hinglish <file.hing>)
  hinglish check <file.hing>    bina chalaye galtiyan dhoondhein
  hinglish [repl]               ek-ek line code likhein
  hinglish --help | --version

Vikalp:
  --lang=en|hi    sandeshon ki bhasha (default: galtiyan dono mein)

Udaharan:
  hinglish run examples/hello.hing
  hinglish check examples/hello.hing --lang=hi

Exit codes:
  0 theek   64 galat istemal   65 compile galti   66 file nahi padhi   70 chalte waqt galti

Rang band karne ke liye NO_COLOR set karein.
`,
};

export const REPL_HELP: Text = {
  en: `  .help     show this help
  .cancel   drop an unfinished entry
  .exit     quit
The final ; of an entry may be left out. An open bracket continues on the next line.
`,
  hi: `  .help     yeh madad dikhayein
  .cancel   adhoori entry chhod dein
  .exit     bahar niklein
Entry ke aakhir ka ; chhod sakte hain. Khula bracket agli line par jaari rehta hai.
`,
};

export const banner = (version: string): Text => ({
  en: `Jugaad Hinglish ${version}. Type .help for help, .exit to quit.`,
  hi: `Jugaad Hinglish ${version}. Madad ke liye .help, bahar jaane ke liye .exit likhein.`,
});

export const unknownReplCommand = (name: string): Text => ({
  hi: `'${name}' command nahi pata. .help likhein.`,
  en: `unknown command '${name}'; type .help`,
});

export const unknownOption = (name: string): Text => ({
  hi: `'${name}' option nahi pata`,
  en: `unknown option '${name}'`,
});

export const badLanguage = (value: string): Text => ({
  hi: `--lang mein 'en' ya 'hi' chahiye, '${value}' nahi`,
  en: `--lang takes 'en' or 'hi', not '${value}'`,
});

export const unknownCommand = (name: string): Text => ({
  hi: `'${name}' command nahi pata`,
  en: `unknown command '${name}'`,
});

export const missingFile = (command: string): Text => ({
  hi: `'${command}' ke baad file ka naam chahiye`,
  en: `'${command}' needs a file name`,
});

export const extraArgument = (value: string): Text => ({
  hi: `'${value}' faltu hai`,
  en: `unexpected argument '${value}'`,
});

export const fileNotFound = (file: string): Text => ({
  hi: `file nahi mili: ${file}`,
  en: `file not found: ${file}`,
});

export const cannotRead = (file: string, reason: string): Text => ({
  hi: `file nahi padhi gayi: ${file}: ${reason}`,
  en: `cannot read ${file}: ${reason}`,
});

export const noErrors = (file: string): Text => ({
  hi: `${file}: koi galti nahi`,
  en: `${file}: no errors`,
});

export const errorCount = (count: number): Text => ({
  hi: `${count} galtiyan mili`,
  en: `${count} errors found`,
});

export const internalError = (reason: string): Text => ({
  hi: `interpreter ki andaruni galti: ${reason}. Kripya GitHub par report karein.`,
  en: `internal error: ${reason}. Please report it on GitHub.`,
});

export const SEE_HELP: Text = {
  hi: 'Madad ke liye: hinglish --help',
  en: 'See: hinglish --help',
};
