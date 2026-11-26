/** Short reference data for the cheatsheet and search. */
export const KEYWORD_MEANINGS: Record<string, string> = {
  Var: 'declare a variable',
  Const: 'declare a constant',
  Function: 'define a function',
  Return: 'return from a function',
  If: 'if',
  Else: 'else',
  True: 'true',
  False: 'false',
  Null: 'null',
  While: 'while loop',
  For: 'counted loop',
  Break: 'leave a loop',
  Continue: 'skip to the next round',
  AndAnd: 'and (&&)',
  OrOr: 'or (||)',
  Bang: 'not (!)',
};

export const BUILTINS = [
  { name: 'bolo(a, b, ...)', does: 'print the values, then a new line' },
  { name: 'suno(prompt)', does: 'show the prompt and read one line' },
  { name: 'lambai(x)', does: 'length of a string, list or dictionary' },
  { name: 'joro(list, x)', does: 'add x to the end of a list' },
  { name: 'nikalo(list)', does: 'remove and return the last element' },
  { name: 'sankhya(x)', does: 'turn a string into a number' },
  { name: 'shabd(x)', does: 'turn any value into a string' },
  { name: 'prakar(x)', does: 'name of the type of x' },
] as const;
