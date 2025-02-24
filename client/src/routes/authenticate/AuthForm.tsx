import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useContext } from 'react'

import { IdentityContext } from '@contexts'

interface AuthFormValues {
	email: string
	password: string
}

export function AuthForm() {
	const [formInstance] = Form.useForm<AuthFormValues>()
	const { loginError, login, isAuthenticating } = useContext(IdentityContext)

	return (
		<Card title={<Typography.Title>Connexion</Typography.Title>}>
			{loginError && <Alert type="error" message={loginError} showIcon />}
			<Form<AuthFormValues>
				className="auth-form"
				layout="vertical"
				form={formInstance}
				onFinish={login}
			>
				<Form.Item name="email" label="Email">
					<Input />
				</Form.Item>
				<Form.Item name="password" label="Mot de passe">
					<Input.Password />
				</Form.Item>
				<Button type="primary" htmlType="submit" loading={isAuthenticating} block>
					Connexion
				</Button>
			</Form>
		</Card>
	)
}
