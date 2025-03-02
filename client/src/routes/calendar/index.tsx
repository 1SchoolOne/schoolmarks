import { QueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Outlet } from 'react-router-dom'

import { classSessionsApi } from '@api/axios'

import { Calendar, ProtectedRoute } from '@components'

import { Route } from '@types'

import { CalendarPage } from './CalendarPage'

export function getCalendarRoute(queryClient: QueryClient): Route {
	return {
		path: 'calendar',
		element: (
			<ProtectedRoute
				restrictedTo={['student']}
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
				label: 'Calendrier',
				path: 'calendar',
			},
		},
		loader: () => calendarLoader(queryClient),
		children: [
			{
				index: true,
				element: <CalendarPage />,
			},
		],
	}
}

export function calendarLoader(queryClient: QueryClient) {
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
