export function capitalize(str: string): string {
	if (!str) return ''

	const trimedStr = str.trim()

	return trimedStr.charAt(0).toUpperCase() + trimedStr.slice(1).toLowerCase()
}
