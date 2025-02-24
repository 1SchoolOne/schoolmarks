import { PropsWithChildren } from '@1schoolone/ui'

import { calculateEventPosition } from './CalendarCellWrapper-utils'

import './CalendarCellWrapper-styles.less'

interface CalendarCellWrapperProps {
	/** Première heure affichée dans le calendrier */
	firstHour: number
	/** Heure de début de la cellule */
	startTime: string
	/** Heure de fin de la cellule */
	endTime: string
	/** Hauteur des cellules */
	hourHeight: number
}

export function CalendarCellWrapper(props: PropsWithChildren<CalendarCellWrapperProps>) {
	const { firstHour, startTime, endTime, hourHeight, children } = props

	return (
		<div
			style={calculateEventPosition({
				firstHour,
				startTime,
				endTime,
				hourHeight,
			})}
			className="calendar-cell-wrapper"
		>
			{children}
		</div>
	)
}
