import { Card, Col, Row, Space, Statistic, Typography } from 'antd'

import { GradeWithUser } from '../hooks/useGrades'

import './StudentCardGrades-styles.less'

const { Text, Title } = Typography

interface StudentGradeCardProps {
	grade: GradeWithUser
	userGrade?: string
}

export const StudentCardGrade = ({ grade, userGrade }: StudentGradeCardProps) => {
	if (!grade) return null

	const numericGrades = grade.studentGrades?.map((g) => Number(g.value)) || []
	const minGrade = numericGrades.length ? Math.floor(Math.min(...numericGrades)) : '-'
	const maxGrade = numericGrades.length ? Math.floor(Math.max(...numericGrades)) : '-'

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
				maxWidth: 320,
				marginBottom: 16,
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
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
							title={<Text type="secondary">Ta note :</Text>}
							value={`${parseInt(userGrade || '0', 10) || '-'}/${parseInt(grade.max_value, 10)}`}
							formatter={formatter}
							valueStyle={{
								color: '#dcb14a',
								fontSize: 22,
							}}
							style={{ textAlign: 'center' }}
						/>
					</Col>
					<Col span={8}>
						<Statistic
							title={<Text type="secondary">Note - :</Text>}
							value={`${minGrade}/${parseInt(grade.max_value, 10)}`}
							formatter={formatter}
							valueStyle={{
								color: '#f5222d',
								fontSize: 22,
							}}
							style={{ textAlign: 'center' }}
						/>
					</Col>
					<Col span={8}>
						<Statistic
							title={<Text type="secondary">Note + :</Text>}
							value={`${maxGrade}/${parseInt(grade.max_value, 10)}`}
							formatter={formatter}
							valueStyle={{
								color: '#52c41a',
								fontSize: 22,
							}}
							style={{ textAlign: 'center' }}
						/>
					</Col>
				</Row>
			</Space>
		</Card>
	)
}
