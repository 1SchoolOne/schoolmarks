import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type ClassStudent = components['schemas']['ClassStudent']

/* - - - GET - - - */

export type GetClassStudentsResponse =
	paths['/class_students/']['get']['responses']['200']['content']['application/json']
export type GetClassStudentByIdResponse =
	paths['/class_students/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostClassStudentBody = Omit<ClassStudent, 'id'>
export type PostClassStudentResponse =
	paths['/class_students/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutClassStudentByIdBody = Omit<ClassStudent, 'id'>
export type PutClassStudentByIdResponse =
	paths['/class_students/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchClassStudentByIdBody = Partial<Omit<ClassStudent, 'id'>>
export type PatchClassStudentByIdResponse =
	paths['/class_students/{id}/']['patch']['responses']['200']['content']['application/json']
