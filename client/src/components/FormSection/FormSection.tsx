import { PropsWithChildren } from '@1schoolone/ui'
import { Tooltip, Typography } from 'antd'
import { InfoIcon } from 'lucide-react'

import './FormSection-styles.less'

interface FormSectionProps {
	title: React.ReactNode
	tooltip?: string
}

export function FormSection(props: PropsWithChildren<FormSectionProps>) {
	const { title, tooltip, children } = props

	return (
		<section className="form-section">
			<div className="form-section__title">
				<Typography.Title level={5} ellipsis>
					{title}
				</Typography.Title>
				{tooltip && (
					<Tooltip title={tooltip} placement="right">
						<InfoIcon size={16} color="var(--ant-color-info)" />
					</Tooltip>
				)}
			</div>
			<div className="form-section__content">{children}</div>
		</section>
	)
}
