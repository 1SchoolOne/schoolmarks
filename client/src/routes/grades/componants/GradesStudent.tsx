import { AppstoreOutlined, CloseCircleOutlined, UnorderedListOutlined } from '@ant-design/icons'
import {
	Button,
	Card,
	Col,
	Divider,
	Empty,
	Flex,
	Input,
	Row,
	Select,
	Spin,
	Table,
	TableProps,
	Typography,
} from 'antd'
import { useMemo } from 'react'

import { GradeWithUser, useGrades } from '../hooks/useGrades'
import { StudentCardGrade } from './StudentCardGrade'

import './GradesStudent-styles.less'

export function GradesStudent() {
	const {
		viewMode,
		setViewMode,
		filters,
		searchTerm,
		setSearchTerm,
		filteredGrades,
		isLoading,
		handleChange,
		handleResetFilter,
		handleResetAllFilters,
		subjectOptions,
		classOptions,
		monthOptions,
		yearOptions,
		user,
	} = useGrades('student')

	// Définition des colonnes spécifiques pour la vue étudiant
	const columns: TableProps<GradeWithUser>['columns'] = useMemo(
		() => [
			{
				title: 'Matière',
				dataIndex: 'courseName',
				key: 'courseName',
				render: (text) => <Typography.Text strong>{text}</Typography.Text>,
			},
			{
				title: 'Date',
				dataIndex: 'created_at',
				key: 'created_at',
				render: (date: string) => {
					if (!date) return '-'
					const d = new Date(date)
					return `${d.getDate()}/${d.getMonth() + 1}`
				},
			},
			{
				title: 'Coeff.',
				dataIndex: 'coef',
				key: 'coef',
				render: (coef) => parseInt(coef, 10) || 1,
			},
			{
				title: 'Ta Note',
				key: 'yourGrade',
				render: (_, record) => {
					const yourGrade = record.studentGrades?.find((g) => g.student === user?.id)
					return yourGrade ? yourGrade.value : '-'
				},
			},
			{
				title: 'Note -',
				key: 'minGrade',
				render: (_, record) => {
					const numericGrades = record.studentGrades?.map((g) => Number(g.value)) || []
					return numericGrades.length ? Math.min(...numericGrades) : '-'
				},
			},
			{
				title: 'Note +',
				key: 'maxGrade',
				render: (_, record) => {
					const numericGrades = record.studentGrades?.map((g) => Number(g.value)) || []
					return numericGrades.length ? Math.max(...numericGrades) : '-'
				},
			},
			{
				title: 'Classe',
				dataIndex: 'className',
				key: 'className',
				render: (text) => text || '-',
			},
			{
				title: 'Appréciation',
				key: 'appreciation',
				width: 250,
				render: (_, record) => {
					const yourGrade = record.studentGrades?.find((g) => g.student === user?.id)
					return (
						<Card className="appreciation-card" bordered size="small">
							<Typography.Paragraph className="appreciation-text">
								{yourGrade?.comment || 'Pas de commentaire'}
							</Typography.Paragraph>
						</Card>
					)
				},
			},
		],
		[user],
	)

	return (
		<Flex vertical>
			<Row>
				<Col style={{ padding: '8px' }}>
					<Typography.Text type="secondary">
						Consultez vos évaluations et suivez votre progression
					</Typography.Text>
				</Col>
			</Row>

			<Flex justify="space-around">
				<Row>
					<Col style={{ marginRight: '10px' }}>
						<Input.Search
							placeholder="Rechercher une évaluation"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onSearch={setSearchTerm}
							style={{
								width: '250px',
							}}
							enterButton
						/>
					</Col>
				</Row>
				<Row>
					<Button.Group>
						<Button
							type={viewMode === 'list' ? 'primary' : 'default'}
							icon={<UnorderedListOutlined />}
							onClick={() => setViewMode('list')}
						>
							Liste
						</Button>
						<Button
							type={viewMode === 'card' ? 'primary' : 'default'}
							icon={<AppstoreOutlined />}
							onClick={() => setViewMode('card')}
						>
							Cartes
						</Button>
					</Button.Group>
				</Row>
			</Flex>

			<Flex className="filters-container" justify="center" align="center">
				<Flex className="filter-group" align="center">
					<Flex vertical align="center" className="filter-group-item">
						<Typography.Title level={5}>Matière</Typography.Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Matière"
								onChange={(value) => handleChange(value, 'subject')}
								value={filters.subject}
								options={subjectOptions}
							/>
							<CloseCircleOutlined
								className="filter-reset-icon"
								onClick={() => handleResetFilter('subject')}
							/>
						</Flex>
					</Flex>

					<Divider type="vertical" className="filter-divider" />

					<Flex vertical align="center" className="filter-group-item">
						<Typography.Title level={5}>Classe</Typography.Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Classe"
								onChange={(value) => handleChange(value, 'class')}
								value={filters.class}
								options={classOptions}
							/>
							<CloseCircleOutlined
								className="filter-reset-icon"
								onClick={() => handleResetFilter('class')}
							/>
						</Flex>
					</Flex>

					<Divider type="vertical" className="filter-divider" />

					<Flex vertical align="center" className="filter-group-item">
						<Typography.Title level={5}>Mois</Typography.Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Mois"
								onChange={(value) => handleChange(value, 'month')}
								value={filters.month}
								options={monthOptions}
							/>
							<CloseCircleOutlined
								className="filter-reset-icon"
								onClick={() => handleResetFilter('month')}
							/>
						</Flex>
					</Flex>

					<Divider type="vertical" className="filter-divider" />

					<Flex vertical align="center" className="filter-group-item">
						<Typography.Title level={5}>Année</Typography.Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Année"
								onChange={(value) => handleChange(value, 'year')}
								value={filters.year}
								options={yearOptions}
							/>
							<CloseCircleOutlined
								className="filter-reset-icon"
								onClick={() => handleResetFilter('year')}
							/>
						</Flex>
					</Flex>
				</Flex>

				<Divider type="vertical" className="filter-divider" />

				<Flex vertical align="flex-end" justify="flex-end" className="filter-reset-all-container">
					<Button onClick={handleResetAllFilters} type="primary">
						Réinitialiser tous les filtres
					</Button>
				</Flex>
			</Flex>

			<Flex vertical className="grades-content">
				{isLoading ? (
					<Flex justify="center" align="center" style={{ height: '200px' }}>
						<Spin size="large" />
					</Flex>
				) : filteredGrades.length === 0 ? (
					<Empty
						description={
							<Typography.Text>
								Aucune évaluation trouvée. Essayez de modifier vos filtres.
							</Typography.Text>
						}
					/>
				) : viewMode === 'list' ? (
					<Table
						columns={columns}
						dataSource={filteredGrades}
						rowKey="id"
						className="grades-table student-grades-table"
						pagination={filteredGrades.length > 10 ? { pageSize: 10 } : false}
						loading={isLoading}
					/>
				) : (
					<Row
						gutter={[16, 16]}
						style={{
							width: '100%',
							margin: 0,
							padding: '16px 0',
						}}
					>
						{filteredGrades.map((grade) => {
							const studentGrade = grade.studentGrades?.find((g) => g.student === user?.id)
							return (
								<Col xs={24} sm={12} md={8} lg={6} key={grade.id} style={{ display: 'flex' }}>
									<StudentCardGrade grade={grade} userGrade={studentGrade?.value} />
								</Col>
							)
						})}
					</Row>
				)}
			</Flex>
		</Flex>
	)
}
