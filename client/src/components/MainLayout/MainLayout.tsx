import { MainLayout as Main, PropsWithChildren, ThemeSelect } from '@1schoolone/ui'
import { Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import {
	BookMarkedIcon,
	CalendarDays,
	Clock,
	ComponentIcon,
	FileSpreadsheetIcon,
	ScrollText,
	UsersIcon,
} from 'lucide-react'
import { useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Link, UserMenu } from '@components'

import { IdentityContext } from '@contexts'

import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs'
import { SetPasswordModal } from './SetPasswordModal'

import './MainLayout-styles.less'

/**
 * Pour chaque élément de l'URI, contatène avec la string concaténée
 * précédemment. Example:
 *
 * Avec un pathname `"/app/admin/users/new"`, le résultat serait `['admin',
 * 'admin-users', 'admin-users-new']`.
 */
function getSelectedKeysFromPathname(pathname: string): string[] {
	const URIKeys = pathname.split('/').filter((i) => i)
	// Removes the 'app' element
	URIKeys.shift()

	const keys: string[] = []
	URIKeys.forEach((item, index) => {
		const previousKey = keys.at(index - 1)
		const keyPathname = previousKey ? `${previousKey}-${item}` : item

		keys.push(keyPathname)
	})

	return keys
}

function getMenuItems(userRole: string): ItemType[] {
	switch (userRole) {
		case 'admin':
			return [
				{
					key: 'admin-users',
					label: <Link to="/app/admin/users">Utilisateurs</Link>,
					icon: <UsersIcon size={16} />,
				},
				{
					key: 'admin-classes',
					label: <Link to="/app/admin/classes">Classes</Link>,
					icon: <ComponentIcon size={16} />,
				},
				{
					key: 'admin-courses',
					label: <Link to="/app/admin/courses">Cours</Link>,
					icon: <BookMarkedIcon size={16} />,
				},
				{
					key: 'admin-import',
					label: <Link to="/app/admin/import">Import</Link>,
					icon: <FileSpreadsheetIcon size={16} />,
				},
			]

		case 'teacher':
			return [
				{
					key: 'attendance',
					label: <Link to="/app/attendance">Assiduité</Link>,
					icon: <Clock size={16} />,
				},
				{
					key: 'grades',
					label: <Link to="/app/grades">Notes</Link>,
					icon: <ScrollText size={16} />,
				},
			]

		case 'student':
			return [
				{
					key: 'calendar',
					label: <Link to="/app/calendar">Calendrier</Link>,
					icon: <CalendarDays size={16} />,
				},
				{
					key: 'grades',
					label: <Link to="/app/grades">Notes</Link>,
					icon: <ScrollText size={16} />,
				},
			]

		default:
			return []
	}
}

export function MainLayout({ children }: PropsWithChildren) {
	const location = useLocation()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { user } = useContext(IdentityContext)

	return (
		<>
			<SetPasswordModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
			<Main
				className={isModalOpen ? 'blur-mask' : undefined}
				contentClassName="no-scrollbar"
				header={
					<Flex justify="space-between" align="center">
						<Breadcrumbs />
						<ThemeSelect placement="bottomRight" />
						<UserMenu />
					</Flex>
				}
				sidebarMenuProps={{
					selectedKeys: getSelectedKeysFromPathname(location.pathname),
					items: user ? getMenuItems(user?.role) : [],
				}}
			>
				{children}
			</Main>
		</>
	)
}
