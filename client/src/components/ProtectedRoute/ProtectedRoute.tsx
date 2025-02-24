import { PropsWithChildren } from '@1schoolone/ui'
import { useContext } from 'react'
import { Navigate } from 'react-router-dom'

import { IdentityContext } from '@contexts'

import { UserRole } from '@types'

import { LoadingScreen } from '../LoadingScreen/LoadingScreen'

interface ProtectedRouteProps {
	/** Permet de restreindre l'accès à certains rôles. */
	restrictedTo?: [UserRole, ...UserRole[]]
	redirectTo?: string
}

function RoleCheck(
	props: PropsWithChildren<{ userRole: UserRole; acceptedRoles: UserRole[]; redirectTo?: string }>,
) {
	const { acceptedRoles, userRole, children, redirectTo = '/app/attendance' } = props

	if (acceptedRoles.includes(userRole)) {
		return children
	} else {
		return <Navigate to={redirectTo} replace />
	}
}

/**
 * La `ProtectedRoute` permet de restreindre l'accès à une ou plusieurs routes
 * seulement aux utilisateurs authentifié. Si on passe la props `restrictedTo`,
 * le vérification d'authentification est ignorée pour restreindre l'accès
 * seulement aux rôles spécifiés.
 */
export function ProtectedRoute(props: PropsWithChildren<ProtectedRouteProps>) {
	const { restrictedTo, redirectTo, children } = props

	const { status, user } = useContext(IdentityContext)

	if (status === undefined) {
		return <LoadingScreen />
	}

	if (restrictedTo) {
		return (
			<RoleCheck
				acceptedRoles={restrictedTo}
				userRole={user!.role as UserRole}
				redirectTo={redirectTo}
			>
				{children}
			</RoleCheck>
		)
	}

	if (status !== 'authenticated') {
		return <Navigate to="/authenticate" replace />
	} else {
		return children
	}
}
