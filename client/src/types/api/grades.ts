import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type Grade = components['schemas']['Grade']

/* - - - GET - - - */

export type GetGradesResponse =
	paths['/grades/']['get']['responses']['200']['content']['application/json']
export type GetGradeByIdResponse =
	paths['/grades/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostGradeBody = Omit<Grade, 'id'>
export type PostGradeResponse =
	paths['/grades/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutGradeByIdBody = Omit<Grade, 'id'>
export type PutGradeByIdResponse =
	paths['/grades/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchGradeByIdBody = Partial<Omit<Grade, 'id'>>
export type PatchGradeByIdResponse =
	paths['/grades/{id}/']['patch']['responses']['200']['content']['application/json']
