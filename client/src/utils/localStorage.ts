import { getLocalStorage } from '@1schoolone/ui'

interface LocalStorage {
	accessToken: string | null
	refreshToken: string | null
	sidebar: { isCollapsed: boolean }
}

export const localStorage = getLocalStorage<LocalStorage>().namespace('sch-marks')
