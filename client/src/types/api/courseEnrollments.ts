import { paths } from '../api-schema'
import { Class } from './classes'
import { Course } from './courses'

/* - - - Model - - - */
export interface CourseEnrollment {
	id: string
	course: Course
	class_group: Class
	enrolled_at: string
}

/* - - - GET - - - */

export type GetCourseEnrollmentsResponse =
	paths['/course_enrollments/']['get']['responses']['200']['content']['application/json']
export type GetCourseEnrollmentByIdResponse =
	paths['/course_enrollments/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostCourseEnrollmentBody = Omit<CourseEnrollment, 'id'>
export type PostCourseEnrollmentResponse =
	paths['/course_enrollments/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutCourseEnrollmentByIdBody = Omit<CourseEnrollment, 'id'>
export type PutCourseEnrollmentByIdResponse =
	paths['/course_enrollments/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchCourseEnrollmentByIdBody = Partial<Omit<CourseEnrollment, 'id'>>
export type PatchCourseEnrollmentByIdResponse =
	paths['/course_enrollments/{id}/']['patch']['responses']['200']['content']['application/json']
