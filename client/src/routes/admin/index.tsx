import { QueryClient } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { classesApi, coursesApi, usersApi } from '@api/axios'

import { ProtectedRoute } from '@components'

import { Route } from '@types'

import { ClassAdminTable } from './classes/ClassAdminTable'
import { CreateClassForm } from './classes/CreateClassForm/CreateClassForm'
import { EditClassModal } from './classes/EditClassModal'
import { EnrollCourses } from './classes/EnrollCourses'
import { EnrollStudents } from './classes/EnrollStudents'
import { CourseAdminTable } from './courses/CourseAdminTable'
import { CourseForm } from './courses/CourseForm'
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
			<ProtectedRoute
				restrictedTo={['admin']}
				redirectTo={(role) => {
					switch (role) {
						case 'student':
							return '/app/calendar'
						case 'teacher':
							return '/app/attendance'
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
						handle: {
							crumb: {
								label: 'Créer une classe',
								path: 'new',
							},
						},
						loader: () => createClassLoader(queryClient),
						element: <CreateClassForm />,
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
						path: ':classId/enroll-students',
						loader: ({ params }) => enrollStudentsLoader({ queryClient, classId: params.classId }),
						element: <EnrollStudents />,
						errorElement: <EnrollStudents.ErrorBoundary />,
					},
					{
						path: ':classId/enroll-courses',
						loader: ({ params }) => enrollCoursesLoader({ queryClient, classId: params.classId }),
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
						element: (
							<>
								<CourseAdminTable />
								<CourseForm />
							</>
						),
					},
					{
						path: 'edit/:courseId',
						loader: ({ params }) => courseLoader({ queryClient, courseId: params.courseId }),
						element: (
							<>
								<CourseAdminTable />
								<CourseForm />
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
		queryFn: () => usersApi.usersList().then(({ data }) => data),
	})
}

export function classAdminTableLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['classes'],
		queryFn: () => classesApi.classesList().then(({ data }) => data),
	})
}

export function studentsLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['users', { role: 'student' }],
		queryFn: () => usersApi.usersList('student').then(({ data }) => data),
	})
}

export async function classLoader(params: {
	queryClient: QueryClient
	classId: string | undefined
}) {
	const { queryClient, classId } = params

	if (!classId) throw new Error('classId is undefined')

	return queryClient.fetchQuery({
		queryKey: ['classes', classId],
		queryFn: () => classesApi.classesRetrieve(classId).then(({ data }) => data),
	})
}

export async function enrollCoursesLoader(params: {
	queryClient: QueryClient
	classId: string | undefined
}) {
	const { queryClient, classId } = params

	if (!classId) throw new Error('classId is undefined')

	const [courses, enrolledCourses] = await Promise.all([
		queryClient.fetchQuery({
			queryKey: ['courses'],
			queryFn: () => coursesApi.coursesList().then(({ data }) => data),
		}),
		queryClient.fetchQuery({
			queryKey: ['courses', { classId }],
			queryFn: () => classesApi.classesCoursesRetrieve(classId).then(({ data }) => data),
		}),
	])

	return { courses, enrolledCourses }
}

export function coursesLoader(queryClient: QueryClient) {
	return queryClient.fetchQuery({
		queryKey: ['courses'],
		queryFn: () => coursesApi.coursesList().then(({ data }) => data),
	})
}

export async function courseLoader(params: {
	queryClient: QueryClient
	courseId: string | undefined
}) {
	const { queryClient, courseId } = params

	if (!courseId) throw new Error('courseId is undefined')

	return queryClient.fetchQuery({
		queryKey: ['courses', courseId],
		queryFn: () => coursesApi.coursesRetrieve(courseId).then(({ data }) => data),
	})
}

export async function createClassLoader(queryClient: QueryClient) {
	const [students, courses] = await Promise.all([
		queryClient.fetchQuery({
			queryKey: ['users', { role: 'student' }],
			queryFn: () => usersApi.usersList('student').then(({ data }) => data),
		}),
		queryClient.fetchQuery({
			queryKey: ['courses'],
			queryFn: () => coursesApi.coursesList().then(({ data }) => data),
		}),
	])

	return { students, courses }
}

export async function enrollStudentsLoader(params: {
	queryClient: QueryClient
	classId: string | undefined
}) {
	const { queryClient, classId } = params

	if (!classId) throw new Error('classId is undefined')

	const [classStudents, students] = await Promise.all([
		queryClient.fetchQuery({
			queryKey: ['users', { classId }],
			queryFn: () => classesApi.classesStudentsRetrieve(classId).then(({ data }) => data),
		}),
		queryClient.fetchQuery({
			queryKey: ['users', { role: 'student' }],
			queryFn: () => usersApi.usersList('student').then(({ data }) => data),
		}),
	])

	return { classStudents, students }
}
