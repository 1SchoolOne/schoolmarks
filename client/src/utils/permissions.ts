import { SessionUserData } from '@api/auth'

type Action = 'read' | 'create' | 'update' | 'delete'
type Resource =
	| 'attendance_details'
	| 'attendance_records'
	| 'checkin_sessions'
	| 'class_sessions'
	| 'classes'
	| 'courses'
	| 'grades'

type Permission = `${Action}:${Resource}`

type Role = 'admin' | 'teacher' | 'student'

type PermissionsMap = Record<Role, Set<Permission> | 'all'>

export const PERMISSIONS_MAP: PermissionsMap = {
	admin: 'all',
	teacher: new Set<Permission>([
		// - - - - -
		'read:attendance_details',
		'read:attendance_records',
		'read:checkin_sessions',
		'read:class_sessions',
		'read:classes',
		'read:courses',
		'read:grades',
		// - - - - -
		'create:checkin_sessions',
		'create:class_sessions',
		'create:courses',
		'create:grades',
		// - - - - -
		'update:checkin_sessions',
		'update:class_sessions',
		'update:courses',
		'update:grades',
		// - - - - -
		'delete:checkin_sessions',
		'delete:class_sessions',
		'delete:courses',
		'delete:grades',
	]),
	student: new Set<Permission>([
		'read:attendance_details',
		'read:class_sessions',
		'read:courses',
		'read:grades',
		'create:attendance_records',
	]),
}

export function hasPermission(
	user: SessionUserData | undefined,
	action: Action,
	resource: Resource,
): boolean {
	const userPermissions = getPermissions(user)

	if (userPermissions === 'all') return true

	return userPermissions.has(`${action}:${resource}`)
}

export function getPermissions(user: SessionUserData | undefined): Set<Permission> | 'all' {
	if (user === undefined) throw Error('User is undefined')

	if (user.role === undefined) throw Error('User role is undefined')

	return PERMISSIONS_MAP[user.role as Role]
}
