import { Button, Space } from 'antd'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import { DownloadIcon, FolderDownIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { downloadFromURL } from '@utils/downloadPublicFile'

import { ImportList } from '../_components/ImportList/ImportList'

dayjs.extend(durationPlugin)

interface UserImportResult {
	first_name: string
	last_name: string
	email: string
	password: string
}

export function ImportUsersList() {
	const navigate = useNavigate()

	return (
		<Space direction="vertical" style={{ width: '100%' }}>
			<Space>
				<Button
					type="primary"
					icon={<FolderDownIcon size={16} />}
					onClick={() => navigate('/app/admin/import/users/new')}
				>
					Importer des utilisateurs
				</Button>
				<Button
					icon={<DownloadIcon size={16} />}
					onClick={() =>
						downloadFromURL('/CSV_users_SchoolMarks.xlsx', 'CSV_users_SchoolMarks.xlsx')
					}
				>
					Télécharger le modèle CSV
				</Button>
			</Space>
			<ImportList<UserImportResult>
				importType="users"
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
								<Link to={`/app/admin/import/users/view/${item.import_id}`}>
									{item.status === 'completed'
										? `${item.results?.length} utilisateurs importés`
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
