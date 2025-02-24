import { Spin } from 'antd'

import './LoadingScreen-styles.less'

export function LoadingScreen() {
	return (
		<div className="loading-screen">
			<Spin size="large" />
		</div>
	)
}
