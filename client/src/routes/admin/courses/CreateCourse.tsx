import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Input, Modal, Row, Select } from 'antd'
import axios from 'axios'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getUsers } from '@api/users'
import { Course } from '@apiSchema/courses'

import { teachersLoader } from '..'
import { CourseAdminTable } from './CourseAdminTable'

interface FormValues extends Omit<Course, 'professor'> {
	professor_id: number
}

export function CreateCourse() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof teachersLoader>>
	const [formInstance] = Form.useForm()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const { data: teachers } = useQuery({
		queryKey: ['users', { role: 'teacher' }],
		queryFn: () => getUsers({ role: 'teacher' }),
		initialData,
	})

	const { mutate: createCourse } = useMutation({
		mutationFn: (values: FormValues) =>
			axios.post(`${API_BASE_URL}/courses/`, values, AXIOS_DEFAULT_CONFIG),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['courses'],
			})
			notification.success({ message: 'Cours créée avec succès.' })
			navigate('/app/admin/courses')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur lors de la création', description: err.message })
		},
	})

	return (
		<>
			<CourseAdminTable />
			<Modal
				open
				title="Ajouter un cours"
				onCancel={() => navigate('/app/admin/courses')}
				onOk={formInstance.submit}
			>
				<Form
					layout="vertical"
					form={formInstance}
					initialValues={{
						name: '',
						code: '',
						professor: undefined,
					}}
					validateMessages={{
						required: 'Ce champ est requis.',
					}}
					onFinish={createCourse}
				>
					<Row gutter={[8, 8]}>
						<Col span={24}>
							<Form.Item label="Nom" name="name" rules={[{ required: true }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label="Code" name="code" rules={[{ required: true }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label="Professeur" name="professor_id" rules={[{ required: true }]}>
								<Select
									placeholder="Sélectionner un professeur"
									options={teachers?.map((t) => ({
										label: `${t.first_name} ${t.last_name} (${t.email})`,
										value: t.id,
									}))}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	)
}
