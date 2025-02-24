import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type AttendanceDetail = components['schemas']['AttendanceDetail']

/* - - - GET - - - */

export type GetAttendanceDetailsResponse =
	paths['/attendance_details/']['get']['responses']['200']['content']['application/json']
export type GetAttendanceDetailByIdResponse =
	paths['/attendance_details/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostAttendanceDetailBody = Omit<AttendanceDetail, 'id'>
export type PostAttendanceDetailResponse =
	paths['/attendance_details/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutAttendanceDetailByIdBody = Omit<AttendanceDetail, 'id'>
export type PutAttendanceDetailByIdResponse =
	paths['/attendance_details/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchAttendanceDetailByIdBody = Partial<Omit<AttendanceDetail, 'id'>>
export type PatchAttendanceDetailByIdResponse =
	paths['/attendance_details/{id}/']['patch']['responses']['200']['content']['application/json']
