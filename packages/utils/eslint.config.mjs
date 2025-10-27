// @ts-check
import baseConfig from '@taskmanagerjungle/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(...baseConfig, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
