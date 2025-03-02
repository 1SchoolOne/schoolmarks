import { Table } from '@1schoolone/ui'

import { StudentGrade } from '@apiClient'

import { LoadingScreen } from '@components'

interface GradeTableProps {
	grades: StudentGrade[]
	isLoading: boolean
}

// TODO: use @1schoolone/ui filters
export function GradeTable(props: GradeTableProps) {
	const { grades, isLoading } = props

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<Table
			tableId="grades"
			dataSource={{ data: grades, totalCount: grades.length }}
			columns={[
				{
					dataIndex: 'assessment',
					title: 'Évaluation',
					render: (_, { assessment }) => assessment.name,
				},
				{
					dataIndex: 'assessment',
					title: 'Cours',
					render: (_, { assessment }) => assessment.course.name,
				},
				{
					dataIndex: 'value',
					title: 'Note',
					render: (value, { assessment }) => `${value} / ${assessment.max_value}`,
				},
				{
					dataIndex: 'comment',
					title: 'Commentaire',
				},
			]}
			defaultFilters={{}}
		/>
	)
}
