import { getLocalStorage } from '@1schoolone/ui'
import { Button, DatePicker, Divider, Flex, Input, Select, Tabs, Typography } from 'antd'
import { LayoutGridIcon, ListIcon, PlusIcon } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTeacherData } from '@routes/grades/Assessments-data'
import { filtersReducer } from '@routes/grades/Assessments-utils'

import { Assessment } from '@apiClient'

import { AssessmentCards } from './AssessmentCards'
import { AssessmentTable } from './AssessmentTable'

type TabKey = 'cards' | 'table'

export interface ParsedAssessment extends Assessment {
	gradesAvg: number
	bestGrade: number
	worstGrade: number
}

export function TeacherView() {
	const localeStorage = getLocalStorage<{ assessmentsTabKey: TabKey }>()
	const [tabKey, setTabKey] = useState(localeStorage.get('assessmentsTabKey'))
	const [filtersState, dispatchFilters] = useReducer(filtersReducer, {
		course: 'all',
		class_group: 'all',
		date: undefined,
		search: '',
	})
	const navigate = useNavigate()

	const { assessments, courses, classes } = useTeacherData(filtersState)

	useEffect(() => {
		if (tabKey) {
			localeStorage.set('assessmentsTabKey', tabKey)
		}
	}, [tabKey, localeStorage])

	const filteredAssessment = (assessments ?? []).filter(({ name, course, class_group }) => {
		const search = filtersState.search.toLocaleLowerCase()

		const matchesName = name.toLocaleLowerCase().includes(search)
		const matchesCourseName = course.name.toLocaleLowerCase().includes(search)
		const matchesCourseCode = course.code.toLocaleLowerCase().includes(search)
		const matchesClassName = class_group.name.toLocaleLowerCase().includes(search)
		const matchesClassCode = class_group.code.toLocaleLowerCase().includes(search)

		return (
			matchesName || matchesCourseName || matchesCourseCode || matchesClassName || matchesClassCode
		)
	})

	return (
		<div className="assessments">
			<Flex align="end" gap="var(--ant-margin-xxl)">
				<Button
					type="primary"
					icon={<PlusIcon size={16} />}
					onClick={() => navigate('/app/grades/new')}
				>
					Créer une évaluation
				</Button>
				<div className="assessments__filters">
					<div className="assessments__filters__item">
						<Typography.Text>Cours :</Typography.Text>
						<Select
							value={filtersState.course}
							options={[
								{ label: 'Tous', value: 'all' },
								...(courses ?? []).map((c) => ({ label: c.name, value: c.id })),
							]}
							onChange={(courseId) =>
								dispatchFilters({ type: 'setCourse', value: courseId ?? 'all' })
							}
							popupMatchSelectWidth={false}
							allowClear
						/>
					</div>

					<Divider type="vertical" />

					<div className="assessments__filters__item">
						<Typography.Text>Classe :</Typography.Text>
						<Select
							value={filtersState.class_group}
							options={[
								{ label: 'Toutes', value: 'all' },
								...(classes ?? []).map((c) => ({ label: c.name, value: c.id })),
							]}
							onChange={(classId) => dispatchFilters({ type: 'setClass', value: classId ?? 'all' })}
							popupMatchSelectWidth={false}
							allowClear
						/>
					</div>

					<Divider type="vertical" />

					<div className="assessments__filters__item">
						<Typography.Text>Mois :</Typography.Text>
						<DatePicker
							value={filtersState.date}
							picker="month"
							placeholder="Tous"
							format="MMMM YYYY"
							onChange={(date) => dispatchFilters({ type: 'setDate', value: date })}
							allowClear
						/>
					</div>

					<Divider type="vertical" />

					<div className="assessments__filters__item search">
						<Typography.Text>Recherche :</Typography.Text>
						<Input
							placeholder="Ex: Mathématiques"
							onChange={(e) => dispatchFilters({ type: 'setSearch', value: e.target.value })}
						/>
					</div>
				</div>
			</Flex>
			<Tabs
				activeKey={tabKey ?? undefined}
				onChange={(activeKey) => setTabKey(activeKey as TabKey)}
				items={[
					{
						key: 'cards',
						icon: <LayoutGridIcon size={16} />,
						label: 'Cartes',
						children: <AssessmentCards assessments={filteredAssessment} />,
					},
					{
						key: 'table',
						icon: <ListIcon size={16} />,
						label: 'Liste',
						children: <AssessmentTable assessments={filteredAssessment} />,
					},
				]}
				type="card"
				destroyInactiveTabPane
			/>
		</div>
	)
}
