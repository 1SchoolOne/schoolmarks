import { Outlet } from 'react-router-dom'

import { Route } from '@types'

export const calendarRoute: Route = {
	path: 'calendar',
	element: <Outlet />,
	handle: {
		crumb: {
			label: 'Calendrier',
			path: 'calendar',
		},
	},
	children: [
		{
			index: true,
			element: <></>,
		},
	],
}
