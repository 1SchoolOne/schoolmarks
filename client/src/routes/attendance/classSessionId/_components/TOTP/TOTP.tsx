import { Col, Flex, Progress, Row, Typography } from 'antd'

import { useController } from './TOTP-controller'

interface TOTPCountdownProps {
	totp: string | undefined
	totpCountdown: number
}

function TOTP() {
	const { totp, totpCountdown } = useController()

	return <TOTPCountdown totp={totp} totpCountdown={totpCountdown} />
}

function TOTPCountdown(props: TOTPCountdownProps) {
	const { totp, totpCountdown } = props

	return (
		<Row className="totp-container" gutter={[8, 8]}>
			<Col span={24}>
				<Flex align="center" justify="center" gap={6}>
					<Typography.Title level={3}>Code : {totp ? totp : '-'}</Typography.Title>
				</Flex>
			</Col>
			{totp && (
				<Col span={24}>
					<Progress
						data-testid="totp-countdown-id"
						percent={(totpCountdown / 15) * 100 + 1}
						format={() => ''}
						strokeColor={totpCountdown > 5 ? 'var(--ant-color-info)' : 'var(--ant-color-error)'}
					/>
				</Col>
			)}
		</Row>
	)
}

TOTP.Countdown = TOTPCountdown

export { TOTP }
