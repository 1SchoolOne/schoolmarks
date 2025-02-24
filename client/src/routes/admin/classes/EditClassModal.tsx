import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Form, Input, Modal } from 'antd'
import axios from 'axios'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { PutClassByIdResponse } from '@apiSchema/classes'

import { classLoader } from '..'

interface FormValues {
	name: string
	code: string
	year_of_graduation: number
}

export function EditClassModal() {
	const classData = useLoaderData() as Awaited<ReturnType<typeof classLoader>>
	const [formInstance] = Form.useForm<FormValues>()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { notification } = App.useApp()

	const { mutate: updateClass, isPending } = useMutation({
		mutationFn: async (values: FormValues) => {
			const { data } = await axios.put<PutClassByIdResponse>(
				`${API_BASE_URL}/classes/${classData.id}/`,
				values,
				AXIOS_DEFAULT_CONFIG,
			)
			return data
		},
		onSuccess: ({ name, code }) => {
			queryClient.refetchQueries({
				queryKey: ['classes'],
			})
			notification.success({
				message: `${name} (${code})`,
				description: 'Classe modifiée avec succès.',
			})
			navigate('/app/admin/classes')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur', description: err.message })
		},
	})

	return (
		<Modal
			title="Modifier la classe"
			okText="Enregistrer"
			onCancel={() => navigate('/app/admin/classes')}
			onOk={formInstance.submit}
			confirmLoading={isPending}
			destroyOnClose
			open
		>
			<Form form={formInstance} layout="vertical" initialValues={classData} onFinish={updateClass}>
				<Form.Item name="name" label="Nom" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item name="code" label="Code" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item
					name="year_of_graduation"
					label="Année d'obtention du diplôme"
					rules={[{ required: true }]}
				>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	)
}
