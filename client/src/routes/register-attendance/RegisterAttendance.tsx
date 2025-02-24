import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Flex, Grid } from 'antd'
import axios from 'axios'
import { useParams } from 'react-router-dom'

import { AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { PostAttendanceRecordResponse } from '@apiSchema/attendanceRecords'

import { isUUID } from '@utils/isUUID'

import { AttendanceForm } from './AttendanceForm'

import './RegisterAttendance-styles.less'

export function RegisterAttendance() {
	const params = useParams()
	const isValidSessionId = isUUID(String(params.checkinSessionId))
	const screens = Grid.useBreakpoint()
	const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationFn: (otp: string) => {
			if (!isValidSessionId) {
				throw Error("La session d'appel n'est pas valide")
			}

			return axios.post<PostAttendanceRecordResponse>(
				`/attendance_records/`,
				{
					checkin_session_id: params.checkinSessionId,
					totp_code: otp,
				},
				AXIOS_DEFAULT_CONFIG,
			)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['classSession', { checkinSessionId: params.checkinSessionId }],
			})
			queryClient.refetchQueries({ queryKey: ['attendanceRecords', params.checkinSessionId] })
		},
	})

	if (!screens.lg) {
		return (
			<Flex className="register-attendance" justify="center" align="center">
				<AttendanceForm onSubmit={({ otp }) => mutate(otp)} />
			</Flex>
		)
	}

	return (
		<Flex className="register-attendance" justify="center" align="center">
			<Card>
				<AttendanceForm onSubmit={({ otp }) => mutate(otp)} />
			</Card>
		</Flex>
	)
}
