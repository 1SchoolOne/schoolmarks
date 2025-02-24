import { Col, Row, Space, Typography } from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'

import { ImportForm, ProcessingStatus } from '../_components/ImportForm/ImportForm'

export function ImportClasses() {
	const navigate = useNavigate()

	return (
		<Space direction="vertical" style={{ width: '100%', maxWidth: '1200px' }}>
			<Typography.Paragraph>
				Configurez vos classes en quelques clics. Une fois importées, vous pourrez y assigner vos
				étudiants et les lier à leurs cours respectifs.
			</Typography.Paragraph>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<ImportForm
						onUpload={async (file) => {
							const fileBuffer = await file.originFileObj?.arrayBuffer()
							if (!fileBuffer) throw new Error('fileBuffer is undefined')

							const blob = new Blob([fileBuffer], { type: 'text/csv' })
							const formData = new FormData()

							formData.append('file', blob)

							return axios.post<{ import_id: string; status: ProcessingStatus }>(
								`${API_BASE_URL}/import/classes/`,
								formData,
								AXIOS_DEFAULT_CONFIG,
							)
						}}
						onUploadSuccess={({ data }) => {
							navigate(`/app/admin/import/classes/view/${data.import_id}`)
						}}
					/>
				</Col>
			</Row>
		</Space>
	)
}
