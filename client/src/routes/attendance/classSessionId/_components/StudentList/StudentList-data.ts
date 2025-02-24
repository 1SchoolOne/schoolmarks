import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useContext } from 'react'
import { useLoaderData, useParams } from 'react-router-dom'

import { classSessionloader } from '@routes/attendance'

import { AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getClassSessionQueryOptions } from '@api/classSessions'
import { AttendanceRecord } from '@apiSchema/attendanceRecords'
import { GetUserByIdResponse } from '@apiSchema/users'

import { IdentityContext } from '@contexts'

import { hasPermission } from '@utils/permissions'

export type Student = Omit<AttendanceRecord, 'student_detail' | 'student'> & {
	student: GetUserByIdResponse
}

export function useData() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classSessionloader>>
	const { user } = useContext(IdentityContext)
	const params = useParams()
	const canReadCheckinSessions = hasPermission(user, 'read', 'checkin_sessions')

	const classSessionQueryOptions = getClassSessionQueryOptions(params.classSessionId)

	const { data: classSession } = useQuery({
		...classSessionQueryOptions,
		initialData,
		enabled: typeof params.classSessionId === 'string',
	})

	const { data: students, isPending } = useQuery({
		queryKey: ['checkinStudents', classSession.checkin_session?.id],
		queryFn: async () => {
			const { data } = await axios.get<Student[]>(
				`/attendance_records/?checkin_session_id=${classSession.checkin_session?.id}`,
				AXIOS_DEFAULT_CONFIG,
			)

			return data
		},
		select: (data) => {
			if (Array.isArray(data)) {
				return data
			}

			return [data]
		},
		refetchInterval: 2_000,
		initialData: [],
		enabled: !!classSession.checkin_session,
	})

	return {
		classSession,
		students,
		isStudentsPending: isPending,
		canReadCheckinSessions,
	}
}
