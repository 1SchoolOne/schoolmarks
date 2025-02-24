import { Button, Col, Form, Row, Select, SelectProps, Space } from 'antd'
import { FormListProps } from 'antd/es/form'
import classnames from 'classnames'
import { MinusCircleIcon, PlusIcon } from 'lucide-react'

import './SelectAddItem-styles.less'

interface SelectAddItemProps extends Omit<FormListProps, 'children'> {
	label: string
	selectProps?: SelectProps
}

/**
 * /!\ Attention: ce composant doit être utilisé dans le contexte d'un
 * formulaire antd.
 */
export function SelectAddItem(props: SelectAddItemProps) {
	const { label, selectProps = {}, ...formListProps } = props
	const formInstance = Form.useFormInstance()

	return (
		<Form.List {...formListProps}>
			{(fields, { add, remove }) => (
				<Space className="select-add-item" direction="vertical" size="middle">
					{fields.map(({ key, ...restField }, index) => (
						<Space key={key} className="select-add-item__item">
							<Row gutter={[4, 4]}>
								<Col span={21}>
									<Form.Item {...restField} label={index === 0 ? label : undefined}>
										<Select {...selectProps} />
									</Form.Item>
								</Col>
								<Col
									span={3}
									className={classnames('select-add-item__item__remove-btn', {
										'select-add-item__item__remove-btn--first': index === 0,
									})}
								>
									<Button
										type="text"
										icon={<MinusCircleIcon size={16} />}
										onClick={() => {
											if (index === 0 && fields.length === 1) {
												formInstance.setFieldValue(formListProps.name, [])
											} else {
												remove(restField.name)
											}
										}}
										title="Retirer l'étudiant"
										danger
									/>
								</Col>
							</Row>
						</Space>
					))}
					<Button type="dashed" icon={<PlusIcon size={16} />} onClick={() => add(undefined)} block>
						Ajouter un étudiant
					</Button>
				</Space>
			)}
		</Form.List>
	)
}
