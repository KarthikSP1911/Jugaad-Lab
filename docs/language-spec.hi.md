# भाषा की पूरी जानकारी v0.1 (मसौदा)

नाम, फ़ाइल एक्सटेंशन (`.hing`), CLI कमांड (`hinglish`) और कीवर्ड की वर्तनी
तब तक कच्ची है जब तक मालिक उन्हें पक्का नहीं करते।

> यह अंग्रेज़ी विवरण (`language-spec.md`) का अनुवाद है। दोनों में अंतर हो तो अंग्रेज़ी वाला सही माना जाएगा। कोड, कीवर्ड और built-in फ़ंक्शन के नाम रोमन लिपि में ही लिखे जाते हैं।

## डिज़ाइन के उसूल

1. **हर कीवर्ड एक शब्द।** कई शब्दों वाले कीवर्ड आसानी से टूट जाते हैं (defect 10)। इसलिए `else if` व्याकरण में दो अलग शब्दों से बनता है।
2. **कोई प्रोग्राम wrapper नहीं।** Hinglish ऊपर के स्टेटमेंट सीधे चलाता है।
3. **जाना-पहचाना ढाँचा।** ब्लॉक के लिए `{ }`, शर्त के आसपास `( )` और आख़िर में `;`, ताकि गलती होने पर `;` से दोबारा सँभला जा सके।
4. **जहाँ बग पकड़े, वहाँ सख़्त।** अनजान नाम, कॉन्स्टेंट को बदलना, गलत गिनती के arguments और बिना boolean वाली शर्त, सब एरर हैं; चुपचाप कुछ नहीं होता।
5. **हर कीवर्ड की एक मुख्य वर्तनी, और आम दूसरी वर्तनियाँ भी मान्य।** रोमन हिंदी की कोई तय वर्तनी नहीं है (`jhooth`, `jhuth`; `wapas`, `vapas`)। Lexer कीवर्ड एक तालिका से पढ़ता है, इसलिए दूसरी वर्तनियाँ मुख्य वर्तनी के उपनाम (alias) हैं, parser को छुए बिना। दस्तावेज़ और आउटपुट सिर्फ़ मुख्य वर्तनी इस्तेमाल करते हैं।

## कीवर्ड

| मतलब | कीवर्ड |
| --- | --- |
| वेरिएबल / कॉन्स्टेंट | `rakho` / `pakka` |
| फ़ंक्शन / मान लौटाना | `kaam` / `wapas` |
| अगर / वरना | `agar` / `warna` (`warna agar` दो टोकन हैं) |
| सच / झूठ / कुछ नहीं | `sach` / `jhooth` / `khaali` |
| जब तक / गिनती वाला लूप | `jabtak` / `chalo (init; test; step)` |
| लूप तोड़ो / अगला चक्कर | `ruko` / `agla` |
| और / या / नहीं | `aur` / `ya` / `nahi` (`&&`, `\|\|`, `!` के दूसरे नाम) |

`bolo` और `suno` built-in फ़ंक्शन हैं, कीवर्ड नहीं। आरक्षित शब्द छोटे-बड़े अक्षर का
फ़र्क मानते हैं और उन्हें नाम (identifier) की तरह इस्तेमाल नहीं किया जा सकता।

**दूसरी वर्तनियाँ।** ये वर्तनियाँ भी मान्य हैं और बिल्कुल मुख्य वर्तनी जैसा काम करती हैं: `jhoot`, `jhuth`, `jhut`, `jhoothh` → `jhooth`; `vapas`, `waapas`, `vaapas` → `wapas`; `varna` → `warna`; `sachh`, `sacch` → `sach`; `khali` → `khaali`; `nahin`, `nhi` → `nahi`; `yaa` → `ya`; `pakaa`, `pukka` → `pakka`। ये भी आरक्षित शब्द हैं। आउटपुट और संदेश हमेशा मुख्य वर्तनी दिखाते हैं (`shabd(jhoot)` है `"jhooth"`)।

## शब्दों के नियम और टाइप

- **नाम (identifiers):** एक अक्षर या `_`, उसके बाद अक्षर, अंक या `_`। यूनिकोड अक्षर, अंक और मात्राएँ (`ID_Start`, `ID_Continue`) चलते हैं, इसलिए देवनागरी नाम भी काम करते हैं।
- **संख्याएँ:** बिना चिह्न वाले दशमलव (`42`, `3.14`)। आगे लगा `-` हमेशा ऑपरेटर होता है, संख्या का हिस्सा नहीं (defect 1 इसी से ठीक हुआ)।
- **स्ट्रिंग:** `"..."` या `'...'`, escapes `\n \t \\ \" \'` के साथ। MVP में स्ट्रिंग एक से ज़्यादा लाइन में नहीं फैल सकती।
- **टिप्पणियाँ (comments):** `// line` और `/* block */`।

| टाइप | कैसे लिखें | ध्यान दें |
| --- | --- | --- |
| संख्या | `42`, `3.14` | 64-bit float; `/` हमेशा दशमलव वाला भाग देता है |
| स्ट्रिंग | `"namaste"` | बदली नहीं जा सकती; किसी भी तरफ़ स्ट्रिंग हो तो `+` जोड़ता है |
| boolean | `sach`, `jhooth` | शर्त में सिर्फ़ यही चलते हैं |
| null | `khaali` |  |
| लिस्ट | `[1, 2, 3]` | बदली जा सकती है, 0 से गिनती, आइटम कोई भी expression |
| डिक्शनरी | `{ "naam": "Asha" }` | स्ट्रिंग कुंजियाँ; `d["naam"]` पढ़ता और लिखता है |
| फ़ंक्शन | `kaam (a) { ... }` | मान की तरह चलता है, अपने बनने की जगह याद रखता है |

**अभी से पक्के नियम:** `==` और `!=` टाइप नहीं बदलते (`1 == "1"` `jhooth` है); `<`, `<=`, `>`, `>=` सिर्फ़ दो संख्याएँ या दो स्ट्रिंग लेते हैं; सीमा से बाहर का इंडेक्स runtime एरर है, `undefined` नहीं; फ़ंक्शन अपने ब्लॉक में hoist होते हैं, इसलिए एक-दूसरे को बुला सकते हैं।

## ऑपरेटर, सबसे कम से सबसे ज़्यादा प्राथमिकता

| स्तर | ऑपरेटर | दिशा |
| --- | --- | --- |
| 1 | `=` `+=` `-=` `*=` `/=` `%=` | दाएँ से |
| 2 | `\|\|` `ya` | बाएँ से, short-circuit |
| 3 | `&&` `aur` | बाएँ से, short-circuit |
| 4 | `==` `!=` | बाएँ से |
| 5 | `<` `<=` `>` `>=` | बाएँ से |
| 6 | `+` `-` | बाएँ से |
| 7 | `*` `/` `%` | बाएँ से |
| 8 | एकल (unary) `!` `nahi` `-` | दाएँ से |
| 9 | call `f(x)`, इंडेक्स `a[i]` | बाएँ से |

`&&` और `||` boolean लौटाते हैं और short-circuit करते हैं।

## व्याकरण (EBNF)

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

**चलते समय:** शून्य से भाग या शेषफल एरर है (E0403)। `!`, `&&` और `||` के ऑपरेंड boolean होने चाहिए (E0405)। `==` लिस्ट, डिक्शनरी और फ़ंक्शन को पहचान (identity) से मिलाता है। `chalo` लूप का वेरिएबल सारे चक्करों में एक ही रहता है। नाम अपने declaration के बाद से दिखता है (फ़ंक्शन अपने ब्लॉक की शुरुआत से); मान मिलने से पहले उसे छूना E0406 है।

`rakho x;` से `x` का मान `khaali` होता है। `pakka` को शुरुआती मान चाहिए (E0206)। `agar`, `warna`, `jabtak` या `chalo` की body एक स्टेटमेंट है, इसलिए वहाँ declaration के लिए ब्लॉक चाहिए (E0207)। Nesting 256 स्तर तक ही हो सकती है (E0209)।

`warna agar` के लिए अलग नियम नहीं चाहिए: `warna` के बाद एक स्टेटमेंट आता है, और वह स्टेटमेंट एक `ifStmt` है। `{` से शुरू होने वाला स्टेटमेंट ब्लॉक होता है, JavaScript की तरह; डिक्शनरी literal को कोष्ठक में लिखिए या किसी वेरिएबल में रखिए।

## Built-in फ़ंक्शन

| नाम | क्या करता है |
| --- | --- |
| `bolo(a, b, ...)` | मानों को स्पेस के साथ प्रिंट करता है, फिर नई लाइन |
| `suno(prompt)` | प्रॉम्प्ट प्रिंट करता है, एक लाइन पढ़ता है, उसे स्ट्रिंग की तरह लौटाता है |
| `lambai(x)` | स्ट्रिंग, लिस्ट या डिक्शनरी की लंबाई |
| `joro(list, x)` | लिस्ट के आख़िर में `x` जोड़ता है |
| `nikalo(list)` | आख़िरी आइटम हटाकर लौटाता है |
| `sankhya(x)` | स्ट्रिंग को संख्या बनाता है; गलत हो तो एरर |
| `shabd(x)` | किसी भी मान को स्ट्रिंग बनाता है (`sach`, `jhooth`, `khaali` वैसे ही) |
| `prakar(x)` | टाइप का नाम स्ट्रिंग में: `sankhya`, `shabd`, `bool`, `khaali`, `soochi`, `kosh`, `kaam` |

### मानक लाइब्रेरी (standard library)

गणित (सिर्फ़ संख्याएँ; वरना E0416):

| नाम | क्या करता है |
| --- | --- |
| `mod(x)` | निरपेक्ष मान (बिना माइनस): `mod(-4)` है `4` |
| `vargmool(x)` | वर्गमूल; ऋणात्मक `x` E0417 है |
| `ghaat(a, b)` | `a` की `b` घात; ऋणात्मक `a` और अधूरी `b` E0417 है |
| `gol(x)` | सबसे पास की पूर्ण संख्या तक गोल; आधा शून्य से दूर जाता है (`gol(2.5)` है `3`) |
| `neeche(x)` / `upar(x)` | नीचे की ओर / ऊपर की ओर गोल |
| `adhiktam(...)` / `nyuntam(...)` | दी गई संख्याओं (या एक लिस्ट) में सबसे बड़ी / सबसे छोटी; कुछ न हो तो E0414 |
| `kismat(a, b)` | `a` से `b` तक कोई भी पूर्ण संख्या (दोनों शामिल); `a > b` E0417 है |

टेक्स्ट:

| नाम | क्या करता है |
| --- | --- |
| `todo(text, sep)` | तोड़कर स्ट्रिंग की लिस्ट बनाता है; ख़ाली `sep` एक-एक अक्षर अलग करता है |
| `milao(list, sep)` | आइटमों को (`shabd` की तरह बदलकर) बीच में `sep` लगाकर जोड़ता है |
| `bade(text)` / `chhote(text)` | बड़े अक्षर / छोटे अक्षर |
| `saaf(text)` | दोनों ओर से स्पेस, टैब और नई लाइन हटाता है |
| `badlo(text, old, new)` | हर `old` को `new` से बदलता है; ख़ाली `old` E0417 है |

स्ट्रिंग और लिस्ट:

| नाम | क्या करता है |
| --- | --- |
| `hai(x, item)` | `sach` अगर लिस्ट में `item` है (`==` की तरह मिलाकर), स्ट्रिंग में स्ट्रिंग `item` है, या डिक्शनरी में कुंजी `item` है |
| `kahan(x, item)` | लिस्ट या स्ट्रिंग में पहले `item` की जगह, या `-1` |
| `kaato(x, start, end)` | `start` से `end` तक (end शामिल नहीं) नई लिस्ट या स्ट्रिंग; दोनों 0 से लंबाई तक (E0410), `end < start` E0417 है |
| `ulta(x)` | उलटे क्रम में नई लिस्ट या स्ट्रिंग |
| `chhanto(list)` | छोटे से बड़े क्रम में नई लिस्ट; सब संख्याएँ या सब स्ट्रिंग, वरना E0416 |
| `har(list, f)` | हर आइटम के लिए `f(item)` की नई लिस्ट |
| `chuno(list, f)` | सिर्फ़ वे आइटम जिनके लिए `f(item)` `sach` है; boolean न मिले तो E0405 |
| `daalo(list, i, x)` | जगह `i` (0 से लंबाई तक) पर `x` डालता है |
| `hatao(list, i)` | जगह `i` वाला आइटम हटाकर लौटाता है |
| `chaabiyan(dict)` | कुंजियों की लिस्ट, जिस क्रम में डाली गई थीं |

`chhanto`, `ulta`, `kaato`, `har` और `chuno` अपना इनपुट कभी नहीं बदलते। स्ट्रिंग की जगहें यूनिकोड code points गिनती हैं, इंडेक्सिंग की तरह। प्रोग्राम किसी built-in के नाम का अपना वेरिएबल बना सकता है; तब वह built-in छिप जाता है।

Boolean और null `sach`, `jhooth` और `khaali` की तरह प्रिंट होते हैं; यह बदलाव सिर्फ़ `shabd` करता है, वेरिएबल पढ़ना कभी नहीं (defects 7 और 8)।

### लिस्ट, डिक्शनरी, स्ट्रिंग और बदलाव

- लिस्ट या स्ट्रिंग का इंडेक्स 0 से लंबाई - 1 तक की पूर्ण संख्या है; बाहर हो तो E0410, दूसरा टाइप हो तो E0411। लिस्ट के इंडेक्स पर लिखना एक आइटम बदलता है, लिस्ट को कभी बढ़ाता नहीं।
- डिक्शनरी की कुंजियाँ स्ट्रिंग होती हैं (वरना E0411)। जो कुंजी नहीं है उसे पढ़ने पर `khaali` मिलता है; लिखने पर कुंजी जुड़ जाती है। Literal में एक ही कुंजी दो बार हो तो आख़िरी वाली जीतती है।
- स्ट्रिंग का इंडेक्स पढ़ सकते हैं पर बदल नहीं सकते (E0413)। इंडेक्सिंग और `lambai` यूनिकोड code points गिनते हैं।
- `a[i] += x` में `a` और `i` एक ही बार चलते हैं।
- लिस्ट `[1, "a"]` और डिक्शनरी `{"k": 1}` की तरह प्रिंट होती हैं, डालने के क्रम में, स्ट्रिंग quote और escape के साथ। अपने अंदर ख़ुद हो तो collection `[...]` या `{...}` दिखता है।
- ख़ाली लिस्ट पर `nikalo` E0414 है।
- `sankhya` स्ट्रिंग लेता है: चाहें तो `-`, फिर अंक, चाहें तो दशमलव; आसपास की स्पेस अनदेखी। बाकी टेक्स्ट E0415 है। Built-in को गलत टाइप मिले तो E0416।
- `suno` अपना प्रॉम्प्ट host को देता है और लाइन बिना line-ending के लौटाता है; इनपुट ख़त्म हो तो `""` लौटाता है।

## उदाहरण

**नमस्ते, दुनिया**

```text
bolo("Namaste, duniya!");
```

**वेरिएबल, कॉन्स्टेंट और टाइप**

```text
rakho naam = "Asha";
rakho umar = 25;
pakka PI = 3.14159;
rakho student = sach;
rakho kuch_nahi = khaali;
bolo(naam, umar, student, prakar(umar));   // Asha 25 sach sankhya
```

**शर्तें**

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

**लूप**

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

**फ़ंक्शन, recursion और क्लोज़र**

```text
kaam jodo(a, b) { wapas a + b; }
bolo(jodo(2, 3));                       // 5

kaam factorial(n) {
    agar (n <= 1) { wapas 1; }
    wapas n * factorial(n-1);           // चलता है: '-' कभी संख्या का हिस्सा नहीं
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

**लिस्ट और डिक्शनरी**

```text
rakho fal = ["aam", "kela", 1 + 2];     // आइटम पूरे expression हो सकते हैं
fal[0] = "seb";                         // इंडेक्स पर लिखना चलता है
joro(fal, "angoor");
bolo(lambai(fal), fal[1]);              // 4 kela

rakho chhatra = { "naam": "Ravi", "shehar": "Pune" };
chhatra["umar"] = 21;
bolo(chhatra["naam"], lambai(chhatra));  // Ravi 3
```

**इनपुट और आउटपुट**

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

## एरर संदेश

हर diagnostic में कोड, फ़ाइल, लाइन और कॉलम होता है, और source लाइन के नीचे गलती पर निशान (caret) लगता है। संदेश दो भाषाओं में हैं: पहले हिंग्लिश (रोमन लिपि), फिर सरल अंग्रेज़ी कोष्ठक में; `--lang` से चुनिए।

```text
Galti E0301 [naam nahi mila] at kaam.hing:3:9
    bolo(totl);
         ^^^^
'totl' declare nahi hua (undefined variable). Kya aapka matlab 'total' tha?
```

`--lang=hi` के साथ जगह और call trace भी हिंग्लिश में आते हैं (`yahan: kaam.hing:3:9`)।
वेबसाइट का प्लेग्राउंड यही default में इस्तेमाल करता है।
