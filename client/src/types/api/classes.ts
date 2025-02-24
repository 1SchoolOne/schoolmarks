import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type Class = components['schemas']['Class']

/* - - - GET - - - */

export type GetClassesResponse =
	paths['/classes/']['get']['responses']['200']['content']['application/json']
export type GetClassByIdResponse =
	paths['/classes/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostClassBody = Omit<Class, 'id'>
export type PostClassResponse =
	paths['/classes/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutClassByIdBody = Omit<Class, 'id'>
export type PutClassByIdResponse =
	paths['/classes/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchClassByIdBody = Partial<Omit<Class, 'id'>>
export type PatchClassByIdResponse =
	paths['/classes/{id}/']['patch']['responses']['200']['content']['application/json']
