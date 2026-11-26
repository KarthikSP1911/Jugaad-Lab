# Error codes

| Range | Stage |
| --- | --- |
| E01xx | lexical |
| E02xx | syntax |
| E03xx | semantic |
| E04xx | runtime |

Exit codes: 0 ok, 65 compile errors, 70 runtime error.

## Assigned codes

| Code | Meaning |
| --- | --- |
| E0101 | unknown character |
| E0102 | unterminated string |
| E0103 | invalid escape |
| E0104 | malformed number |
| E0105 | unterminated block comment |
| E0301 | undefined name |
| E0302 | duplicate declaration |
| E0303 | assignment to a constant |
| E0304 | name used in its own initialiser |
| E0305 | `ruko` or `agla` outside a loop |
| E0306 | `wapas` outside a function |
| E0307 | wrong number of arguments on a direct call |
| E0402 | call depth exceeded |
| E0405 | non-boolean condition |

New codes are added here in the same change that introduces them.
