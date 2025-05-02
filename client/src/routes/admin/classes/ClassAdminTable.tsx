import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Popover, Space, Table, Typography } from 'antd'
import { InfoIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import React, { useState } from 'react'
import { useLoaderData } from 'react-router-dom'

import { classesApi } from '@api/axios'

import { User } from '@apiClient'

import { classAdminTableLoader } from '..'
import { ClassForm } from './ClassForm'

import './ClassAdminTable-styles.less'

interface ClassFormState {
	classId: string | null
	open: boolean
}

export function ClassAdminTable() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classAdminTableLoader>>
	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
	const { notification } = App.useApp()
	const queryClient = useQueryClient()
	const { modal } = App.useApp()

	const [classFormState, setClassFormState] = useState<ClassFormState>({
		classId: null,
		open: false,
	})

	const { data } = useQuery({
		queryKey: ['classes'],
		queryFn: () => classesApi.classesList().then(({ data }) => data),
		initialData,
	})

	const { mutate: deleteClasses } = useMutation({
		mutationFn: async (classIds: React.Key[]) =>
			classesApi
				.classesBulkDeleteCreate({ class_ids: classIds as string[] })
				.then(({ data }) => data),
		onSuccess: ({ count }) => {
			notification.success({
				message:
					count > 1 ? `${count} classes supprimées avec succès.` : 'Classe supprimée avec succès.',
			})
			queryClient.refetchQueries({
				queryKey: ['classes'],
			})
			setSelectedKeys([])
		},
		onError: (err) => {
			notification.error({ message: 'Erreur lors de la suppression', description: err.message })
		},
	})

	return (
		<>
			<ClassForm
				{...classFormState}
				closeDrawer={() => {
					setClassFormState({ classId: null, open: false })
				}}
			/>
			<Table
				dataSource={data}
				rowKey={({ id }) => String(id)}
				title={() => (
					<Space>
						<Button
							type="primary"
							icon={<PlusIcon size={16} />}
							onClick={() => setClassFormState({ classId: null, open: true })}
						>
							Créer une classe
						</Button>
						<Button
							icon={<Trash2Icon size={16} />}
							onClick={() => {
								modal.confirm({
									icon: <Trash2Icon color="var(--ant-color-error)" />,
									title: 'Supprimer',
									content: `Êtes-vous sûr de vouloir supprimer ${selectedKeys.length} classes ?`,
									okText: 'Supprimer',
									okButtonProps: { danger: true },
									onOk: async () => await deleteClasses(selectedKeys),
								})
							}}
							disabled={selectedKeys.length === 0}
							danger
						>
							Supprimer
						</Button>
						{selectedKeys.length >= 1 && (
							<Typography.Text>{selectedKeys.length} classes sélectionnées</Typography.Text>
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
						render: (_, classRecord) => (
							<Button
								type="link"
								icon={<PencilIcon size={16} />}
								title="Modifier"
								onClick={() => {
									setClassFormState({ classId: classRecord.id, open: true })
								}}
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
					},
					{
						dataIndex: 'year_of_graduation',
						title: "Année d'obtention du dipôme",
					},
					{
						dataIndex: 'students',
						title: 'Étudiants',
						render: (students) => {
							const studentsCount = students.length

							if (studentsCount === 0) {
								return 0
							}

							return (
								<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-margin-xs)' }}>
									{studentsCount}
									<Popover
										content={
											<ul className="students-list-popover">
												{students.map(({ id, first_name, last_name }: User) => (
													<li key={id}>
														{first_name} {last_name}
													</li>
												))}
											</ul>
										}
									>
										<InfoIcon color="var(--ant-color-info)" size={16} />
									</Popover>
								</div>
							)
						},
					},
				]}
			/>
		</>
	)
}
