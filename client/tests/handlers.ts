import dayjs from 'dayjs'
import { HttpResponse, http } from 'msw'

import { SessionResponse } from '@api/auth'
import { API_BASE_URL } from '@api/axios'

import { GetClassSessionByIdResponse } from '../src/types/api/classSessions'

export const roleHandler = {
	admin: http.get(`${API_BASE_URL}/_allauth/browser/v1/auth/session`, () => {
		return HttpResponse.json<SessionResponse>({
			status: 200,
			data: {
				method: [],
				user: {
					id: 1,
					display: 'Mock Admin',
					username: 'mock.admin',
					email: 'mock.admin@schoolmarks.fr',
					has_usable_password: true,
					role: 'admin',
					has_changed_password: true,
				},
			},
			meta: {
				is_authenticated: true,
			},
		})
	}),
	teacher: http.get(`${API_BASE_URL}/_allauth/browser/v1/auth/session`, () => {
		return HttpResponse.json<SessionResponse>({
			status: 200,
			data: {
				method: [],
				user: {
					id: 1,
					display: 'Mock Teacher',
					username: 'mock.teacher',
					email: 'mock.teacher@schoolmarks.fr',
					has_usable_password: true,
					role: 'teacher',
					has_changed_password: true,
				},
			},
			meta: {
				is_authenticated: true,
			},
		})
	}),
	student: http.get(`${API_BASE_URL}/_allauth/browser/v1/auth/session`, () => {
		return HttpResponse.json<SessionResponse>({
			status: 200,
			data: {
				method: [],
				user: {
					id: 1,
					display: 'Mock Student',
					username: 'mock.student',
					email: 'mock.student@schoolmarks.fr',
					has_usable_password: true,
					role: 'student',
					has_changed_password: true,
				},
			},
			meta: {
				is_authenticated: true,
			},
		})
	}),
}

export const commonHandlers = [
	http.get(`${API_BASE_URL}/class_sessions/`, () => {
		return HttpResponse.json<GetClassSessionByIdResponse[]>([
			{
				id: '1',
				room: '3.02',
				date: dayjs().format('YYYY-MM-DD'),
				start_time: dayjs().format('HH:mm:ss'),
				end_time: dayjs().add(5, 'minutes').format('HH:mm:ss'),
				status: 'scheduled',
				checkin_session: {
					id: '1',
					class_session: '1',
					started_at: dayjs().toISOString(),
					closed_at: dayjs().add(5, 'minutes').toISOString(),
					created_by: 1,
					status: 'open',
				},
			},
		])
	}),
	http.get(`${API_BASE_URL}/class_sessions/*`, () => {
		return HttpResponse.json<GetClassSessionByIdResponse>({
			id: '1',
			room: '3.02',
			date: dayjs().format('YYYY-MM-DD'),
			start_time: dayjs().format('HH:mm:ss'),
			end_time: dayjs().add(5, 'minutes').format('HH:mm:ss'),
			status: 'scheduled',
			checkin_session: {
				id: '1',
				class_session: '1',
				started_at: dayjs().toISOString(),
				closed_at: dayjs().add(5, 'minutes').toISOString(),
				created_by: 1,
				status: 'open',
			},
		})
	}),
	http.get(new RegExp(`${API_BASE_URL}/checkin_sessions/[^/]+/totp`), () => {
		return HttpResponse.json({
			totp: '123456',
		})
	}),
]
