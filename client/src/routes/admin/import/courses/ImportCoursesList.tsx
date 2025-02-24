import { Button, Space } from 'antd'
import dayjs from 'dayjs'
import { DownloadIcon, FolderDownIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { downloadFromURL } from '@utils/downloadPublicFile'

import { ImportList } from '../_components/ImportList/ImportList'

interface CourseImportResult {
	id: string
	name: string
	code: string
	professor: string
}

export function ImportCoursesList() {
	const navigate = useNavigate()

	return (
		<Space direction="vertical" style={{ width: '100%' }}>
			<Space>
				<Button
					type="primary"
					icon={<FolderDownIcon size={16} />}
					onClick={() => navigate('/app/admin/import/courses/new')}
				>
					Importer des classes
				</Button>
				<Button
					icon={<DownloadIcon size={16} />}
					onClick={() =>
						downloadFromURL('/CSV_courses_SchoolMarks.xlsx', 'CSV_courses_SchoolMarks.xlsx')
					}
				>
					Télécharger le modèle CSV
				</Button>
			</Space>
			<ImportList<CourseImportResult>
				importType="courses"
				renderItem={(item) => {
					const duration = item.finished_at
						? dayjs.duration(dayjs(item.finished_at).diff(item.started_at))
						: null

					let durationString = duration ? `${duration.seconds()}s` : null

					if (duration && duration.minutes() > 0) {
						durationString = `${duration?.minutes()}min` + durationString
					}

					return (
						<ImportList.Item
							status={item.status}
							title={
								<Link to={`/app/admin/import/courses/view/${item.import_id}`}>
									{item.status === 'completed'
										? `${item.results?.length} cours importés`
										: `Erreur : ${item.error}`}
								</Link>
							}
							description={`Lancé par ${item.imported_by} le ${dayjs(item.started_at).locale('fr').format('DD/MM/YYYY à HH:mm')}${durationString ? ` - a duré ${durationString}` : ''}`}
						/>
					)
				}}
			/>
		</Space>
	)
}
