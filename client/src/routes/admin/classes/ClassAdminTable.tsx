import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Popover, Space, Table, Tooltip, Typography } from 'antd'
import axios from 'axios'
import {
	BookPlusIcon,
	InfoIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	UserPlusIcon,
} from 'lucide-react'
import React, { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getClasses } from '@api/classes'
import { User } from '@apiSchema/users'

import { classAdminTableLoader } from '..'

import './ClassAdminTable-styles.less'

export function ClassAdminTable() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classAdminTableLoader>>
	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
	const { notification } = App.useApp()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { modal } = App.useApp()

	const { data } = useQuery({
		queryKey: ['classes'],
		queryFn: getClasses,
		initialData,
	})

	const { mutate: deleteClasses } = useMutation({
		mutationFn: async (classIds: React.Key[]) => {
			const { data } = await axios.post<{ detail: string; count: number }>(
				`${API_BASE_URL}/classes/bulk_delete/`,
				{ ids: classIds },
				AXIOS_DEFAULT_CONFIG,
			)

			return data
		},
		onSuccess: ({ count }) => {
			notification.success({
				message:
					count > 1 ? `${count} classes supprimées avec succès.` : 'Classe supprimée avec succès.',
			})
			queryClient.refetchQueries({
				queryKey: ['classes'],
			})
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
						onClick={() => navigate('/app/admin/classes/new')}
					>
						Ajouter une classe
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
						<Space.Compact block>
							<Button
								type="link"
								icon={<PencilIcon size={16} />}
								title="Modifier"
								onClick={() => {
									navigate(`/app/admin/classes/edit/${classRecord.id}`)
								}}
							/>
							<Tooltip title="Affectation des cours">
								<Button
									type="link"
									icon={<BookPlusIcon size={16} />}
									title="Affectation des cours"
									onClick={() => {
										navigate(`/app/admin/classes/${classRecord.id}/enroll-courses`)
									}}
								/>
							</Tooltip>
							<Tooltip title="Ajouter des étudiants">
								<Button
									type="link"
									icon={<UserPlusIcon size={16} />}
									title="Ajouter des étudiants"
									onClick={() => {
										navigate(`/app/admin/classes/${classRecord.id}/add-students`)
									}}
								/>
							</Tooltip>
						</Space.Compact>
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
	)
}
