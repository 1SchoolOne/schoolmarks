import { useMutation } from '@tanstack/react-query'
import { App, Col, Form, Input, Modal, ModalProps, Row, Skeleton } from 'antd'
import axios from 'axios'
import { CheckIcon } from 'lucide-react'
import { useContext } from 'react'

import { AXIOS_DEFAULT_CONFIG } from '@api/axios'

import { IdentityContext } from '@contexts'

import './ProfileForm-styles.less'

interface ProfileFormModalProps {
	isOpen: boolean
	closeModal: () => void
}

interface ProfileFormValues {
	firstName?: string
	lastName?: string
	username?: string
}

interface ProfileFormPayload {
	first_name?: string
	last_name?: string
	username?: string
}

export function getInitialValues(user: { display: string; username: string }): ProfileFormValues {
	// Le 'display' est composé du prénom et du nom sous ce format: '<Prénom> <Nom>'.
	// Si le profile utilisateur n'a pas de Nom/Prénom alors l'API utilise le nom
	// d'utilisateur comme display.
	const isDiplayUsername = user.display.split(' ').length !== 2

	// Si l'utilisateur n'a pas de Nom/Prénom dans son profile
	if (isDiplayUsername) {
		return {
			firstName: '',
			lastName: '',
			username: user.username,
		}
	}

	const [firstName, lastName] = user.display.split(' ')

	return {
		firstName,
		lastName,
		username: user.username,
	}
}

export function ProfileFormModal(params: ProfileFormModalProps) {
	const { isOpen, closeModal } = params

	const [formInstance] = Form.useForm()
	const { user } = useContext(IdentityContext)
	const { notification } = App.useApp()

	const { mutate: submit, isPending } = useMutation({
		mutationFn: (payload: ProfileFormPayload) =>
			axios.patch(`/users/${user?.id}/`, payload, AXIOS_DEFAULT_CONFIG),
		onSuccess: () => {
			notification.success({ message: 'Profile enregistré' })
			closeModal()
		},
	})

	const commonModalProps: ModalProps = {
		className: 'profile-form-modal',
		title: 'Votre profil',
		open: isOpen,
		okText: 'Confirmer',
		okButtonProps: { icon: <CheckIcon size={16} /> },
		onCancel: closeModal,
		destroyOnClose: true,
	}

	if (!user) {
		return (
			<Modal {...commonModalProps}>
				<Form layout="vertical">
					<Row gutter={[16, 16]}>
						<Col span={12}>
							<Form.Item label="Prénom">
								<Skeleton.Input active />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label="Nom">
								<Skeleton.Input active />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label="Nom d'utilisateur">
								<Skeleton.Input active />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		)
	}

	return (
		<Modal
			{...commonModalProps}
			onCancel={closeModal}
			confirmLoading={isPending}
			onOk={formInstance.submit}
		>
			<Form<ProfileFormValues>
				form={formInstance}
				layout="vertical"
				initialValues={getInitialValues({ display: user?.display, username: user?.username })}
				preserve={false}
				onFinish={(values) => {
					const payload: ProfileFormPayload = {
						first_name: values.firstName,
						last_name: values.lastName,
						username: values.username,
					}

					submit(payload)
				}}
			>
				<Row gutter={[16, 16]}>
					<Col span={12}>
						<Form.Item label="Prénom" name="firstName">
							<Input />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="Nom" name="lastName">
							<Input />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item label="Nom d'utilisateur" name="username">
							<Input disabled />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	)
}
