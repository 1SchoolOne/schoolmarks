import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Space, Table, Typography } from 'antd'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import React, { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { coursesApi } from '@api/axios'

import { User } from '@apiClient'

import { coursesLoader } from '..'

export function CourseAdminTable() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof coursesLoader>>
	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
	const { notification } = App.useApp()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { modal } = App.useApp()

	const { data } = useQuery({
		queryKey: ['courses'],
		queryFn: () => coursesApi.coursesList().then(({ data }) => data),
		initialData,
	})

	const { mutate: deleteCourses } = useMutation({
		mutationFn: async (courseIds: React.Key[]) =>
			coursesApi
				.coursesBulkDeleteCreate({ course_ids: courseIds as string[] })
				.then(({ data }) => data),
		onSuccess: ({ count }) => {
			notification.success({
				message: count > 1 ? `${count} cours supprimés avec succès` : 'Cours supprimé avec succès',
			})
			queryClient.invalidateQueries({ queryKey: ['courses'] })
		},
		onError: (err) => {
			notification.error({ message: 'Erreur lors de la suppression', description: err.message })
		},
	})

	return (
		<Table
			dataSource={data}
			rowKey={({ id }) => String(id)}
			title={() => (
				<Space>
					<Button
						type="primary"
						icon={<PlusIcon size={16} />}
						onClick={() => navigate('/app/admin/courses/new')}
					>
						Créer un cours
					</Button>
					<Button
						icon={<Trash2Icon size={16} />}
						onClick={() =>
							modal.confirm({
								icon: <Trash2Icon color="var(--ant-color-error)" />,
								title: 'Supprimer',
								content: `Êtes-vous sûr de vouloir supprimer ${selectedKeys.length} cours ?`,
								okText: 'Supprimer',
								okButtonProps: { danger: true },
								onOk: async () => {
									await deleteCourses(selectedKeys)
									setSelectedKeys([])
								},
							})
						}
						disabled={selectedKeys.length === 0}
						danger
					>
						Supprimer
					</Button>
					{selectedKeys.length >= 1 && (
						<Typography.Text>{selectedKeys.length} cours sélectionné(s)</Typography.Text>
					)}
				</Space>
			)}
			rowSelection={{
				type: 'checkbox',
				selectedRowKeys: selectedKeys,
				onChange: (selectedRowKeys) => setSelectedKeys(selectedRowKeys),
			}}
			columns={[
				{
					title: 'Actions',
					width: 100,
					render: (_, course) => (
						<Button
							type="link"
							icon={<PencilIcon size={16} />}
							title="Modifier"
							onClick={() => navigate(`/app/admin/courses/edit/${course.id}`)}
						/>
					),
				},
				{
					dataIndex: 'name',
					title: 'Nom',
				},
				{
					dataIndex: 'code',
					title: 'Code',
					width: 125,
				},
				{
					dataIndex: 'professor',
					title: 'Professeur',
					render: (professor: User) =>
						professor ? `${professor.first_name} ${professor.last_name}` : '-',
				},
			]}
		/>
	)
}
