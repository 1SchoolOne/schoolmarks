import { QueryClient } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'

import { assessmentsApi, classesApi } from '@api/axios'

import { ProtectedRoute } from '@components'

import { Route } from '@types'

import { AssessmentForm } from './AssessmentForm/AssessmentForm'
import { Assessments } from './Assessments'

export function getGradesRoute(queryClient: QueryClient): Route {
	return {
		path: 'grades',
		element: (
			<ProtectedRoute
				restrictedTo={['teacher', 'student']}
				redirectTo={(role) => {
					switch (role) {
						case 'student':
						case 'teacher':
							return '/app/grades'
						case 'admin':
							return '/app/admin/users'
					}
				}}
			>
				<Outlet />
			</ProtectedRoute>
		),
		handle: {
			crumb: {
				label: 'Notes',
				path: 'grades',
			},
		},
		children: [
			{ index: true, element: <Assessments /> },
			{
				path: 'new',
				loader: () => assessmentFormLoader({ queryClient, assessmentId: undefined }),
				element: <AssessmentForm />,
				handle: {
					crumb: {
						label: 'Créer une évaluation',
						path: 'new',
					},
				},
			},
			{
				path: 'edit/:assessmentId',
				loader: ({ params }) =>
					assessmentFormLoader({ queryClient, assessmentId: params.assessmentId }),
				element: <AssessmentForm />,
				handle: {
					crumb: {
						label: 'Modifier une évaluation',
						path: 'edit',
					},
				},
			},
		],
	}
}

export function assessmentLoader(params: {
	queryClient: QueryClient
	assessmentId: string | undefined
}) {
	const { queryClient, assessmentId } = params

	if (!assessmentId) throw new Error('assessmentId is undefined')

	return queryClient.fetchQuery({
		queryKey: ['assessments', assessmentId],
		queryFn: () => assessmentsApi.assessmentsRetrieve(assessmentId).then(({ data }) => data),
	})
}

export async function assessmentFormLoader(params: {
	queryClient: QueryClient
	assessmentId: string | undefined
}) {
	const { queryClient, assessmentId } = params

	if (assessmentId) {
		const assessment = await queryClient.fetchQuery({
			queryKey: ['assessments', assessmentId],
			queryFn: () => assessmentsApi.assessmentsRetrieve(assessmentId).then(({ data }) => data),
		})

		return { assessment, classes: [assessment.class_group] }
	}
	const classes = await queryClient.fetchQuery({
		queryKey: ['classes'],
		queryFn: () => classesApi.classesList().then(({ data }) => data),
	})

	return { assessment: undefined, classes }
}
