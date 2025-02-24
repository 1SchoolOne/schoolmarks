import { Card, Progress } from 'antd'

import './ImportProgress-styles.less'

type ImportType = 'users' | 'classes' | 'courses'

interface ImportProgressProps {
	percent: number
	importType: ImportType
}

function getCardTitle(importType: ImportType): string {
	switch (importType) {
		case 'users':
			return "Import d'utilisateurs"
		case 'classes':
			return 'Import de classes'
		case 'courses':
			return 'Import de cours'
	}
}

export function ImportProgress(props: ImportProgressProps) {
	const { importType, percent } = props

	return (
		<Card className="import-progress-card" title={getCardTitle(importType)}>
			<Progress percent={percent} status="active" />
		</Card>
	)
}
