import { useQuery } from '@tanstack/react-query'
import { Col, Table, Typography } from 'antd'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { importApi } from '@api/axios'

import { LoadingScreen } from '@components'

import { ImportProgress } from '../_components/ImportProgress/ImportProgress'
import { ImportStatus } from '../types'

interface ClassImportResult {
	id: string
	name: string
	code: string
	year_of_graduation: number
}

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
			const { data } = await importApi.importRetrieve(importId!)

			setStatus(data.status)

			return data
		},
		select: (data) => ({ ...data, results: data.results as ClassImportResult[] }),
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
