import { screen } from '@testing-library/react'

import { renderWithThemeProvider } from '@helpers/test'

import { StudentList } from './StudentList'
import { provisioning } from './provisioning'

const { present, late, absent, noReadPerms, sessionNotOpened } = provisioning

describe.skip('<StudentList />', () => {
	it('conforme au snapshot', () => {
		const { asFragment } = renderWithThemeProvider(
			<List
				canReadCheckinSessions
				isCheckInSessionOpened
				students={present.students}
				isLoading={false}
			/>,
		)

		expect(asFragment()).toMatchSnapshot()
	})

	it('affiche les étudiants présents', () => {
		renderWithThemeProvider(<List isLoading={false} {...present} />)

		expect(screen.getByText('Mock User')).toBeDefined()
		expect(screen.getByText('Présent')).toBeDefined()
	})

	it('affiche les étudiants en retard', () => {
		renderWithThemeProvider(<List isLoading={false} {...late} />)

		expect(screen.getByText('Mock User')).toBeDefined()
		expect(screen.getByText('En retard')).toBeDefined()
	})

	it('affiche les étudiants absents', () => {
		renderWithThemeProvider(<List isLoading={false} {...absent} />)

		expect(screen.getByText('Mock User')).toBeDefined()
		expect(screen.getByText('Absent')).toBeDefined()
	})

	it("n'affiche rien lors que l'utilisateur n'a pas les permissions", () => {
		renderWithThemeProvider(<List isLoading={false} {...noReadPerms} />)

		expect(screen.queryByText('Mock User')).toBeNull()
		expect(screen.queryByText('Absent')).toBeNull()
	})

	it("affiche un message lorsque la session d'appel n'est pas encore ouverte", () => {
		renderWithThemeProvider(<List isLoading={false} {...sessionNotOpened} />)

		expect(screen.queryByText('Mock User')).toBeNull()
		expect(screen.queryByText('Absent')).toBeNull()

		expect(screen.getByText("La liste s'actualisera une fois l'appel lancé")).toBeDefined()
	})
})
