import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { useLoaderData, useParams } from 'react-router-dom'

import { classSessionloader } from '@routes/attendance'

import { attendanceRecordsApi, classSessionsApi } from '@api/axios'

import { IdentityContext } from '@contexts'

import { hasPermission } from '@utils/permissions'

export function useData() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classSessionloader>>
	const { user } = useContext(IdentityContext)
	const params = useParams()
	const canReadCheckinSessions = hasPermission(user, 'read', 'checkin_sessions')

	const { data: classSession } = useQuery({
		queryKey: ['classSession', params.classSessionId],
		queryFn: () =>
			classSessionsApi.classSessionsRetrieve(params.classSessionId!).then(({ data }) => data),
		initialData,
		enabled: typeof params.classSessionId === 'string',
	})

	const { data: students, isPending } = useQuery({
		queryKey: ['checkinStudents', classSession.checkin_session?.id],
		queryFn: async () => {
			const { data } = await attendanceRecordsApi.attendanceRecordsList({
				params: { checkin_session_id: classSession.checkin_session?.id },
			})

			return data
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
