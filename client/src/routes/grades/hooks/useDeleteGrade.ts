import { Modal, message } from 'antd'

import { deleteGrade } from '@api/grades'

import { GradeWithUser } from './useGrades'

interface UseDeleteGradeProps {
	onSuccess?: () => Promise<void>
}

export function useDeleteGrade({ onSuccess }: UseDeleteGradeProps = {}) {
	const handleDelete = async (grade: GradeWithUser) => {
		Modal.confirm({
			title: 'Êtes-vous sûr de vouloir supprimer cette évaluation ?',
			content: 'Cette action supprimera également toutes les notes associées aux étudiants.',
			okText: 'Supprimer',
			okType: 'danger',
			cancelText: 'Annuler',
			async onOk() {
				try {
					if (!grade.id) throw new Error("ID de l'évaluation non défini")
					await deleteGrade(grade.id)
					message.success('Évaluation supprimée avec succès')
					if (onSuccess) {
						await onSuccess()
					}
				} catch (error) {
					message.error("Erreur lors de la suppression de l'évaluation")
					console.error(error)
				}
			},
		})
	}

	return { handleDelete }
}
