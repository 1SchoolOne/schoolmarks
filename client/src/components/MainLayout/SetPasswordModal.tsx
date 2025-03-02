import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Form, Input, Modal, Typography } from 'antd'
import { useContext, useEffect, useState } from 'react'

import { changePassword } from '@api/auth'

import { IdentityContext } from '@contexts'

interface SetPasswordModalProps {
	isOpen: boolean
	setIsOpen: (isOpen: boolean) => void
}

export function SetPasswordModal(props: SetPasswordModalProps) {
	const { isOpen, setIsOpen } = props

	const { user, logout } = useContext(IdentityContext)
	const [formError, setFormError] = useState<unknown>()
	const [formInstance] = Form.useForm()
	const queryClient = useQueryClient()

	const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
		mutationFn: (values: { currentPassword: string; newPassword: string }) => {
			if (!user) throw new Error('User object is undefined')

			return changePassword({ ...values, userId: user.id })
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['auth-status'] })
			setIsOpen(false)
		},
		onError: (error) => {
			setFormError(error.message)
		},
	})

	/**
	 * Affiche une modal si l'utilisateur courant n'a pas changé son mot de passe
	 * temporaire.
	 */
	useEffect(() => {
		setIsOpen(!user?.has_changed_password)
	}, [user?.has_changed_password, setIsOpen])
	return (
		<Modal
			title="Définir un mot de passe"
			open={isOpen}
			closable={false}
			centered
			destroyOnClose
			onCancel={() => logout()}
			cancelText="Retour à la page de connexion"
			onOk={() => {
				formInstance.submit()
			}}
			okText="Confirmer"
			confirmLoading={isUpdatingPassword}
		>
			<Typography.Text type="secondary">
				Vous utilisez actuellement un mot de passe temporaire. Veuillez définir un nouveau mot de
				passe afin d'accéder à l'application.
			</Typography.Text>
			{!!formError && <Alert type="error" message={String(formError)} />}
			<Form
				form={formInstance}
				layout="vertical"
				autoComplete="off"
				validateMessages={{
					required: 'Ce champ est requis',
				}}
				onFinish={updatePassword}
			>
				<Form.Item name="currentPassword" label="Mot de passe actuel" rules={[{ required: true }]}>
					<Input.Password onPressEnter={() => formInstance.submit()} />
				</Form.Item>
				<Form.Item
					name="newPassword"
					label="Nouveau mot de passe"
					rules={[
						{ required: true },
						() => ({
							validator: (_, value) => {
								const numberRegex = /[0-9]/
								const specialRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/

								const hasAtLeastOneNumber = numberRegex.test(value)
								const hasAtLeastOneSpCharacter = specialRegex.test(value)

								if (value.length < 8) {
									return Promise.reject('Votre mot de passe doit contenir au moins 8 caractères.')
								}

								if (!hasAtLeastOneNumber) {
									return Promise.reject(
										new Error('Votre mot de passe doit contenir au moins un chiffre.'),
									)
								} else if (!hasAtLeastOneSpCharacter) {
									return Promise.reject(
										new Error('Votre mot de passe doit contenir au moins un caractère spécial.'),
									)
								}

								return Promise.resolve()
							},
						}),
					]}
				>
					<Input.Password onPressEnter={() => formInstance.submit()} />
				</Form.Item>
			</Form>
		</Modal>
	)
}
