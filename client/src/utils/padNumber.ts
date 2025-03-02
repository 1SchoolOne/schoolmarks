export function padNumber(number: number, pad: number): string {
	return String(number).padStart(pad, '0')
}
