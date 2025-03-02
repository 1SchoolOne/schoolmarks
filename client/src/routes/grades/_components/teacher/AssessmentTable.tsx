import { Space, Table, Typography } from 'antd'

import { ActionButton } from '../../ActionButtons'
import { ParsedAssessment } from '../../Assessments'

interface AssessmentTableProps {
	assessments: ParsedAssessment[]
}

export function AssessmentTable({ assessments }: AssessmentTableProps) {
	return (
		<Table
			className="assessments__table"
			scroll={{
				y: 65 * 10,
			}}
			dataSource={assessments}
			rowKey={({ id }) => id}
			columns={[
				{
					title: 'Actions',
					width: 125,
					render: (_, record) => (
						<Space.Compact>
							<ActionButton.Edit assessmentId={record.id} />
							<ActionButton.Export assessment={record} />
							<ActionButton.Delete assessmentId={record.id} />
						</Space.Compact>
					),
				},
				{ dataIndex: 'name', title: 'Nom' },
				{ title: 'Cours', render: (_, { course }) => `${course.name} (${course.code})` },
				{
					title: 'Classe',
					render: (_, { class_group }) => `${class_group.name} (${class_group.code})`,
				},
				{ dataIndex: 'coef', title: 'Coef.', width: 80 },
				{
					title: 'Moyenne',
					width: 100,
					render: (_, { max_value, gradesAvg }) => `${gradesAvg} / ${max_value.split('.')[0]}`,
				},
				{
					title: 'Note +',
					width: 100,
					render: (_, { max_value, bestGrade }) => (
						<Typography.Text type="success">
							{bestGrade} / {max_value.split('.')[0]}
						</Typography.Text>
					),
				},
				{
					title: 'Note -',
					width: 100,
					render: (_, { max_value, worstGrade }) => (
						<Typography.Text type="danger">
							{worstGrade} / {max_value.split('.')[0]}
						</Typography.Text>
					),
				},
			]}
		/>
	)
}
