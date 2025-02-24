import dayjs from 'dayjs'

const dummyDate = dayjs('2025-01-01T00:00:00.000Z')

export const provisioning = {
	present: {
		students: [
			{
				student: {
					username: 'mock.user',
					first_name: 'Mock',
					last_name: 'User',
				},
				checkin_session: '1',
				checked_in_at: dummyDate.add(2, 'minutes').toISOString(),
				status: 'present',
			},
		],
		isCheckInSessionOpened: true,
		canReadCheckinSessions: true,
	},
	late: {
		students: [
			{
				student: {
					username: 'mock.user',
					first_name: 'Mock',
					last_name: 'User',
				},
				checkin_session: '1',
				checked_in_at: dummyDate.add(10, 'minutes').toISOString(),
				status: 'late',
			},
		],
		isCheckInSessionOpened: true,
		canReadCheckinSessions: true,
	},
	absent: {
		students: [
			{
				student: {
					username: 'mock.user',
					first_name: 'Mock',
					last_name: 'User',
				},
				checkin_session: '1',
				checked_in_at: dummyDate.add(15, 'minutes').toISOString(),
				status: 'absent',
			},
		],
		isCheckInSessionOpened: true,
		canReadCheckinSessions: true,
	},
	noReadPerms: {
		students: [
			{
				student: {
					username: 'mock.user',
					first_name: 'Mock',
					last_name: 'User',
				},
				checkin_session: '1',
				checked_in_at: dummyDate.add(15, 'minutes').toISOString(),
				status: 'absent',
			},
		],
		isCheckInSessionOpened: true,
		canReadCheckinSessions: false,
	},
	sessionNotOpened: {
		students: [
			{
				student: {
					username: 'mock.user',
					first_name: 'Mock',
					last_name: 'User',
				},
				checkin_session: '1',
				checked_in_at: dummyDate.add(15, 'minutes').toISOString(),
				status: 'absent',
			},
		],
		isCheckInSessionOpened: false,
		canReadCheckinSessions: true,
	},
}
