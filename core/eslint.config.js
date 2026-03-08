import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
// import jsdoc from 'eslint-plugin-jsdoc'

export default defineConfig(
  {
    files: ['src/**/*.ts'],
    ignores: ['dist/**'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      // jsdoc: jsdoc,
    },
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.node,
        ...globals.es2025,
      },
    },
  },
  tseslint.configs.recommendedTypeCheckedOnly,
  { rules: { 'no-useless-assignment': 'off' } }
)
