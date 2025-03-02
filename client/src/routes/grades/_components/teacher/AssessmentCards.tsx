import { Card, Col, Empty, Flex, Space, Statistic, Typography } from 'antd'

import { ActionButton } from '../../ActionButtons'
import { ParsedAssessment } from '../../Assessments'

interface AssessmentCardsProps {
	assessments: ParsedAssessment[]
}

export function AssessmentCards({ assessments }: AssessmentCardsProps) {
	return (
		<div className="assessments__cards">
			{assessments.length > 0 ? (
				assessments.map((a) => (
					<div key={a.id}>
						<Card
							className="assessments__cards__item"
							title={
								<Flex className="assessments__cards__item__title" vertical>
									<Typography.Title level={5}>{a.name}</Typography.Title>
									<Typography.Text type="secondary" ellipsis>
										{a.course.name} ({a.course.code})
									</Typography.Text>
								</Flex>
							}
							actions={[
								<ActionButton.Edit assessmentId={a.id} />,
								<ActionButton.Export assessment={a} />,
								<ActionButton.Delete assessmentId={a.id} />,
							]}
						>
							<Space style={{ width: '100%' }} direction="vertical" size="large">
								{a.description && <Card.Meta description={a.description} />}

								<Space>
									<Typography.Text type="secondary">Classe :</Typography.Text>
									<Typography.Text>{a.class_group.name}</Typography.Text>
								</Space>

								<Space>
									<Typography.Text type="secondary">Coef. :</Typography.Text>
									<Typography.Text>{a.coef}</Typography.Text>
								</Space>

								<div className="assessments__cards__item__statistics">
									<Statistic
										title="Moyenne :"
										value={a.gradesAvg}
										suffix={`/ ${a.max_value.split('.')[0]}`}
									/>
									<Statistic
										title="Note + :"
										valueStyle={{ color: 'var(--ant-color-success)' }}
										value={a.bestGrade}
										suffix={`/ ${a.max_value.split('.')[0]}`}
									/>
									<Statistic
										title="Note - :"
										valueStyle={{ color: 'var(--ant-color-error)' }}
										value={a.worstGrade}
										suffix={`/ ${a.max_value.split('.')[0]}`}
									/>
								</div>
							</Space>
						</Card>
					</div>
				))
			) : (
				<Col span={24}>
					<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</Col>
			)}
		</div>
	)
}
