import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type StudentGrade = components['schemas']['StudentGrade']

/* - - - GET - - - */

export type GetStudentGradeResponse =
	paths['/student_grades/']['get']['responses']['200']['content']['application/json']
export type GetStudentGradeByIdResponse =
	paths['/student_grades/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostStudentGradeBody = Omit<StudentGrade, 'id'>
export type PostStudentGradeResponse =
	paths['/student_grades/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutStudentGradeByIdBody = Omit<StudentGrade, 'id'>
export type PutStudentGradeByIdResponse =
	paths['/student_grades/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchStudentGradeByIdBody = Partial<Omit<StudentGrade, 'id'>>
export type PatchStudentGradeByIdResponse =
	paths['/student_grades/{id}/']['patch']['responses']['200']['content']['application/json']
