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
| E0201 | expected an expression |
| E0202 | expected `;` |
| E0203 | expected a symbol such as `)`, `}` or `:` |
| E0204 | expected a name |
| E0205 | assignment target is not a variable or index |
| E0206 | `pakka` without an initial value |
| E0207 | declaration where only a statement is allowed |
| E0208 | expected a dictionary key (string or name) |
| E0209 | code nested too deeply (256 levels, or an expression tree 1000 deep) |
| E0301 | undefined name |
| E0302 | duplicate declaration |
| E0303 | assignment to a constant |
| E0304 | name used in its own initialiser |
| E0305 | `ruko` or `agla` outside a loop |
| E0306 | `wapas` outside a function |
| E0307 | wrong number of arguments on a direct call |
| E0401 | operand has the wrong type |
| E0402 | call depth exceeded |
| E0403 | division or remainder by zero |
| E0404 | calling a value that is not a function |
| E0405 | non-boolean condition or logical operand |
| E0406 | name used before it has a value |
| E0407 | wrong number of arguments at run time |
| E0408 | step limit exceeded |
| E0409 | string too long |
| E0410 | list or string index out of range |
| E0411 | index has the wrong type (not a whole number, or a key that is not a string) |
| E0412 | indexing a value that cannot be indexed |
| E0413 | assigning into a string |
| E0414 | `nikalo` on an empty list |
| E0415 | `sankhya` on a string that is not a number |
| E0416 | wrong argument type for a built-in |
| E0417 | a built-in got the right type but a value it cannot use (for example `vargmool(-1)`, `kismat(6, 1)`) |

New codes are added here in the same change that introduces them.
