import { Button, ButtonProps } from 'antd'
import classNames from 'classnames'

import './IconButton-styles.less'

interface IIconButtonProps extends Omit<ButtonProps, 'icon' | 'children'> {
	icon: React.ReactNode
}

export function IconButton(props: IIconButtonProps) {
	const { className, ...restprops } = props

	return <Button {...restprops} className={classNames('icon-button', className)} />
}
