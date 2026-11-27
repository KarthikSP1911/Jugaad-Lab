# Bhasha ki poori jaankari v0.1 (draft)

Naam, file extension (`.hing`), CLI command (`hinglish`) aur keywords ki spelling
tab tak kachchi hai jab tak owner unhe pakka nahi karte.

> Yeh English spec (`language-spec.md`) ka anuvaad hai. Dono mein fark ho to English wala sahi maana jaayega.

## Design ke usool

1. **Har keyword ek shabd.** Kai shabdon wale keywords aasaani se toot jaate hain (defect 10). Isliye `else if` grammar mein do alag shabdon se banta hai.
2. **Koi program wrapper nahi.** Hinglish upar ke statements seedhe chalata hai.
3. **Jaana-pehchaana dhaancha.** Blocks ke liye braces `{ }`, shart ke aas-paas parentheses `( )` aur aakhir mein `;`, taaki galti hone par `;` se dobara sambhla ja sake.
4. **Jahan bug pakde, wahan sakht.** Anjaan naam, constant ko badalna, galat ginti ke arguments aur bina boolean wali shart, sab errors hain, chupchaap kuch nahi hota.
5. **Har keyword ki ek mukhya spelling, aur aam doosri spellings bhi chalti hain.** Roman Hindi ki koi tay spelling nahi hai (`jhooth`, `jhuth`; `wapas`, `vapas`). Lexer keywords ek table se padhta hai, isliye doosri spellings mukhya spelling ke alias hain, parser ko chhede bina. Docs aur output sirf mukhya spelling use karte hain.

## Keywords

| Matlab | Keyword |
| --- | --- |
| variable / constant | `rakho` / `pakka` |
| function / wapas bhejna | `kaam` / `wapas` |
| agar / warna | `agar` / `warna` (`warna agar` do tokens hain) |
| sach / jhooth / kuch nahi | `sach` / `jhooth` / `khaali` |
| jab tak / ginti wala loop | `jabtak` / `chalo (init; test; step)` |
| loop todo / agla round | `ruko` / `agla` |
| aur / ya / nahi | `aur` / `ya` / `nahi` (`&&`, `\|\|`, `!` ke doosre naam) |

`bolo` aur `suno` built-in functions hain, keywords nahi. Reserved shabd chhote-bade
akshar ka fark maante hain aur unhe naam (identifier) ki tarah istemaal nahi kiya ja sakta.

**Doosri spellings.** Yeh spellings bhi chalti hain aur bilkul mukhya spelling jaisa kaam karti hain: `jhoot`, `jhuth`, `jhut`, `jhoothh` → `jhooth`; `vapas`, `waapas`, `vaapas` → `wapas`; `varna` → `warna`; `sachh`, `sacch` → `sach`; `khali` → `khaali`; `nahin`, `nhi` → `nahi`; `yaa` → `ya`; `pakaa`, `pukka` → `pakka`. Yeh bhi reserved shabd hain. Output aur messages hamesha mukhya spelling dikhate hain (`shabd(jhoot)` hai `"jhooth"`).

## Shabdon ke niyam aur types

- **Naam (identifiers):** ek akshar ya `_`, uske baad akshar, ank ya `_`. Unicode akshar, ank aur matraayein (`ID_Start`, `ID_Continue`) chalte hain, isliye Devanagari naam bhi kaam karte hain.
- **Numbers:** bina chinh wale decimal (`42`, `3.14`). Aage laga `-` hamesha operator hota hai, number ka hissa nahi (defect 1 isi se theek hua).
- **Strings:** `"..."` ya `'...'`, escapes `\n \t \\ \" \'` ke saath. MVP mein string ek se zyada line mein nahi faila sakti.
- **Comments:** `// line` aur `/* block */`.

| Type | Kaise likhein | Dhyaan dein |
| --- | --- | --- |
| number | `42`, `3.14` | 64-bit float; `/` hamesha dashmlav wala bhaag deta hai |
| string | `"namaste"` | badli nahi ja sakti; koi bhi taraf string ho to `+` jodta hai |
| boolean | `sach`, `jhooth` | shart mein sirf yahi chalte hain |
| null | `khaali` |  |
| list | `[1, 2, 3]` | badli ja sakti hai, 0 se ginti, items koi bhi expression |
| dictionary | `{ "naam": "Asha" }` | string keys; `d["naam"]` padhta aur likhta hai |
| function | `kaam (a) { ... }` | value ki tarah chalta hai, apne banne ki jagah yaad rakhta hai |

**Abhi se pakke niyam:** `==` aur `!=` type nahi badalte (`1 == "1"` `jhooth` hai); `<`, `<=`, `>`, `>=` sirf do numbers ya do strings lete hain; range ke bahar index runtime error hai, `undefined` nahi; functions apne block mein hoist hote hain, isliye ek-doosre ko bula sakte hain.

## Operators, sabse kam se sabse zyada precedence

| Level | Operators | Associativity |
| --- | --- | --- |
| 1 | `=` `+=` `-=` `*=` `/=` `%=` | daayein se |
| 2 | `\|\|` `ya` | baayein se, short-circuit |
| 3 | `&&` `aur` | baayein se, short-circuit |
| 4 | `==` `!=` | baayein se |
| 5 | `<` `<=` `>` `>=` | baayein se |
| 6 | `+` `-` | baayein se |
| 7 | `*` `/` `%` | baayein se |
| 8 | unary `!` `nahi` `-` | daayein se |
| 9 | call `f(x)`, index `a[i]` | baayein se |

`&&` aur `||` boolean lautaate hain aur short-circuit karte hain.

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

**Chalte samay:** zero se bhaag ya shesh error hai (E0403). `!`, `&&` aur `||` ke operands boolean hone chahiye (E0405). `==` lists, dictionaries aur functions ko pehchaan (identity) se milata hai. `chalo` loop ka variable saare rounds mein ek hi rehta hai. Naam apne declaration ke baad se dikhta hai (functions apne block ki shuruaat se); value milne se pehle use chhoona E0406 hai.

`rakho x;` se `x` ki value `khaali` hoti hai. `pakka` ko shuruaati value chahiye (E0206). `agar`, `warna`, `jabtak` ya `chalo` ki body ek statement hai, isliye wahan declaration ke liye block chahiye (E0207). Nesting 256 levels tak hi ho sakti hai (E0209).

`warna agar` ke liye alag niyam nahi chahiye: `warna` ke baad ek statement aata hai, aur woh statement ek `ifStmt` hai. `{` se shuru hone wala statement block hota hai, JavaScript ki tarah; dictionary literal ko parentheses mein likhiye ya kisi variable mein rakhiye.

## Built-in functions

| Naam | Kya karta hai |
| --- | --- |
| `bolo(a, b, ...)` | Values ko space ke saath print karta hai, phir nayi line |
| `suno(prompt)` | Prompt print karta hai, ek line padhta hai, use string ki tarah lautata hai |
| `lambai(x)` | String, list ya dictionary ki lambai |
| `joro(list, x)` | List ke aakhir mein `x` jodta hai |
| `nikalo(list)` | Aakhri item hata kar lautata hai |
| `sankhya(x)` | String ko number banata hai; galat ho to error |
| `shabd(x)` | Kisi bhi value ko string banata hai (`sach`, `jhooth`, `khaali` waise hi) |
| `prakar(x)` | Type ka naam string mein: `sankhya`, `shabd`, `bool`, `khaali`, `soochi`, `kosh`, `kaam` |

### Standard library

Ganit (sirf numbers; warna E0416):

| Naam | Kya karta hai |
| --- | --- |
| `mod(x)` | Bina minus ki value: `mod(-4)` hai `4` |
| `vargmool(x)` | Square root; negative `x` E0417 hai |
| `ghaat(a, b)` | `a` ki `b` ghaat (power); negative `a` aur adhoori `b` E0417 hai |
| `gol(x)` | Sabse paas ke poore number tak gol; aadha zero se door jaata hai (`gol(2.5)` hai `3`) |
| `neeche(x)` / `upar(x)` | Neeche ki taraf / upar ki taraf gol |
| `adhiktam(...)` / `nyuntam(...)` | Diye gaye numbers (ya ek list) mein sabse bada / sabse chhota; kuch na ho to E0414 |
| `kismat(a, b)` | `a` se `b` tak koi bhi poora number (dono shaamil); `a > b` E0417 hai |

Text:

| Naam | Kya karta hai |
| --- | --- |
| `todo(text, sep)` | Tod kar strings ki list banata hai; khaali `sep` ek-ek akshar alag karta hai |
| `milao(list, sep)` | Items ko (`shabd` ki tarah badal kar) beech mein `sep` laga kar jodta hai |
| `bade(text)` / `chhote(text)` | Bade akshar / chhote akshar |
| `saaf(text)` | Dono taraf se space, tab aur nayi line hatata hai |
| `badlo(text, old, new)` | Har `old` ko `new` se badalta hai; khaali `old` E0417 hai |

Strings aur lists:

| Naam | Kya karta hai |
| --- | --- |
| `hai(x, item)` | `sach` agar list mein `item` hai (`==` ki tarah milakar), string mein string `item` hai, ya dictionary mein key `item` hai |
| `kahan(x, item)` | List ya string mein pehle `item` ki jagah, ya `-1` |
| `kaato(x, start, end)` | `start` se `end` tak (end shaamil nahi) nayi list ya string; dono 0 se lambai tak (E0410), `end < start` E0417 hai |
| `ulta(x)` | Ulte kram mein nayi list ya string |
| `chhanto(list)` | Chhote se bade kram mein nayi list; sab numbers ya sab strings, warna E0416 |
| `har(list, f)` | Har item ke liye `f(item)` ki nayi list |
| `chuno(list, f)` | Sirf woh items jinke liye `f(item)` `sach` hai; boolean na mile to E0405 |
| `daalo(list, i, x)` | Jagah `i` (0 se lambai tak) par `x` daalta hai |
| `hatao(list, i)` | Jagah `i` wala item hata kar lautata hai |
| `chaabiyan(dict)` | Keys ki list, jis kram mein daali gayi thi |

`chhanto`, `ulta`, `kaato`, `har` aur `chuno` apna input kabhi nahi badalte. String ki jagahein Unicode code points ginti hain, indexing ki tarah. Program built-in ke naam ka apna variable bana sakta hai; tab woh built-in chhup jaata hai.

Booleans aur null `sach`, `jhooth` aur `khaali` ki tarah print hote hain; yeh badlaav sirf `shabd` karta hai, variable padhna kabhi nahi (defects 7 aur 8).

### Collections, strings aur badlaav

- List ya string ka index 0 se lambai - 1 tak ka poora number hai; bahar ho to E0410, doosra type ho to E0411. List ke index par likhna ek item badalta hai, list ko kabhi badhata nahi.
- Dictionary ki keys strings hoti hain (warna E0411). Na maujood key padhne par `khaali` milta hai; likhne par key jud jaati hai. Literal mein ek hi key do baar ho to aakhri wali jeetti hai.
- Strings ka index padh sakte hain par badal nahi sakte (E0413). Indexing aur `lambai` Unicode code points ginte hain.
- `a[i] += x` mein `a` aur `i` ek hi baar chalte hain.
- Lists `[1, "a"]` aur dictionaries `{"k": 1}` ki tarah print hoti hain, daalne ke kram mein, strings quote aur escape ke saath. Apne andar khud ho to collection `[...]` ya `{...}` dikhta hai.
- Khaali list par `nikalo` E0414 hai.
- `sankhya` string leta hai: chahein to `-`, phir ank, chahein to dashmlav; aas-paas ki spaces nazarandaaz. Baaki text E0415 hai. Built-in ko galat type mile to E0416.
- `suno` apna prompt host ko deta hai aur line bina line-ending ke lautata hai; input khatam ho to `""` lautata hai.

## Examples

**Namaste, duniya**

```text
bolo("Namaste, duniya!");
```

**Variables, constants aur types**

```text
rakho naam = "Asha";
rakho umar = 25;
pakka PI = 3.14159;
rakho student = sach;
rakho kuch_nahi = khaali;
bolo(naam, umar, student, prakar(umar));   // Asha 25 sach sankhya
```

**Shartein**

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

**Functions, recursion aur closures**

```text
kaam jodo(a, b) { wapas a + b; }
bolo(jodo(2, 3));                       // 5

kaam factorial(n) {
    agar (n <= 1) { wapas 1; }
    wapas n * factorial(n-1);           // chalta hai: '-' kabhi number ka hissa nahi
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

**Lists aur dictionaries**

```text
rakho fal = ["aam", "kela", 1 + 2];     // items poore expressions ho sakte hain
fal[0] = "seb";                         // index par likhna chalta hai
joro(fal, "angoor");
bolo(lambai(fal), fal[1]);              // 4 kela

rakho chhatra = { "naam": "Ravi", "shehar": "Pune" };
chhatra["umar"] = 21;
bolo(chhatra["naam"], lambai(chhatra));  // Ravi 3
```

**Input aur output**

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

Har diagnostic mein code, file, line aur column hota hai, aur source line ke neeche galti par nishaan (caret) lagta hai. Sandesh do bhashaon mein hain: pehle Hinglish, phir saral English brackets mein; `--lang` se chuniye.

```text
Galti E0301 [naam nahi mila] at kaam.hing:3:9
    bolo(totl);
         ^^^^
'totl' declare nahi hua (undefined variable). Kya aapka matlab 'total' tha?
```

`--lang=hi` ke saath jagah aur call trace bhi Hinglish mein aate hain (`yahan: kaam.hing:3:9`).
Website ka playground yahi default mein use karta hai.
