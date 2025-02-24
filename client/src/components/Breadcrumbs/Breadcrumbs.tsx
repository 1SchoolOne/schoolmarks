import { Breadcrumb, Typography } from 'antd'
import { BreadcrumbItemType, BreadcrumbSeparatorType } from 'antd/es/breadcrumb/Breadcrumb'
import { Link, UIMatch, useMatches } from 'react-router-dom'

import { Crumb } from '@types'

import { getCrumbsFromMatches } from './Breadcrumbs-utils'

import './Breadcrumbs-styles.less'

export type MatchWithCrumb = UIMatch<
	unknown,
	{
		crumb: Crumb
	}
>

export type Match = UIMatch<
	unknown,
	{
		crumb?: Crumb
	}
>

function itemRender(
	currentRoute: Partial<BreadcrumbItemType & BreadcrumbSeparatorType>,
	params: Record<string, { disabled: boolean }>,
	items: Partial<BreadcrumbItemType & BreadcrumbSeparatorType>[],
) {
	const isLast = currentRoute?.path === items[items.length - 1]?.path
	const isDisabled = !!params[currentRoute.path!]?.disabled

	return isLast || isDisabled ? (
		<span>{currentRoute.title}</span>
	) : (
		<Link to={`/app/${currentRoute?.path}`}>{currentRoute.title}</Link>
	)
}

export function Breadcrumbs() {
	const matches = useMatches() as Match[]
	const crumbs: Crumb[] = getCrumbsFromMatches(matches)
	const pathParams: Record<string, { disabled: boolean }> = {}

	crumbs.forEach((crumb) => {
		pathParams[crumb.path] = { disabled: !!crumb.disabled }
	})

	return (
		<Breadcrumb
			className="path-breadcrumb"
			params={pathParams}
			itemRender={itemRender}
			items={crumbs.map((crumb, index) => ({
				title:
					index === 0 ? <Typography.Title level={3}>{crumb.label}</Typography.Title> : crumb.label,
				path: crumb.path,
			}))}
		/>
	)
}
