import { useQuery } from '@tanstack/react-query'
import { Space, Table, Tag, Typography } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { CircleCheckBigIcon, CircleOffIcon, ClockAlertIcon } from 'lucide-react'

import { AXIOS_DEFAULT_CONFIG } from '@api/axios'

import { Student } from './StudentList-data'

import './StudentList-styles.less'

interface StudentListProps {
	checkinSessionId: string | undefined
	isSessionClosed: boolean
}

type Attendance = {
	fullname: string
	arrivedAt: string
	presence: string
}

function renderTitle(attendances: readonly Attendance[]) {
	const [presentCount, lateCount, absentCount] = [
		attendances.filter((a) => a.presence === 'present').length,
		attendances.filter((a) => a.presence === 'late').length,
		attendances.filter((a) => a.presence === 'absent').length,
	]

	return (
		<Space>
			<Typography.Text type="success">{presentCount} élèves présent</Typography.Text>/
			<Typography.Text type="warning">{lateCount} élèves en retard</Typography.Text>/
			<Typography.Text type="danger">{absentCount} élèves absent</Typography.Text>
		</Space>
	)
}

export function StudentList(props: StudentListProps) {
	const { checkinSessionId, isSessionClosed } = props

	const { data: studentAttendances, isPending } = useQuery({
		queryKey: ['students', checkinSessionId],
		queryFn: async () => {
			const { data } = await axios.get<Student[]>(
				`/attendance_records/?checkin_session_id=${checkinSessionId}`,
				AXIOS_DEFAULT_CONFIG,
			)

			const finalData: {
				fullname: string
				arrivedAt: string
				presence: string
			}[] = data.map((attendance) => ({
				fullname: `${attendance.student.first_name} ${attendance.student.last_name}`,
				arrivedAt: dayjs(attendance.checked_in_at).format('HH:mm'),
				presence: attendance.status,
			}))

			return finalData
		},
		refetchInterval: !isSessionClosed ? 2000 : undefined,
		enabled: checkinSessionId !== undefined,
		initialData: [],
	})

	return (
		<Table
			className="student-checkin-list"
			size="small"
			tableLayout="fixed"
			dataSource={studentAttendances}
			loading={isPending}
			bordered
			scroll={{
				y: 450 - 39 * 2,
			}}
			rowKey={({ fullname, presence }) => `${fullname}-${presence}`}
			title={studentAttendances?.length > 0 ? renderTitle : undefined}
			columns={[
				{
					dataIndex: 'fullname',
					title: 'Nom',
					render: (value: string) => (value.trim() === '' ? '-' : value),
				},
				{
					dataIndex: 'arrivedAt',
					title: 'Arrivée',
					width: 70,
				},
				{
					dataIndex: 'presence',
					title: 'Statut',
					width: 100,
					render: (value: string) => {
						switch (value) {
							case 'present':
								return (
									<Tag color="var(--ant-color-success)" icon={<CircleCheckBigIcon size={10} />}>
										Présent
									</Tag>
								)
							case 'late':
								return (
									<Tag color="var(--ant-color-warning)" icon={<ClockAlertIcon size={10} />}>
										En retard
									</Tag>
								)
							case 'absent':
								return (
									<Tag color="var(--ant-color-error)" icon={<CircleOffIcon size={10} />}>
										Absent
									</Tag>
								)
						}
					},
				},
			]}
			pagination={false}
		/>
	)
}
