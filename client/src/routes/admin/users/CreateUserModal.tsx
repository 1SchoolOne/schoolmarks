import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Input, Modal, Row, Select } from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { PostUserResponse } from '@apiSchema/users'

interface FormValues {
	first_name: string
	last_name: string
	email: string
	user_role: 'admin' | 'teacher' | 'student'
}

export function CreateUserModal() {
	const [formInstance] = Form.useForm()
	const { notification } = App.useApp()
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	const { mutate: createUser } = useMutation({
		mutationFn: (values: FormValues) =>
			axios.post<PostUserResponse>(
				'/users/',
				{ ...values, username: `${values.first_name}.${values.last_name}`.toLocaleLowerCase() },
				AXIOS_DEFAULT_CONFIG,
			),
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['users'] })
			notification.success({ message: 'Utilisateur créé avec succès.' })
			navigate('/app/admin/users')
		},
		onError: () => {
			notification.error({ message: 'Erreur', description: "Impossible de créer l'utilisateur." })
		},
	})

	return (
		<Modal
			title="Ajouter un utilisateur"
			onOk={formInstance.submit}
			onCancel={() => navigate('/app/admin/users')}
			destroyOnClose
			open
		>
			<Form
				layout="vertical"
				form={formInstance}
				preserve={false}
				onFinish={createUser}
				validateMessages={{ required: 'Ce champs est requis.' }}
			>
				<Row gutter={[8, 8]}>
					<Col span={12}>
						<Form.Item name="first_name" label="Prénom" rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="last_name" label="Nom" rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="email" label="Email" rules={[{ required: true }]}>
							<Input type="email" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="user_role" label="Rôle" rules={[{ required: true }]}>
							<Select
								options={[
									{ label: 'Admin', value: 'admin' },
									{ label: 'Professeur', value: 'teacher' },
									{ label: 'Étudiant', value: 'student' },
								]}
								placeholder="Sélectionner un rôle"
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	)
}
