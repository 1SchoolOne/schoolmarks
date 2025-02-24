import { components, paths } from '../api-schema'
import { CheckinSession } from './checkinSessions'

/* - - - Model - - - */
export type ClassSession = components['schemas']['ClassSession']
export type ClassSessionDetail = Omit<
	components['schemas']['ClassSessionDetail'],
	'checkin_session'
> & { checkin_session: CheckinSession | null }

/* - - - GET - - - */

export type GetClassSessionsResponse = ClassSessionDetail[]
export type GetClassSessionByIdResponse = ClassSessionDetail

/* - - - POST - - - */

export type PostClassSessionBody = Omit<ClassSession, 'id'>
export type PostClassSessionResponse =
	paths['/class_sessions/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutClassSessionByIdBody = Omit<ClassSession, 'id'>
export type PutClassSessionByIdResponse =
	paths['/class_sessions/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchClassSessionByIdBody = Partial<Omit<ClassSession, 'id'>>
export type PatchCheckinSessionByIdResponse =
	paths['/class_sessions/{id}/']['patch']['responses']['200']['content']['application/json']
