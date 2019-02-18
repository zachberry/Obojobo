import React from 'react'
import _ from 'underscore'
import renderer from 'react-test-renderer'
import { shallow, mount } from 'enzyme'

jest.mock('obojobo-document-engine/src/scripts/viewer/util/assessment-util')
jest.mock('./components/pre-test')
jest.mock('./components/test')
jest.mock('./components/post-test')
jest.mock('obojobo-document-engine/src/scripts/viewer/util/nav-util')
jest.mock('obojobo-document-engine/src/scripts/common/flux/dispatcher')
jest.mock('obojobo-document-engine/src/scripts/common/util/modal-util')

import Assessment from './viewer-component'
import OboModel from 'obojobo-document-engine/src/scripts/common/models/obo-model'
import AssessmentUtil from 'obojobo-document-engine/src/scripts/viewer/util/assessment-util'
import NavUtil from 'obojobo-document-engine/src/scripts/viewer/util/nav-util'
import ModalUtil from 'obojobo-document-engine/src/scripts/common/util/modal-util'
import Dispatcher from 'obojobo-document-engine/src/scripts/common/flux/dispatcher'

require('./viewer') // used to register this oboModel
require('obojobo-pages-page/viewer')
require('obojobo-chunks-text/viewer')
require('obojobo-chunks-question-bank/viewer')

const assessmentJSON = {
	id: 'assessment',
	type: 'ObojoboDraft.Sections.Assessment',
	content: {
		attempts: 3
	},
	children: [
		{
			id: 'page',
			type: 'ObojoboDraft.Pages.Page',
			children: [
				{
					id: 'child',
					type: 'ObojoboDraft.Chunks.Text',
					content: {
						textGroup: [
							{
								text: {
									value:
										'You have {{assessment:attemptsRemaining}} attempts remaining out of {{assessment:attemptsAmount}}.'
								}
							}
						]
					}
				}
			]
		},
		{
			id: 'QuestionBank',
			type: 'ObojoboDraft.Chunks.QuestionBank'
		}
	]
}

describe('Assessment', () => {
	beforeAll(() => {
		_.shuffle = a => a
	})

	beforeEach(() => {
		jest.resetAllMocks()
	})

	test('Assessment component', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		AssessmentUtil.getAssessmentForModel.mockReturnValue(null)

		const component = renderer.create(<Assessment model={model} moduleData={moduleData} />)
		const tree = component.toJSON()

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(tree).toMatchSnapshot()
	})

	test('Assessment component in pre-test stage', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		AssessmentUtil.getAssessmentForModel.mockReturnValue({
			current: null,
			attempts: []
		})

		const component = renderer.create(<Assessment model={model} moduleData={moduleData} />)
		const tree = component.toJSON()

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(tree).toMatchSnapshot()
	})

	test('Assessment component in test stage', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce({ current: true })
		AssessmentUtil.isCurrentAttemptComplete.mockReturnValueOnce(false)

		const component = renderer.create(<Assessment model={model} moduleData={moduleData} />)
		const tree = component.toJSON()

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(AssessmentUtil.isCurrentAttemptComplete).toHaveBeenCalledWith(
			'mockAssessmentState',
			'mockQuestionState',
			model,
			'mockContext'
		)
		expect(tree).toMatchSnapshot()
	})

	test('Assessment component in post-test stage', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce({
			current: null,
			attempts: [{}]
		})

		const component = renderer.create(<Assessment model={model} moduleData={moduleData} />)
		const tree = component.toJSON()

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(tree).toMatchSnapshot()
	})

	test('Assessment component in post-test stage with score actions', () => {
		const model = OboModel.create(assessmentJSON)
		model.modelState.scoreActions = {
			getActionForScore: jest.fn().mockReturnValueOnce({})
		}
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce({
			current: null,
			attempts: [{}]
		})

		const component = renderer.create(<Assessment model={model} moduleData={moduleData} />)
		const tree = component.toJSON()

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(tree).toMatchSnapshot()
	})

	test('getCurrentStep returns pre-test with no assessment', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		// null means pre-test
		AssessmentUtil.getAssessmentForModel.mockReturnValue(null)
		const component = shallow(<Assessment model={model} moduleData={moduleData} />)
		const instance = component.instance()
		const stage = instance.getCurrentStep(instance.props)

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(stage).toEqual('pre-test')
	})

	test('getCurrentStep returns test when assignment is current', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {},
			navState: {}
		}

		// current not null means test
		AssessmentUtil.getAssessmentForModel.mockReturnValue({ current: 'yes' })
		AssessmentUtil.isCurrentAttemptComplete.mockReturnValue(true)
		const component = shallow(<Assessment model={model} moduleData={moduleData} />)
		const instance = component.instance()
		const stage = instance.getCurrentStep(instance.props)

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(stage).toEqual('test')
	})

	test('getCurrentStep returns post-test when assignment has attempts', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {},
			navState: {}
		}

		// post-test means assessment.attempts.length > 0
		AssessmentUtil.getAssessmentForModel.mockReturnValue({
			attempts: ['something'],
			current: null
		})
		const component = shallow(<Assessment model={model} moduleData={moduleData} />)
		const instance = component.instance()
		const stage = instance.getCurrentStep(instance.props)

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(stage).toEqual('post-test')
	})

	test('this.curStep is updated and Dispatcher viewer:scrollToTop is called in componentDidUpdate', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {},
			navState: {}
		}

		// pre-test
		// constructor
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		// render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		// test
		// render after componentDidUpdate
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce({ current: 'yes' })
		const component = shallow(<Assessment model={model} moduleData={moduleData} />)
		const instance = component.instance()
		const stage = instance.getCurrentStep(instance.props)
		component.setProps({ model, moduleData })

		expect(Dispatcher.trigger).toHaveBeenCalledWith('viewer:scrollToTop')
	})

	test('getCurrentStep returns pre-test when assignment has no attempts', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce({
			current: null,
			attempts: []
		})

		const instance = component.instance()
		const stage = instance.getCurrentStep(instance.props)

		expect(AssessmentUtil.getAssessmentForModel).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(stage).toEqual('pre-test')
	})

	test('componentWillUnmount calls dispatcher and NavUtil', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = mount(<Assessment model={model} moduleData={moduleData} />)
		component.unmount()

		expect(NavUtil.setContext).toHaveBeenCalledWith('practice')
		expect(Dispatcher.off).toHaveBeenCalledWith('assessment:endAttempt', expect.any(Function))
		expect(Dispatcher.off).toHaveBeenCalledWith('assessment:attemptEnded', expect.any(Function))
	})

	test('onEndAttempt alters the state', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		expect(component.instance().state.isFetching).toEqual(false)
		component.instance().onEndAttempt()
		expect(component.instance().state.isFetching).toEqual(true)
	})

	test('onAttemptEnded alters the state', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		expect(component.instance().state.isFetching).toEqual(false)
		component.instance().onEndAttempt()
		expect(component.instance().state.isFetching).toEqual(true)
		component.instance().onAttemptEnded()
		expect(component.instance().state.isFetching).toEqual(false)
	})

	test('isAttemptComplete calls AssessmentUtil', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		AssessmentUtil.isCurrentAttemptComplete.mockReturnValueOnce('mockComplete')

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		const complete = component.instance().isAttemptComplete()

		expect(AssessmentUtil.isCurrentAttemptComplete).toHaveBeenCalledWith(
			'mockAssessmentState',
			'mockQuestionState',
			model,
			'mockContext'
		)
		expect(complete).toEqual('mockComplete')
	})

	test('isAssessmentComplete calls AssessmentUtil', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		AssessmentUtil.hasAttemptsRemaining.mockReturnValueOnce(false)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		const complete = component.instance().isAssessmentComplete()

		expect(AssessmentUtil.hasAttemptsRemaining).toHaveBeenCalledWith('mockAssessmentState', model)
		expect(complete).toEqual(true)
	})

	test('onClickSubmit cant be clicked multiple times', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		AssessmentUtil.isCurrentAttemptComplete.mockReturnValueOnce(false)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		// set button to have already been clicked
		component.instance().state.isFetching = true

		component.instance().onClickSubmit()

		expect(AssessmentUtil.endAttempt).not.toHaveBeenCalled()
		expect(ModalUtil.show).not.toHaveBeenCalled()
	})

	test('onClickSubmit displays a Modal if attempt is not complete', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		// Attempt is not complete
		AssessmentUtil.isCurrentAttemptComplete.mockReturnValueOnce(false)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		component.instance().onClickSubmit()

		expect(AssessmentUtil.endAttempt).not.toHaveBeenCalled()
		expect(ModalUtil.show).toHaveBeenCalled()
	})

	test('onClickSubmit calls endAttempt', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		// Attempt is complete
		AssessmentUtil.isCurrentAttemptComplete.mockReturnValueOnce(true)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		component.instance().onClickSubmit()

		expect(AssessmentUtil.endAttempt).toHaveBeenCalled()
		expect(ModalUtil.show).not.toHaveBeenCalled()
	})

	test('endAttempt calls AssessmentUtil', () => {
		const model = OboModel.create(assessmentJSON)
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)
		// Attempt is complete
		AssessmentUtil.isCurrentAttemptComplete.mockReturnValueOnce(true)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		component.instance().endAttempt()

		expect(AssessmentUtil.endAttempt).toHaveBeenCalled()
	})

	test('exitAssessment calls NavUtil and goes to location', () => {
		const model = OboModel.create(assessmentJSON)
		model.modelState.scoreActions = {
			getActionForScore: jest.fn().mockReturnValueOnce({ action: {} })
		}
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		component.instance().exitAssessment()

		expect(NavUtil.goto).toHaveBeenCalled()
	})

	test('exitAssessment calls NavUtil and goes to next', () => {
		const model = OboModel.create(assessmentJSON)
		model.modelState.scoreActions = {
			getActionForScore: jest.fn().mockReturnValueOnce({
				action: { value: '_next' }
			})
		}
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		component.instance().exitAssessment()

		expect(NavUtil.goNext).toHaveBeenCalled()
	})

	test('exitAssessment calls NavUtil and goes to next', () => {
		const model = OboModel.create(assessmentJSON)
		model.modelState.scoreActions = {
			getActionForScore: jest.fn().mockReturnValueOnce({
				action: { value: '_prev' }
			})
		}
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		component.instance().exitAssessment()

		expect(NavUtil.goPrev).toHaveBeenCalled()
	})

	test('getScoreAction calls AssessmentUtil and returns default', () => {
		const model = OboModel.create(assessmentJSON)
		model.modelState.scoreActions = {
			getActionForScore: jest.fn().mockReturnValueOnce(null)
		}
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		const action = component.instance().getScoreAction()

		expect(AssessmentUtil.getAssessmentScoreForModel).toHaveBeenCalledWith(
			'mockAssessmentState',
			model
		)
		expect(action).toEqual({
			from: 0,
			to: 100,
			message: '',
			action: {
				type: 'unlock',
				value: '_next'
			}
		})
	})

	test('getScoreAction calls AssessmentUtil and returns custom', () => {
		const model = OboModel.create(assessmentJSON)
		model.modelState.scoreActions = {
			getActionForScore: jest.fn().mockReturnValueOnce('mockAction')
		}
		const moduleData = {
			assessmentState: 'mockAssessmentState',
			questionState: 'mockQuestionState',
			navState: {
				context: 'mockContext'
			},
			focusState: {}
		}

		// mock for render
		AssessmentUtil.getAssessmentForModel.mockReturnValueOnce(null)

		const component = shallow(<Assessment model={model} moduleData={moduleData} />)

		const action = component.instance().getScoreAction()

		expect(AssessmentUtil.getAssessmentScoreForModel).toHaveBeenCalledWith(
			'mockAssessmentState',
			model
		)
		expect(action).toEqual('mockAction')
	})
})
