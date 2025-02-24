import axios from 'axios'

import {
	GetCourseEnrollmentByIdResponse,
	GetCourseEnrollmentsResponse,
} from '@apiSchema/courseEnrollments'

import { AXIOS_DEFAULT_CONFIG } from './axios'

type QueryParamsKeys = 'course' | 'class_group'

/* - - - GET - - - */

export async function getCourseEnrollment(courseEnrollmentsId: string) {
	const { data } = await axios.get<GetCourseEnrollmentByIdResponse>(
		`/course_enrollments/${courseEnrollmentsId}/`,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}

export async function getCourseEnrollments(queryParams?: Partial<Record<QueryParamsKeys, string>>) {
	let url = '/course_enrollments/'

	if (queryParams) {
		const params = new URLSearchParams(queryParams)
		url += `?${params.toString()}`
	}

	const { data } = await axios.get<GetCourseEnrollmentsResponse>(url, AXIOS_DEFAULT_CONFIG)

	return data
}
