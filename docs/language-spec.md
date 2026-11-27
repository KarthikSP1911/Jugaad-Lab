# Language specification v0.1 (draft)

Name, file extension (`.hing`), CLI command (`hinglish`) and keyword spellings
are placeholders until the owner confirms them.

## Design principles

1. **One word per keyword.** Multi-word keywords are fragile (defect 10). Hinglish builds `else if` from two single-word tokens in the grammar instead.
2. **No program wrapper.** Hinglish runs top-level statements directly.
3. **Familiar structure.** Braces for blocks, parentheses around conditions and `;` terminators, so that `;` can serve as an error-recovery point.
4. **Strict where it catches bugs.** Undefined names, constant reassignment, wrong arity and non-boolean conditions are errors, not silent no-ops.
5. **One main spelling per keyword, common variants accepted.** Roman Hindi has no standard spelling (`jhooth`, `jhuth`; `wapas`, `vapas`). The lexer reads keywords from a table, so variants are aliases of the main spelling, added without touching the parser. The docs teach, and the output prints, only the main spelling.

## Keywords

| Concept | Keyword |
| --- | --- |
| variable / constant | `rakho` / `pakka` |
| function / return | `kaam` / `wapas` |
| if / else | `agar` / `warna` (`warna agar` is two tokens) |
| true / false / null | `sach` / `jhooth` / `khaali` |
| while / counted loop | `jabtak` / `chalo (init; test; step)` |
| break / continue | `ruko` / `agla` |
| and / or / not | `aur` / `ya` / `nahi` (aliases of `&&`, `\|\|`, `!`) |

`bolo` and `suno` are built-in functions, not keywords. Reserved words are
case-sensitive and cannot be used as identifiers.

**Other spellings.** These variants are accepted too and mean exactly the same as the main spelling: `jhoot`, `jhuth`, `jhut`, `jhoothh` → `jhooth`; `vapas`, `waapas`, `vaapas` → `wapas`; `varna` → `warna`; `sachh`, `sacch` → `sach`; `khali` → `khaali`; `nahin`, `nhi` → `nahi`; `yaa` → `ya`; `pakaa`, `pukka` → `pakka`. They are reserved words as well. Output and messages always use the main spelling (`shabd(jhoot)` is `"jhooth"`).

## Lexical rules and types

- **Identifiers:** a letter or `_` followed by letters, digits or `_`. Unicode letters, digits and combining marks (`ID_Start`, `ID_Continue`) are allowed so Devanagari names work.
- **Numbers:** unsigned decimal literals (`42`, `3.14`). A leading `-` is always the unary or binary operator, which fixes defect 1.
- **Strings:** `"..."` or `'...'` with escapes `\n \t \\ \" \'`. Strings may not span lines in the MVP.
- **Comments:** `// line` and `/* block */`.

| Type | Literal | Notes |
| --- | --- | --- |
| number | `42`, `3.14` | 64-bit float; `/` is always float division |
| string | `"namaste"` | immutable; `+` joins when either operand is a string |
| boolean | `sach`, `jhooth` | the only values allowed in conditions |
| null | `khaali` |  |
| list | `[1, 2, 3]` | mutable, zero-indexed, elements are any expression |
| dictionary | `{ "naam": "Asha" }` | string keys; `d["naam"]` reads and writes |
| function | `kaam (a) { ... }` | first-class, closes over its defining scope |

**Semantics worth fixing now:** `==` and `!=` never coerce (`1 == "1"` is `jhooth`); `<`, `<=`, `>`, `>=` accept two numbers or two strings only; indexing out of range is a runtime error, not `undefined`; functions are hoisted within their block so they can call each other.

## Operators, lowest to highest precedence

| Level | Operators | Associativity |
| --- | --- | --- |
| 1 | `=` `+=` `-=` `*=` `/=` `%=` | right |
| 2 | `\|\|` `ya` | left, short-circuit |
| 3 | `&&` `aur` | left, short-circuit |
| 4 | `==` `!=` | left |
| 5 | `<` `<=` `>` `>=` | left |
| 6 | `+` `-` | left |
| 7 | `*` `/` `%` | left |
| 8 | unary `!` `nahi` `-` | right |
| 9 | call `f(x)`, index `a[i]` | left |

`&&` and `||` return booleans and short-circuit.

## Grammar (EBNF)

```text
program     = { declaration } EOF ;
declaration = varDecl | funcDecl | statement ;
varDecl     = ( "rakho" | "pakka" ) IDENT [ "=" expression ] ";" ;
funcDecl    = "kaam" IDENT "(" [ params ] ")" block ;
params      = IDENT { "," IDENT } ;

statement   = exprStmt | ifStmt | whileStmt | forStmt
            | returnStmt | "ruko" ";" | "agla" ";" | block | ";" ;
ifStmt      = "agar" "(" expression ")" statement [ "warna" statement ] ;
whileStmt   = "jabtak" "(" expression ")" statement ;
forStmt     = "chalo" "(" ( varDecl | exprStmt | ";" )
                          [ expression ] ";" [ expression ] ")" statement ;
returnStmt  = "wapas" [ expression ] ";" ;
block       = "{" { declaration } "}" ;
exprStmt    = expression ";" ;

expression  = assignment ;
assignment  = ( IDENT | postfix "[" expression "]" ) assignOp assignment | logicOr ;
logicOr     = logicAnd { ( "||" | "ya" ) logicAnd } ;
logicAnd    = equality { ( "&&" | "aur" ) equality } ;
equality    = comparison { ( "==" | "!=" ) comparison } ;
comparison  = term { ( "<" | "<=" | ">" | ">=" ) term } ;
term        = factor { ( "+" | "-" ) factor } ;
factor      = unary { ( "*" | "/" | "%" ) unary } ;
unary       = ( "!" | "nahi" | "-" ) unary | postfix ;
postfix     = primary { "(" [ args ] ")" | "[" expression "]" } ;
primary     = NUMBER | STRING | "sach" | "jhooth" | "khaali" | IDENT
            | "(" expression ")" | listLit | dictLit | funcExpr ;
listLit     = "[" [ expression { "," expression } [ "," ] ] "]" ;
dictLit     = "{" [ pair { "," pair } [ "," ] ] "}" ;
pair        = ( STRING | IDENT ) ":" expression ;
funcExpr    = "kaam" "(" [ params ] ")" block ;
```

**Run time:** division or remainder by zero is an error (E0403). The operands of `!`, `&&` and `||` must be booleans (E0405). `==` compares lists, dictionaries and functions by identity. A `chalo` loop variable is one binding shared by all iterations. A name is visible from its declaration onwards (functions from the start of their block); reaching it before it has a value is E0406.

`rakho x;` gives `x` the value `khaali`. `pakka` requires an initial value (E0206). An `agar`, `warna`, `jabtak` or `chalo` body is a statement, so a declaration there needs a block (E0207). Nesting is limited to 256 levels (E0209).

`warna agar` needs no special rule: `warna` is followed by a statement, and that statement is an `ifStmt`. A statement that begins with `{` is a block, as in JavaScript; wrap a dictionary literal in parentheses or assign it to a variable.

## Built-in functions

| Name | Behaviour |
| --- | --- |
| `bolo(a, b, ...)` | Print the values separated by spaces, then a newline |
| `suno(prompt)` | Print the prompt, read one line, return it as a string |
| `lambai(x)` | Length of a string, list or dictionary |
| `joro(list, x)` | Append `x` to a list |
| `nikalo(list)` | Remove and return the last element |
| `sankhya(x)` | Convert a string to a number; error if invalid |
| `shabd(x)` | Convert any value to its string form (`sach`, `jhooth`, `khaali` for those values) |
| `prakar(x)` | Type name as a string: `sankhya`, `shabd`, `bool`, `khaali`, `soochi`, `kosh`, `kaam` |

### Standard library

Maths (numbers only; E0416 otherwise):

| Name | Behaviour |
| --- | --- |
| `mod(x)` | Absolute value: `mod(-4)` is `4` |
| `vargmool(x)` | Square root; negative `x` is E0417 |
| `ghaat(a, b)` | `a` to the power `b`; a negative `a` with a fractional `b` is E0417 |
| `gol(x)` | Round to the nearest whole number; halves go away from zero (`gol(2.5)` is `3`) |
| `neeche(x)` / `upar(x)` | Round down / round up |
| `adhiktam(...)` / `nyuntam(...)` | Largest / smallest of the numbers given, or of one list of numbers; none is E0414 |
| `kismat(a, b)` | Random whole number from `a` to `b`, both included; `a > b` is E0417 |

Text:

| Name | Behaviour |
| --- | --- |
| `todo(text, sep)` | Split into a list of strings; an empty `sep` splits into single characters |
| `milao(list, sep)` | Join the items (converted like `shabd`) with `sep` between them |
| `bade(text)` / `chhote(text)` | Upper case / lower case |
| `saaf(text)` | Remove spaces, tabs and newlines from both ends |
| `badlo(text, old, new)` | Replace every `old` with `new`; an empty `old` is E0417 |

Strings and lists:

| Name | Behaviour |
| --- | --- |
| `hai(x, item)` | `sach` if a list holds `item` (compared like `==`), a string contains the string `item`, or a dictionary has the key `item` |
| `kahan(x, item)` | Position of the first `item` in a list or string, or `-1` |
| `kaato(x, start, end)` | New list or string from `start` up to, not including, `end`; both from 0 to the length (E0410), `end < start` is E0417 |
| `ulta(x)` | New list or string in reverse order |
| `chhanto(list)` | New list sorted smallest first; all numbers or all strings, else E0416 |
| `har(list, f)` | New list of `f(item)` for each item |
| `chuno(list, f)` | New list of the items for which `f(item)` is `sach`; a non-boolean answer is E0405 |
| `daalo(list, i, x)` | Insert `x` at position `i` (0 to the length) |
| `hatao(list, i)` | Remove and return the item at position `i` |
| `chaabiyan(dict)` | List of the keys, in insertion order |

`chhanto`, `ulta`, `kaato`, `har` and `chuno` never change their input. String positions count Unicode code points, like indexing. A program may declare its own variable with a built-in's name; it hides the built-in.

Booleans and null print as `sach`, `jhooth` and `khaali`; only `shabd` does this conversion, never a variable read (defects 7 and 8).

### Collections, strings and conversion

- A list or string index is a whole number from 0 to length - 1; anything outside is E0410, another type E0411. Assigning to a list index replaces an element and never grows the list.
- Dictionary keys are strings (E0411 otherwise). Reading a missing key gives `khaali`; writing it adds the key. In a literal the last duplicate wins.
- Strings can be indexed but not changed (E0413). Indexing and `lambai` count Unicode code points.
- `a[i] += x` evaluates `a` and `i` once.
- Lists print as `[1, "a"]` and dictionaries as `{"k": 1}`, in insertion order, with strings quoted and escaped. A collection inside itself prints as `[...]` or `{...}`.
- `nikalo` on an empty list is E0414.
- `sankhya` takes a string: an optional `-`, digits and an optional fraction, with surrounding spaces ignored. Other text is E0415. A built-in given the wrong type is E0416.
- `suno` hands its prompt to the host and returns the line without its ending; at end of input it returns `""`.

## Examples

**Hello, world**

```text
bolo("Namaste, duniya!");
```

**Variables, constants and types**

```text
rakho naam = "Asha";
rakho umar = 25;
pakka PI = 3.14159;
rakho student = sach;
rakho kuch_nahi = khaali;
bolo(naam, umar, student, prakar(umar));   // Asha 25 sach sankhya
```

**Conditions**

```text
rakho marks = 82;
agar (marks >= 90) {
    bolo("A");
} warna agar (marks >= 75) {
    bolo("B");
} warna {
    bolo("C");
}
```

**Loops**

```text
rakho i = 1;
jabtak (i <= 5) {
    agar (i == 4) { ruko; }
    bolo(i);
    i += 1;
}

chalo (rakho j = 0; j < 3; j += 1) {
    agar (j == 1) { agla; }
    bolo("j =", j);
}
```

**Functions, recursion and closures**

```text
kaam jodo(a, b) { wapas a + b; }
bolo(jodo(2, 3));                       // 5

kaam factorial(n) {
    agar (n <= 1) { wapas 1; }
    wapas n * factorial(n-1);           // works: '-' is never part of a number
}
bolo(factorial(5));                     // 120

kaam counter() {
    rakho c = 0;
    wapas kaam () { c += 1; wapas c; };
}
rakho gino = counter();
gino();
bolo(gino());                           // 2
```

**Lists and dictionaries**

```text
rakho fal = ["aam", "kela", 1 + 2];     // elements are full expressions
fal[0] = "seb";                         // index assignment works
joro(fal, "angoor");
bolo(lambai(fal), fal[1]);              // 4 kela

rakho chhatra = { "naam": "Ravi", "shehar": "Pune" };
chhatra["umar"] = 21;
bolo(chhatra["naam"], lambai(chhatra));  // Ravi 3
```

**Input and output**

```text
rakho naam = suno("Aapka naam? ");
rakho saal = sankhya(suno("Janm ka saal? "));
bolo("Namaste " + naam + ", umar kareeb", 2026 - saal);
```

**FizzBuzz**

```text
chalo (rakho n = 1; n <= 15; n += 1) {
    agar (n % 15 == 0)     { bolo("FizzBuzz"); }
    warna agar (n % 3 == 0) { bolo("Fizz"); }
    warna agar (n % 5 == 0) { bolo("Buzz"); }
    warna                  { bolo(n); }
}
```

## Error messages

Every diagnostic carries a code, file, line and column, and shows the source line with a caret. Messages are bilingual: Hinglish first, plain English in brackets, selectable with `--lang`.

```text
Galti E0301 [naam nahi mila] at kaam.hing:3:9
    bolo(totl);
         ^^^^
'totl' declare nahi hua (undefined variable). Kya aapka matlab 'total' tha?
```

With `--lang=hi` the location and call trace are in Hinglish too (`yahan: kaam.hing:3:9`).
The website playground uses this by default on its English pages.

Every message also has a Hindi version in Devanagari, selected with `lang: 'deva'` in the
library. The Hindi pages of the website use it; the command line does not offer it.
