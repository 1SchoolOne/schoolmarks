import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Modal, Result, Row, Transfer, Typography } from 'antd'
import { isAxiosError } from 'axios'
import { useLoaderData, useNavigate, useParams, useRouteError } from 'react-router-dom'

import { classesApi, usersApi } from '@api/axios'

import { User } from '@apiClient'

import { enrollStudentsLoader } from '..'
import { ClassAdminTable } from './ClassAdminTable'

interface FormValues {
	students: Array<number>
}

function getInitialValues(classStudents: User[]): FormValues {
	return {
		students: classStudents.map((s) => s.id),
	}
}

function EnrollStudents() {
	const params = useParams()
	const { classStudents: initialClassStudents, students: initialStudents } =
		useLoaderData() as Awaited<ReturnType<typeof enrollStudentsLoader>>
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [formInstance] = Form.useForm<FormValues>()
	const watchedValues = Form.useWatch([], formInstance)
	const { notification } = App.useApp()

	const { data: classStudents } = useQuery({
		queryKey: ['users', { classId: params.classId }],
		queryFn: () => classesApi.classesStudentsRetrieve(params.classId!).then(({ data }) => data),
		initialData: initialClassStudents,
		enabled: params.classId !== undefined,
	})

	const { data: students } = useQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => usersApi.usersList('student').then(({ data }) => data),
		initialData: initialStudents,
	})

	const { mutate: updateClass, isPending: isUpdating } = useMutation({
		mutationFn: async ({ students }: FormValues) => {
			if (params.classId === undefined) throw new Error('Class ID is undefined')

			const studentIds = students.filter((i) => i)

			const { data } = await classesApi.classesUpdateStudentsCreate(params.classId, {
				student_ids: studentIds,
			})

			return data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['classes', 1] })
			notification.success({
				message: `Liste des étudiants modifiée avec succès.`,
			})
			navigate('/app/admin/classes')
		},
	})

	return (
		<>
			<ClassAdminTable />
			<Modal
				title="Ajouter des étudiants"
				open
				confirmLoading={isUpdating}
				onOk={() => formInstance.submit()}
				onCancel={() => navigate('/app/admin/classes')}
				okText="Confirmer"
				destroyOnClose
			>
				<Form
					preserve={false}
					form={formInstance}
					layout="vertical"
					initialValues={getInitialValues(classStudents)}
					onFinish={updateClass}
				>
					<Row gutter={[8, 8]}>
						<Col span={24}>
							<Typography.Text type="secondary">
								Vous pouvez rechercher le nom de l'étudiant ou bien l'email.
							</Typography.Text>
						</Col>
						<Col span={24}>
							<Form.Item name="students">
								<Transfer
									locale={{
										itemUnit: 'étudiant',
										itemsUnit: 'étudiants',
									}}
									targetKeys={watchedValues?.students ?? []}
									dataSource={students.map((s) => ({
										key: s.id,
										title: `${s.first_name} ${s.last_name}`,
										description: s.email,
									}))}
									render={({ title }) => title}
									listStyle={
										students.length > 0 || classStudents.length > 0 ? { height: 400 } : undefined
									}
									showSearch
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
				title="Ajouter des étudiants"
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

EnrollStudents.ErrorBoundary = ErrorBoundary

export { EnrollStudents }
