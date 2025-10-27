//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: [
      'tailwind.config.js',
      'prettier.config.js',
      'eslint.config.js',
    ],
  },
  ...tanstackConfig,
]
