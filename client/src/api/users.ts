import axios from 'axios'

import { GetUserByIdResponse, GetUsersResponse } from '@apiSchema/users'

import { AXIOS_DEFAULT_CONFIG } from './axios'

interface QueryParams {
	role: 'teacher' | 'student'
	class_id: string
}

/* - - - GET - - - */

export async function getUserById(userId: string) {
	const { data } = await axios.get<GetUserByIdResponse>(`/users/${userId}/`, AXIOS_DEFAULT_CONFIG)
	return data
}

export async function getUsers(queryParams?: Partial<QueryParams>) {
	let url = '/users/'

	if (queryParams) {
		const params = new URLSearchParams(queryParams)
		url += `?${params.toString()}`
	}

	const { data } = await axios.get<GetUsersResponse>(url, AXIOS_DEFAULT_CONFIG)
	return data
}
