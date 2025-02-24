import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Outlet, RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'

import { getAdminRoute } from '@routes/admin'
import { getAttendanceRoute } from '@routes/attendance'
import { authenticateRoute } from '@routes/authenticate'
import { calendarRoute } from '@routes/calendar'
import { gradesRoute } from '@routes/grades'
import { getRegisterAttendanceRoute } from '@routes/register-attendance'

import { getSession } from '@api/auth'

import { MainLayout, ProtectedRoute } from '@components'

import { IdentityProvider } from '@contexts'

import '@1schoolone/ui/dist/ui.css'

/**
 * Les requêtes mises en cache sont valides pendant 2 minutes. Après ce délai
 * elles sont ré-exécuté au besoin.
 *
 * En mode dev, les requêtes ne sont pas mise en cache.
 */
const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: import.meta.env.DEV ? 0 : 2 * 60 * 1000, retry: false } },
})

const routes = createBrowserRouter([
	{ path: '*', element: <Navigate to="/app/attendance" replace /> },
	{
		path: '/',
		element: (
			<QueryClientProvider client={queryClient}>
				<IdentityProvider>
					<Outlet />
				</IdentityProvider>
			</QueryClientProvider>
		),
		loader: async ({ request }) => {
			const session = await queryClient.fetchQuery({
				queryKey: ['auth-status'],
				queryFn: getSession,
			})

			if (!session.meta.is_authenticated && !request.url.endsWith('authenticate')) {
				return redirect('/authenticate')
			}

			return session
		},
		children: [
			authenticateRoute,
			getRegisterAttendanceRoute(queryClient),
			{
				path: 'app',
				element: (
					<ProtectedRoute>
						<MainLayout>
							<Outlet />
						</MainLayout>
					</ProtectedRoute>
				),
				children: [
					{ path: '/app', element: <Navigate to="/app/attendance" replace /> },
					getAttendanceRoute(queryClient),
					gradesRoute,
					calendarRoute,
					getAdminRoute(queryClient),
				],
			},
		],
	},
])

export function App() {
	return <RouterProvider router={routes} />
}
