import { PropsWithChildren } from '@1schoolone/ui'
import classnames from 'classnames'
import React, { useContext, useMemo } from 'react'

import { CalendarProps, MandatoryProperties } from './Calendar-types'
import { getWeekDates } from './Calendar-utils'
import { CalendarContext, CalendarProvider } from './CalendarContext'
import { CalendarGrid } from './_components/CalendarGrid/CalendarGrid'
import { CalendarHeader } from './_components/CalendarHeader/CalendarHeader'

import './Calendar-styles.less'

function Calendar<CellData extends MandatoryProperties>(props: CalendarProps<CellData>) {
	const {
		className,
		showHeader = true,
		dataSource,
		cellRender,
		hourHeight,
		firstHour = 8,
		lastHour = 18,
	} = props

	const { currentDate } = useContext(CalendarContext)

	const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

	return (
		<div className={classnames('calendar-container', className)}>
			{showHeader && <CalendarHeader />}
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

function CalendarCellContent(
	props: PropsWithChildren<{ className?: string; style?: React.CSSProperties }>,
) {
	const { className, style, children } = props

	return (
		<div className={classnames('calendar-cell-content', className)} style={style}>
			{children}
		</div>
	)
}

Calendar.Cell = CalendarCellContent
Calendar.Context = CalendarContext
Calendar.Provider = CalendarProvider

export { Calendar }
