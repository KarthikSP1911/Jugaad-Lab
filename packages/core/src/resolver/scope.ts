export interface Binding {
  isConst: boolean;
  /** False while the declaration's own initialiser is being resolved. */
  ready: boolean;
  /** How many functions enclose the declaration. */
  functionDepth: number;
  /** Parameter count, for names declared with a function declaration. */
  arity?: number;
  reassigned: boolean;
}

export type Scope = Map<string, Binding>;
