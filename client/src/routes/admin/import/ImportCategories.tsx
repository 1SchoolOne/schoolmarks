import { Breakpoint, Card, Col, Grid, Row, Space, Typography } from 'antd'
import { ArrowRightIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { categories } from './ImportCategories-constants'

import './ImportCategories-styles.less'

export interface Category {
	path: string
	title: string
	description?: string
	icon?: ReactNode
}

function getColSpan(screens: Partial<Record<Breakpoint, boolean>>): number {
	if (screens.xxl) {
		return 6
	} else if (screens.xl) {
		return 6
	} else if (screens.lg) {
		return 8
	} else if (screens.md) {
		return 12
	}

	return 24
}

function pairCategoriesWithoutDesc(categories: Category[]): [Category, Category | null][] {
	const result: [Category, Category | null][] = []

	for (let i = 0; i < categories.length; i += 2) {
		const pair: [Category, Category | null] = [
			categories[i]!,
			i + 1 < categories.length ? categories[i + 1]! : null,
		]

		result.push(pair)
	}

	return result
}

export function ImportCategories() {
	const screens = Grid.useBreakpoint()
	const navigate = useNavigate()

	const colSpan = getColSpan(screens)

	const categoriesWithDesc = categories.filter((c) => typeof c.description === 'string')
	const categoriesWithoutDesc = pairCategoriesWithoutDesc(
		categories.filter((c) => c.description === undefined),
	)

	return (
		<Space className="import-categories no-scrollbar" direction="vertical">
			<Typography.Paragraph>
				Importez facilement vos données existantes grâce à nos modèles CSV prédéfinis.
			</Typography.Paragraph>
			<Row className="categories-grid" gutter={[8, 8]}>
				{categoriesWithDesc.map((cat) => (
					<Col key={cat.path} span={colSpan}>
						<Card
							className="import-category-card"
							classNames={{
								body: 'import-category-card__body import-category-card__body--with-desc',
							}}
							onClick={() => navigate(cat.path)}
						>
							<Card.Meta
								avatar={cat.icon}
								title={
									<div
										className="import-category-card__title"
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
										}}
									>
										<Typography.Text>{cat.title}</Typography.Text>
										<ArrowRightIcon size={16} />
									</div>
								}
								description={<Typography.Paragraph>{cat.description}</Typography.Paragraph>}
							/>
						</Card>
					</Col>
				))}
				{categoriesWithoutDesc.map((pair) => {
					const cat1 = pair[0]
					const cat2 = pair[1]

					return (
						<Col key={cat1.path} span={colSpan}>
							<div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', rowGap: '8px' }}>
								<Card
									className="import-category-card"
									classNames={{
										body: 'import-category-card__body',
									}}
									onClick={() => navigate(cat1.path)}
								>
									<Card.Meta
										avatar={cat1.icon}
										title={
											<div
												className="import-category-card__title"
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
												}}
											>
												<Typography.Text>{cat1.title}</Typography.Text>
												<ArrowRightIcon size={16} />
											</div>
										}
									/>
								</Card>
								{cat2 && (
									<Card
										className="import-category-card"
										classNames={{
											body: 'import-category-card__body',
										}}
										onClick={() => navigate(cat2.path)}
									>
										<Card.Meta
											avatar={cat2.icon}
											title={
												<div
													className="import-category-card__title"
													style={{
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center',
													}}
												>
													<Typography.Text>{cat2.title}</Typography.Text>
													<ArrowRightIcon size={16} />
												</div>
											}
										/>
									</Card>
								)}
							</div>
						</Col>
					)
				})}
			</Row>
		</Space>
	)
}
