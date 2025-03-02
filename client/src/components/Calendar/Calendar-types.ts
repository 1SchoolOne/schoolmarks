import { ReactNode } from 'react'

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type Hour = `0${Digit}` | `1${Digit}` | `2${0 | 1 | 2 | 3}`
type Minute = `${0 | 1 | 2 | 3 | 4 | 5}${Digit}`
type Second = Minute
export type TimeString = `${Hour}:${Minute}:${Second}`

export interface IWeekDates {
	weekNumber: number
	dates: {
		date: number
		month: number
		year: number
		dayOfWeek: number
		fullDate: string
	}[]
	month: number
	year: number
}

export interface MandatoryProperties {
	date: string
	startTime: TimeString | string
	endTime: TimeString | string
}

export interface CalendarProps<CellData extends MandatoryProperties> {
	className?: string
	dataSource: CellData[]
	cellRender: (cellData: CellData) => ReactNode
	hourHeight: number
	firstHour?: number
	lastHour?: number
	showHeader?: boolean
}
