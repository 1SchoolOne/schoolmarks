import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Col, Drawer, Form, Input, Row, Select, Space } from 'antd'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { coursesApi, usersApi } from '@api/axios'

import { Course, CourseInput } from '@apiClient'

import { courseLoader } from '..'

type FormValues = CourseInput

function getInitialValues(course: Course | undefined): FormValues {
	if (course) {
		return {
			name: course.name,
			code: course.code,
			professor_id: course.professor.id,
		}
	}

	return {
		name: '',
		code: '',
		professor_id: undefined,
	}
}

export function CourseForm() {
	const initialCourseData = useLoaderData() as Awaited<ReturnType<typeof courseLoader>> | undefined
	const [formInstance] = Form.useForm()
	const { notification } = App.useApp()
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const isNew = !initialCourseData

	const { data: teachers, isPending: areTeachersLoading } = useQuery({
		queryKey: ['users', { role: 'teacher' }],
		queryFn: () => usersApi.usersList('teacher').then(({ data }) => data),
	})

	const { mutate: createOrEditCourse } = useMutation({
		mutationFn: async (values: FormValues) => {
			if (isNew) {
				return coursesApi.coursesCreate(values)
			} else {
				return coursesApi.coursesPartialUpdate(initialCourseData!.id, values)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['courses'],
			})
			notification.success({ message: 'Cours créé avec succès.' })
			navigate('/app/admin/courses')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur lors de la création', description: err.message })
		},
	})

	return (
		<Drawer
			title={isNew ? 'Créer un cours' : 'Modifier un cours'}
			onClose={() => navigate('/app/admin/courses')}
			width={500}
			closeIcon={false}
			extra={
				<Space>
					<Button variant="outlined" color="primary" onClick={() => navigate('/app/admin/courses')}>
						Annuler
					</Button>
					<Button type="primary" onClick={formInstance.submit}>
						{isNew ? 'Créer' : 'Enregistrer'}
					</Button>
				</Space>
			}
			destroyOnClose
			open
		>
			<Form
				layout="vertical"
				form={formInstance}
				initialValues={getInitialValues(initialCourseData)}
				validateMessages={{
					required: 'Ce champ est requis.',
				}}
				onFinish={createOrEditCourse}
			>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Form.Item
							label="Nom"
							name="name"
							validateDebounce={500}
							rules={[
								{ required: true },
								{
									validator: (_, value) => {
										return coursesApi.coursesList(undefined, undefined, value).then(({ data }) => {
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
					<Col span={24}>
						<Form.Item
							label="Code"
							name="code"
							validateDebounce={500}
							rules={[
								{ required: true },
								{
									validator: (_, value) => {
										return coursesApi.coursesList(undefined, value, undefined).then(({ data }) => {
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
					<Col span={24}>
						<Form.Item label="Professeur" name="professor_id" rules={[{ required: true }]}>
							<Select
								placeholder="Sélectionner un professeur"
								loading={areTeachersLoading}
								options={teachers?.map((t) => ({
									label: `${t.first_name} ${t.last_name} (${t.email})`,
									value: t.id,
								}))}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Drawer>
	)
}
