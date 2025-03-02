import { useQuery } from '@tanstack/react-query'
import { Flex, Typography } from 'antd'
import { ClockIcon, MapPinIcon } from 'lucide-react'
import { useContext } from 'react'
import { useLoaderData } from 'react-router-dom'

import { formatTimeFrame } from '@routes/register-attendance/RegisterAttendance-utils'

import { classSessionsApi } from '@api/axios'

import { Calendar } from '@components'

import { padNumber } from '@utils/padNumber'

import { calendarLoader } from '.'
import { getCourseColorVars, getWeekDates } from '../../components/Calendar/Calendar-utils'

export function CalendarPage() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof calendarLoader>>
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
			className="calendar-page"
			dataSource={classSessions}
			hourHeight={80}
			cellRender={(event) => {
				const { background, border } = getCourseColorVars(event.course!.code!)

				return (
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
				)
			}}
		/>
	)
}
