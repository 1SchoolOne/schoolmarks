import { QueryClient } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { getClassById, getClasses } from '@api/classes'
import { getCourseEnrollments } from '@api/courseEnrollments'
import { getCourseById, getCourses } from '@api/courses'
import { getUsers } from '@api/users'

import { ProtectedRoute } from '@components'

import { Route } from '@types'

import { AddStudents } from './classes/AddStudents'
import { ClassAdminTable } from './classes/ClassAdminTable'
import { CreateClass } from './classes/CreateClass'
import { EditClassModal } from './classes/EditClassModal'
import { EnrollCourses } from './classes/EnrollCourses'
import { CourseAdminTable } from './courses/CourseAdminTable'
import { CreateCourse } from './courses/CreateCourse'
import { EditCourseModal } from './courses/EditCourseModal'
import { ImportCategories } from './import/ImportCategories'
import { ImportClasses } from './import/classes/ImportClasses'
import { ImportClassesDetail } from './import/classes/ImportClassesDetail'
import { ImportClassesList } from './import/classes/ImportClassesList'
import { ImportCourses } from './import/courses/ImportCourses'
import { ImportCoursesDetail } from './import/courses/ImportCoursesDetail'
import { ImportCoursesList } from './import/courses/ImportCoursesList'
import { ImportUsers } from './import/users/ImportUsers'
import { ImportUsersDetail } from './import/users/ImportUsersDetail'
import { ImportUsersList } from './import/users/ImportUsersList'
import { CreateUserModal } from './users/CreateUserModal'
import { UserAdminTable } from './users/UserAdminTable'

export function getAdminRoute(queryClient: QueryClient): Route {
	return {
		path: 'admin',
		element: (
			<ProtectedRoute restrictedTo={['admin']}>
				<Outlet />
			</ProtectedRoute>
		),
		handle: {
			crumb: {
				label: 'Administration',
				path: 'admin',
				disabled: true,
			},
		},
		children: [
			{ index: true, element: <Navigate to="/app/admin/users" /> },
			{
				path: 'users',
				loader: () => userAdminTableLoader(queryClient),
				element: <Outlet />,
				handle: {
					crumb: {
						label: 'Utilisateurs',
						path: 'users',
					},
				},
				children: [
					{
						index: true,
						element: <UserAdminTable />,
					},
					{
						path: 'new',
						element: (
							<>
								<UserAdminTable />
								<CreateUserModal />
							</>
						),
					},
				],
			},
			{
				path: 'classes',
				loader: () => classAdminTableLoader(queryClient),
				handle: {
					crumb: {
						label: 'Classes',
						path: 'classes',
					},
				},
				children: [
					{
						index: true,
						element: <ClassAdminTable />,
					},
					{
						path: 'new',
						loader: () => studentsLoader(queryClient),
						element: <CreateClass />,
					},
					{
						path: 'edit/:classId',
						loader: ({ params }) => classLoader({ queryClient, classId: params.classId }),
						element: (
							<>
								<ClassAdminTable />
								<EditClassModal />
							</>
						),
					},
					{
						path: ':classId/add-students',
						loader: ({ params }) => classLoader({ queryClient, classId: params.classId }),
						element: <AddStudents />,
					},
					{
						path: ':classId/enroll-courses',
						loader: ({ params }) => classCoursesLoader({ queryClient, classId: params.classId }),
						element: <EnrollCourses />,
						errorElement: <EnrollCourses.ErrorBoundary />,
					},
				],
			},
			{
				path: 'courses',
				loader: () => coursesLoader(queryClient),
				element: <Outlet />,
				handle: {
					crumb: {
						label: 'Cours',
						path: 'courses',
					},
				},
				children: [
					{
						index: true,
						element: <CourseAdminTable />,
					},
					{
						path: 'new',
						loader: () => teachersLoader(queryClient),
						element: <CreateCourse />,
					},
					{
						path: 'edit/:courseId',
						loader: ({ params }) => editCourseLoader({ queryClient, courseId: params.courseId }),
						element: (
							<>
								<CourseAdminTable />
								<EditCourseModal />
							</>
						),
					},
				],
			},
			/* - - - - - - - - Import CSV - - - - - - - - */
			{
				path: 'import',
				element: <Outlet />,
				handle: {
					crumb: {
						label: 'Import',
						path: 'import',
					},
				},
				children: [
					{
						index: true,
						element: <ImportCategories />,
					},
					{
						path: 'users',
						handle: {
							crumb: {
								label: 'Utilisateurs',
								path: 'users',
							},
						},
						children: [
							{
								index: true,
								element: <ImportUsersList />,
							},
							{
								path: 'new',
								handle: {
									crumb: {
										label: 'Nouveau',
										path: 'new',
									},
								},
								element: <ImportUsers />,
							},
							{
								path: 'view/:importId',
								handle: {
									crumb: {
										label: 'Détails',
										path: 'view',
									},
								},
								element: <ImportUsersDetail />,
							},
						],
					},
					{
						path: 'classes',
						handle: {
							crumb: {
								label: 'Classes',
								path: 'classes',
							},
						},
						element: <Outlet />,
						children: [
							{
								index: true,
								element: <ImportClassesList />,
							},
							{
								path: 'new',
								handle: {
									crumb: {
										label: 'Nouveau',
										path: 'new',
									},
								},
								element: <ImportClasses />,
							},
							{
								path: 'view/:importId',
								handle: {
									crumb: {
										label: 'Détails',
										path: 'view',
									},
								},
								element: <ImportClassesDetail />,
							},
						],
					},
					{
						path: 'courses',
						handle: {
							crumb: {
								label: 'Cours',
								path: 'courses',
							},
						},
						element: <Outlet />,
						children: [
							{
								index: true,
								element: <ImportCoursesList />,
							},
							{
								path: 'new',
								handle: {
									crumb: {
										label: 'Nouveau',
										path: 'new',
									},
								},
								element: <ImportCourses />,
							},
							{
								path: 'view/:importId',
								handle: {
									crumb: {
										label: 'Détails',
										path: 'view',
									},
								},
								element: <ImportCoursesDetail />,
							},
						],
					},
				],
			},
		],
	}
}

export function userAdminTableLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['users'],
		queryFn: () => getUsers(),
	})
}

export function classAdminTableLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['classes'],
		queryFn: getClasses,
	})
}

export function studentsLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => getUsers({ role: 'student' }),
	})
}

export function classLoader(params: { queryClient: QueryClient; classId: string | undefined }) {
	const { queryClient, classId } = params

	if (!classId) throw new Error('classId is undefined')

	return queryClient.fetchQuery({
		queryKey: ['class', classId],
		queryFn: () => getClassById(classId),
	})
}

export async function classCoursesLoader(params: {
	queryClient: QueryClient
	classId: string | undefined
}) {
	const { queryClient, classId } = params

	if (!classId) throw new Error('classId is undefined')

	const [courseEnrollments, courses] = await Promise.all([
		queryClient.fetchQuery({
			queryKey: ['courses', classId],
			queryFn: () => getCourseEnrollments({ class_group: classId }),
		}),
		queryClient.fetchQuery({
			queryKey: ['courses'],
			queryFn: getCourses,
		}),
	])

	return { courses, courseEnrollments }
}

export function coursesLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['courses'],
		queryFn: getCourses,
	})
}

export function teachersLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['users', { role: 'teacher' }],
		queryFn: () => getUsers({ role: 'teacher' }),
	})
}

export async function editCourseLoader(params: {
	queryClient: QueryClient
	courseId: string | undefined
}) {
	const { queryClient, courseId } = params

	if (!courseId) throw new Error('courseId is undefined')

	const [course, teachers] = await Promise.all([
		queryClient.fetchQuery({
			queryKey: ['courses', courseId],
			queryFn: () => getCourseById(courseId),
		}),
		queryClient.fetchQuery({
			queryKey: ['users', { role: 'teacher' }],
			queryFn: () => getUsers({ role: 'teacher' }),
		}),
	])

	return { course, teachers }
}
