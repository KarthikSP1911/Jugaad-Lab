import type { Expr } from '../src/ast/expr.js';
import type { Stmt } from '../src/ast/stmt.js';

const list = (parts: (string | undefined)[]) => `(${parts.filter(Boolean).join(' ')})`;

/** Compact S-expressions, so parse tree tests stay readable. */
export function print(node: Expr | Stmt): string {
  switch (node.kind) {
    case 'Literal':
      return JSON.stringify(node.value);
    case 'Var':
      return node.name;
    case 'List':
      return list(['list', ...node.elements.map(print)]);
    case 'Dict':
      return list(['dict', ...node.entries.map((e) => `${e.key}:${print(e.value)}`)]);
    case 'Unary':
      return list([node.op, print(node.operand)]);
    case 'Binary':
    case 'Logical':
      return list([node.op, print(node.left), print(node.right)]);
    case 'Assign':
      return list([node.op, print(node.target), print(node.value)]);
    case 'Call':
      return list(['call', print(node.callee), ...node.args.map(print)]);
    case 'Index':
      return list(['index', print(node.object), print(node.index)]);
    case 'Function':
      return list(['fn', list(node.params.map((p) => p.name)), print(node.body)]);
    case 'VarDecl':
      return list([node.isConst ? 'const' : 'var', node.name.name, node.init && print(node.init)]);
    case 'FuncDecl':
      return list([
        'func',
        node.name.name,
        list(node.params.map((p) => p.name)),
        print(node.body),
      ]);
    case 'Block':
      return list(['block', ...node.body.map(print)]);
    case 'If':
      return list([
        'if',
        print(node.test),
        print(node.then),
        node.otherwise && print(node.otherwise),
      ]);
    case 'While':
      return list(['while', print(node.test), print(node.body)]);
    case 'For':
      return list([
        'for',
        node.init ? print(node.init) : '_',
        node.test ? print(node.test) : '_',
        node.step ? print(node.step) : '_',
        print(node.body),
      ]);
    case 'Return':
      return list(['return', node.value && print(node.value)]);
    case 'Break':
      return '(break)';
    case 'Continue':
      return '(continue)';
    case 'ExprStmt':
      return print(node.expr);
    default: {
      const missing: never = node;
      return missing;
    }
  }
}
