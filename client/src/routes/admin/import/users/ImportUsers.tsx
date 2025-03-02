import { Col, Row, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

import { importApi } from '@api/axios'

import { ImportForm } from '../_components/ImportForm/ImportForm'

export function ImportUsers() {
	const navigate = useNavigate()

	return (
		<Space direction="vertical" style={{ width: '100%', maxWidth: '1200px' }}>
			<Typography.Paragraph>
				Créez rapidement les comptes de vos étudiants et professeurs. Un mot de passe temporaire
				sera envoyé automatiquement à chaque nouvel utilisateur.
			</Typography.Paragraph>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<ImportForm
						onUpload={async (file) => {
							return importApi.importUsersCreate(file.originFileObj)
						}}
						onUploadSuccess={({ data }) => {
							navigate(`/app/admin/import/users/view/${data.import_id}`)
						}}
					/>
				</Col>
			</Row>
		</Space>
	)
}
