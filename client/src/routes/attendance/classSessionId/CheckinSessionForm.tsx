import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Col, Form, Row, Space, Statistic, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { useContext } from 'react'
import { useLoaderData, useParams } from 'react-router-dom'

import { checkinSessionsApi, classSessionsApi } from '@api/axios'

import { IdentityContext } from '@contexts'

import { hasPermission } from '@utils/permissions'

import { classSessionloader } from '..'

interface CheckinSessionFormValues {
	startedAt: string
	closedAt: string
}

export function CheckinSessionForm() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classSessionloader>>
	const { user } = useContext(IdentityContext)
	const canCreateCheckinSessions = hasPermission(user, 'create', 'checkin_sessions')
	const queryClient = useQueryClient()
	const params = useParams()

	const { data: classSession } = useQuery({
		queryKey: ['classSession', params.classSessionId],
		queryFn: () =>
			classSessionsApi.classSessionsRetrieve(params.classSessionId!).then(({ data }) => data),
		initialData,
		enabled: !!params.classSessionId,
	})

	const { mutate: submitCheckinSession } = useMutation({
		mutationFn: (values: CheckinSessionFormValues) => {
			if (!canCreateCheckinSessions) {
				throw Error("Impossible de lancer l'appel")
			}

			return checkinSessionsApi
				.checkinSessionsCreate({
					class_session: String(classSession.id),
					started_at: values.startedAt,
					closed_at: values.closedAt,
					created_by: user!.id,
					status: 'active',
				})
				.then(({ data }) => data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['classSession', params.classSessionId] })
			queryClient.invalidateQueries({ queryKey: ['classSessions'] })
		},
		onError: console.error,
	})

	if (classSession.checkin_session) {
		return (
			<Space size="large">
				<Statistic
					title="En retard à"
					value={dayjs(classSession.checkin_session?.started_at).format('HH:mm')}
				/>
				<Statistic
					title="Ferme à"
					value={dayjs(classSession.checkin_session?.closed_at).format('HH:mm')}
				/>
			</Space>
		)
	}

	return (
		<Form<CheckinSessionFormValues>
			layout="vertical"
			onFinish={submitCheckinSession}
			preserve={false}
			validateMessages={{
				required: 'Champ requis',
			}}
		>
			<Row gutter={[8, 8]}>
				<Col span={12}>
					<Form.Item label="En retard à partir de :" name="startedAt" rules={[{ required: true }]}>
						<TimePicker placeholder="HH:mm" format="HH:mm" minuteStep={5} />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Absent à partir de :" name="closedAt" rules={[{ required: true }]}>
						<TimePicker placeholder="HH:mm" format="HH:mm" minuteStep={5} />
					</Form.Item>
				</Col>
				<Col span={24}>
					<Button type="primary" htmlType="submit" block>
						Lancer l'appel
					</Button>
				</Col>
			</Row>
		</Form>
	)
}
