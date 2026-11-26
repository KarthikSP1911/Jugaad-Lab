/** A source range. `start`/`end` are UTF-16 offsets; `column` counts code points, from 1. */
export interface Span {
  start: number;
  end: number;
  line: number;
  column: number;
}
