import { capitalize } from '@utils/capitalize'

describe('capitalize()', () => {
	it('handles empty strings successfuly', () => {
		const result = capitalize('    ')
		expect(result).toEqual('')
	})

	it('capitalizes only the first letter', () => {
		const result = capitalize(' toto titi tata')
		expect(result).toEqual('Toto titi tata')
	})
})
