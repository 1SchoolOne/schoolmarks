import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type User = components['schemas']['User']

/* - - - GET - - - */

export type GetUsersResponse =
	paths['/users/']['get']['responses']['200']['content']['application/json']
export type GetUserByIdResponse =
	paths['/users/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostUserBody = Omit<User, 'id'>
export type PostUserResponse =
	paths['/users/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutUserByIdBody = Omit<User, 'id'>
export type PutUserByIdResponse =
	paths['/users/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchUserByIdBody = Partial<Omit<User, 'id'>>
export type PatchUserByIdResponse =
	paths['/users/{id}/']['patch']['responses']['200']['content']['application/json']
