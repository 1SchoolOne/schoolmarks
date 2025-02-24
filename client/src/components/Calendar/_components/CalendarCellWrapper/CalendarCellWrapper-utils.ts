interface CalculateEventPositionParams {
	startTime: string
	endTime: string
	/** Première heure affichée dans le calendrier. */
	firstHour: number
	hourHeight: number
}

export function calculateEventPosition(params: CalculateEventPositionParams) {
	const { startTime, endTime, firstHour, hourHeight } = params

	const [startHours = 0, startMinutes = 0] = startTime.split(':').map(Number)
	const [endHours = 0, endMinutes = 0] = endTime.split(':').map(Number)

	// Convertit les heures en minutes et compte le temps écoulé depuis minuit.
	// Puis fais la différence entre l'heure de début du cours et l'heure de début du calendrier
	const eventStart = startHours * 60 + startMinutes - firstHour * 60
	const eventEnd = endHours * 60 + endMinutes - firstHour * 60
	const eventDuration = eventEnd - eventStart

	const topPosition = (eventStart / 60) * hourHeight
	const height = (eventDuration / 60) * hourHeight

	return {
		top: `${topPosition}px`,
		height: `${height}px`,
	}
}
