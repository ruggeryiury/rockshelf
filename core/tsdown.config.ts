import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/preload.ts'],
  fixedExtension: false,
  // minify: true, # Uncomment this for production bundling
  unbundle: true,
  copy: { from: 'src/bin', to: 'dist' },
  deps: {
    neverBundle: ['type-fest'],
  },
})
