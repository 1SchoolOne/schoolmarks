import { DeleteOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Statistic, Tooltip, Typography } from 'antd'

import { useGradeExport } from '../hooks/useGradeExport'
import { GradeWithUser } from '../hooks/useGrades'

const { Text, Title } = Typography
interface TeacherCardGradeProps {
	grade: GradeWithUser
	grades: GradeWithUser[]
	onEdit: (grade: GradeWithUser) => void
	onDelete: (grade: GradeWithUser) => void
	onExport?: (grade: GradeWithUser) => void
}

export const TeacherCardGrade = ({ grade, grades, onEdit, onDelete }: TeacherCardGradeProps) => {
	const { handleExport } = useGradeExport()
	if (!grade) return null

	const courseGrades = grades.filter((g) => g.course === grade.course)

	const allStudentGrades: number[] = []
	courseGrades.forEach((g) => {
		if (g.studentGrades) {
			g.studentGrades.forEach((sg) => {
				const numericValue = Number(sg.value)
				if (!isNaN(numericValue)) {
					allStudentGrades.push(numericValue)
				}
			})
		}
	})

	const minGrade = allStudentGrades.length ? Math.floor(Math.min(...allStudentGrades)) : '-'
	const maxGrade = allStudentGrades.length ? Math.floor(Math.max(...allStudentGrades)) : '-'

	const averageGrade = allStudentGrades.length
		? Math.round((allStudentGrades.reduce((a, b) => a + b, 0) / allStudentGrades.length) * 10) / 10
		: '-'

	const formattedDate = grade.created_at
		? new Date(grade.created_at).toLocaleDateString('fr-FR', {
				day: '2-digit',
				month: '2-digit',
			})
		: ''

	const formatter = (value: string | number) => <span>{value}</span>

	return (
		<Card
			style={{
				borderRadius: 8,
				width: '100%',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
				margin: '0 auto',
			}}
			bodyStyle={{ padding: 16 }}
			hoverable
		>
			<Space direction="vertical" style={{ width: '100%' }} size={16}>
				{/* Header */}
				<Space direction="vertical" size={8} style={{ width: '100%' }}>
					<Title level={5} style={{ margin: 0 }}>
						{grade.courseName}
					</Title>
					<Space wrap size={12}>
						<Text type="secondary">{formattedDate}</Text>
						<Text type="secondary">Classe : {grade.className || '-'}</Text>
						<Text type="secondary">Coeff. : {parseInt(grade.coef, 10) || 1}</Text>
					</Space>
				</Space>

				<Row gutter={8}>
					<Col span={8}>
						<Statistic
							title={<Text type="secondary">Note -</Text>}
							value={`${minGrade}/${parseInt(grade.max_value, 10)}`}
							formatter={formatter}
							valueStyle={{
								color: '#f5222d',
								fontSize: 20,
							}}
							style={{ textAlign: 'center' }}
						/>
					</Col>
					<Col span={8}>
						<Statistic
							title={<Text type="secondary">Moyenne</Text>}
							value={`${averageGrade}/${parseInt(grade.max_value, 10)}`}
							formatter={formatter}
							valueStyle={{
								color: '#1890ff',
								fontSize: 20,
							}}
							style={{ textAlign: 'center' }}
						/>
					</Col>
					<Col span={8}>
						<Statistic
							title={<Text type="secondary">Note +</Text>}
							value={`${maxGrade}/${parseInt(grade.max_value, 10)}`}
							formatter={formatter}
							valueStyle={{
								color: '#52c41a',
								fontSize: 20,
							}}
							style={{ textAlign: 'center' }}
						/>
					</Col>
				</Row>

				{/* Actions */}
				<Row justify="end" gutter={8}>
					<Col>
						<Tooltip title="Modifier l'évaluation">
							<Button
								type="text"
								icon={<EditOutlined style={{ color: '#1890ff' }} />}
								onClick={() => onEdit(grade)}
							/>
						</Tooltip>
					</Col>
					<Col>
						<Tooltip title="Exporter l'évaluation">
							<Button
								type="text"
								icon={<ExportOutlined style={{ color: '#1890ff' }} />}
								onClick={() => handleExport(grade)}
							/>
						</Tooltip>
					</Col>
					<Col>
						<Tooltip title="Supprimer l'évaluation">
							<Button
								type="text"
								icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
								onClick={() => onDelete(grade)}
							/>
						</Tooltip>
					</Col>
				</Row>
			</Space>
		</Card>
	)
}
