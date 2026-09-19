import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts', 'src/preload.ts', 'src/lib/rbtools/index.ts', 'src/lib/rbtools/lib.exports.ts', 'src/lib/rbtools/utils.exports.ts'],
	fixedExtension: false,
	minify: false,
	unbundle: true,
	copy: [
		{ from: 'src/bin', to: 'dist' },
		{ from: 'src/lib/rbtools/bin', to: 'dist/lib/rbtools' },
	],
	deps: {
		neverBundle: ['type-fest'],
	},
})
