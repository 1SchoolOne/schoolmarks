import { useQuery } from '@tanstack/react-query'
import { Col, Table, Typography } from 'antd'
import axios from 'axios'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'

import { LoadingScreen } from '@components'

import { ProcessingStatus } from '../_components/ImportForm/ImportForm'
import { ImportProgress } from '../_components/ImportProgress/ImportProgress'
import { ImportStatus } from '../types'

export function ImportClassesDetail() {
	const [status, setStatus] = useState<ImportStatus>()
	const params = useParams()

	const { importId } = params

	const {
		data: importProgress,
		isLoading,
		isPending,
	} = useQuery({
		queryKey: ['import-progress', importId],
		queryFn: async () => {
			const { data } = await axios.get<{
				progress: number
				status: ProcessingStatus
				results: Array<{
					id: string
					name: string
					code: string
					year_of_graduation: number
				}>
				error: unknown
			}>(`${API_BASE_URL}/import/${importId}`, AXIOS_DEFAULT_CONFIG)

			setStatus(data.status)

			return data
		},
		refetchInterval: status === 'processing' ? 1000 : undefined,
		enabled: !!importId,
	})

	if (isLoading && isPending) {
		return <LoadingScreen />
	}

	return (
		<Col span={24}>
			{importProgress?.status === 'processing' && (
				<ImportProgress importType="classes" percent={importProgress.progress} />
			)}
			{importProgress?.status === 'completed' && (
				<Table
					title={() => `${importProgress?.results.length} classes importés`}
					dataSource={importProgress?.results}
					rowKey={({ id }) => id}
					columns={[
						{ dataIndex: 'name', title: 'Nom' },
						{ dataIndex: 'code', title: 'Code' },
						{ dataIndex: 'year_of_graduation', title: "Année d'obtention du diplôme" },
					]}
				/>
			)}
			{importProgress?.status === 'failed' && (
				<Typography.Text>Cet import a échoué</Typography.Text>
			)}
		</Col>
	)
}
