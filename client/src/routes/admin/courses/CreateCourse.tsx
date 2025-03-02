import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Input, Modal, Row, Select } from 'antd'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { coursesApi, usersApi } from '@api/axios'

import { CourseInput } from '@apiClient'

import { teachersLoader } from '..'
import { CourseAdminTable } from './CourseAdminTable'

type FormValues = CourseInput

export function CreateCourse() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof teachersLoader>>
	const [formInstance] = Form.useForm()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const { data: teachers } = useQuery({
		queryKey: ['users', { role: 'teacher' }],
		queryFn: () => usersApi.usersList('teacher').then(({ data }) => data),
		initialData,
	})

	const { mutate: createCourse } = useMutation({
		mutationFn: (values: FormValues) => coursesApi.coursesCreate(values),
		onSuccess: () => {
			queryClient.refetchQueries({
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
				title="Créer un cours"
				onCancel={() => navigate('/app/admin/courses')}
				onOk={formInstance.submit}
				okText="Créer"
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
							<Form.Item
								label="Nom"
								name="name"
								validateDebounce={500}
								rules={[
									{ required: true },
									{
										validator: (_, value) => {
											return coursesApi
												.coursesList(undefined, undefined, value)
												.then(({ data }) => {
													const nameExists = data.find(
														({ name }) =>
															name.toLocaleLowerCase() === String(value).toLocaleLowerCase(),
													)

													if (nameExists) {
														return Promise.reject('Un cours avec ce nom existe déjà.')
													}

													return Promise.resolve()
												})
										},
									},
								]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Code"
								name="code"
								validateDebounce={500}
								rules={[
									{ required: true },
									{
										validator: (_, value) => {
											return coursesApi
												.coursesList(undefined, value, undefined)
												.then(({ data }) => {
													const nameExists = data.find(
														({ code }) =>
															code.toLocaleLowerCase() === String(value).toLocaleLowerCase(),
													)

													if (nameExists) {
														return Promise.reject('Un cours avec ce code existe déjà.')
													}

													return Promise.resolve()
												})
										},
									},
								]}
							>
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
