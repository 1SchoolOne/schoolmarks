import { useContext } from 'react'

import { IdentityContext } from '@contexts'

import { GradesStudent } from './componants/GradesStudent'
import { GradesTeacher } from './componants/GradesTeacher'

export const Grade = () => {
	const { user } = useContext(IdentityContext)

	if (user?.role === 'student') {
		return <GradesStudent />
	}

	return <GradesTeacher />
}
