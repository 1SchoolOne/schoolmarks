import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Card, Flex, Grid } from 'antd'
import { useLoaderData } from 'react-router-dom'

import { checkinSessionsApi } from '@api/axios'

import { registerAttendanceLoader } from '.'
import { AttendanceForm } from './AttendanceForm'

import './RegisterAttendance-styles.less'

export function RegisterAttendance() {
	const { classSession } = useLoaderData() as Awaited<ReturnType<typeof registerAttendanceLoader>>
	const screens = Grid.useBreakpoint()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const { mutate } = useMutation({
		mutationFn: (otp: string) => {
			if (!classSession.checkin_session) {
				throw new Error('Checkin session is not opened yet')
			}

			return checkinSessionsApi
				.checkinSessionsRegisterCreate(classSession.checkin_session.id, {
					totp_code: Number(otp),
				})
				.then(({ data }) => data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['classSession', classSession.id],
			})
			queryClient.refetchQueries({
				queryKey: ['attendanceRecords', { classSessionId: classSession.id }],
			})
		},
		onError: (err) => {
			notification.error({ message: 'Erreur', description: err.message })
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
