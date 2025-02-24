import { useMemo } from 'react'

import { CalendarProps, MandatoryProperties } from './Calendar-types'
import { getWeekDates } from './Calendar-utils'
import { CalendarGrid } from './_components/CalendarGrid/CalendarGrid'
import { CalendarHeader } from './_components/CalendarHeader/CalendarHeader'
import { useCalendar } from './_components/CalendarHeader/CalendarHeader-utils'

export function Calendar<CellData extends MandatoryProperties>(props: CalendarProps<CellData>) {
	const {
		showHeader = true,
		dataSource,
		cellRender,
		hourHeight,
		firstHour = 8,
		lastHour = 18,
	} = props

	const {
		currentDate,
		updateCurrentDate,
		handleMonthSelectChange,
		handleYearSelectChange,
		handleToCurrentWeek,
	} = useCalendar()

	const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

	return (
		<div className="calendar-container">
			{showHeader && (
				<CalendarHeader
					currentDate={currentDate}
					updateCurrentDate={updateCurrentDate}
					handleMonthSelectChange={handleMonthSelectChange}
					handleYearSelectChange={handleYearSelectChange}
					handleToCurrentWeek={handleToCurrentWeek}
				/>
			)}
			<CalendarGrid
				events={dataSource}
				cellRender={cellRender}
				hourHeight={hourHeight}
				weekDates={weekDates}
				startHour={firstHour}
				endHour={lastHour}
			/>
		</div>
	)
}
