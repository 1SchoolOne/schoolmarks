import { AxiosRequestConfig } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_HOST

export const AXIOS_DEFAULT_CONFIG: AxiosRequestConfig = {
	baseURL: API_BASE_URL,
	withCredentials: true,
}
