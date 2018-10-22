/* eslint-disable no-undefined */

import React from 'react'
import { shallow, mount } from 'enzyme'
import renderer from 'react-test-renderer'

import ActionButton from '../../../../ObojoboDraft/Chunks/ActionButton/editor'
const BUTTON_NODE = 'ObojoboDraft.Chunks.ActionButton'

describe('ActionButton editor', () => {
	test('requiresValue.nav:goto looks for id', () => {
		const value = '{"id": "mockId"}'
		const checked = ActionButton.helpers.requiresValue['nav:goto'](value)
		expect(checked).toEqual('mockId')
	})
	test('requiresValue.nav:openExternalLink looks for url', () => {
		const value = '{"url": "mockURL"}'
		const checked = ActionButton.helpers.requiresValue['nav:openExternalLink'](value)
		expect(checked).toEqual('mockURL')
	})
	test('assessment:startAttempt looks for id', () => {
		const value = '{"id": "mockId"}'
		const checked = ActionButton.helpers.requiresValue['assessment:startAttempt'](value)
		expect(checked).toEqual('mockId')
	})
	test('requiresValue.assessment:endAttempt looks for id', () => {
		const value = '{"id": "mockId"}'
		const checked = ActionButton.helpers.requiresValue['assessment:endAttempt'](value)
		expect(checked).toEqual('mockId')
	})
	test('requiresValue.js looks for string', () => {
		const value = 'mockJavaScript'
		const checked = ActionButton.helpers.requiresValue['js'](value)
		expect(checked).toEqual(true)
	})
	test('requiresValue.viewer:alert looks for id', () => {
		const value = '{"title": "mockTitle", "message": "mockMessage"}'
		const checked = ActionButton.helpers.requiresValue['viewer:alert'](value)
		expect(checked).toEqual(true)
	})

	test('Node builds the expected component', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			type: BUTTON_NODE,
			data: {
				get: () => {
					return {}
				}
			}
		}
		const component = renderer.create(<Node node={nodeData} />)
		const tree = component.toJSON()

		expect(tree).toMatchSnapshot()
	})

	test('Node builds the expected component when selected', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const component = renderer.create(<Node node={nodeData} isSelected={true} isFocused={true} />)
		const tree = component.toJSON()

		expect(tree).toMatchSnapshot()
	})

	test('Node component with changing label', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const change = {
			setNodeByKey: jest.fn()
		}

		const component = shallow(
			<Node
				node={nodeData}
				isSelected={true}
				isFocused={true}
				editor={{
					value: { change: () => change },
					onChange: jest.fn()
				}}
			/>
		)
		const tree = component.html()

		component
			.find('input')
			.at(0)
			.simulate('click', { stopPropagation: () => true })

		component
			.find('input')
			.at(0)
			.simulate('change', {
				stopPropagation: () => true,
				target: {
					value: 'mockLabel'
				}
			})

		expect(tree).toMatchSnapshot()
		expect(change.setNodeByKey).toHaveBeenCalledWith(undefined, {
			data: {
				content: {
					actions: [
						{
							type: 'mockType',
							value: 'mockValue'
						}
					],
					label: 'mockLabel'
				}
			}
		})
	})

	test('Node component with changing new action type', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const change = {
			setNodeByKey: jest.fn()
		}

		const component = shallow(
			<Node
				node={nodeData}
				isSelected={true}
				isFocused={true}
				editor={{
					value: { change: () => change },
					onChange: jest.fn()
				}}
			/>
		)
		const tree = component.html()

		component
			.find('select')
			.at(0)
			.simulate('click', { stopPropagation: () => true })

		component
			.find('select')
			.at(0)
			.simulate('change', {
				stopPropagation: () => true,
				target: {
					value: 'mockNewType'
				}
			})

		expect(tree).toMatchSnapshot()
	})

	test('Node component with changing new action type', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const change = {
			setNodeByKey: jest.fn()
		}

		const component = shallow(
			<Node
				node={nodeData}
				isSelected={true}
				isFocused={true}
				editor={{
					value: { change: () => change },
					onChange: jest.fn()
				}}
			/>
		)
		const tree = component.html()

		component
			.find('textarea')
			.at(0)
			.simulate('click', { stopPropagation: () => true })

		component
			.find('textarea')
			.at(0)
			.simulate('change', {
				stopPropagation: () => true,
				target: {
					value: 'mockNewType'
				}
			})

		expect(tree).toMatchSnapshot()
	})

	test('Node component adds new action', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const change = {
			setNodeByKey: jest.fn()
		}

		const component = shallow(
			<Node
				node={nodeData}
				isSelected={true}
				isFocused={true}
				editor={{
					value: { change: () => change },
					onChange: jest.fn()
				}}
			/>
		)
		const tree = component.html()

		component
			.find('textarea')
			.at(0)
			.simulate('change', {
				stopPropagation: () => true,
				target: {
					value: '{ "id": "mockId" }'
				}
			})

		component
			.find('button')
			.at(0)
			.simulate('click')

		expect(tree).toMatchSnapshot()
	})

	test('Node component deletes a trigger', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const change = {
			setNodeByKey: jest.fn()
		}

		const component = mount(
			<Node
				node={nodeData}
				isSelected={true}
				isFocused={true}
				editor={{
					value: { change: () => change },
					onChange: jest.fn()
				}}
			/>
		)
		const tree = component.html()

		component
			.find('button')
			.at(0)
			.simulate('click')

		expect(tree).toMatchSnapshot()
	})

	test('Node component fails to add new action', () => {
		const Node = ActionButton.components.Node
		const nodeData = {
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: 'mockValue'
							}
						]
					}
				}
			}
		}
		const change = {
			setNodeByKey: jest.fn()
		}

		const component = shallow(
			<Node
				node={nodeData}
				isSelected={true}
				isFocused={true}
				editor={{
					value: { change: () => change },
					onChange: jest.fn()
				}}
			/>
		)
		const tree = component.html()

		component
			.find('textarea')
			.at(0)
			.simulate('change', {
				stopPropagation: () => true,
				target: {
					value: '{}'
				}
			})

		component
			.find('button')
			.at(0)
			.simulate('click')

		expect(tree).toMatchSnapshot()
	})

	test('insertNode calls change methods', () => {
		const change = {}
		change.insertBlock = jest.fn().mockReturnValueOnce(change)
		change.moveToStartOfNextText = jest.fn().mockReturnValueOnce(change)
		change.focus = jest.fn().mockReturnValueOnce(change)

		ActionButton.helpers.insertNode(change)

		expect(change.insertBlock).toHaveBeenCalled()
		expect(change.moveToStartOfNextText).toHaveBeenCalled()
		expect(change.focus).toHaveBeenCalled()
	})

	test('slateToObo converts a Slate node', () => {
		const slateNode = {
			key: 'mockKey',
			type: 'mockType',
			data: {
				get: () => {
					return {
						actions: [
							{
								type: 'mockType',
								value: ''
							},
							{
								type: 'mockOtherType',
								value: '{"id": "mockId"}'
							}
						]
					}
				}
			}
		}
		const oboNode = ActionButton.helpers.slateToObo(slateNode)

		expect(oboNode).toMatchSnapshot()
	})

	test('oboToSlate converts an OboNode to a Slate node', () => {
		const oboNode = {
			id: 'mockKey',
			type: 'mockType',
			content: { label: 'mockLabel' }
		}
		const slateNode = ActionButton.helpers.oboToSlate(oboNode)

		expect(slateNode).toMatchSnapshot()
	})

	test('oboToSlate converts an OboNode to a Slate node using a textGroup', () => {
		const oboNode = {
			id: 'mockKey',
			type: 'mockType',
			content: { textGroup: [{ text: { value: 'mockLabel' } }] }
		}
		const slateNode = ActionButton.helpers.oboToSlate(oboNode)

		expect(slateNode).toMatchSnapshot()
	})

	test('oboToSlate converts an OboNode to a Slate node with triggers', () => {
		const oboNode = {
			id: 'mockKey',
			type: 'mockType',
			content: {
				label: 'mockLabel',
				triggers: [
					{
						actions: [{ type: 'mockType' }, { type: 'mockOtherType', value: { id: 'mockId' } }]
					}
				]
			}
		}
		const slateNode = ActionButton.helpers.oboToSlate(oboNode)

		expect(slateNode).toMatchSnapshot()
	})

	test('plugins.renderNode renders a button when passed', () => {
		const props = {
			attributes: { dummy: 'dummyData' },
			node: {
				type: BUTTON_NODE,
				data: {
					get: () => {
						return {}
					}
				}
			}
		}

		expect(ActionButton.plugins.renderNode(props)).toMatchSnapshot()
	})
})