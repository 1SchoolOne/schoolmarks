import { getLocalStorage } from '@1schoolone/ui'

// TODO: update local storage keys and group them here
interface LocalStorage {
	accessToken: string | null
	refreshToken: string | null
	sidebar: { isCollapsed: boolean }
}

export const localStorage = getLocalStorage<LocalStorage>().namespace('sch-marks')
