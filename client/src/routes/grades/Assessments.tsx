import { useContext } from 'react'

import { IdentityContext } from '@contexts'

import { StudentView } from './_components/student/StudentView'
import { TeacherView } from './_components/teacher/TeacherView'

import './Assessments-styles.less'

export function Assessments() {
	const { user } = useContext(IdentityContext)

	if (user?.role === 'student') {
		return <StudentView />
	}

	return <TeacherView />
}
