import { MandatoryProperties } from '../../Calendar-types'

export function getCurrentTimePosition(
	startHour: number,
	endHour: number,
	hourHeight: number,
): number {
	const now = new Date()
	const currentHour = now.getHours()
	const currentMinutes = now.getMinutes()

	if (currentHour < startHour || currentHour >= endHour + 1) return -1

	// Convertit l'écart de temps en minutes entre l'heure actuelle et le début de la journée
	const elapsedMinutes = (currentHour - startHour) * 60 + currentMinutes

	const positionPixels = (elapsedMinutes / 60) * hourHeight

	return positionPixels
}

export function getEventsForDate<CellData extends MandatoryProperties>(
	events: CellData[],
	date: string,
) {
	if (!events) return []
	return events.filter((event) => event.date === date)
}
