import { components, paths } from '../api-schema'

/* - - - Model - - - */
export type AttendanceRecord = components['schemas']['AttendanceRecord']

/* - - - GET - - - */

export type GetAttendanceRecordsResponse =
	paths['/attendance_records/']['get']['responses']['200']['content']['application/json']
export type GetAttendanceRecordByIdResponse =
	paths['/attendance_records/{id}/']['get']['responses']['200']['content']['application/json']

/* - - - POST - - - */

export type PostAttendanceRecordBody = Omit<AttendanceRecord, 'id'>
export type PostAttendanceRecordResponse =
	paths['/attendance_records/']['post']['responses']['201']['content']['application/json']

/* - - - PUT - - - */

export type PutAttendanceRecordByIdBody = Omit<AttendanceRecord, 'id'>
export type PutAttendanceRecordByIdResponse =
	paths['/attendance_records/{id}/']['put']['responses']['200']['content']['application/json']

/* - - - PATCH - - - */

export type PatchAttendanceRecordByIdBody = Partial<Omit<AttendanceRecord, 'id'>>
export type PatchAttendanceRecordByIdResponse =
	paths['/attendance_records/{id}/']['patch']['responses']['200']['content']['application/json']
