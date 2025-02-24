import axios from 'axios'

import { CheckinSession, PostCheckinSessionBody } from '@apiSchema/checkinSessions'

import { AXIOS_DEFAULT_CONFIG } from './axios'

export const CHECKIN_SESSIONS_API_URL = '/checkin_sessions/'

export function createCheckinSession(values: PostCheckinSessionBody) {
	return axios.post(CHECKIN_SESSIONS_API_URL, values, AXIOS_DEFAULT_CONFIG)
}

export function getCheckinSession(checkinSessionId: string | number) {
	return axios.get<CheckinSession>(
		`${CHECKIN_SESSIONS_API_URL}${checkinSessionId}`,
		AXIOS_DEFAULT_CONFIG,
	)
}
