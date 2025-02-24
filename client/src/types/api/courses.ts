import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type Course = components['schemas']['Course']

/* - - - GET - - - */

export type GetCoursesResponse =
	paths['/courses/']['get']['responses']['200']['content']['application/json']
export type GetCourseByIdResponse =
	paths['/courses/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostCourseBody = Omit<Course, 'id'>
export type PostCourseResponse =
	paths['/courses/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutCourseByIdBody = Omit<Course, 'id'>
export type PutCourseByIdResponse =
	paths['/courses/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchCourseByIdBody = Partial<Omit<Course, 'id'>>
export type PatchCourseByIdResponse =
	paths['/courses/{id}/']['patch']['responses']['200']['content']['application/json']
