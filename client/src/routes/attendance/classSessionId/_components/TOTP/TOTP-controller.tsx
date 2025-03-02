import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useParams } from 'react-router-dom'

import { checkinSessionsApi, classSessionsApi } from '@api/axios'

import { classSessionloader } from '../../..'

export function useController() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classSessionloader>>
	const params = useParams()
	const [totpCountdown, setTotpCountdown] = useState(0)
	const [totpExpiresAt, setTotpExpiresAt] = useState(dayjs().add(15, 'seconds'))
	const previousTotp = useRef<string>()

	const { data: classSession } = useQuery({
		queryKey: ['classSession', params.classSessionId],
		queryFn: () =>
			classSessionsApi.classSessionsRetrieve(params.classSessionId!).then(({ data }) => data),
		initialData,
		enabled: typeof params.classSessionId === 'string',
	})

	const { data: totp } = useQuery({
		queryKey: ['checkin-session', 'totp', classSession?.checkin_session?.id],
		queryFn: async () => {
			const { data } = await checkinSessionsApi.checkinSessionsTotpRetrieve(
				classSession?.checkin_session?.id,
			)

			// TODO: fix api totp typing
			if (previousTotp.current !== data.totp) {
				setTotpExpiresAt(dayjs().add(15.5, 'seconds'))
			}

			previousTotp.current = data.totp

			return data.totp
		},
		refetchIntervalInBackground: true,
		refetchInterval: 1000,
		staleTime: 1000,
		enabled: !!classSession?.checkin_session,
	})

	useEffect(
		function updateCountdown() {
			const interval = setInterval(() => {
				const now = dayjs()
				const timeLeft = totpExpiresAt.diff(now, 'seconds')

				if (timeLeft === 0) {
					clearInterval(interval)
					setTotpCountdown(0)
					return
				}

				setTotpCountdown(totpExpiresAt.diff(now, 'seconds'))
			}, 16.67)

			return () => clearInterval(interval)
		},
		[totpCountdown, totpExpiresAt],
	)

	return { totp, totpCountdown }
}
