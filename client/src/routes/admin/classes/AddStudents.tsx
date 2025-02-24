import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Modal, Row, Transfer } from 'antd'
import { TransferItem } from 'antd/es/transfer'
import axios from 'axios'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getClassById } from '@api/classes'
import { getUsers } from '@api/users'

import { classLoader } from '..'
import { ClassAdminTable } from './ClassAdminTable'

type Class = Awaited<ReturnType<typeof classLoader>>

interface FormValues {
	students: Array<number>
}

function getInitialValues(classRecord: Class): FormValues {
	return {
		students: classRecord.students?.map((s) => s.id!) ?? [],
	}
}

export function AddStudents() {
	const params = useParams()
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classLoader>>
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [formInstance] = Form.useForm<FormValues>()
	const watchedValues = Form.useWatch([], formInstance)
	const { notification } = App.useApp()

	const { data } = useQuery({
		queryKey: ['class', params.classId],
		queryFn: () => getClassById(params.classId!),
		initialData,
		enabled: params.classId !== undefined,
	})

	const { data: students, isPending: isStudentsLoading } = useQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => getUsers({ role: 'student' }),
	})

	const { mutate: updateClass, isPending: isUpdating } = useMutation({
		mutationFn: async ({ students }: FormValues) => {
			const studentIds = students.filter((i) => i)

			const { data } = await axios.put(
				`${API_BASE_URL}/classes/${params.classId}/update_students/`,
				{ student_ids: studentIds },
				AXIOS_DEFAULT_CONFIG,
			)

			return data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['classes', 'class', 1] })
			notification.success({
				message: `${data.name} (${data.code})`,
				description: 'Liste des étudiants modifiée avec succès.',
			})
			navigate('/app/admin/classes')
		},
	})

	const transferItems: TransferItem[] =
		students?.map((s) => ({
			key: s.id,
			title: `${s.first_name} ${s.last_name}`,
			description: s.email,
		})) ?? []

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
					initialValues={getInitialValues(data)}
					onFinish={updateClass}
				>
					<Row gutter={[8, 8]}>
						<Col span={24}>
							<Form.Item name="students">
								<Transfer
									locale={{
										itemUnit: 'étudiant',
										itemsUnit: 'étudiants',
									}}
									targetKeys={watchedValues?.students ?? []}
									dataSource={transferItems}
									render={(item) => item.title!}
									disabled={isStudentsLoading}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	)
}
