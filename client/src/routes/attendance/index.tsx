import { QueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Outlet } from 'react-router-dom'

import { classSessionsApi } from '@api/axios'

import { Calendar, ProtectedRoute } from '@components'

import { Route } from '@types'

import { Attendance } from './Attendance'
import { AttendanceWithModal } from './classSessionId/AttendanceWithModal'

export function getAttendanceRoute(queryClient: QueryClient): Route {
	return {
		path: 'attendance',
		element: (
			<ProtectedRoute
				restrictedTo={['teacher']}
				redirectTo={(role) => {
					switch (role) {
						case 'student':
							return '/app/calendar'
						case 'teacher':
							return '/app/attendance'
						case 'admin':
							return '/app/admin/users'
					}
				}}
			>
				<Calendar.Provider>
					<Outlet />
				</Calendar.Provider>
			</ProtectedRoute>
		),
		handle: {
			crumb: {
				label: 'Assiduité',
				path: 'attendance',
			},
		},
		loader: () => attendanceLoader(queryClient),
		children: [
			{
				index: true,
				element: <Attendance />,
			},
			{
				path: 'class-session/:classSessionId',
				element: <AttendanceWithModal />,
				loader: ({ params }) =>
					classSessionloader({ queryClient, classSessionId: params.classSessionId }),
			},
		],
	}
}

export async function attendanceLoader(queryClient: QueryClient) {
	const startDate = dayjs().startOf('week').format('YYYY-MM-DD')
	const endDate = dayjs().endOf('week').format('YYYY-MM-DD')

	return queryClient.fetchQuery({
		queryKey: ['classSessions', { start: startDate, end: endDate }],
		queryFn: () =>
			classSessionsApi
				.classSessionsList(undefined, undefined, endDate, startDate)
				.then(({ data }) => data),
	})
}

export async function classSessionloader(params: {
	queryClient: QueryClient
	classSessionId: string | undefined
}) {
	const { queryClient, classSessionId } = params

	return queryClient.fetchQuery({
		queryKey: ['classSession', classSessionId],
		queryFn: () => classSessionsApi.classSessionsRetrieve(classSessionId!).then(({ data }) => data),
	})
}
