import { Button, Select, Space, Typography } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useContext } from 'react'

import { capitalize } from '@utils/capitalize'

import { CalendarContext } from '../../CalendarContext'

import './CalendarHeader-styles.less'

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

export function CalendarHeader() {
	const {
		currentDate,
		updateCurrentDate,
		handleMonthSelectChange,
		handleYearSelectChange,
		handleToCurrentWeek,
	} = useContext(CalendarContext)

	const totalWeeks = Math.ceil(currentDate.endOf('month').date() / 7)
	const selectedWeek = Math.min(Math.ceil(currentDate.date() / 7), totalWeeks)

	return (
		<Space className="calendar-filter-container">
			<div className="calendar-select-date-and-year">
				<Select
					className="month"
					options={monthOptions}
					value={currentDate.month()}
					onChange={handleMonthSelectChange}
				/>
				<Select
					className="year"
					options={yearOptions}
					value={currentDate.year()}
					onChange={handleYearSelectChange}
				/>
			</div>
			<div className="calendar-switch-week">
				<div className="switch-week-by-week">
					<Button
						type="primary"
						icon={<ArrowLeft size={16} />}
						onClick={() => updateCurrentDate('prevWeek')}
					/>
					<Typography.Text>Semaine {selectedWeek}</Typography.Text>
					<Button
						type="primary"
						icon={<ArrowRight size={16} />}
						onClick={() => updateCurrentDate('nextWeek')}
					/>
				</div>
				<Button onClick={handleToCurrentWeek}>Cette semaine</Button>
			</div>
		</Space>
	)
}
