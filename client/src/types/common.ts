import { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom'

export type Route = IndexRoute | NonIndexRoute

interface IndexRoute extends Omit<IndexRouteObject, 'handle'> {
	handle?: Handle
}

interface NonIndexRoute extends Omit<NonIndexRouteObject, 'handle' | 'children'> {
	handle?: Handle
	children?: Route[]
}

export interface Handle {
	crumb?: Crumb
}

export interface Crumb {
	label: string
	path: string
	disabled?: true
}

export type UserRole = 'admin' | 'teacher' | 'student'
