import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/preload.ts'],
  fixedExtension: false,
  minify: true,
})
