import { Dayjs } from 'dayjs'

import { ParsedAssessment } from './Assessments'

export interface FiltersState {
	course: string | undefined
	class_group: string | undefined
	date: Dayjs | undefined
	search: string
}

type Actions =
	| Action<'setCourse'>
	| Action<'setClass'>
	| Action<'setDate', Dayjs>
	| Action<'setSearch'>

interface Action<ActionType, PayloadType = string | undefined> {
	type: ActionType
	value: PayloadType
}

export function filtersReducer(state: FiltersState, action: Actions): FiltersState {
	switch (action.type) {
		case 'setCourse':
			return {
				...state,
				course: action.value,
			}
		case 'setClass':
			return {
				...state,
				class_group: action.value,
			}
		case 'setDate':
			return {
				...state,
				date: action.value,
			}
		case 'setSearch':
			return {
				...state,
				search: action.value ?? '',
			}
	}
}

export function exportGradesToCsv(assessment: ParsedAssessment) {
	const headers = [
		'Classe',
		'Cours',
		'Évaluation',
		'Coefficient',
		'Élève',
		'Note',
		'Commentaire',
	].join(';')

	const className = assessment.class_group.name
	const courseName = assessment.course.name
	const assessmentName = assessment.name
	const coefficient = assessment.coef

	const rows = assessment.student_grades.map((grade) => {
		const studentName = `${grade.student.first_name} ${grade.student.last_name}`

		return [
			className,
			courseName,
			assessmentName,
			coefficient,
			studentName,
			grade.value,
			grade.comment,
		].join(';')
	})

	const fileContent = [headers, ...rows].join('\n')
	const file = new Blob(['\ufeff' + fileContent], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(file)

	const linkElement = document.createElement('a')

	linkElement.setAttribute('href', url)
	linkElement.setAttribute(
		'download',
		`${assessmentName}_${courseName}_${className}.csv`.split(' ').join('-'),
	)

	document.body.appendChild(linkElement)
	linkElement.click()
	document.body.removeChild(linkElement)
}
