import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Input, InputNumber, Modal, Row } from 'antd'
import axios from 'axios'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getUsers } from '@api/users'

import { SelectAddItem } from '@components'

import { classLoader, studentsLoader } from '..'
import { ClassAdminTable } from './ClassAdminTable'

import './CreateClass-styles.less'

type Class = Awaited<ReturnType<typeof classLoader>>

export function CreateClass() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof studentsLoader>>
	const [formInstance] = Form.useForm()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const { data: students } = useQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => getUsers({ role: 'student' }),
		initialData,
	})

	const { mutate: createClass } = useMutation({
		mutationFn: (
			values: Pick<Class, 'name' | 'code' | 'year_of_graduation'> & {
				students: (number | undefined)[]
			},
		) => {
			const classData = {
				...values,
				students: values.students.filter((s) => s),
			}

			return axios.post(`${API_BASE_URL}/classes/`, classData, AXIOS_DEFAULT_CONFIG)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['classes'],
			})
			notification.success({ message: 'Classe créée avec succès.' })
			navigate('/app/admin/classes')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur lors de la création', description: err.message })
		},
	})

	return (
		<>
			<ClassAdminTable />
			<Modal
				open
				title="Ajouter une classe"
				onCancel={() => navigate('/app/admin/classes')}
				onOk={formInstance.submit}
			>
				<Form
					className="create-class"
					layout="vertical"
					form={formInstance}
					initialValues={{
						name: '',
						code: '',
						year_of_graduation: '',
						students: [undefined],
					}}
					validateMessages={{
						required: 'Ce champ est requis.',
					}}
					onFinish={createClass}
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
							<Form.Item
								label="Année d'obtention du diplôme"
								name="year_of_graduation"
								rules={[{ required: true }]}
							>
								<InputNumber />
							</Form.Item>
						</Col>
						<Col span={24}>
							<SelectAddItem
								label="Étudiants"
								name="students"
								selectProps={{
									placeholder: 'Sélectionner un étudiant',
									options: students.map((s) => ({
										label: `${s.first_name} ${s.last_name} (${s.email})`,
										value: s.id,
									})),
								}}
							/>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	)
}
