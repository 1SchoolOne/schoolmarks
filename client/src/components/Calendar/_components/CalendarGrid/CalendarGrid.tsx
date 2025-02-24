import { Col, Row, Typography } from 'antd'
import { ReactNode, useLayoutEffect, useState } from 'react'

import { IWeekDates, MandatoryProperties } from '../../Calendar-types'
import { CalendarCellWrapper } from '../CalendarCellWrapper/CalendarCellWrapper'
import { getCurrentTimePosition, getEventsForDate } from './CalendarGrid-utils'

import './CalendarGrid-styles.less'

export interface ICalendarGridProps<CellData extends MandatoryProperties> {
	events: CellData[]
	startHour: number
	endHour: number
	weekDates: IWeekDates
	hourHeight: number
	cellRender: (cellData: CellData) => ReactNode
}

export function CalendarGrid<CellData extends MandatoryProperties>(
	params: ICalendarGridProps<CellData>,
) {
	const { events, startHour, endHour, weekDates, hourHeight, cellRender } = params
	const [currentTimePosition, setCurrentTimePosition] = useState(0)

	useLayoutEffect(() => {
		function updateCurrentTime() {
			setCurrentTimePosition(getCurrentTimePosition(startHour, endHour, hourHeight))
		}

		updateCurrentTime()
		const interval = setInterval(updateCurrentTime, 60000)

		return () => clearInterval(interval)
	}, [startHour, endHour, hourHeight])

	const hourLabels = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

	const days = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.']

	return (
		<div className="calendar-grid">
			<Row justify="end" className="calendar-header">
				{days.map((day, index) => (
					<Col key={day} span={4} className="day-column-header">
						<div className="dates">
							<Typography.Text>{day}</Typography.Text>
							<Typography.Text>{weekDates.dates[index]?.date}</Typography.Text>
						</div>
					</Col>
				))}
			</Row>
			<Row className="calendar-body">
				<div
					className="current-time-line"
					style={{ top: `${currentTimePosition}px`, opacity: currentTimePosition >= 0 ? 1 : 0 }}
				/>
				<Col span={4} className="time-column">
					{hourLabels.map((hour) => (
						<div key={hour} style={{ height: `${hourHeight}px` }} className="hour-label">
							{`${hour}h`}
						</div>
					))}
				</Col>
				{weekDates.dates.map((dateInfo) => (
					<Col key={dateInfo.fullDate} span={4} className="day-column">
						<div className="day-grid">
							{hourLabels.map((hour) => (
								<div
									key={`${dateInfo.fullDate}-${hour}`}
									style={{ height: `${hourHeight}px` }}
									className="hour-slot"
								></div>
							))}
							{getEventsForDate(events, dateInfo.fullDate).map((event) => (
								<CalendarCellWrapper
									key={JSON.stringify(event)}
									firstHour={startHour}
									startTime={event.startTime}
									endTime={event.endTime}
									hourHeight={hourHeight}
								>
									{cellRender(event)}
								</CalendarCellWrapper>
							))}
						</div>
					</Col>
				))}
			</Row>
		</div>
	)
}
