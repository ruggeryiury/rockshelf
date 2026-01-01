import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/core.exports.ts', 'src/lib.exports.ts', 'src/preload.ts']
})
