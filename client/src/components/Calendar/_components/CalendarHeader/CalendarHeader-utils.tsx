import dayjs from 'dayjs'
import { useCallback, useState } from 'react'

export function useCalendar() {
	const [currentDate, setCurrentDate] = useState(dayjs())

	const firstDayOfMonth = currentDate.clone().startOf('month')
	const lastDayOfMonth = currentDate.clone().endOf('month')

	const updateCurrentDate = useCallback((operation: 'next' | 'prev') => {
		setCurrentDate((currentDate) => {
			let newDate = currentDate.clone()
			const firstDayOfMonth = newDate.startOf('month')
			const currentWeekIndex = Math.floor(newDate.diff(firstDayOfMonth, 'day') / 7) + 1
			const totalWeeks = Math.ceil(newDate.endOf('month').date() / 7)

			if (operation === 'next') {
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
	}, [])

	const handleMonthSelectChange = useCallback((newMonth: number) => {
		setCurrentDate((current) => current.clone().month(newMonth))
	}, [])

	const handleYearSelectChange = useCallback((newYear: number) => {
		setCurrentDate((current) => current.clone().year(newYear))
	}, [])

	const handleToCurrentWeek = useCallback(() => {
		setCurrentDate(dayjs().startOf('week'))
	}, [])

	return {
		currentDate,
		firstDayOfMonth,
		lastDayOfMonth,
		updateCurrentDate,
		handleMonthSelectChange,
		handleYearSelectChange,
		handleToCurrentWeek,
	}
}
