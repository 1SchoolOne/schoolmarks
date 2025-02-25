import { useQuery } from '@tanstack/react-query'
import { Col, Divider, Modal, QRCode, Row, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useContext, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'

import { getClassSession } from '@api/classSessions'

import { IdentityContext } from '@contexts'

import { hasPermission } from '@utils/permissions'

import { classSessionloader } from '..'
import { Attendance } from '../Attendance'
import { CheckinSessionForm } from './CheckinSessionForm'
import { StudentList } from './_components/StudentList/StudentList'
import { TOTP } from './_components/TOTP/TOTP'

import './AttendanceWithModal-styles.less'

export function AttendanceWithModal() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classSessionloader>>
	const { user } = useContext(IdentityContext)
	const navigate = useNavigate()
	const params = useParams()
	const [refetchInterval, setRefetchInterval] = useState<number | undefined>(2_000)
	const canCreateCheckinSessions = hasPermission(user, 'create', 'checkin_sessions')

	const { data: classSession } = useQuery({
		queryKey: ['classSession', params.classSessionId],
		queryFn: async () => {
			const session = await getClassSession(String(params.classSessionId))

			if (session.checkin_session?.status === 'closed') {
				setRefetchInterval(undefined)
			}

			return session
		},
		initialData,
		refetchInterval,
		enabled: !!params.classSessionId,
	})

	const isSessionClosed = classSession.checkin_session?.status === 'closed'
	const sessionDate = dayjs(classSession.date).format('dddd DD MMMM')
	const checkinSessionUrl = `${import.meta.env.VITE_CLIENT_HOST}/register-attendance/${classSession.checkin_session?.id}`

	return (
		<>
			<Attendance />
			<Modal
				title={
					<div className="checkin-session__modal-title-container">
						<Typography.Title
							level={5}
						>{`${sessionDate.charAt(0).toUpperCase() + sessionDate.slice(1)} - ${classSession.course?.name} (${classSession.course?.code})`}</Typography.Title>
						{isSessionClosed && <Tag color="error">Appel fermé</Tag>}
					</div>
				}
				onCancel={() => navigate('/app/attendance')}
				footer={null}
				width={isSessionClosed ? 700 : 800}
				styles={{
					body: {
						height: '450px',
					},
				}}
				open
				centered
				destroyOnClose
			>
				<Row gutter={[8, 8]} className="checkin-modal">
					{classSession.checkin_session?.status !== 'closed' && (
						<>
							<Col span={11} className="checkin-modal__left-panel">
								<QRCode
									status={classSession.checkin_session ? 'active' : 'loading'}
									statusRender={({ status }) => {
										if (status === 'loading') {
											return canCreateCheckinSessions
												? "Lancez l'appel pour générer un QR code"
												: "Le QR code sera généré après le lancement de l'appel"
										}
									}}
									type="svg"
									value={checkinSessionUrl}
									size={200}
								/>
								{classSession.checkin_session && <TOTP />}
								<div className="checkin-session-form">
									<CheckinSessionForm />
								</div>
							</Col>
							<Col span={1}>
								<Divider className="student-list-divider" type="vertical" />
							</Col>
						</>
					)}
					<Col span={isSessionClosed ? 24 : 12}>
						<StudentList
							checkinSessionId={classSession.checkin_session?.id}
							isSessionClosed={isSessionClosed}
						/>
					</Col>
				</Row>
			</Modal>
		</>
	)
}
