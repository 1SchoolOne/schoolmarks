import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Form, Input, Modal, Select } from 'antd'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { coursesApi } from '@api/axios'

import { Course } from '@apiClient'

import { editCourseLoader } from '..'

interface FormValues {
	name: string
	code: string
	professor_id: number | undefined
}

function getInitialValues(data: Course): FormValues {
	return {
		name: data.name,
		code: data.code,
		professor_id: data.professor?.id,
	}
}

export function EditCourseModal() {
	const { course, teachers } = useLoaderData() as Awaited<ReturnType<typeof editCourseLoader>>
	const [formInstance] = Form.useForm<FormValues>()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { notification } = App.useApp()

	const { mutate: updateCourse, isPending } = useMutation({
		mutationFn: (values: FormValues) =>
			coursesApi.coursesPartialUpdate(course.id, values).then(({ data }) => data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['courses'],
			})
			notification.success({ message: 'Cours modifié avec succès' })
			navigate('/app/admin/courses')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur', description: err.message })
		},
	})

	return (
		<Modal
			title="Modifier"
			okText="Enregistrer"
			onCancel={() => navigate('/app/admin/courses')}
			onOk={formInstance.submit}
			confirmLoading={isPending}
			destroyOnClose
			open
		>
			<Form
				form={formInstance}
				layout="vertical"
				initialValues={getInitialValues(course)}
				onFinish={updateCourse}
			>
				<Form.Item name="name" label="Nom" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item name="code" label="Code" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item name="professor_id" label="Professeur">
					<Select
						placeholder="Sélectionner un professeur"
						options={teachers.map((t) => ({
							label: `${t.first_name} ${t.last_name}`,
							value: t.id,
						}))}
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	)
}
