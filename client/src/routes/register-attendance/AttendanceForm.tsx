import { useQuery } from '@tanstack/react-query'
import { Alert, AlertProps, Button, Flex, Form, Input, Typography } from 'antd'
import axios from 'axios'
import classnames from 'classnames'
import dayjs from 'dayjs'
import {
	ArrowLeftIcon,
	CalendarIcon,
	CheckIcon,
	CircleOffIcon,
	ClockIcon,
	MapPinIcon,
	MoveRightIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'

import { getAttendanceRecords } from '@api/attendanceRecords'
import { AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { CLASS_SESSIONS_API_URL } from '@api/classSessions'
import { ClassSessionDetail } from '@apiSchema/classSessions'

import { registerAttendanceLoader } from '.'

function formatTimeFrame(startTime: string | undefined, endTime: string | undefined) {
	if (!startTime && !endTime) {
		return (
			<Flex align="center" gap={6}>
				<span>--:--</span>
				<MoveRightIcon size={16} />
				<span>--:--</span>
			</Flex>
		)
	}

	const formattedStartTime = `${startTime!.split(':')[0]}:${startTime!.split(':')[1]}`
	const formattedEndTime = `${endTime!.split(':')[0]}:${endTime!.split(':')[1]}`

	return (
		<Flex align="center" gap={6}>
			<span>{formattedStartTime}</span>
			<MoveRightIcon size={16} color="var(--ant-color-text-tertiary)" />
			<span>{formattedEndTime}</span>
		</Flex>
	)
}

interface AttendanceFormValues {
	otp: string
}

function getPresenceStatusAlertProps(presence: string): Pick<AlertProps, 'type' | 'message'> {
	switch (presence) {
		case 'present':
			return { type: 'success', message: 'Vous avez été noté présent(e).' }
		case 'late':
			return { type: 'warning', message: 'Vous avez été noté en retard.' }
		case 'absent':
			return { type: 'error', message: 'Vous avez été noté absent.' }
		default:
			return { type: 'info', message: "Votre présence n'a pas été enregistrée." }
	}
}

export function AttendanceForm({ onSubmit }: { onSubmit: (values: AttendanceFormValues) => void }) {
	const { classSession: initialClassSession, attendance: initialAttendance } =
		useLoaderData() as Awaited<ReturnType<typeof registerAttendanceLoader>>
	const [isOTPValid, setIsOTPValid] = useState(false)
	const [formInstance] = Form.useForm()
	const params = useParams()
	const navigate = useNavigate()

	const { data: classSession } = useQuery({
		queryKey: ['classSession', { checkinSessionId: params.checkinSessionId }],
		queryFn: async () => {
			const { data } = await axios.get<ClassSessionDetail>(
				`${CLASS_SESSIONS_API_URL}?checkin_session_id=${params.checkinSessionId}`,
				AXIOS_DEFAULT_CONFIG,
			)
			return data
		},
		initialData: initialClassSession,
		enabled: !!params.checkinSessionId,
	})

	const { data: attendance } = useQuery({
		queryKey: ['attendanceRecords', params.checkinSessionId],
		queryFn: async () => {
			const records = await getAttendanceRecords()

			return records.filter((a) => a.checkin_session === params.checkinSessionId)[0] ?? null
		},
		initialData: initialAttendance,
	})

	const sessionDate = dayjs(classSession?.date)
	const isSessionClosed = classSession.status === 'closed'

	return (
		<Flex
			className={classnames('attendance-form', { 'attendance-form--closed': isSessionClosed })}
			vertical
			gap={12}
		>
			<Typography.Title level={3}>
				{classSession?.course?.name} ({classSession?.course?.code})
			</Typography.Title>

			{attendance && (
				<Alert
					{...getPresenceStatusAlertProps(attendance.status)}
					icon={<CheckIcon size={14} />}
					showIcon
					banner
				/>
			)}

			{isSessionClosed && (
				<Alert
					type="error"
					icon={<CircleOffIcon size={14} />}
					message="L'appel est fermé"
					showIcon
					banner
				/>
			)}

			<Flex vertical gap={6}>
				<Flex align="center" gap={8}>
					<CalendarIcon size={16} />
					<span>
						{sessionDate.format('dddd DD MMMM').charAt(0).toUpperCase() +
							sessionDate.format('dddd DD MMMM').slice(1)}
					</span>
				</Flex>
				<Flex align="center" gap={8}>
					<ClockIcon size={16} />
					<span>{formatTimeFrame(classSession?.start_time, classSession?.end_time)}</span>
				</Flex>
				<Flex align="center" gap={8}>
					<MapPinIcon size={16} />
					<span>Salle {classSession?.room}</span>
				</Flex>
			</Flex>

			{!attendance ? (
				<Form<AttendanceFormValues>
					form={formInstance}
					layout="vertical"
					initialValues={{ otp: '' }}
					onFinish={onSubmit}
				>
					<Form.Item label="Code :" name="otp">
						<Input.OTP
							type="number"
							size="large"
							onInput={(values) => setIsOTPValid(values.length === 6)}
						/>
					</Form.Item>
					<Button htmlType="submit" type="primary" disabled={!isOTPValid} block>
						Valider
					</Button>
				</Form>
			) : (
				<Button type="link" icon={<ArrowLeftIcon size={16} />} onClick={() => navigate('/app')}>
					Revenir sur SchoolMarks
				</Button>
			)}
		</Flex>
	)
}
