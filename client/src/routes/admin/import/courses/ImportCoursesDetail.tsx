import { useQuery } from '@tanstack/react-query'
import { App, Button, Col, Space, Table, Typography } from 'antd'
import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { AssignTeacherModal } from '@routes/admin/courses/AssignTeacherModal'

import { importApi } from '@api/axios'

import { LoadingScreen } from '@components'

import { ImportProgress } from '../_components/ImportProgress/ImportProgress'
import { ImportStatus } from '../types'

interface CourseImportResult {
	id: string
	name: string
	code: string
	professor: string | null
	professor_email: string | null
}

export function ImportCoursesDetail() {
	const [status, setStatus] = useState<ImportStatus>()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [currentCourseId, setCurrentCourseId] = useState<string>()
	const params = useParams()
	const { notification } = App.useApp()

	const { importId } = params

	// Narrow down the type of importProgress.results using `select`
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
		// Les types générés par l'API sont trop vagues. On cast les résultats pour
		// avoir un type plus précis.
		select: (data) => ({ ...data, results: data.results as CourseImportResult[] }),
		refetchInterval: status === 'processing' ? 1000 : undefined,
		enabled: !!importId,
	})

	if (isLoading && isPending) {
		return <LoadingScreen />
	}

	return (
		<>
			<AssignTeacherModal
				courseId={currentCourseId ?? ''}
				open={isModalOpen}
				onSuccess={() => {
					notification.success({ message: 'Professeur assigné aves succès' })
				}}
				onError={() => {
					notification.error({ message: "Erreur lors de l'assignation" })
				}}
				onCancel={() => {
					setIsModalOpen(false)
					setCurrentCourseId(undefined)
				}}
			/>
			<Col span={24}>
				{importProgress?.status === 'processing' && (
					<ImportProgress importType="courses" percent={importProgress.progress} />
				)}
				{importProgress?.status === 'completed' && (
					<Table
						title={() => (
							<Space direction="vertical">
								<Typography.Text>{importProgress?.results.length} cours importés</Typography.Text>
								{(importProgress.warnings ?? []).map((warn) => (
									<div
										style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-margin-xs)' }}
									>
										<TriangleAlertIcon size={16} color="var(--ant-color-warning)" />
										<Typography.Text italic>{warn}</Typography.Text>
									</div>
								))}
							</Space>
						)}
						dataSource={importProgress?.results}
						rowKey={({ id }) => id}
						columns={[
							{ dataIndex: 'name', title: 'Nom' },
							{ dataIndex: 'code', title: 'Code' },
							{
								dataIndex: 'professor',
								title: 'Professeur',
								render: (value: string | null, record) => {
									if (value) return value

									return (
										<Button
											type="link"
											onClick={() => {
												setCurrentCourseId(record.id)
												setIsModalOpen(true)
											}}
										>
											Assigner un professeur
										</Button>
									)
								},
							},
						]}
					/>
				)}
				{importProgress?.status === 'failed' && (
					<Typography.Text>Cet import a échoué</Typography.Text>
				)}
			</Col>
		</>
	)
}
