import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Modal, Result, Row, Transfer, Typography } from 'antd'
import { isAxiosError } from 'axios'
import { useLoaderData, useNavigate, useParams, useRouteError } from 'react-router-dom'

import { classesApi, coursesApi } from '@api/axios'

import { User } from '@apiClient'

import { enrollCoursesLoader } from '..'
import { ClassAdminTable } from './ClassAdminTable'

interface FormValues {
	courses: string[]
}

function getTransferItemDescription(user: User): string {
	const fullname = `${user.first_name} ${user.last_name}`

	if (fullname.trim() === '') {
		return user.email
	}

	return fullname
}

function EnrollCourses() {
	const { courses: initialCourses, enrolledCourses: initialEnrolledCourses } =
		useLoaderData() as Awaited<ReturnType<typeof enrollCoursesLoader>>
	const [formInstance] = Form.useForm<FormValues>()
	const watchedValues = Form.useWatch('courses', formInstance)
	const navigate = useNavigate()
	const params = useParams()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const { data: courses } = useQuery({
		queryKey: ['courses', { classId: params.classId }],
		queryFn: () => coursesApi.coursesList().then(({ data }) => data),
		initialData: initialCourses,
	})

	const { data: enrolledCourses } = useQuery({
		queryKey: ['courses', { classId: params.classId }],
		queryFn: () => classesApi.classesCoursesRetrieve(params.classId!).then(({ data }) => data),
		initialData: initialEnrolledCourses,
		enabled: !!params.classId,
	})

	const { mutate: updateEnrollments } = useMutation({
		mutationFn: async (values: FormValues) =>
			classesApi
				.classesUpdateCoursesCreate(params.classId!, { course_ids: values.courses })
				.then(({ data }) => data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['courses', params.classId],
			})
			notification.success({
				message: 'Affectation réussie.',
			})
			navigate('/app/admin/classes')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur', description: err.message })
		},
	})

	return (
		<>
			<ClassAdminTable />
			<Modal
				className="enroll-courses-modal"
				title="Affectation des cours"
				okText="Affecter"
				onOk={() => formInstance.submit()}
				onCancel={() => navigate('/app/admin/classes')}
				destroyOnClose
				open
			>
				<Form
					preserve={false}
					form={formInstance}
					layout="vertical"
					initialValues={{
						courses: enrolledCourses.map(({ id }) => id),
					}}
					onFinish={updateEnrollments}
				>
					<Row gutter={[8, 8]}>
						<Col span={24}>
							<Typography.Text type="secondary">
								Vous pouvez rechercher le nom du cours ou bien le nom du professeur.
							</Typography.Text>
						</Col>
						<Col span={24}>
							<Form.Item name="courses">
								<Transfer
									locale={{
										itemUnit: 'cours',
										itemsUnit: 'cours',
									}}
									targetKeys={watchedValues ?? []}
									dataSource={courses.map((c) => ({
										key: c.id,
										title: c.name,
										description: getTransferItemDescription(c.professor),
									}))}
									render={({ title }) => title}
									filterOption={(inputValue, item) => {
										const matchName = item.title
											?.toLocaleLowerCase()
											.includes(inputValue.toLocaleLowerCase())
										const matchProfessorName = item.description
											.toLocaleLowerCase()
											.includes(inputValue.toLocaleLowerCase())

										return matchName || matchProfessorName
									}}
									listStyle={{
										height: courses.length > 0 || enrolledCourses.length > 0 ? 300 : undefined,
									}}
									showSearch
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	)
}

function ErrorBoundary() {
	const navigate = useNavigate()
	let error = useRouteError()

	if (isAxiosError(error) && (error.status === 403 || error.status === 401)) {
		error = "Vous n'avez pas accès à cette page."
	} else {
		error = 'Veuillez contacter votre administrateur.'
	}

	return (
		<>
			<ClassAdminTable />
			<Modal
				title="Affectation des cours"
				open
				onCancel={() => navigate('/app/admin/classes')}
				onOk={() => navigate(0)}
				okText="Réessayer"
				destroyOnClose
			>
				<Result status="error" title="Une erreur est survenue" subTitle={String(error)} />
			</Modal>
		</>
	)
}

EnrollCourses.ErrorBoundary = ErrorBoundary

export { EnrollCourses }
