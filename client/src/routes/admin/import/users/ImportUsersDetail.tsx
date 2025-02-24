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

export function ImportUsersDetail() {
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
					first_name: string
					last_name: string
					email: string
					temp_password: string
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
				<ImportProgress importType="users" percent={importProgress.progress} />
			)}
			{importProgress?.status === 'completed' && (
				<Table
					title={() => `${importProgress?.results.length} utilisateurs importés`}
					dataSource={importProgress?.results}
					rowKey={({ email }) => email}
					columns={[
						{ dataIndex: 'first_name', title: 'Prénom' },
						{ dataIndex: 'last_name', title: 'Nom' },
						{ dataIndex: 'email', title: 'Email' },
						{ dataIndex: 'temp_password', title: 'Mot de passe temporaire' },
					]}
				/>
			)}
			{importProgress?.status === 'failed' && (
				<Typography.Text>Cet import a échoué</Typography.Text>
			)}
		</Col>
	)
}
