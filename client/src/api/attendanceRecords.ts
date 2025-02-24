import axios from 'axios'

import { GetAttendanceRecordsResponse } from '@apiSchema/attendanceRecords'

import { AXIOS_DEFAULT_CONFIG } from './axios'

export const ATTENDANCE_RECORDS_API_URL = '/attendance_records/'

export async function getAttendanceRecords() {
	const { data } = await axios.get<GetAttendanceRecordsResponse>(
		ATTENDANCE_RECORDS_API_URL,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}
