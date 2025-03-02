import { Col, Row, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

import { importApi } from '@api/axios'

import { ImportForm } from '../_components/ImportForm/ImportForm'

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
							return importApi.importClassesCreate(file.originFileObj)
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
