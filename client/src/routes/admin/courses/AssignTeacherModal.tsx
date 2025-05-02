import { useMutation, useQuery } from '@tanstack/react-query'
import { Form, Modal, Select } from 'antd'

import { coursesApi, usersApi } from '@api/axios'

interface AssignTeacherModalProps {
	courseId: string
	open: boolean
	/**
	 * Le comportement de base du onOk est de soumettre le formulaire. Cette
	 * callback permet de surcharger le comportement de base, i.e. soumettre le
	 * form + une autre action.
	 */
	onSuccess?: () => void
	onError?: () => void
	onCancel: () => void
}

interface FormValues {
	professor: string
}

export function AssignTeacherModal(props: AssignTeacherModalProps) {
	const { courseId, open, onSuccess, onError, onCancel } = props

	const [formInstance] = Form.useForm<FormValues>()

	const { data: teachers } = useQuery({
		queryKey: ['users', { role: 'teacher' }],
		queryFn: () => usersApi.usersList('teacher').then(({ data }) => data),
	})

	const { mutate: assignTeacher, isPending } = useMutation({
		mutationFn: (professorId: string) =>
			coursesApi.coursesPartialUpdate(courseId, { professor_id: Number(professorId) }),
		onSuccess,
		onError,
	})

	return (
		<Modal
			title="Assigner un professeur"
			confirmLoading={isPending}
			onOk={formInstance.submit}
			onCancel={onCancel}
			open={open}
			destroyOnClose
		>
			<Form
				form={formInstance}
				layout="vertical"
				onFinish={({ professor }) => assignTeacher(professor)}
			>
				<Form.Item name="professor" label="Professeur" rules={[{ required: true }]}>
					<Select
						placeholder="Sélectionner un professeur"
						options={teachers?.map((t) => ({
							label: `${t.first_name} ${t.last_name}`,
							value: t.id,
						}))}
					/>
				</Form.Item>
			</Form>
		</Modal>
	)
}
