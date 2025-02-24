import axios from 'axios'

import {
	GetGradeByIdResponse,
	GetGradesResponse,
	PatchGradeByIdResponse,
	PostGradeBody,
	PostGradeResponse,
} from '@apiSchema/grades'

import { AXIOS_DEFAULT_CONFIG } from './axios'

/* - - - GET - - - */

export async function getGrade(gradeId: string) {
	const { data } = await axios.get<GetGradeByIdResponse>(
		`/grades/${gradeId}/`,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}

export async function getGrades() {
	const { data } = await axios.get<GetGradesResponse>('/grades/', AXIOS_DEFAULT_CONFIG)
	return data
}

/* - - - POST - - - */

export async function postGrade(GradeData: PostGradeBody) {
	const { data } = await axios.post<PostGradeResponse>('/grades/', GradeData, AXIOS_DEFAULT_CONFIG)
	return data
}

/* - - - PATCH - - - */

export async function patchGrade(gradeId: string, gradeData: PostGradeBody) {
	const { data } = await axios.patch<PatchGradeByIdResponse>(
		`/grades/${gradeId}/`,
		gradeData,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}

/* - - - DELETE - - - */

export async function deleteGrade(gradeId: string) {
	await axios.delete(`/grades/${gradeId}/`, {
		...AXIOS_DEFAULT_CONFIG,
		params: {
			cascade: true, // Pour indiquer au backend de supprimer aussi les notes associées
		},
	})
}
