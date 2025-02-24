import {
	AppstoreOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	ExportOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons'
import {
	Button,
	Col,
	Divider,
	Empty,
	Flex,
	Input,
	Row,
	Select,
	Space,
	Spin,
	Table,
	TableProps,
	Tooltip,
	Typography,
} from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGradeExport } from '../hooks/useGradeExport'
import { GradeWithUser, useGrades } from '../hooks/useGrades'
import { TeacherCardGrade } from './TeacherCardGrade'

import './GradesTeacher-styles.less'

const { Text, Title } = Typography

export function GradesTeacher() {
	const navigate = useNavigate()
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
		handleEdit,
		handleDelete,
		subjectOptions,
		classOptions,
		monthOptions,
		yearOptions,
	} = useGrades('teacher')
	const { handleExport } = useGradeExport()

	// Définition des colonnes spécifiques pour la vue enseignant
	const columns: TableProps<GradeWithUser>['columns'] = useMemo(
		() => [
			{
				title: 'Matière',
				dataIndex: 'courseName',
				key: 'courseName',
				render: (text) => <Text strong>{text}</Text>,
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
				title: 'Classe',
				dataIndex: 'className',
				key: 'className',
				render: (text) => text || 'Classe inconnue',
			},
			{
				title: 'Coefficient',
				dataIndex: 'coef',
				key: 'coef',
				render: (coef) => parseInt(coef, 10) || 1,
			},
			{
				title: 'Note -',
				key: 'lowestGrade',
				render: (_, record) => {
					const numericGrades = record.studentGrades?.map((g) => Number(g.value)) || []
					return numericGrades.length ? Math.min(...numericGrades) : '-'
				},
			},
			{
				title: 'Moy. classe',
				key: 'averageGrade',
				render: (_, record) => {
					const numericGrades = record.studentGrades?.map((g) => Number(g.value)) || []
					const averageGrade = numericGrades.length
						? numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length
						: 0
					return numericGrades.length ? Math.round(averageGrade * 10) / 10 : '-'
				},
			},
			{
				title: 'Note +',
				key: 'highestGrade',
				render: (_, record) => {
					const numericGrades = record.studentGrades?.map((g) => Number(g.value)) || []
					return numericGrades.length ? Math.max(...numericGrades) : '-'
				},
			},
			{
				title: 'Actions',
				key: 'actions',
				width: 120,
				render: (_, record) => (
					<Space size="middle">
						<Tooltip title="Modifier l'évaluation">
							<Button
								type="text"
								icon={<EditOutlined className="action-edit" />}
								onClick={() => handleEdit(record)}
							/>
						</Tooltip>
						<Tooltip title="Exporter l'évaluation">
							<Button
								type="text"
								icon={<ExportOutlined className="action-edit" />}
								onClick={() => handleExport(record)}
							/>
						</Tooltip>
						<Tooltip title="Supprimer l'évaluation">
							<Button
								type="text"
								icon={<DeleteOutlined className="action-delete" />}
								onClick={() => handleDelete(record)}
							/>
						</Tooltip>
					</Space>
				),
			},
		],
		[handleEdit, handleDelete, handleExport],
	)

	return (
		<Flex vertical>
			<Row>
				<Col>
					<Text type="secondary">
						Accéder rapidement à vos évaluations et suivez la progression de vos étudiants
					</Text>
				</Col>
			</Row>

			<Flex className="grades-actions" justify="space-between" align="center">
				<Space>
					<Input.Search
						placeholder="Rechercher une évaluation"
						className="grades-actions-search"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onSearch={setSearchTerm}
					/>
					<Button type="primary" onClick={() => navigate('/app/grades/new')}>
						Créer une évaluation
					</Button>
				</Space>
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
			</Flex>

			<Flex className="filters-container" align="center" justify="center">
				<Flex className="filter-group" align="center">
					<Flex vertical align="center" className="filter-group-item">
						<Title level={5}>Matière</Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Matière"
								onChange={(value) => handleChange(value, 'subject')}
								value={filters.subject}
								options={subjectOptions}
							/>
							<Button
								type="text"
								icon={<CloseCircleOutlined className="filter-reset-icon" />}
								onClick={() => handleResetFilter('subject')}
							/>
						</Flex>
					</Flex>

					<Divider type="vertical" className="filter-divider" />

					<Flex vertical align="center" className="filter-group-item">
						<Title level={5}>Classe</Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Classe"
								onChange={(value) => handleChange(value, 'class')}
								value={filters.class}
								options={classOptions}
							/>
							<Button
								type="text"
								icon={<CloseCircleOutlined className="filter-reset-icon" />}
								onClick={() => handleResetFilter('class')}
							/>
						</Flex>
					</Flex>

					<Divider type="vertical" className="filter-divider" />

					<Flex vertical align="center" className="filter-group-item">
						<Title level={5}>Mois</Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Mois"
								onChange={(value) => handleChange(value, 'month')}
								value={filters.month}
								options={monthOptions}
							/>
							<Button
								type="text"
								icon={<CloseCircleOutlined className="filter-reset-icon" />}
								onClick={() => handleResetFilter('month')}
							/>
						</Flex>
					</Flex>

					<Divider type="vertical" className="filter-divider" />

					<Flex vertical align="center" className="filter-group-item">
						<Title level={5}>Année</Title>
						<Flex align="center" className="filter-group-item-controls">
							<Select
								className="filter-select"
								placeholder="Année"
								onChange={(value) => handleChange(value, 'year')}
								value={filters.year}
								options={yearOptions}
							/>
							<Button
								type="text"
								icon={<CloseCircleOutlined className="filter-reset-icon" />}
								onClick={() => handleResetFilter('year')}
							/>
						</Flex>
					</Flex>
				</Flex>

				<Divider type="vertical" className="filter-divider" />

				<Flex vertical align="flex-end" justify="flex-end" className="filter-reset-all-container">
					<Button type="primary" onClick={handleResetAllFilters} className="filter-reset-all">
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
								Aucune évaluation trouvée. Essayez de modifier vos filtres ou créez-en une nouvelle.
							</Typography.Text>
						}
					/>
				) : viewMode === 'list' ? (
					<Table
						columns={columns}
						dataSource={filteredGrades}
						rowKey="id"
						className="grades-table"
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
						{filteredGrades.map((grade) => (
							<Col xs={24} sm={12} md={8} xl={6} key={grade.id} style={{ display: 'flex' }}>
								<TeacherCardGrade
									grade={grade}
									grades={filteredGrades}
									onEdit={handleEdit}
									onDelete={handleDelete}
								/>
							</Col>
						))}
					</Row>
				)}
			</Flex>
		</Flex>
	)
}
