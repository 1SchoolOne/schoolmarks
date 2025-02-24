import { useQuery } from '@tanstack/react-query'

import { getUsers } from '@api/users'

import { GradeWithUser } from './useGrades'

export function useGradeExport() {
	const { data: students = [] } = useQuery({
		queryKey: ['users'],
		queryFn: () => getUsers(),
	})

	const convertToCSV = (grade: GradeWithUser) => {
		const headers = [
			'Classe',
			'Cours',
			'Évaluation',
			'Coefficient',
			'Note maximale',
			'Description',
			'Élève',
			'Note',
			'Commentaire',
		].join(';')

		const rows =
			grade.studentGrades?.map((studentGrade) => {
				const student = students.find((s) => s.id === studentGrade.student)
				const studentName = student
					? `${student.first_name} ${student.last_name}`
					: `Étudiant ${studentGrade.student}`

				return [
					grade.className,
					grade.courseName,
					grade.name,
					grade.coef,
					grade.max_value,
					grade.description || '',
					studentName,
					studentGrade.value,
					studentGrade.comment || '',
				].join(';')
			}) || []

		return [headers, ...rows].join('\n')
	}

	const handleExport = (grade: GradeWithUser) => {
		const csv = convertToCSV(grade)
		const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)

		link.setAttribute('href', url)
		link.setAttribute('download', `evaluation_${grade.courseName}_${grade.className}.csv`)
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	return { handleExport }
}
