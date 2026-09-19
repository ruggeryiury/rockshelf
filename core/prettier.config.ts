import { type Config } from 'prettier'

const config: Config = {
	useTabs: true,
	semi: false,
	singleQuote: true,
	printWidth: 800,
	tabWidth: 2,
	plugins: ['@trivago/prettier-plugin-sort-imports'],
	importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
}

export default config
