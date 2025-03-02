import dayjs from 'dayjs'

import { IWeekDates } from './Calendar-types'

const COLORS = [
	'lime',
	'gold',
	'geekblue',
	'volcano',
	'yellow',
	'orange',
	'red',
	'pink',
	'magenta',
	'green',
	'cyan',
	'purple',
	'blue',
] as const

interface CourseColorVars {
	/** Lighter shade */
	background: string
	/** Darker shade */
	border: string
	/** Lighter shade on hover */
	backgroundHover: string
	/** Darker shade on hover */
	borderHover: string
}

/** Generates a deterministic hash from a string */
function hashString(str: string): number {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32-bit integer
	}
	return Math.abs(hash)
}

/**
 * Generates CSS variable names for a course's colors Returns both light (shade
 * 3) and dark (shade 5) versions
 */
export function getCourseColorVars(courseCode: string): CourseColorVars {
	const hash = hashString(courseCode)
	const colorIndex = hash % COLORS.length
	const color = COLORS[colorIndex]

	return {
		background: `--ant-${color}-3`,
		border: `--ant-${color}-5`,
		backgroundHover: `--ant-${color}-2`,
		borderHover: `--ant-${color}-4`,
	}
}

export function getWeekDates(currentDate: dayjs.Dayjs): IWeekDates {
	const firstDayOfMonth = currentDate.startOf('month')
	const weekNumber = Math.ceil((currentDate.date() + firstDayOfMonth.day()) / 7)

	let startOfWeek = currentDate.startOf('week')

	if (weekNumber === 1) {
		if (startOfWeek.month() !== currentDate.month()) {
			startOfWeek = firstDayOfMonth.startOf('week')
		}
	} else {
		startOfWeek = firstDayOfMonth.add((weekNumber - 1) * 7, 'day').startOf('week')
	}

	const dates = Array.from({ length: 5 }, (_, index) => {
		const date = startOfWeek.add(index, 'day')
		return {
			date: date.date(),
			month: date.month(),
			year: date.year(),
			dayOfWeek: index,
			fullDate: date.format('YYYY-MM-DD'),
		}
	})

	return {
		weekNumber,
		dates,
		month: currentDate.month(),
		year: currentDate.year(),
	}
}
