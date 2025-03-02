import { Col, Row, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

import { importApi } from '@api/axios'

import { ImportForm } from '../_components/ImportForm/ImportForm'

export function ImportCourses() {
	const navigate = useNavigate()

	return (
		<Space direction="vertical" style={{ width: '100%', maxWidth: '1200px' }}>
			<Typography.Paragraph>
				Mettez en place vos cours et associez-y directement les professeurs responsables.
			</Typography.Paragraph>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<ImportForm
						onUpload={async (file) => {
							return importApi.importCoursesCreate(file.originFileObj)
						}}
						onUploadSuccess={({ data }) => {
							navigate(`/app/admin/import/courses/view/${data.import_id}`)
						}}
					/>
				</Col>
			</Row>
		</Space>
	)
}
