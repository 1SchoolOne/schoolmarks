import { Crumb } from '@types'

import { Match, MatchWithCrumb } from './Breadcrumbs'

function isMatchWithCrumb(match: Match): match is MatchWithCrumb {
	return match.handle?.crumb !== undefined
}

export function getCrumbsFromMatches(matches: Match[]): Crumb[] {
	const crumbs = matches.filter(isMatchWithCrumb).map((match) => match.handle.crumb)

	const joinedPathCrumbs: Crumb[] = []

	crumbs.forEach((crumb, index) => {
		const previousJoinedPathCrumb = joinedPathCrumbs.at(index - 1)

		joinedPathCrumbs.push({
			...crumb,
			path: previousJoinedPathCrumb
				? [previousJoinedPathCrumb.path, crumb.path].join('/')
				: crumb.path,
		})
	})

	return joinedPathCrumbs
}
