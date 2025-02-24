import { Flex } from 'antd'
import { MoveRightIcon } from 'lucide-react'

export function formatTimeFrame(startTime: string | undefined, endTime: string | undefined) {
	if (!startTime && !endTime) {
		return (
			<Flex align="center" gap={6}>
				<span>--:--</span>
				<MoveRightIcon size={16} />
				<span>--:--</span>
			</Flex>
		)
	}

	const formattedStartTime = `${startTime!.split(':')[0]}:${startTime!.split(':')[1]}`
	const formattedEndTime = `${endTime!.split(':')[0]}:${endTime!.split(':')[1]}`

	return (
		<Flex align="center" gap={6}>
			<span>{formattedStartTime}</span>
			<MoveRightIcon size={16} color="var(--ant-color-text-tertiary)" />
			<span>{formattedEndTime}</span>
		</Flex>
	)
}
