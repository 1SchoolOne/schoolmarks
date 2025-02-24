import { BookMarkedIcon, ComponentIcon, UsersIcon } from 'lucide-react'

import { Category } from './ImportCategories'

/** To add a category to the grid, simply add an item to this array. */
export const categories: Array<Category> = [
	{
		path: 'users',
		title: 'Utilisateurs',
		description:
			'Créez rapidement les comptes de vos utilisateurs. Un mot de passe temporaire sera envoyé automatiquement à chaque nouvel utilisateur.',
		icon: <UsersIcon />,
	},
	{
		path: 'classes',
		title: 'Classes',
		description:
			'Configurez vos classes en quelques clics. Une fois importées, vous pourrez y assigner vos étudiants et les lier à leurs cours respectifs.',
		icon: <ComponentIcon />,
	},
	{
		path: 'courses',
		title: 'Cours',
		description:
			'Mettez en place vos cours et associez-y directement les professeurs responsables.',
		icon: <BookMarkedIcon />,
	},
]
