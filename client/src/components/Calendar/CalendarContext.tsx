import { PropsWithChildren } from '@1schoolone/ui'
import dayjs, { Dayjs } from 'dayjs'
import { createContext, useMemo, useState } from 'react'

interface CalendarContextState {
	currentDate: Dayjs
	firstDayOfMonth: Dayjs
	lastDayOfMonth: Dayjs
	updateCurrentDate: (operation: 'nextWeek' | 'prevWeek') => void
	handleMonthSelectChange: (newMonth: number) => void
	handleYearSelectChange: (newYear: number) => void
	handleToCurrentWeek: () => void
}

export const CalendarContext = createContext({} as CalendarContextState)

export function CalendarProvider({ children }: PropsWithChildren) {
	const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())

	const firstDayOfMonth = currentDate.clone().startOf('month')
	const lastDayOfMonth = currentDate.clone().endOf('month')

	const updateCurrentDate = (operation: 'nextWeek' | 'prevWeek') =>
		setCurrentDate((prevState) => {
			let newDate = prevState.clone()

			const firstDayOfMonth = newDate.startOf('month')
			const currentWeekIndex = Math.floor(newDate.diff(firstDayOfMonth, 'day') / 7) + 1
			const totalWeeks = Math.ceil(newDate.endOf('month').date() / 7)

			if (operation === 'nextWeek') {
				if (currentWeekIndex >= totalWeeks) {
					newDate = newDate.add(1, 'month').startOf('month')
				} else {
					newDate = newDate.add(7, 'day')
				}
			} else {
				if (currentWeekIndex === 1) {
					const previousMonth = newDate.subtract(1, 'month')
					const lastWeekOfPreviousMonth = Math.ceil(previousMonth.endOf('month').date() / 7)
					newDate = previousMonth.startOf('month').add((lastWeekOfPreviousMonth - 1) * 7, 'day')
				} else {
					newDate = newDate.subtract(7, 'day')
				}
			}

			return newDate
		})

	const handleMonthSelectChange = (newMonth: number) =>
		setCurrentDate((current) => current.clone().month(newMonth))

	const handleYearSelectChange = (newYear: number) =>
		setCurrentDate((current) => current.clone().year(newYear))

	const handleToCurrentWeek = () => setCurrentDate(dayjs().startOf('week'))

	const value: CalendarContextState = useMemo(
		() => ({
			currentDate,
			firstDayOfMonth,
			lastDayOfMonth,
			updateCurrentDate,
			handleMonthSelectChange,
			handleYearSelectChange,
			handleToCurrentWeek,
		}),
		[currentDate, firstDayOfMonth, lastDayOfMonth],
	)

	return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}
