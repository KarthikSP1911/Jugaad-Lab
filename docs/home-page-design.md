# Home page design

Later change: the hero's runnable demo was replaced by an illustration with
Mithu (`components/home/hero-art.tsx`). The demo's layout, spacing and copy below
describe the earlier version; `hero-demo.tsx` is no longer used.

## Assumptions and departures from the brief

- No licence has been chosen, so the page says "Free to use in your browser" and
  "Source on GitHub", not "open source". The footer states the licence position.
- No star counts, testimonials or user numbers are shown, because none are verified.
- Later requests for less space under the navbar and wider side margins replace the
  brief's values: hero top padding is 24 / 64px (not 56 / 96px) and page padding is
  20 / 32 / 64px (not 16 / 20 / 24px).
- A later request for smaller hero text sets the headline to 36-56px (not 40-72px)
  and the subtitle to 17px.
- The hero editor is the playground's editor, so its padding stays 16px.
- Columns are 11fr / 9fr (55 / 45) and equal card tracks, not a literal 12-column grid.
- Keyword meanings and the version status reuse existing site text.

## Rationale

- One idea per example: the demo opens on a one-line program, and the others are tabs.
- The demo runs the real interpreter, so the first success happens on the home page.
- One primary action, "Start coding"; the docs button is visibly secondary.
- The keyword table answers "why this language?" before any prose does.
- Mithu stands on the code card, reacts to runs, and his message can be closed.
- Warm off-white, raised white cards and soft shadows separate areas without heavy borders.
- Two families in two weights, plus Devanagari; contrast is tested in both themes.
- The version status stays, folded away, so the page does not oversell a young language.

## Layout

| Section | Desktop (above 1024px) | Narrow screens |
| --- | --- | --- |
| Navbar | logo, links, tools, search, theme; 64px | logo, search, theme, menu; 56px below 640px |
| Hero | copy beside the demo (from 900px) | copy, then demo |
| Keywords | full-width table | the same table, text wrapping |
| Why learn with it | 3 columns | 2 from 640px, then 1 |
| Get started | 3 columns | 1 |
| Learning paths | 3 columns | 2 from 640px, then 1 |
| Community | 4 columns, status disclosure | 2 from 640px, then 1 |
| Footer | brand and 3 link columns | 2 from 640px, then 1 |

## Spacing audit

Tokens are defined in `apps/docs/styles/tokens.css`. Values are phone / tablet / desktop.

| Area | Property | Tokens | Pixels |
| --- | --- | --- | --- |
| Container | max content width | `--content` | 1200 |
| Container | side padding | `--space-4`+`1`, `--space-6`, `--space-8` | 20 / 32 / 64 |
| Navbar | height | `--header-height` | 56 / 64 / 64 |
| Navbar | item gap above 1024px | `--space-5` | 24 |
| Hero | padding top | `--space-5`, `--space-5`, `--space-8` | 24 / 24 / 64 |
| Hero | padding bottom | `--space-7` | 48 |
| Hero | column gap | `--space-6`, `--space-7` | 32 / 48 |
| Hero | headline to subtitle | `--space-4`+`1` | 20 |
| Hero | subtitle to buttons | `--space-6` | 32 |
| Hero | buttons to trust line | `--space-5` | 24 |
| Buttons | gap, minimum height | `--space-3`, `--space-7` | 12, 48 |
| Buttons | primary, secondary padding | `--pad-button` `--space-5`; `--space-3` `--space-4`+`1` | 14 24; 12 20 |
| Demo | card to output | `--space-4` | 16 |
| Demo | tabs padding; action bar and output padding | `--space-3` `--space-4`+`1`; `--space-4` `--space-4`+`1` | 12 20 (12 8 on phones); 16 20 |
| Mithu | size; perch overlap; right offset | `--bird`; 14/130 of it; `--space-5` | 72 / 80; 8 / 9; 24 |
| Sections | block padding | `--section-pad` | 56 / 48 / 64 |
| Sections | title to subtitle, to content | `--space-3`, `--space-6`+`2` | 12, 40 |
| Cards | padding, grid gap | `--space-5` | 24, 24 |
| Cards | icon to title, title to text | `--space-4`, `--space-2` | 16, 8 |
| Keyword table | cell padding, row gap | `--space-3` `--space-4`, `--space-2` | 12 16, 8 |
| Footer | padding top, bottom | `--space-8`, `--space-6` | 64, 32 |
| Footer | column gap, link gap | `--space-6`, `--gap-link` | 32, 10 (44px targets on touch) |
| Radius | small, button, card, pill | `--radius-*` | 6, 10, 14, 999 |

## Copy

### Home page

| Key | English | हिन्दी |
| --- | --- | --- |
| tagline | A small programming language with Roman-script Hindi keywords. | रोमन लिपि के हिन्दी कीवर्ड वाली एक छोटी प्रोग्रामिंग भाषा। |
| home.headingStart | Code likho,  | कोड लिखो,  |
| home.headingAccent | apni bhasha | अपनी भाषा |
| home.headingEnd |  mein. |  में। |
| home.subtitle | Learn variables, loops and functions with words you already say: rakho, jabtak, kaam. A small, real programming language that explains its errors in Hinglish. | वेरिएबल, लूप और फ़ंक्शन उन शब्दों से सीखें जो आप रोज़ बोलते हैं: rakho, jabtak, kaam। एक छोटी, असली प्रोग्रामिंग भाषा जो अपनी गलतियाँ हिन्दी में समझाती है। |
| home.primary | Start coding | कोड लिखना शुरू करें |
| home.secondary | Read the docs | दस्तावेज़ पढ़ें |
| home.trust.0 | Free to use in your browser | ब्राउज़र में मुफ़्त इस्तेमाल |
| home.trust.1 | Nothing to install | कुछ इंस्टॉल नहीं करना |
| home.trust.2 | Source on GitHub | सोर्स कोड GitHub पर |
| home.demo.tabsLabel | Example programs | उदाहरण प्रोग्राम |
| home.demo.tabs.hello | Hello World | नमस्ते |
| home.demo.tabs.factorial | Factorial | फ़ैक्टोरियल |
| home.demo.tabs.closures | Closures | क्लोज़र |
| home.demo.tabs.loops | Loops | लूप |
| home.demo.run | Run | चलाएँ |
| home.demo.stop | Stop | रोकें |
| home.demo.open | Open in playground → | प्लेग्राउंड में खोलें → |
| home.demo.output | Output | आउटपुट |
| home.demo.outputEmpty | Press Run. Your output appears here. | “चलाएँ” दबाएँ। आउटपुट यहाँ दिखेगा। |
| home.demo.editorHint | Edit the program, then press Run. Press Escape, then Tab, to leave the editor. | प्रोग्राम बदलें, फिर “चलाएँ” दबाएँ। एडिटर से बाहर जाने के लिए Escape, फिर Tab दबाएँ। |
| home.keywords.title | If you know the Hindi, you know the code | हिन्दी आती है, तो कोड भी आता है |
| home.keywords.subtitle | Each keyword is one Hinglish word standing in for a familiar English one. | हर कीवर्ड एक जाने-पहचाने अंग्रेज़ी शब्द की जगह लेने वाला हिन्दी शब्द है। |
| home.keywords.all | See every keyword in the cheatsheet → | सारे कीवर्ड झटपट सार में देखें → |
| home.features.title | Why learn with it? | इससे क्यों सीखें? |
| home.features.subtitle | Less time translating, more time thinking about logic. | अनुवाद में कम समय, तर्क सोचने में ज़्यादा। |
| home.features.items.0.title | Readable Hindi keywords | पढ़ने में आसान हिन्दी कीवर्ड |
| home.features.items.0.body | agar, warna, jabtak and kaam read like the sentence in your head. | agar, warna, jabtak और kaam आपके मन के वाक्य जैसे पढ़े जाते हैं। |
| home.features.items.1.title | Functions and closures | फ़ंक्शन और क्लोज़र |
| home.features.items.1.body | Pass functions around and let them remember values, as in larger languages. | बड़ी भाषाओं की तरह फ़ंक्शन आगे भेजें, और वे मान याद रखें। |
| home.features.items.2.title | Runs in your browser | आपके ब्राउज़र में चले |
| home.features.items.2.body | The interpreter runs on your device. Your code is not sent to a server. | इंटरप्रेटर आपके डिवाइस पर चलता है। आपका कोड किसी सर्वर पर नहीं जाता। |
| home.features.items.3.title | Errors that explain | समझाने वाली त्रुटियाँ |
| home.features.items.3.body | Line, column, a pointer to the mistake and a “did you mean” hint. | लाइन, कॉलम, गलती पर निशान और “क्या आपका मतलब था” वाला सुझाव। |
| home.features.items.4.title | Hindi docs | हिन्दी दस्तावेज़ |
| home.features.items.4.body | Every page and error message is also available in Devanagari. | हर पेज और त्रुटि संदेश देवनागरी में भी मिलता है। |
| home.features.items.5.title | Source on GitHub | सोर्स कोड GitHub पर |
| home.features.items.5.body | Read how the lexer, parser and interpreter work, line by line. | लेक्सर, पार्सर और इंटरप्रेटर का काम लाइन-दर-लाइन पढ़ें। |
| home.start.title | Get started in 3 steps | 3 कदम में शुरुआत |
| home.start.subtitle | Your first program takes about a minute. | पहला प्रोग्राम लगभग एक मिनट में। |
| home.start.openPlayground | Open the playground → | प्लेग्राउंड खोलें → |
| home.start.openDocs | Go to the docs → | दस्तावेज़ों पर जाएँ → |
| home.start.steps.0.title | Open the playground | प्लेग्राउंड खोलें |
| home.start.steps.0.body | It loads in your browser. No account and no setup. | यह ब्राउज़र में खुलता है। न खाता चाहिए, न सेटअप। |
| home.start.steps.1.title | Write your first program | पहला प्रोग्राम लिखें |
| home.start.steps.1.body | Copy this line, paste it into the editor and press Run. | यह लाइन कॉपी करें, एडिटर में डालें और “चलाएँ” दबाएँ। |
| home.start.steps.2.title | Explore the docs | दस्तावेज़ देखें |
| home.start.steps.2.body | Add a variable, then a loop, then a function of your own. | पहले एक वेरिएबल जोड़ें, फिर लूप, फिर अपना फ़ंक्शन। |
| home.paths.title | Pick your path | अपना रास्ता चुनें |
| home.paths.subtitle | Start where it suits you. | जहाँ से ठीक लगे, वहीं से शुरू करें। |
| home.paths.items.0.title | For students | विद्यार्थियों के लिए |
| home.paths.items.0.body | Set up, write a first program and build from there. | सेटअप करें, पहला प्रोग्राम लिखें और आगे बढ़ें। |
| home.paths.items.0.action | Getting started | शुरुआत करें |
| home.paths.items.1.title | For teachers | शिक्षकों के लिए |
| home.paths.items.1.body | One page of keywords and built-ins to project or print for class. | कक्षा में दिखाने या छापने के लिए कीवर्ड और फ़ंक्शन एक पेज पर। |
| home.paths.items.1.action | Open the cheatsheet | झटपट सार खोलें |
| home.paths.items.2.title | For fun projects | मज़ेदार प्रोजेक्ट के लिए |
| home.paths.items.2.body | Run short examples, from loops to FizzBuzz, then change them. | लूप से FizzBuzz तक छोटे उदाहरण चलाएँ, फिर उन्हें बदलें। |
| home.paths.items.2.action | Take the tour | भाषा की सैर करें |
| home.community.title | Build it with us | हमारे साथ बनाइए |
| home.community.subtitle | The language is young, and small contributions count. | भाषा अभी नई है, और छोटा योगदान भी मायने रखता है। |
| home.community.items.0.title | Star on GitHub | GitHub पर स्टार दें |
| home.community.items.0.body | Follow the project and help others find it. | प्रोजेक्ट से जुड़े रहें और दूसरों को इसे खोजने में मदद करें। |
| home.community.items.0.action | Open the repository | रिपॉज़िटरी खोलें |
| home.community.items.1.title | Contribute | योगदान करें |
| home.community.items.1.body | Fix a typo, review the Hindi text or add an example. | कोई वर्तनी सुधारें, हिन्दी पाठ जाँचें या उदाहरण जोड़ें। |
| home.community.items.1.action | Read the guide | गाइड पढ़ें (अंग्रेज़ी) |
| home.community.items.2.title | Report a problem | समस्या बताएँ |
| home.community.items.2.body | Found a confusing error or a bug? Tell us what happened. | कोई उलझी हुई त्रुटि या बग मिला? बताइए क्या हुआ। |
| home.community.items.2.action | Open the issue tracker | इश्यू ट्रैकर खोलें |
| home.community.items.3.title | Share your program | अपना प्रोग्राम साझा करें |
| home.community.items.3.body | Write it in the playground, press Share and send the link. | प्लेग्राउंड में लिखें, “साझा करें” दबाएँ और लिंक भेजें। |
| home.community.items.3.action | Write something | कुछ लिखें |
| home.community.status | What works in version 0.1.0 | संस्करण 0.1.0 में क्या चलता है |
| home.community.inVersion | In version 0.1.0 | संस्करण 0.1.0 में |
| home.community.notIn | Not in 0.1 | 0.1 में नहीं |

### Footer and mascot

| Key | English | हिन्दी |
| --- | --- | --- |
| footer.issues | Issue tracker | इश्यू ट्रैकर |
| footer.notices | Third-party notices | तीसरे पक्ष की सूचनाएँ |
| footer.licence | No licence has been chosen yet, so reuse of the source is not yet permitted. | अभी कोई लाइसेंस नहीं चुना गया है, इसलिए सोर्स कोड को दोबारा इस्तेमाल करने की अनुमति अभी नहीं है। |
| footer.credits | Built from its own specification by the Jugaad Lab project. | Jugaad Lab प्रोजेक्ट ने इसे अपने स्पेसिफ़िकेशन से बनाया है। |
| footer.workingName | (working name) | (कामचलाऊ नाम) |
| footer.version | Version | संस्करण |
| footer.source | Source on GitHub | GitHub पर सोर्स कोड |
| footer.learn | Learn | सीखें |
| footer.lookUp | Look up | देखें |
| footer.project | Project | प्रोजेक्ट |
| mascot.dismiss | Hide Mithu’s message | मिट्ठू का संदेश छिपाएँ |
| mascot.talk | Talk to Mithu | मिट्ठू से बात करें |
| mascot.tip | Tip: | सुझाव: |

## Possible next steps

- A "Hinglish and Python side by side" page.
- A social preview image and page metadata for shared links.
- Short lesson sheets for teachers, with exercises.
- Run demo examples from the tour pages without opening the playground.
- Choose a licence, then describe the project as open source.

The code is in `apps/docs/components/home/` and `apps/docs/styles/`.
