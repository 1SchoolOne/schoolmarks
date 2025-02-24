import { useQuery } from '@tanstack/react-query'
import { Typography } from 'antd'
import { Link, useLoaderData } from 'react-router-dom'

import { getClassSessions } from '@api/classSessions'

import { LoadingScreen } from '@components'

import { attendanceLoader } from '.'
import { Calendar } from '../../components/Calendar/Calendar'
import { getCourseColorVars } from '../../components/Calendar/Calendar-utils'

import './Attendance-styles.less'

export function Attendance() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof attendanceLoader>>

	const { data: classSessions, isPending } = useQuery({
		queryKey: ['classSessions'],
		queryFn: () => getClassSessions(),
		select: (data) =>
			data.map(({ start_time, end_time, ...restSession }) => ({
				...restSession,
				startTime: start_time,
				endTime: end_time,
			})),
		initialData,
	})

	if (isPending) {
		return <LoadingScreen />
	}

	return (
		<Calendar
			dataSource={classSessions}
			hourHeight={80}
			cellRender={(event) => {
				const { background, border } = getCourseColorVars(event.course!.code!)

				return (
					<Link
						to={`/app/attendance/class-session/${event.id}`}
						className="calendar-cell-content"
						style={{
							backgroundColor: `var(${background})`,
							borderLeft: `3px solid var(${border})`,
						}}
					>
						<Typography.Text>
							{event.course!.name} ({event.course!.code})
						</Typography.Text>
						<Typography.Text>
							{event.startTime} - {event.endTime}
						</Typography.Text>
					</Link>
				)
			}}
		/>
	)
}
