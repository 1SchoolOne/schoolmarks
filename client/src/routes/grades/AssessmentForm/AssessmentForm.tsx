import { useMutation, useQuery } from '@tanstack/react-query'
import { App, Button, Col, Form, Grid, Input, InputNumber, Row, Select, Table } from 'antd'
import { TableRef } from 'antd/es/table'
import classnames from 'classnames'
import { RefObject, useEffect, useRef } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'

import { assessmentsApi, classesApi } from '@api/axios'

import { Assessment } from '@apiClient'

import { FormSection } from '@components'

import { assessmentFormLoader } from '..'

import './AssessmentForm-styles.less'

interface FormValues {
	class: string | undefined
	course: string | undefined
	name: string | undefined
	coef: string | undefined
	maxValue: string | undefined
	description: string | undefined
	studentGrades: StudentGradeFieldValue[]
}

interface StudentGradeFieldValue {
	gradeId: string | undefined
	studentId: number
	studentFullname: string
	value: string
	comment: string
}

// TODO: extract this function if needed
function getScrollX(tableRef: RefObject<TableRef>) {
	if (tableRef?.current) {
		const tableContainer = tableRef.current.nativeElement.parentElement as HTMLElement

		const totalWidth = tableContainer.getBoundingClientRect().width
		const computedStyle = window.getComputedStyle(tableContainer)
		const paddingLeft = parseFloat(computedStyle.getPropertyValue('padding-left'))

		return totalWidth - paddingLeft
	}
}

function getInitialValues(assessment: Assessment | undefined): FormValues {
	const isNew = !assessment

	if (isNew) {
		return {
			class: undefined,
			course: undefined,
			name: undefined,
			coef: '1',
			maxValue: '0',
			description: undefined,
			studentGrades: [],
		}
	}

	const studentGrades: FormValues['studentGrades'] = []

	return {
		class: assessment.class_group.id,
		course: assessment.course.id,
		name: assessment.name,
		coef: assessment.coef,
		maxValue: assessment.max_value,
		description: assessment.description ?? '',
		studentGrades: studentGrades,
	}
}

// TODO: split le formulaire
export function AssessmentForm() {
	const { assessment: assessmentInitialData, classes: classesInitialData } =
		useLoaderData() as Awaited<ReturnType<typeof assessmentFormLoader>>
	const { assessmentId } = useParams()
	const [formInstance] = Form.useForm<FormValues>()
	const watchedValues = Form.useWatch([], formInstance)
	const classIdRef = useRef(assessmentInitialData?.class_group.id)
	const screens = Grid.useBreakpoint()
	const tableRef = useRef<TableRef>(null)
	const navigate = useNavigate()
	const { notification } = App.useApp()

	const isNew = !assessmentInitialData

	const { data: assessment } = useQuery({
		queryKey: ['assessments', assessmentId],
		queryFn: () => assessmentsApi.assessmentsRetrieve(assessmentId!).then(({ data }) => data),
		initialData: assessmentInitialData,
		enabled: assessmentInitialData !== undefined && assessmentId !== undefined,
	})

	const { data: classes } = useQuery({
		queryKey: ['classes'],
		queryFn: () => classesApi.classesList().then(({ data }) => data),
		initialData: classesInitialData,
		enabled: isNew,
	})

	const { data: courses, isLoading: areCoursesLoading } = useQuery({
		queryKey: ['courses', classIdRef.current],
		queryFn: () => classesApi.classesCoursesRetrieve(classIdRef.current!).then(({ data }) => data),
		initialData: isNew ? [] : [assessmentInitialData.course],
		enabled: !!classIdRef.current,
	})

	const { data: students, isLoading: areStudentsLoading } = useQuery({
		queryKey: ['users', classIdRef.current],
		queryFn: () => classesApi.classesStudentsRetrieve(classIdRef.current!).then(({ data }) => data),
		select: (data) => {
			if (isNew) {
				return data.map(
					(st) =>
						({
							studentId: st.id,
							studentFullname: `${st.first_name} ${st.last_name}`,
							gradeId: undefined,
							value: '0',
							comment: '',
						}) as StudentGradeFieldValue,
				)
			}

			return assessment?.student_grades.map(
				(grade) =>
					({
						gradeId: grade.id,
						studentId: grade.student.id,
						studentFullname: `${grade.student.first_name} ${grade.student.last_name}`,
						value: grade.value,
						comment: grade.comment,
					}) as StudentGradeFieldValue,
			)
		},
		initialData: [],
		enabled: !!classIdRef.current,
	})

	const { mutate: createAssessment } = useMutation({
		mutationFn: (values: FormValues) =>
			assessmentsApi.assessmentsCreate({
				class_id: values.class!,
				course_id: values.course!,
				name: values.name!,
				coef: values.coef!,
				max_value: values.maxValue!,
				description: values.description,
				student_grades: values.studentGrades.map(({ studentFullname: _, ...grade }) => ({
					...grade,
					student_id: grade.studentId,
					grade_id: grade.gradeId,
				})),
			}),
		onSuccess: ({ data }) => {
			notification.success({ message: 'Évaluation créée avec succès.' })
			navigate(`/app/grades/edit/${data.id}`)
		},
	})

	const { mutate: updateAssessment } = useMutation({
		mutationFn: (values: FormValues) =>
			assessmentsApi.assessmentsUpdate(assessmentInitialData!.id, {
				class_id: values.class!,
				course_id: values.course!,
				name: values.name!,
				coef: values.coef!,
				max_value: values.maxValue!,
				description: values.description,
				student_grades: values.studentGrades.map(({ studentFullname: _, ...grade }) => ({
					...grade,
					student_id: grade.studentId,
					grade_id: grade.gradeId,
				})),
			}),
		onSuccess: () => {
			notification.success({ message: 'Évaluation modifiée avec succès.' })
			navigate('/app/grades')
		},
	})

	useEffect(() => {
		formInstance.setFieldValue('studentGrades', students)
	}, [students, formInstance])

	const scrollX = getScrollX(tableRef)

	return (
		<Form
			className={classnames('assessment-form', {
				'v-stack': !screens.lg,
				'h-stack': screens.lg,
			})}
			layout="vertical"
			form={formInstance}
			initialValues={getInitialValues(assessment)}
			onFinish={(values) => {
				if (isNew) {
					createAssessment(values)
				} else {
					updateAssessment(values)
				}
			}}
			validateMessages={{
				required: 'Ce champs est requis.',
			}}
		>
			<div className="form-content">
				<FormSection title="Évaluation">
					<Row gutter={[8, 8]}>
						<Col span={24}>
							<Form.Item name="class" label="Classe" rules={[{ required: true }]}>
								<Select
									placeholder="Sélectionner une classe"
									onChange={(value) => {
										classIdRef.current = value
									}}
									options={classes.map((cl) => ({
										label: `${cl.name} (${cl.code})`,
										value: cl.id,
									}))}
									disabled={!isNew}
								/>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name="course" label="Cours" rules={[{ required: true }]}>
								<Select
									placeholder="Sélectionner un cours"
									options={courses.map((course) => ({
										label: `${course.name} (${course.code})`,
										value: course.id,
									}))}
									loading={areCoursesLoading}
									disabled={watchedValues?.class === undefined || !isNew}
								/>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name="name" label="Nom de l'évaluation" rules={[{ required: true }]}>
								<Input disabled={watchedValues?.class === undefined} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="coef" label="Coefficient" rules={[{ required: true }]}>
								<InputNumber
									min="0.5"
									max="100"
									step={0.5}
									parser={(value) => String(value)}
									disabled={watchedValues?.class === undefined}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name="maxValue"
								label="Note maximale"
								dependencies={['studentGrades']}
								rules={[{ required: true }]}
							>
								<InputNumber min={0} step={1} disabled={watchedValues?.class === undefined} />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name="description" label="Description">
								<Input.TextArea
									disabled={watchedValues?.class === undefined}
									autoSize={{ minRows: 2, maxRows: 4 }}
								/>
							</Form.Item>
						</Col>
					</Row>
				</FormSection>
				<FormSection title="Notes">
					<Form.List name="studentGrades">
						{() => (
							<Table
								ref={tableRef}
								dataSource={students}
								rowKey={({ studentId }) => studentId}
								scroll={{
									x: scrollX,
								}}
								columns={[
									{
										dataIndex: 'studentFullname',
										title: 'Étudiant',
										width: 225,
										fixed: 'left',
									},
									{
										dataIndex: 'grade',
										title: 'Note',
										width: 150,
										render: (_, _record, index) => {
											return (
												<Form.Item
													className="student-list-item"
													name={[index, 'value']}
													dependencies={['max_value']}
													rules={[
														{
															validator: (_, value) => {
																const maxValue = formInstance.getFieldValue('maxValue')

																if (value > maxValue) {
																	return Promise.reject(`Doit être entre 0 et ${maxValue}.`)
																}

																return Promise.resolve()
															},
														},
													]}
												>
													<InputNumber min="0" parser={(value) => String(value)} />
												</Form.Item>
											)
										},
									},
									{
										dataIndex: 'comment',
										title: 'Commentaire',
										width: 450,
										render: (_, _record, index) => {
											return (
												<Form.Item className="student-list-item" name={[index, 'comment']}>
													<Input allowClear />
												</Form.Item>
											)
										},
									},
								]}
								loading={areStudentsLoading}
								pagination={false}
							/>
						)}
					</Form.List>
				</FormSection>
			</div>
			<div className="form-footer">
				<Button htmlType="submit" type="primary">
					{isNew ? 'Créer' : 'Enregistrer'}
				</Button>
				<Button onClick={() => navigate('/app/grades')}>Annuler</Button>
			</div>
		</Form>
	)
}
