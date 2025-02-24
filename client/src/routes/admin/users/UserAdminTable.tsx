import { PropsWithChildren } from '@1schoolone/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Popover, Segmented, Space, Table, Tag } from 'antd'
import axios from 'axios'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'

import { AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getUsers } from '@api/users'
import { User } from '@apiSchema/users'

import { userAdminTableLoader } from '..'

import './UserAdminTable-styles.less'

function renderRoleTag(role: string) {
	const tagClassname = 'role-tag'

	switch (role) {
		case 'admin':
			return (
				<Tag className={tagClassname} color="var(--ant-color-error)">
					Admin
				</Tag>
			)
		case 'teacher':
			return (
				<Tag className={tagClassname} color="var(--ant-color-success)">
					PO
				</Tag>
			)
		case 'student':
			return (
				<Tag className={tagClassname} color="var(--ant-color-info)">
					Étudiant
				</Tag>
			)
		default:
			return '-'
	}
}

function EditRolePopover({ user, children }: PropsWithChildren<{ user: User }>) {
	const queryClient = useQueryClient()
	const [isOpen, setIsOpen] = useState(false)
	const [formInstance] = Form.useForm()
	const { notification } = App.useApp()

	const { mutate: updateUserRole } = useMutation({
		mutationFn: (values: { user_role: string }) =>
			axios.patch(`/users/${user.id}/`, values, AXIOS_DEFAULT_CONFIG),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['users'],
			})
			notification.success({
				message: `Rôle de ${user.first_name} ${user.last_name} modifié avec succès`,
			})
			setIsOpen(false)
		},
		onError: () => {
			notification.error({
				message: 'Erreur',
				description: `Impossible de mettre à jour le rôle de ${user.first_name} ${user.last_name}`,
			})
		},
	})

	return (
		<Popover
			title="Modifier le rôle"
			trigger="click"
			open={isOpen}
			onOpenChange={setIsOpen}
			overlayClassName="edit-role-popover"
			destroyTooltipOnHide
			content={
				<Form
					form={formInstance}
					onFinish={updateUserRole}
					initialValues={{ user_role: user.role }}
					preserve={false}
				>
					<Space direction="vertical">
						<Form.Item name="user_role">
							<Segmented
								options={[
									{ value: 'student', label: 'Étudiant' },
									{ value: 'teacher', label: 'PO' },
									{ value: 'admin', label: 'Admin' },
								]}
							/>
						</Form.Item>
						<div className="btn-container">
							<Button size="small" onClick={() => setIsOpen(false)}>
								Annuler
							</Button>
							<Button htmlType="submit" type="primary" size="small">
								Enregistrer
							</Button>
						</div>
					</Space>
				</Form>
			}
		>
			{children}
		</Popover>
	)
}

export function UserAdminTable() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof userAdminTableLoader>>
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { modal } = App.useApp()

	const { data } = useQuery({
		queryKey: ['users'],
		queryFn: () => getUsers(),
		initialData,
	})

	return (
		<Table
			className="user-admin-table"
			dataSource={data}
			title={() => (
				<Button
					type="primary"
					icon={<PlusIcon size={16} />}
					onClick={() => navigate('/app/admin/users/new')}
				>
					Ajouter un utilisateur
				</Button>
			)}
			rowKey={({ id }) => String(id)}
			columns={[
				{
					title: 'Actions',
					width: 100,
					render: (_, user) => (
						<Button
							type="link"
							icon={<Trash2Icon size={16} />}
							onClick={() =>
								modal.confirm({
									icon: <Trash2Icon color="var(--ant-color-error)" />,
									title: 'Supprimer',
									content: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name} ?`,
									okText: 'Supprimer',
									okButtonProps: { danger: true },
									onOk: async () => await axios.delete(`/users/${user.id}/`, AXIOS_DEFAULT_CONFIG),
									afterClose: () => queryClient.refetchQueries({ queryKey: ['users'] }),
								})
							}
							danger
						/>
					),
				},
				{
					dataIndex: 'first_name',
					title: 'Prénom',
				},
				{
					dataIndex: 'last_name',
					title: 'Nom',
				},
				{
					dataIndex: 'email',
					title: 'Email',
				},
				{
					dataIndex: 'role',
					title: 'Role',
					render: (role, user) => (
						<EditRolePopover user={user}>{renderRoleTag(role)}</EditRolePopover>
					),
				},
			]}
		/>
	)
}
