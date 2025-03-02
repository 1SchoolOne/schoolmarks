import { useStudentData } from '@routes/grades/Assessments-data'

import { GradeTable } from './GradeTable'

export function StudentView() {
	const { grades, isPending } = useStudentData()

	return <GradeTable grades={grades ?? []} isLoading={isPending} />
}
