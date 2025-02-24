import axios from 'axios'

import { GetCourseByIdResponse, GetCoursesResponse } from '@apiSchema/courses'

import { AXIOS_DEFAULT_CONFIG } from './axios'

/* - - - GET - - - */

export async function getCourseById(courseId: string) {
	const { data } = await axios.get<GetCourseByIdResponse>(
		`/courses/${courseId}/`,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}

export async function getCourses() {
	const { data } = await axios.get<GetCoursesResponse>('/courses/', AXIOS_DEFAULT_CONFIG)
	return data
}

export async function getCoursesClass(classId?: string) {
	const { data } = await axios.get<GetCoursesResponse>(
		`/courses/${classId ? `?class_id=${classId}` : ''}`,
		AXIOS_DEFAULT_CONFIG,
	)
	return data
}
