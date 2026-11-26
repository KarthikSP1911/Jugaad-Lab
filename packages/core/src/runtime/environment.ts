import { InternalError } from '../diagnostics/internal-error.js';
import type { Value } from './value.js';

/** One scope at run time; mirrors the resolver's scopes one to one. */
export class Environment {
  private readonly values = new Map<string, Value>();

  constructor(private readonly parent?: Environment) {}

  define(name: string, value: Value): void {
    this.values.set(name, value);
  }

  /** `undefined` while the declaration has not run yet. */
  get(name: string, depth: number): Value | undefined {
    return this.ancestor(depth).values.get(name);
  }

  /** `false` while the declaration has not run yet. */
  assign(name: string, depth: number, value: Value): boolean {
    const { values } = this.ancestor(depth);
    if (!values.has(name)) return false;
    values.set(name, value);
    return true;
  }

  private ancestor(depth: number): Environment {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let environment: Environment = this;
    for (let hop = 0; hop < depth; hop += 1) {
      if (!environment.parent) throw new InternalError(`no scope at depth ${depth}`);
      environment = environment.parent;
    }
    return environment;
  }
}
