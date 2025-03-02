import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Col, Form, Grid, Input, InputNumber, Row, Transfer } from 'antd'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { classesApi, coursesApi, usersApi } from '@api/axios'

import { FormSection } from '@components'

import { createClassLoader } from '../..'

import './CreateClassForm-styles.less'

const defaultListStyle = { width: '100%', maxWidth: 300 }

export interface FormValues {
	name: string
	code: string
	year_of_graduation: number
	/** Liste d'id */
	students: number[]
	/** Liste d'id */
	courses: string[]
}

export function CreateClassForm() {
	const { students: initialStudents, courses: initialCourses } = useLoaderData() as Awaited<
		ReturnType<typeof createClassLoader>
	>
	const [formInstance] = Form.useForm<FormValues>()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()
	const studentsFieldValue = Form.useWatch('students', formInstance)
	const coursesFieldValue = Form.useWatch('courses', formInstance)
	const screens = Grid.useBreakpoint()
	const navigate = useNavigate()

	const { data: students } = useQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => usersApi.usersList('student').then(({ data }) => data),
		initialData: initialStudents,
	})

	const { data: courses } = useQuery({
		queryKey: ['courses'],
		queryFn: () => coursesApi.coursesList().then(({ data }) => data),
		initialData: initialCourses,
	})

	const { mutate: createClass, isPending } = useMutation({
		mutationFn: (values: FormValues) =>
			classesApi
				.classesCreateWithStudentsCreate({
					class_data: {
						name: values.name,
						code: values.code,
						year_of_graduation: values.year_of_graduation,
					},
					course_ids: values.courses,
					student_ids: values.students,
				})
				.then(({ data }) => data),
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ['classes'] })
			notification.success({ message: data.class.name, description: 'Classe créée avec succès.' })
			navigate('/app/admin/classes')
		},
		onError: (err) => {
			notification.error({
				message: 'Erreur',
				description: err.message,
			})
		},
	})

	return (
		<Card className="create-class">
			<Form
				className="create-class__form"
				layout="vertical"
				form={formInstance}
				initialValues={{
					name: '',
					code: '',
					year_of_graduation: '',
					students: [],
					courses: [],
				}}
				validateMessages={{
					required: 'Ce champ est requis.',
				}}
				onFinish={createClass}
			>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<FormSection title="Classe">
							<Row gutter={[16, 16]}>
								<Col span={screens.xl ? 8 : 10}>
									<Form.Item
										label="Nom"
										name="name"
										validateDebounce={500}
										rules={[
											{ required: true },
											{
												validator: (_, value) => {
													return classesApi.classesList(undefined, value).then(({ data }) => {
														const nameExists = data.find(
															({ name }) =>
																name.toLocaleLowerCase() === String(value).toLocaleLowerCase(),
														)

														if (nameExists) {
															return Promise.reject('Une classe avec ce nom existe déjà.')
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
								<Col span={4}>
									<Form.Item
										label="Code"
										name="code"
										validateDebounce={500}
										rules={[
											{ required: true },
											{
												validator: (_, value) => {
													return classesApi.classesList(value, undefined).then(({ data }) => {
														const codeExists = data.find(
															({ code }) =>
																code.toLocaleLowerCase() === String(value).toLocaleLowerCase(),
														)

														if (codeExists) {
															return Promise.reject('Une classe avec ce code existe déjà.')
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
								<Col span={screens.xl ? 12 : 10}></Col>
								<Col span={12}>
									<Form.Item
										label="Année d'obtention du diplôme"
										name="year_of_graduation"
										rules={[
											{ required: true },
											{
												validator: (_, value) => {
													if (Number(value) < 2000) {
														return Promise.reject(
															"L'année d'obtention du diplôme doit être supérieure à 2000.",
														)
													}

													return Promise.resolve()
												},
											},
										]}
									>
										<InputNumber />
									</Form.Item>
								</Col>
							</Row>
						</FormSection>
					</Col>
					<Col span={screens.xl ? 12 : 24}>
						<FormSection
							title="Étudiants"
							tooltip="Vous pouvez rechercher le nom de l'étudiant ou bien l'email."
						>
							<Form.Item name="students" rules={[{ required: true }]}>
								<Transfer
									targetKeys={studentsFieldValue}
									dataSource={students.map((s) => ({
										key: s.id,
										title: `${s.first_name} ${s.last_name}`,
										description: s.email,
									}))}
									render={({ title }) => title}
									locale={{
										itemUnit: 'étudiant',
										itemsUnit: 'étudiants',
									}}
									showSearch
									listStyle={
										students.length > 0 ? { ...defaultListStyle, height: 400 } : defaultListStyle
									}
									filterOption={(inputValue, item) => {
										const matchName = item.title
											.toLocaleLowerCase()
											.includes(inputValue.toLocaleLowerCase())
										const matchEmail = item.description
											.toLocaleLowerCase()
											.includes(inputValue.toLocaleLowerCase())

										return matchName || matchEmail
									}}
								/>
							</Form.Item>
						</FormSection>
					</Col>
					<Col span={screens.xl ? 12 : 24}>
						<FormSection
							title="Cours"
							tooltip="Vous pouvez rechercher le nom du cours ou bien le nom du professeur."
						>
							<Form.Item name="courses" rules={[{ required: true }]}>
								<Transfer
									targetKeys={coursesFieldValue}
									dataSource={courses.map(({ id, name, code, professor }) => {
										const fullname = `${professor.first_name} ${professor.last_name}`.trim()

										return {
											key: id,
											title: `${name} (${code})`,
											description: fullname === '' ? professor.email : fullname,
										}
									})}
									render={({ title }) => title}
									locale={{
										itemUnit: 'cours',
										itemsUnit: 'cours',
									}}
									showSearch
									listStyle={
										courses.length > 0 ? { ...defaultListStyle, height: 400 } : defaultListStyle
									}
									filterOption={(inputValue, item) => {
										const matchName = item.title
											.toLocaleLowerCase()
											.includes(inputValue.toLocaleLowerCase())
										const matchProfessorName = item.description
											.toLocaleLowerCase()
											.includes(inputValue.toLocaleLowerCase())

										return matchName || matchProfessorName
									}}
								/>
							</Form.Item>
						</FormSection>
					</Col>

					<Col span={24}>
						<div className="create-class__form__footer">
							<Button variant="outlined" color="primary">
								Annuler
							</Button>
							<Button htmlType="submit" type="primary" loading={isPending}>
								Créer
							</Button>
						</div>
					</Col>
				</Row>
			</Form>
		</Card>
	)
}
