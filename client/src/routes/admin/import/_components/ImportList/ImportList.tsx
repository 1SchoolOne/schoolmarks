import { useQuery } from '@tanstack/react-query'
import { List, Tooltip } from 'antd'
import axios from 'axios'
import { CircleCheckIcon, CircleDashedIcon, CircleXIcon } from 'lucide-react'
import { ReactNode } from 'react'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'

import { ImportCSV, ImportCSVError, ImportCSVSuccess, ImportStatus, ImportType } from '../../types'

interface ImportListProps<DataType extends Record<string, any>> {
	importType: ImportType
	initialData?: ImportCSV<DataType>
	renderItem: (importItem: ImportCSVSuccess<DataType> | ImportCSVError) => ReactNode
}

interface ImportListItemProps {
	status: ImportStatus
	title: ReactNode
	description: ReactNode
}

function getListItemIcon(status: ImportStatus) {
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
		queryFn: async () => {
			const { data } = await axios.get<ImportCSV<DataType>>(
				`${API_BASE_URL}/import/${importType}`,
				AXIOS_DEFAULT_CONFIG,
			)

			return data
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
