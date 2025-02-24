import { Button, Result } from 'antd'
import { isAxiosError } from 'axios'
import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate, useRouteError } from 'react-router-dom'

export function RegisterError() {
	const navigate = useNavigate()
	const routeError = useRouteError()
	let error = 'Une erreur est survenue'

	if (isAxiosError(routeError)) {
		if (routeError.status === 404) {
			error = "Cette session d'appel n'existe pas"
		} else if (routeError.status === 500) {
			error = 'Une erreur est survenue lors de la récupération des données'
		} else {
			error = routeError.response?.data.message
		}
	}

	return (
		<Result
			status="error"
			title={error}
			extra={[
				<Button type="link" icon={<ArrowLeftIcon size={16} />} onClick={() => navigate('/app')}>
					Revenir sur SchoolMarks
				</Button>,
			]}
		/>
	)
}
