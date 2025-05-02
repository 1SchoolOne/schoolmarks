import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
	App,
	Button,
	Col,
	Drawer,
	Form,
	Input,
	InputNumber,
	Row,
	Space,
	Spin,
	Transfer,
} from 'antd'

import { classesApi, coursesApi, usersApi } from '@api/axios'

import { Class, ClassInput, Course } from '@apiClient'

import { FormSection } from '@components'

interface ClassFormProps {
	classId: string | null
	open: boolean
	closeDrawer: () => void
}

type FormValues = ClassInput & {
	/** Liste d'id */
	students: number[]
	/** Liste d'id */
	courses: string[]
}

const defaultListStyle = { width: '100%', maxWidth: 300 }

function getInitialValues(
	classData: Class | undefined,
	enrolledCourses: Course[] | undefined,
): FormValues {
	if (classData && enrolledCourses) {
		return {
			name: classData.name,
			code: classData.code,
			year_of_graduation: classData.year_of_graduation,
			students: classData.students.map(({ id }) => id),
			courses: enrolledCourses.map(({ id }) => id),
		}
	}

	return {
		name: '',
		code: '',
		year_of_graduation: undefined,
		students: [],
		courses: [],
	}
}

export function ClassForm(props: ClassFormProps) {
	const { classId, closeDrawer, open } = props

	const [formInstance] = Form.useForm()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const studentsFieldValue = Form.useWatch('students', formInstance)
	const coursesFieldValue = Form.useWatch('courses', formInstance)

	const isNew = !classId

	const { data: classData, isPending: isClassLoading } = useQuery({
		queryKey: ['classes', classId],
		queryFn: () => classesApi.classesRetrieve(classId!).then(({ data }) => data),
		enabled: !isNew,
	})

	const { data: enrolledCourses, isPending: areEnrolledCoursesLoading } = useQuery({
		queryKey: ['courses', { classId }],
		queryFn: () => classesApi.classesCoursesRetrieve(classId!).then(({ data }) => data),
		enabled: !isNew,
	})

	const { data: students, isPending: areStudentsLoading } = useQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => usersApi.usersList('student').then(({ data }) => data),
	})

	const { data: courses, isPending: areCoursesLoading } = useQuery({
		queryKey: ['courses'],
		queryFn: () => coursesApi.coursesList().then(({ data }) => data),
	})

	const { mutate: createOrEditClass } = useMutation({
		mutationFn: async (values: FormValues) => {
			if (isNew) {
				return classesApi
					.classesWithStudentsCreate({
						class_data: {
							name: values.name,
							code: values.code,
							year_of_graduation: values.year_of_graduation,
						},
						course_ids: values.courses,
						student_ids: values.students,
					})
					.then(({ data }) => data)
			} else {
				return classesApi
					.classesWithStudentsUpdate({
						class_id: classId,
						class_data: {
							name: values.name,
							code: values.code,
							year_of_graduation: values.year_of_graduation,
						},
						course_ids: values.courses,
						student_ids: values.students,
					})
					.then(({ data }) => data)
			}
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['classes'] })
			notification.success({
				message: data.class.name,
				description: `Classe ${isNew ? 'créée' : 'modifiée'} avec succès.`,
			})
			closeDrawer()
		},
		onError: (err) => {
			notification.error({
				message: 'Erreur',
				description: err.message,
			})
		},
	})

	return (
		<Drawer
			title={isNew ? 'Créer une classe' : `Modifier - ${classData?.name}`}
			width={700}
			closeIcon={false}
			extra={
				<Space>
					<Button variant="outlined" color="primary" onClick={() => closeDrawer()}>
						Annuler
					</Button>
					<Button type="primary" onClick={formInstance.submit}>
						{isNew ? 'Créer' : 'Enregistrer'}
					</Button>
				</Space>
			}
			maskClosable={false}
			open={open}
			loading={!isNew && open && (isClassLoading || areEnrolledCoursesLoading)}
			destroyOnClose
		>
			<Form
				layout="vertical"
				form={formInstance}
				initialValues={getInitialValues(classData, enrolledCourses)}
				validateMessages={{
					required: 'Ce champ est requis.',
				}}
				preserve={false}
				onFinish={createOrEditClass}
			>
				<Row gutter={[16, 16]}>
					<Col span={12}>
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

											if (nameExists && nameExists.id !== classId) {
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
					<Col span={12}>
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

											if (codeExists && codeExists.id !== classId) {
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
					<Col span={24}>
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
					<Col span={24}>
						<FormSection title="Étudiants">
							<Form.Item name="students">
								{areStudentsLoading ? (
									<Spin />
								) : (
									<Transfer
										targetKeys={studentsFieldValue}
										dataSource={students?.map((s) => ({
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
											(students?.length ?? 0) > 0
												? { ...defaultListStyle, height: 400 }
												: defaultListStyle
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
								)}
							</Form.Item>
						</FormSection>
					</Col>
					<Col span={24}>
						<FormSection title="Cours">
							<Form.Item name="courses">
								{areCoursesLoading ? (
									<Spin />
								) : (
									<Transfer
										targetKeys={coursesFieldValue}
										dataSource={courses?.map(({ id, name, code, professor }) => {
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
											(courses?.length ?? 0) > 0
												? { ...defaultListStyle, height: 400 }
												: defaultListStyle
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
								)}
							</Form.Item>
						</FormSection>
					</Col>
				</Row>
			</Form>
		</Drawer>
	)
}
