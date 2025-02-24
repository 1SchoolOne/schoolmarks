import { UseQueryOptions } from '@tanstack/react-query'
import { AnyObject } from 'antd/es/_util/type'
import axios from 'axios'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from './axios'

export interface Credentials {
	email: string
	password: string
}

export interface SessionUserData {
	id: number
	display: string
	has_usable_password: boolean
	has_changed_password: boolean
	email: string
	username: string
	role: string
}

interface SessionAuthenticatedResponse {
	status: number
	data: {
		user: SessionUserData
		method: AnyObject[]
		flows?: never
	}
	meta: {
		is_authenticated: true
	}
}

interface SessionNotAuthenticatedResponse {
	status: 401
	data: {
		flows: { id: string }[]
		user?: never
		method?: never
	}
	meta: {
		is_authenticated: false
	}
}

export type SessionResponse = SessionAuthenticatedResponse | SessionNotAuthenticatedResponse

const AUTH_API_URL = '/_allauth/browser/v1/auth'
const ACCOUNT_API_URL = '/_allauth/browser/v1/account'

export async function changePassword(values: {
	currentPassword: string
	newPassword: string
	userId: number
}) {
	await axios.post(
		`${ACCOUNT_API_URL}/password/change`,
		{ current_password: values.currentPassword, new_password: values.newPassword },
		AXIOS_DEFAULT_CONFIG,
	)

	await axios.patch(
		`${API_BASE_URL}/users/${values.userId}/`,
		{ has_changed_password: true },
		AXIOS_DEFAULT_CONFIG,
	)
}

/**
 * Permet de se connecter.
 *
 * En cas de succès :
 *
 * - Ouvre une session en BDD
 * - Un cookie 'sessionid' sera automatiquement défini via la réponse API
 * - Retourne les données utilisateur
 *
 * @param credentials - Nom d'utilisateur et mot de passe
 */
export async function login(credentials: Credentials) {
	const { data } = await axios.post<SessionResponse>(
		`${AUTH_API_URL}/login`,
		credentials,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}

/** Supprime la session en cours via l'API. Déconnecte l'utilisateur. */
export function logout() {
	return axios.delete(`${AUTH_API_URL}/session`, {
		...AXIOS_DEFAULT_CONFIG,
		validateStatus: (status) => status === 401,
	})
}

/** Récupère les informations de la session en cours, si elle existe. */
export async function getSession() {
	const { data } = await axios.get<SessionResponse>(`${AUTH_API_URL}/session`, {
		...AXIOS_DEFAULT_CONFIG,
		validateStatus: (status) => (status >= 200 && status < 300) || status === 401,
	})
	return data
}

export const getSessionQueryOptions: UseQueryOptions<SessionResponse | null> = {
	queryKey: ['auth-status'],
	queryFn: getSession,
	initialData: null,
}
