import { PropsWithChildren } from '@1schoolone/ui'
import { UseMutateFunction, useMutation, useQuery } from '@tanstack/react-query'
import { AxiosResponse, isAxiosError } from 'axios'
import { createContext, useEffect, useMemo, useState } from 'react'
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom'

import {
	Credentials,
	SessionResponse,
	SessionUserData,
	getSession,
	getSessionQueryOptions,
	login as loginFn,
	logout as logoutFn,
} from '@api/auth'

import { LoadingScreen } from '@components'

interface IdentityContext {
	user: SessionUserData | undefined
	status: AuthStatus
	login: UseMutateFunction<SessionResponse, Error, Credentials, unknown>
	logout: UseMutateFunction<AxiosResponse, Error, void, unknown>
	isAuthenticating: boolean
	loginError: string | undefined
}

/**
 * Il y a 4 statut possible :
 *
 * - `authenticated` = l'utilisateur est authentifié
 * - `unreachable` = impossible de contacter l'api
 * - `null` = l'utilisateur n'est pas authentifié
 * - `undefined` = status inconnu
 */
type AuthStatus = 'authenticated' | 'unreachable' | null | undefined

export const IdentityContext = createContext<IdentityContext>({} as IdentityContext)

/**
 * Gère l'authentification (login, logout et session polling*). Met à
 * disposition les données utilisateurs lorsque ce dernier est connecté.
 *
 * *Vérifie la validité de la session toutes les 10 secondes.
 */
export function IdentityProvider({ children }: PropsWithChildren) {
	const [user, setUser] = useState<SessionUserData | undefined>(undefined)
	const [status, setStatus] = useState<AuthStatus>(undefined)
	const [loginError, setLoginError] = useState<string>()
	const navigate = useNavigate()
	const location = useLocation()
	const initialAuthStatus = useLoaderData() as Awaited<ReturnType<typeof getSession>>

	const pathname = location.pathname.split('/').filter((i) => i)[0]

	const { data: authStatus } = useQuery({
		...getSessionQueryOptions,
		initialData: initialAuthStatus,
		refetchInterval: () => {
			if (pathname === 'authenticate') return false

			return 10_000
		},
	})

	const { mutate: login, isPending: isLoginPending } = useMutation({
		mutationFn: loginFn,
		onSuccess: ({ data }) => {
			if ('user' in data) {
				setLoginError(undefined)
				setStatus('authenticated')
				setUser(data.user)
				navigate('/app/attendance', { replace: true })
			}
		},
		onError: (error) => {
			if (
				isAxiosError<{
					status: number
					errors: { message: string; code: string; param: string }[]
				}>(error)
			) {
				const isEmailValid =
					error.response?.data.errors.find((e) => e.code === 'invalid') === undefined
				const isCrendentialInvalid =
					error.response?.data.errors.find((e) => e.code === 'email_password_mismatch') !==
					undefined

				setLoginError(
					!isEmailValid
						? 'Veuillez utiliser un email valide'
						: isCrendentialInvalid
							? 'Utilisateur ou mot de passe incorrect'
							: 'Une erreur est survenue lors de la connexion',
				)

				return
			}

			setLoginError(String(error))
		},
	})

	const { mutate: logout } = useMutation({
		mutationFn: logoutFn,
		onSuccess: () => {
			setStatus(null)
			setUser(undefined)
		},
	})

	useEffect(() => {
		if (authStatus === null) {
			return
		}

		if (authStatus === undefined) {
			setStatus('unreachable')
		} else if (authStatus.meta.is_authenticated) {
			setUser(authStatus.data.user)
			setStatus('authenticated')
		} else {
			setUser(undefined)
			setStatus(null)
		}
	}, [authStatus])

	/**
	 * Si l'utilisateur n'est pas sur l'app (i.e. routes /app/*) mais qu'il est
	 * authentifié, on le redirige vers l'app. Sinon, on le redirige vers la page
	 * de login.
	 */
	useEffect(() => {
		const isOnTheApp = pathname === 'app'
		const isRegisteringAttendance = pathname === 'register-attendance'

		if (!isOnTheApp && !isRegisteringAttendance && status === 'authenticated') {
			navigate('/app', { replace: true })
		} else if (status === null) {
			navigate('/authenticate', { replace: true })
		}
	}, [pathname, status, navigate])

	const contextValue: IdentityContext = useMemo(
		() => ({
			user,
			status,
			login,
			logout,
			isAuthenticating: isLoginPending,
			loginError,
		}),
		[user, status, login, logout, isLoginPending, loginError],
	)

	return (
		<IdentityContext.Provider value={contextValue}>
			{status === undefined ? <LoadingScreen /> : children}
		</IdentityContext.Provider>
	)
}
