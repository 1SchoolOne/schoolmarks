import { Button, Select, Space, Typography } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import dayjs, { Dayjs } from 'dayjs'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { capitalize } from '@utils/capitalize'

import './CalendarHeader-styles.less'

interface CalendarHeaderProps {
	currentDate: Dayjs
	updateCurrentDate: (operation: 'next' | 'prev') => void
	handleMonthSelectChange: (newMonth: number) => void
	handleYearSelectChange: (newYear: number) => void
	handleToCurrentWeek: React.MouseEventHandler<HTMLElement>
}

const monthOptions: DefaultOptionType[] = Array.from({ length: 12 }, (_, i) => {
	const month = dayjs().locale('fr').month(i).format('MMMM')

	return {
		label: capitalize(month),
		value: i, // Index du mois
	}
})

const currentYear = dayjs().year()
const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i).map((year) => ({
	label: year,
	value: year,
}))

export function CalendarHeader(props: CalendarHeaderProps) {
	const totalWeeks = Math.ceil(props.currentDate.endOf('month').date() / 7)
	const selectedWeek = Math.min(Math.ceil(props.currentDate.date() / 7), totalWeeks)

	function handleNextWeek() {
		props.updateCurrentDate('next')
	}

	function handlePrevWeek() {
		props.updateCurrentDate('prev')
	}

	return (
		<Space className="calendar-filter-container">
			<div className="calendar-select-date-and-year">
				<Select
					className="month"
					options={monthOptions}
					value={props.currentDate.month()}
					onChange={props.handleMonthSelectChange}
				/>
				<Select
					className="year"
					options={yearOptions}
					value={props.currentDate.year()}
					onChange={props.handleYearSelectChange}
				/>
			</div>
			<div className="calendar-switch-week">
				<div className="switch-week-by-week">
					<Button type="primary" icon={<ArrowLeft size={16} />} onClick={handlePrevWeek} />
					<Typography.Text>Semaine {selectedWeek}</Typography.Text>
					<Button type="primary" icon={<ArrowRight size={16} />} onClick={handleNextWeek} />
				</div>
				<Button onClick={props.handleToCurrentWeek}>Cette semaine</Button>
			</div>
		</Space>
	)
}
