import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type CheckinSession = components['schemas']['CheckinSession']

/* - - - GET - - - */

export type GetCheckinSessionsResponse =
	paths['/checkin_sessions/']['get']['responses']['200']['content']['application/json']
export type GetCheckinSessionByIdResponse =
	paths['/checkin_sessions/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostCheckinSessionBody = Omit<CheckinSession, 'id'>
export type PostCheckinSessionResponse =
	paths['/checkin_sessions/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutCheckinSessionByIdBody = Omit<CheckinSession, 'id'>
export type PutCheckinSessionByIdResponse =
	paths['/checkin_sessions/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchCheckinSessionByIdBody = Partial<Omit<CheckinSession, 'id'>>
export type PatchCheckinSessionByIdResponse =
	paths['/checkin_sessions/{id}/']['patch']['responses']['200']['content']['application/json']
