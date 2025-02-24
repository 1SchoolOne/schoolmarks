import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Col, Form, Modal, Result, Row, Transfer } from 'antd'
import { TransferItem } from 'antd/es/transfer'
import axios, { isAxiosError } from 'axios'
import { useLoaderData, useNavigate, useParams, useRouteError } from 'react-router-dom'

import { API_BASE_URL, AXIOS_DEFAULT_CONFIG } from '@api/axios'
import { getCourseEnrollments } from '@api/courseEnrollments'
import { getCourses } from '@api/courses'
import { PostCourseEnrollmentResponse } from '@apiSchema/courseEnrollments'

import { classCoursesLoader } from '..'
import { ClassAdminTable } from './ClassAdminTable'

interface FormValues {
	courses: string[]
}

interface ArrayDiff<T> {
	added: T[]
	removed: T[]
}

/**
 * Compare deux tableaux et retourne leurs différences. Utilise des Sets pour
 * une recherche efficace lors de la comparaison des éléments.
 *
 * @example const initial = [1, 2, 3]; const updated = [2, 3, 4];
 * getDiff(initial, updated); // { added: [4], removed: [1] }
 *
 * @param initialArray - Le tableau original à comparer
 * @param newArray - Le nouveau tableau à comparer
 * @returns Un objet contenant deux tableaux : les éléments ajoutés et les
 *   éléments supprimés
 */
function getDiff<T>(initialArray: T[], newArray: T[]): ArrayDiff<T> {
	// Conversion des tableaux en Sets pour un temps de recherche en O(1)
	const initialSet = new Set(initialArray)
	const newSet = new Set(newArray)

	// Trouve les éléments qui ont été ajoutés (présents dans le nouveau mais pas dans l'initial)
	// Utilise filter pour maintenir l'ordre des éléments tels qu'ils apparaissent dans newArray
	const added = newArray.filter((item) => !initialSet.has(item))

	// Trouve les éléments qui ont été supprimés (présents dans l'initial mais pas dans le nouveau)
	// Utilise filter pour maintenir l'ordre des éléments tels qu'ils apparaissent dans initialArray
	const removed = initialArray.filter((item) => !newSet.has(item))

	return { added, removed }
}

function EnrollCourses() {
	const initialData = useLoaderData() as Awaited<ReturnType<typeof classCoursesLoader>>
	const [formInstance] = Form.useForm<FormValues>()
	const watchedValues = Form.useWatch('courses', formInstance)
	const navigate = useNavigate()
	const params = useParams()
	const queryClient = useQueryClient()
	const { notification } = App.useApp()

	const { data: courseEnrollments } = useQuery({
		queryKey: ['courses', params.classId],
		queryFn: () => getCourseEnrollments({ class_group: params.classId }),
		initialData: initialData.courseEnrollments,
		enabled: params.classId !== undefined,
	})

	const { data: courses } = useQuery({
		queryKey: ['courses'],
		queryFn: getCourses,
		initialData: initialData.courses,
	})

	// TODO: simplifier la suppression
	const { mutate: updateEnrollments } = useMutation({
		mutationFn: async ({ courses }: FormValues) => {
			const initialValues = courseEnrollments.map((ce) => ce.course!.id!)

			const { added, removed } = getDiff(initialValues, courses)

			const addedResults = await Promise.all(
				added.map((id) =>
					axios.post<PostCourseEnrollmentResponse>(
						`${API_BASE_URL}/course_enrollments/`,
						{
							course_id: id,
							class_group_id: params.classId!,
						},
						AXIOS_DEFAULT_CONFIG,
					),
				),
			)

			const idsToRemove = courseEnrollments
				.filter((c) => removed.includes(c.course!.id!))
				.map((c) => c.id)

			const removedResults = await Promise.all(
				idsToRemove.map((id) =>
					axios.delete(`${API_BASE_URL}/course_enrollments/${id}/`, AXIOS_DEFAULT_CONFIG),
				),
			)

			return { added: addedResults.length, removed: removedResults.length }
		},
		onSuccess: ({ added, removed }) => {
			queryClient.refetchQueries({
				queryKey: ['courses', params.classId],
			})
			notification.success({
				message: 'Affectation des cours',
				description: `Ajouté ${added} / Supprimé ${removed}`,
			})
			navigate('/app/admin/classes')
		},
		onError: (err) => {
			notification.error({ message: 'Erreur', description: err.message })
		},
	})

	const transferItems: TransferItem[] = courses.map((c) => ({
		key: c.id,
		title: c.name,
	}))

	return (
		<>
			<ClassAdminTable />
			<Modal
				title="Affectation des cours"
				open
				onOk={() => formInstance.submit()}
				onCancel={() => navigate('/app/admin/classes')}
				okText="Affecter"
				destroyOnClose
			>
				<Form
					preserve={false}
					form={formInstance}
					layout="vertical"
					initialValues={{
						courses: courseEnrollments.map((ce) => ce.course!.id),
					}}
					onFinish={updateEnrollments}
				>
					<Row gutter={[8, 8]}>
						<Col span={24}>
							<Form.Item name="courses">
								<Transfer
									locale={{
										itemUnit: 'cours',
										itemsUnit: 'cours',
									}}
									targetKeys={watchedValues ?? []}
									dataSource={transferItems}
									render={(item) => item.title!}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	)
}

function ErrorBoundary() {
	const navigate = useNavigate()
	let error = useRouteError()

	if (isAxiosError(error) && (error.status === 403 || error.status === 401)) {
		error = "Vous n'avez pas accès à cette page."
	} else {
		error = 'Veuillez contacter votre administrateur.'
	}

	return (
		<>
			<ClassAdminTable />
			<Modal
				title="Affectation des cours"
				open
				onCancel={() => navigate('/app/admin/classes')}
				onOk={() => navigate(0)}
				okText="Réessayer"
				destroyOnClose
			>
				<Result status="error" title="Une erreur est survenue" subTitle={String(error)} />
			</Modal>
		</>
	)
}

EnrollCourses.ErrorBoundary = ErrorBoundary

export { EnrollCourses }
