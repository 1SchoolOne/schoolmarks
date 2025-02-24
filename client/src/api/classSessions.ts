import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { GetClassSessionByIdResponse, GetClassSessionsResponse } from '@apiSchema/classSessions'

import { AXIOS_DEFAULT_CONFIG } from './axios'

export const CLASS_SESSIONS_API_URL = '/class_sessions/'

type QueryParamsKeys =
	| 'start_date'
	| 'end_date'
	| 'course_id'
	| 'course_code'
	| 'checkin_session_id'

export async function getClassSessions(queryParams?: Record<QueryParamsKeys, string>) {
	let url = CLASS_SESSIONS_API_URL

	if (queryParams) {
		const params = new URLSearchParams(queryParams)
		url += `?${params.toString()}`
	}

	const { data } = await axios.get<GetClassSessionsResponse>(url, AXIOS_DEFAULT_CONFIG)
	return data
}

export async function getClassSession(classSessionId: string) {
	const { data } = await axios.get<GetClassSessionByIdResponse>(
		`${CLASS_SESSIONS_API_URL}${classSessionId}/`,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}

export function getClassSessionQueryOptions(
	classSessionId: string | undefined,
): UseQueryOptions<GetClassSessionByIdResponse> {
	return {
		queryKey: ['classSession', classSessionId],
		queryFn: () => getClassSession(String(classSessionId)),
	}
}
