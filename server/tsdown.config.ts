import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outExtensions: () => {
    return {
      js: '.js',
    }
  },
})
