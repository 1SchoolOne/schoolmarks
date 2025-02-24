import { Outlet } from 'react-router-dom'

import { Route } from '@types'

import { Grade } from './Grade'
import { CreateGradePage } from './componants/CreateGradePage'

export const gradesRoute: Route = {
	path: 'grades',
	element: <Outlet />,
	handle: {
		crumb: {
			label: 'Notes',
			path: 'grades',
		},
	},
	children: [
		{
			index: true,
			element: <Grade />,
		},
		{
			path: 'new',
			element: <CreateGradePage />,
		},
		{
			path: 'edit',
			element: <CreateGradePage />,
		},
	],
}
