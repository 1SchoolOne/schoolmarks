import { useQuery } from '@tanstack/react-query'
import { useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCoursesClass } from '@api/courses'
import { getGrades } from '@api/grades'
import { getStudentGrades } from '@api/studentGrade'
import { Grade } from '@apiSchema/grades'
import { StudentGrade } from '@apiSchema/studentGrades'

import { IdentityContext } from '@contexts'

import { useDeleteGrade } from './useDeleteGrade'

type FilterType = {
	subject: string
	class: string
	month: string
	year: string
}

type ViewType = 'student' | 'teacher' | 'admin'

export interface GradeWithUser extends Grade {
	courseName?: string
	studentGrades?: StudentGrade[]
	className?: string
}

export const useGrades = (viewType: ViewType = 'student') => {
	const navigate = useNavigate()
	const { user } = useContext(IdentityContext)
	const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
	const [filters, setFilters] = useState<FilterType>({
		subject: '',
		class: '',
		month: '',
		year: '',
	})
	const [searchTerm, setSearchTerm] = useState<string>('')

	// Requêtes de données
	const {
		data: grades = [],
		isPending: isLoadingGrades,
		refetch: refetchGrades,
	} = useQuery({
		queryKey: ['grades'],
		queryFn: () => getGrades(),
	})

	const { data: courses = [], isPending: isLoadingCourses } = useQuery({
		queryKey: ['courses'],
		queryFn: () => getCoursesClass(),
	})

	const { data: studentGrades = [], isPending: isLoadingStudentGrades } = useQuery({
		queryKey: ['studentGrades'],
		queryFn: () => getStudentGrades(),
	})

	// Traitement des données
	const gradesWithCourseNames = useMemo(() => {
		return grades.map((grade) => ({
			...grade,
			courseName: courses.find((course) => course.id === grade.course)?.name,
			className: grade.class_group?.name,
			studentGrades: studentGrades.filter((sg) => sg.grade === grade.id),
		}))
	}, [grades, courses, studentGrades])

	// Filtration selon le type de vue (étudiant, professeur ou admin)
	const filteredByUserRole = useMemo(() => {
		switch (viewType) {
			case 'student':
				// Pour les étudiants - afficher seulement leurs propres notes
				return gradesWithCourseNames.filter((grade) => {
					return grade.studentGrades.some((sg) => sg.student === user?.id)
				})

			case 'teacher':
				// Pour les enseignants - afficher seulement les notes des cours qu'ils enseignent
				return gradesWithCourseNames.filter((grade) => {
					const course = courses.find((c) => c.id === grade.course)
					return course?.professor?.id === user?.id
				})

			case 'admin':
				// Pour les admins - afficher toutes les notes
				return gradesWithCourseNames

			default:
				return []
		}
	}, [gradesWithCourseNames, courses, user, viewType])

	// Gestionnaire de suppression (uniquement pour les enseignants et admins)
	const { handleDelete } = useDeleteGrade({
		onSuccess: async () => {
			await refetchGrades()
		},
	})

	// Gestionnaires d'événements
	const handleChange = (value: string, type: keyof FilterType): void => {
		const newFilters = { ...filters, [type]: value }
		setFilters(newFilters)
	}

	const handleResetFilter = (type: keyof FilterType): void => {
		const newFilters = { ...filters, [type]: '' }
		setFilters(newFilters)
	}

	const handleResetAllFilters = (): void => {
		setFilters({
			subject: '',
			class: '',
			month: '',
			year: '',
		})
		setSearchTerm('')
	}

	const handleEdit = (record: GradeWithUser) => {
		navigate(`/app/grades/edit?id=${record.id}`)
	}

	// Application des filtres
	const filteredGrades = useMemo(() => {
		let result = filteredByUserRole

		// Filtre par matière
		if (filters.subject) {
			result = result.filter(
				(grade) => grade.courseName?.toLowerCase() === filters.subject.toLowerCase(),
			)
		}

		// Filtre par classe
		if (filters.class) {
			result = result.filter(
				(grade) => grade.className?.toLowerCase() === filters.class.toLowerCase(),
			)
		}

		// Filtres temporels (mois et année)
		if (filters.month || filters.year) {
			result = result.filter((grade) => {
				if (!grade.created_at) return false
				const date = new Date(grade.created_at)

				if (filters.month) {
					const months = [
						'Janvier',
						'Février',
						'Mars',
						'Avril',
						'Mai',
						'Juin',
						'Juillet',
						'Aout',
						'Septembre',
						'Octobre',
						'Novembre',
						'Décembre',
					]
					if (months[date.getMonth()] !== filters.month) return false
				}

				if (filters.year) {
					if (date.getFullYear().toString() !== filters.year) return false
				}

				return true
			})
		}

		// Recherche textuelle
		if (searchTerm) {
			const lowercaseSearch = searchTerm.toLowerCase()
			result = result.filter(
				(grade) =>
					grade.courseName?.toLowerCase().includes(lowercaseSearch) ||
					grade.name.toLowerCase().includes(lowercaseSearch) ||
					grade.className?.toLowerCase().includes(lowercaseSearch),
			)
		}

		return result
	}, [filteredByUserRole, filters, searchTerm])

	// Options pour les filtres selon le type de vue
	const subjectOptions = useMemo(() => {
		if (viewType === 'teacher') {
			// Pour les enseignants, uniquement les matières qu'ils enseignent
			const teacherCourses = courses.filter((course) => course?.professor?.id === user?.id)
			return teacherCourses.map((course) => ({ value: course.name, label: course.name }))
		} else {
			// Pour les étudiants et admins, toutes les matières disponibles
			return courses.map((course) => ({ value: course.name, label: course.name }))
		}
	}, [courses, user, viewType])

	// Récupérer toutes les classes uniques selon le type de vue
	const classOptions = useMemo(() => {
		const uniqueClasses = new Set(
			filteredByUserRole.map((grade) => grade.className).filter(Boolean),
		)
		return Array.from(uniqueClasses).map((className) => ({ value: className, label: className }))
	}, [filteredByUserRole])

	const monthOptions = [
		{ value: 'Janvier', label: 'Janvier' },
		{ value: 'Février', label: 'Février' },
		{ value: 'Mars', label: 'Mars' },
		{ value: 'Avril', label: 'Avril' },
		{ value: 'Mai', label: 'Mai' },
		{ value: 'Juin', label: 'Juin' },
		{ value: 'Juillet', label: 'Juillet' },
		{ value: 'Aout', label: 'Aout' },
		{ value: 'Septembre', label: 'Septembre' },
		{ value: 'Octobre', label: 'Octobre' },
		{ value: 'Novembre', label: 'Novembre' },
		{ value: 'Décembre', label: 'Décembre' },
	]

	const yearOptions = useMemo(() => {
		return Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => {
			const year = (2020 + i).toString()
			return { value: year, label: year }
		})
	}, [])

	const isLoading = isLoadingGrades || isLoadingCourses || isLoadingStudentGrades

	return {
		// États
		viewMode,
		setViewMode,
		filters,
		searchTerm,
		setSearchTerm,
		viewType,

		// Données
		filteredGrades,
		courses,

		// État de chargement
		isLoading,

		// Gestionnaires d'événements
		handleChange,
		handleResetFilter,
		handleResetAllFilters,
		handleEdit,
		handleDelete,

		// Configuration de l'UI
		subjectOptions,
		classOptions,
		monthOptions,
		yearOptions,
		user,
	}
}
