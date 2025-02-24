import { Dropdown, MenuProps } from 'antd'
import classnames from 'classnames'
import { ChevronDownIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { useContext, useState } from 'react'

import { IdentityContext } from '@contexts'

import { ProfileFormModal } from './_components/ProfileForm/ProfileForm'

import './UserMenu-styles.less'

export function UserMenu() {
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
	const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
	const { user, logout } = useContext(IdentityContext)

	const items: MenuProps['items'] = [
		{
			key: 'usermenu-profile',
			icon: <UserIcon size={16} />,
			label: 'Profil',
			onClick: () => setIsProfileModalOpen(true),
		},
		{ type: 'divider' },
		{
			key: 'usermenu-logout',
			icon: <LogOutIcon size={16} />,
			label: 'Déconnexion',
			onClick: () => logout(),
		},
	]

	return (
		<>
			<ProfileFormModal
				isOpen={isProfileModalOpen}
				closeModal={() => setIsProfileModalOpen(false)}
			/>
			<Dropdown
				menu={{ items }}
				className="user-menu__dropdown"
				onOpenChange={(open) => {
					setIsUserMenuOpen(open)
				}}
				trigger={['click']}
				placement="bottom"
			>
				<div
					className={classnames('user-menu__trigger', {
						'user-menu__trigger__is-open': isUserMenuOpen,
					})}
				>
					<div className="user-menu__trigger__display-name">
						<span>{user?.['display']}</span>
						<span>{user?.['username']}</span>
					</div>
					<i className="user-menu__trigger__icon">
						<ChevronDownIcon size={16} />
					</i>
				</div>
			</Dropdown>
		</>
	)
}
