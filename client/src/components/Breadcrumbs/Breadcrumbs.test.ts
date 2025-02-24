import { Match } from './Breadcrumbs'
import { getCrumbsFromMatches } from './Breadcrumbs-utils'

const matches: Match[] = [
	{
		id: 'toto',
		data: null,
		pathname: '',
		params: {},
		handle: { crumb: { label: 'toto', path: 'toto' } },
	},
	{
		id: 'tata',
		data: null,
		pathname: '',
		params: {},
		handle: { crumb: { label: 'tata', path: 'tata' } },
	},
	{
		id: 'titi',
		data: null,
		pathname: '',
		params: {},
		handle: {},
	},
]

describe('getCrumbsFromMatches', () => {
	it('retourne uniquement les matches qui ont un crumb', () => {
		const crumbs = getCrumbsFromMatches(matches)

		expect(crumbs).toEqual([
			{ label: 'toto', path: 'toto' },
			{ label: 'tata', path: 'toto/tata' },
		])
	})
})
