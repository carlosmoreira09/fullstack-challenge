// @ts-check
import baseConfig from '@taskmanagerjungle/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(...baseConfig, {
  languageOptions: {
    sourceType: 'commonjs',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
