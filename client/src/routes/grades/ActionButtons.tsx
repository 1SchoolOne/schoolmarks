import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button } from 'antd'
import { DownloadIcon, PenIcon, Trash2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { assessmentsApi } from '@api/axios'

import { ParsedAssessment } from './Assessments'
import { exportGradesToCsv } from './Assessments-utils'

function EditButton({ assessmentId }: { assessmentId: string }) {
	const navigate = useNavigate()

	return (
		<Button
			type="link"
			icon={<PenIcon size={16} />}
			title="Modifier"
			onClick={() => navigate(`/app/grades/edit/${assessmentId}`)}
		/>
	)
}

function ExportButton({ assessment }: { assessment: ParsedAssessment }) {
	return (
		<Button
			type="link"
			icon={<DownloadIcon size={16} />}
			title="Exporter"
			onClick={() => exportGradesToCsv(assessment)}
		/>
	)
}

function DeleteButton({ assessmentId }: { assessmentId: string }) {
	const queryClient = useQueryClient()
	const { notification, modal } = App.useApp()

	const { mutate: deleteAssessment } = useMutation({
		mutationFn: () => assessmentsApi.assessmentsDestroy(assessmentId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['assessments'],
			})
			notification.success({ message: 'Évaluation supprimée avec succès.' })
		},
		onError: (error) => {
			notification.error({ message: 'Erreur', description: error.message })
		},
	})

	return (
		<Button
			type="link"
			icon={<Trash2Icon size={16} />}
			title="Supprimer"
			onClick={() =>
				modal.confirm({
					icon: (
						<Trash2Icon
							color="var(--ant-color-error)"
							size={22}
							// TODO: move this to a stylesheet
							style={{ marginRight: 'var(--ant-margin-xs)' }}
						/>
					),
					title: 'Supprimer',
					content: 'Êtes-vous sûr de vouloir supprimer cette évaluation ?',
					okText: 'Supprimer',
					onOk: () => deleteAssessment(),
					okButtonProps: { danger: true },
				})
			}
			danger
		/>
	)
}

export const ActionButton = {
	Edit: EditButton,
	Export: ExportButton,
	Delete: DeleteButton,
}
