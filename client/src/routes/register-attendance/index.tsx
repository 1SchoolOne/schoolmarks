import { QueryClient } from '@tanstack/react-query'
import { redirect } from 'react-router-dom'

import { getSession } from '@api/auth'
import { attendanceApi, classSessionsApi } from '@api/axios'

import { Route } from '@types'

import { RegisterAttendance } from './RegisterAttendance'
import { RegisterError } from './RegisterError'

export function getRegisterAttendanceRoute(queryClient: QueryClient): Route {
	return {
		path: 'register-attendance/:classSessionId',
		element: <RegisterAttendance />,
		errorElement: <RegisterError />,
		loader: async ({ params }) => {
			const session = await queryClient.fetchQuery({
				queryKey: ['auth-status'],
				queryFn: getSession,
			})

			if (session.data.user?.role !== 'student') {
				return redirect('/app')
			}

			return registerAttendanceLoader(queryClient, params.classSessionId)
		},
	}
}

export async function registerAttendanceLoader(
	queryClient: QueryClient,
	classSessionId: string | undefined,
) {
	if (!classSessionId) throw new Error('Class session ID is required')

	const classSession = await queryClient.fetchQuery({
		queryKey: ['classSession', classSessionId],
		queryFn: () => classSessionsApi.classSessionsRetrieve(classSessionId).then(({ data }) => data),
	})

	const attendance = await queryClient.fetchQuery({
		queryKey: ['attendanceRecords', { classSessionId: classSession.id }],
		queryFn: () =>
			attendanceApi
				.attendancesList({
					params: { class_session_id: classSession.id },
				})
				.then(({ data }) => data[0] ?? null),
	})

	return { classSession, attendance }
}
