export type ImportStatus = 'completed' | 'failed' | 'processing'

export type ImportType = 'users' | 'classes' | 'courses'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImportCSV<Result extends Record<string, any>> {
	results: (ImportCSVSuccess<Result> | ImportCSVError)[]
	total: number
}

interface ImportCSVCommon {
	import_id: string
	status: ImportStatus
	progress: number
	imported_by: string
	started_at: string
	finished_at: string | null
}

export interface ImportCSVSuccess<Result> extends ImportCSVCommon {
	results: Result[]
	error: null
}

export interface ImportCSVError extends ImportCSVCommon {
	results: null
	error: string
}
