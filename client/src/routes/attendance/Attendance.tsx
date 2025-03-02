import { useQuery } from '@tanstack/react-query'
import { Flex, Typography } from 'antd'
import { ClockIcon, MapPinIcon } from 'lucide-react'
import { useContext } from 'react'
import { Link, useLoaderData } from 'react-router-dom'

import { formatTimeFrame } from '@routes/register-attendance/RegisterAttendance-utils'

import { classSessionsApi } from '@api/axios'

import { padNumber } from '@utils/padNumber'

import { attendanceLoader } from '.'
import { Calendar } from '../../components/Calendar/Calendar'
import { getCourseColorVars, getWeekDates } from '../../components/Calendar/Calendar-utils'

export function Attendance() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof attendanceLoader>>
	const { currentDate } = useContext(Calendar.Context)
	const weekDates = getWeekDates(currentDate)
	const dateInterval = {
		start: `${weekDates.dates[0]?.year}-${padNumber(weekDates.dates[0]!.month + 1, 2)}-${weekDates.dates[0]?.date}`,
		end: `${weekDates.dates[4]?.year}-${padNumber(weekDates.dates[4]!.month + 1, 2)}-${weekDates.dates[4]?.date}`,
	}

	const { data: classSessions } = useQuery({
		queryKey: ['classSessions', dateInterval],
		queryFn: () =>
			classSessionsApi
				.classSessionsList(undefined, undefined, dateInterval.end, dateInterval.start)
				.then(({ data }) => data),
		select: (data) =>
			data.map(({ start_time, end_time, ...restSession }) => ({
				...restSession,
				startTime: start_time,
				endTime: end_time,
			})),
		initialData,
	})

	return (
		<Calendar
			className="attendance-calendar"
			dataSource={classSessions}
			hourHeight={80}
			cellRender={(event) => {
				const { background, border } = getCourseColorVars(event.course!.code!)

				return (
					<Link
						to={`/app/attendance/class-session/${event.id}`}
						style={{ color: 'var(--ant-color-text)' }}
					>
						<Calendar.Cell
							style={{
								backgroundColor: `var(${background})`,
							}}
						>
							<div
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									height: '100%',
									width: '3px',
									backgroundColor: `var(${border})`,
								}}
							/>
							<Typography.Text strong>
								{event.course!.name} ({event.course!.code})
							</Typography.Text>
							<Flex align="center" gap={6}>
								<ClockIcon size="0.8rem" />
								<span style={{ fontSize: '0.8rem' }}>
									{formatTimeFrame(event.startTime, event.endTime)}
								</span>
							</Flex>
							<Flex align="center" gap={6}>
								<MapPinIcon size="0.8rem" />
								<span style={{ fontSize: '0.8rem' }}>Salle {event.room}</span>
							</Flex>
						</Calendar.Cell>
					</Link>
				)
			}}
		/>
	)
}
