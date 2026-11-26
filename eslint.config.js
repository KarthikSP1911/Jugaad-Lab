import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/out/**', '**/next-env.d.ts'] },
  js.configs.recommended,
  tseslint.configs.strict,
  {
    files: ['packages/core/src/**/*.ts'],
    rules: {
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^[^.]',
              message: 'core imports nothing outside itself (no Node APIs, no packages).',
            },
            { group: ['**/cli/**', '**/apps/**'], message: 'core must not depend on cli or apps.' },
          ],
        },
      ],
    },
  },
);
