import { LinkProps, Link as RouterLink } from 'react-router-dom'

import './Link-styles.less'

export function Link(props: LinkProps) {
	return <RouterLink {...props} className="router-link" />
}
