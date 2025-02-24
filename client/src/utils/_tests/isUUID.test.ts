import { isUUID } from '@utils/isUUID'

const validUUID = '9deee2ff-2cfc-40a0-bf55-3be1b2ead25c'
const invalidUUID = '9deee2ff-2cfc-40a0-3be1b2ead25c'

describe('isUUID()', () => {
	it('returns `true` with a valid UUIDv4', () => {
		expect(isUUID(validUUID)).toBe(true)
	})

	it('returns `false` with an invalid UUIDv4', () => {
		expect(isUUID(invalidUUID)).toBe(false)
	})
})
