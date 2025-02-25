import { screen } from '@testing-library/react'

import { renderWithThemeProvider } from '@helpers/test'

import { getMockServer } from '../../../../../../tests/mockServer'
import { TOTPCountdown } from './TOTP'

const mockServer = getMockServer('admin')

describe('<TOTP.Countdown />', () => {
	beforeAll(() => mockServer.listen({ onUnhandledRequest: 'warn' }))
	beforeEach(() => mockServer.resetHandlers())
	afterAll(() => mockServer.close())

	it('conforme au snapshot avec TOTP', async () => {
		const { asFragment } = renderWithThemeProvider(
			<TOTPCountdown totp="123456" totpCountdown={15} />,
		)

		expect(asFragment()).toMatchSnapshot()
	})

	it('conforme au snapshot sans TOTP', async () => {
		const { asFragment } = renderWithThemeProvider(
			<TOTPCountdown totp={undefined} totpCountdown={15} />,
		)

		expect(asFragment()).toMatchSnapshot()
	})

	it('affiche le TOTP', async () => {
		renderWithThemeProvider(<TOTPCountdown totp="123456" totpCountdown={15} />)

		expect(screen.getByTestId('totp-countdown-id')).toBeDefined()
		expect(screen.getByText('Code : 123456')).toBeDefined()
	})

	it("affiche un '-' s'il n'y a pas de TOTP", async () => {
		renderWithThemeProvider(<TOTPCountdown totp={undefined} totpCountdown={15} />)

		expect(screen.queryByTestId('totp-countdown-id')).toBeNull()
		expect(screen.getByText('Code : -')).toBeDefined()
	})
})
