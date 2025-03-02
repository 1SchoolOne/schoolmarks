import { useQuery } from '@tanstack/react-query'
import { List, Tooltip } from 'antd'
import { CircleCheckIcon, CircleDashedIcon, CircleXIcon } from 'lucide-react'
import { ReactNode } from 'react'

import { importApi } from '@api/axios'

import { ImportStatus } from '@apiClient'

import { ImportCSVError, ImportCSVSuccess, ImportType } from '../../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ImportListProps<DataType extends Record<string, any>> {
	importType: ImportType
	initialData?: ImportStatus
	renderItem: (importItem: ImportCSVSuccess<DataType> | ImportCSVError) => ReactNode
}

interface ImportListItemProps {
	status: ImportStatus['status']
	title: ReactNode
	description: ReactNode
}

function getListItemIcon(status: ImportStatus['status']) {
	switch (status) {
		case 'completed':
			return (
				<Tooltip title="Terminé" mouseEnterDelay={0.5} placement="bottom">
					<CircleCheckIcon color="var(--ant-color-success)" />
				</Tooltip>
			)
		case 'failed':
			return (
				<Tooltip title="Échec" mouseEnterDelay={0.5} placement="bottom">
					<CircleXIcon color="var(--ant-color-error)" />
				</Tooltip>
			)
		case 'processing':
			return (
				<Tooltip title="En cours" mouseEnterDelay={0.5} placement="bottom">
					<CircleDashedIcon color="var(--ant-color-info)" />
				</Tooltip>
			)
	}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImportList<DataType extends Record<string, any>>(props: ImportListProps<DataType>) {
	const { importType, initialData, renderItem } = props

	const { data: imports, isPending } = useQuery({
		queryKey: [importType],
		queryFn: () => {
			switch (importType) {
				case 'users':
					return importApi.importUsersRetrieve().then(({ data }) => data)
				case 'classes':
					return importApi.importClassesRetrieve().then(({ data }) => data)
				case 'courses':
					return importApi.importCoursesRetrieve().then(({ data }) => data)
			}
		},
		initialData,
	})

	return <List dataSource={imports?.results ?? []} loading={isPending} renderItem={renderItem} />
}

function ImportListItem(props: ImportListItemProps) {
	const { status, title, description } = props

	return (
		<List.Item>
			<List.Item.Meta avatar={getListItemIcon(status)} title={title} description={description} />
		</List.Item>
	)
}

ImportList.Item = ImportListItem

export { ImportList }
