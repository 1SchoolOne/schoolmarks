import { AuthLayout } from '@1schoolone/ui'

import { Route } from '@types'

import { AuthForm } from './AuthForm'

import './authenticate-styles.less'

export const authenticateRoute: Route = {
	path: 'authenticate',
	element: (
		<AuthLayout heroBackgroundSrc="/brand-mesh-gradient.webp">
			<AuthForm />
		</AuthLayout>
	),
}
