# Intentional changes from KannadaScript

`tools/migrate-ks.ts` translated the KannadaScript test corpus into
`tests/programs/migrated/` (256 programs written; 36 differ). Every
difference is deliberate or a fault in the source file. The golden files record
the Hinglish behaviour.

| Programs | KannadaScript | Hinglish | Reason |
| --- | --- | --- | --- |
| interpreter-ok-019, 056, 057 | any value as a condition or logical operand | E0405 | conditions must be boolean |
| interpreter-ok-084 | `;` optional after `agla` | E0202 | `;` is required |
| interpreter-fail-023, 024, 030 | error | accepted | `+` joins when either side is a string |
| parser-ok-031, 032 | `.5` is a number | E0101 | digits are required before the point |
| parser-fail-009 | empty print is an error | accepted | `bolo()` is a call with no arguments |
| parser-ok-008, parser-ok-013, parser-ok-016, parser-ok-017, parser-ok-023, parser-ok-027, parser-ok-028, parser-ok-029, parser-ok-030, parser-ok-033, parser-ok-034, parser-ok-035, parser-ok-036, parser-ok-037, parser-ok-048, parser-ok-049, parser-ok-051, parser-ok-052, parser-ok-068, parser-ok-069, parser-ok-070, parser-ok-071, parser-ok-072 | parsed | E0301 | `check` also resolves names, and these use undeclared ones |
| interpreter-fail-048 | error | not migrated | an endless loop; only a step limit (E0408) stops it |
| file-function-call | runs | E0301 | the source file calls a function it never defines |
| file-test-function | runs | E0202, E0101 | the source file holds quoted lines, not a program |
