import axios from 'axios'

import { GetClassByIdResponse, GetClassesResponse } from '@apiSchema/classes'
import { User } from '@apiSchema/users'

import { AXIOS_DEFAULT_CONFIG } from './axios'

export async function getClasses() {
	const { data } = await axios.get<GetClassesResponse>('/classes/', AXIOS_DEFAULT_CONFIG)
	return data
}

export async function getClassById(classId: string) {
	const { data } = await axios.get<Omit<GetClassByIdResponse, 'students'> & { students?: User[] }>(
		`/classes/${classId}/`,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}
