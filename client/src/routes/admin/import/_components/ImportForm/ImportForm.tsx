import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Space, Typography, Upload, UploadFile } from 'antd'
import { isAxiosError } from 'axios'
import { FileSpreadsheetIcon } from 'lucide-react'
import React, { useState } from 'react'

export type ProcessingStatus = 'completed' | 'processing' | 'failed'

interface ImportFormProps<UploadResponse> {
	onUpload: (file: UploadFile) => UploadResponse | Promise<UploadResponse>
	onUploadSuccess: (data: UploadResponse) => void
	onUploadError?: (error: Error, setError: React.Dispatch<Error | string>) => void
}

function defaultOnUploadError(error: Error, setError: React.Dispatch<Error | string>) {
	if (isAxiosError(error)) {
		switch (error.status) {
			case 400:
				setError("Le fichier CSV n'est pas valide")
				break
			default:
				setError('Une erreur est survenue')
				break
		}
	} else {
		setError(error)
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ImportForm<UploadResponse extends Record<string, any>>(
	props: ImportFormProps<UploadResponse>,
) {
	const { onUpload, onUploadError = defaultOnUploadError, onUploadSuccess } = props
	const [file, setFile] = useState<UploadFile>()
	const [error, setError] = useState<Error | string>()

	const { mutate: uploadFile } = useMutation({
		mutationFn: async () => {
			if (!file) {
				throw new Error('Aucun fichier sélectionné')
			}

			setError(undefined)

			return await onUpload(file)
		},
		onSuccess: onUploadSuccess,
		onError: (err) => onUploadError(err, setError),
	})

	return (
		<Space direction="vertical" size="large">
			{error && (
				<Alert
					type="error"
					message={typeof error !== 'string' ? error.toString() : error}
					showIcon
				/>
			)}
			<Space direction="vertical" size="large">
				<Upload.Dragger
					accept=".csv"
					maxCount={1}
					beforeUpload={() => false}
					onChange={({ fileList }) => setFile(fileList[0])}
				>
					<Space direction="vertical">
						<FileSpreadsheetIcon size={32} strokeWidth={2} color="var(--ant-color-info)" />
						<Typography.Text>
							Cliquer ou glisser-déposer pour sélectionner un fichier
						</Typography.Text>
					</Space>
				</Upload.Dragger>
				<Button type="primary" onClick={() => uploadFile()}>
					Importer
				</Button>
			</Space>
		</Space>
	)
}
