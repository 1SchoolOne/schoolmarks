import {
	AssessmentsApi,
	AttendancesApi,
	CheckinSessionsApi,
	ClassSessionsApi,
	ClassStudentsApi,
	ClassesApi,
	Configuration,
	CoursesApi,
	ImportApi,
	StudentGradesApi,
	UsersApi,
} from '../api-client'

const API_BASE_URL = import.meta.env.VITE_API_HOST
export const AXIOS_DEFAULT_CONFIG = {
	baseURL: API_BASE_URL,
	withCredentials: true,
}

const configuration = new Configuration({
	basePath: API_BASE_URL,
	baseOptions: {
		withCredentials: true,
	},
})

export const attendanceApi = new AttendancesApi(configuration)

export const checkinSessionsApi = new CheckinSessionsApi(configuration)

export const classSessionsApi = new ClassSessionsApi(configuration)

export const classStudentsApi = new ClassStudentsApi(configuration)

export const classesApi = new ClassesApi(configuration)

export const coursesApi = new CoursesApi(configuration)

export const assessmentsApi = new AssessmentsApi(configuration)

export const importApi = new ImportApi(configuration)

export const studentGradesApi = new StudentGradesApi(configuration)

export const usersApi = new UsersApi(configuration)
