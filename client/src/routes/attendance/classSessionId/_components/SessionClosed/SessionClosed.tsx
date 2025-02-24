import { Result } from 'antd'
import { CircleOffIcon } from 'lucide-react'

export function SessionClosed() {
	return (
		<Result
			status="error"
			icon={<CircleOffIcon color="var(--ant-color-error)" />}
			title="L'appel est fermé"
		/>
	)
}
