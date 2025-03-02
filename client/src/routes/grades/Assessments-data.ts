import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'

import { assessmentsApi, classesApi, coursesApi, studentGradesApi } from '@api/axios'

import { IdentityContext } from '@contexts'

import { FiltersState } from './Assessments-utils'
import { ParsedAssessment } from './_components/teacher/TeacherView'

export function useTeacherData(filtersState: FiltersState) {
	const { user } = useContext(IdentityContext)

	const { data: assessments } = useQuery({
		queryKey: [
			'assessments',
			{
				course: filtersState.course,
				classGroup: filtersState.class_group,
				date: filtersState.date,
			},
		],
		queryFn: async () => {
			const classId = filtersState.class_group !== 'all' ? filtersState.class_group : undefined
			const courseId = filtersState.course !== 'all' ? filtersState.course : undefined
			const month = filtersState.date ? filtersState.date.month() + 1 : undefined
			const year = filtersState.date ? filtersState.date.year() : undefined

			return assessmentsApi.assessmentsList(classId, courseId, month, year).then(({ data }) => data)
		},
		select: (data) => {
			const parsedAssessments: ParsedAssessment[] = data.map((assessment) => {
				const gradeSum = assessment.student_grades.reduce((sum, current) => {
					return sum + Number(current.value)
				}, 0)
				const bestGrade = assessment.student_grades.reduce((best, current) => {
					const currentGrade = Number(current.value)

					if (currentGrade > best) {
						return currentGrade
					}

					return best
				}, 0)
				const worstGrade = assessment.student_grades.reduce(
					(worst, current) => {
						const currentGrade = Number(current.value)

						if (currentGrade < worst) {
							return currentGrade
						}

						return worst
					},
					Number(assessment.student_grades[0]?.value ?? 0),
				)

				return {
					...assessment,
					gradesAvg:
						assessment.student_grades.length > 0 ? gradeSum / assessment.student_grades.length : 0,
					bestGrade,
					worstGrade,
				}
			})

			return parsedAssessments
		},
		enabled: user?.role === 'teacher',
	})

	const { data: courses } = useQuery({
		queryKey: ['courses'],
		queryFn: () => coursesApi.coursesList().then(({ data }) => data),
		enabled: user?.role === 'teacher',
	})

	const { data: classes } = useQuery({
		queryKey: ['classes'],
		queryFn: () => classesApi.classesList().then(({ data }) => data),
		enabled: user?.role === 'teacher',
	})

	return { assessments, courses, classes }
}

export function useStudentData() {
	const { user } = useContext(IdentityContext)

	const { data: grades, isPending } = useQuery({
		queryKey: ['grades'],
		queryFn: () => studentGradesApi.studentGradesList().then(({ data }) => data),
		enabled: user?.role === 'student',
	})

	return { grades, isPending }
}
