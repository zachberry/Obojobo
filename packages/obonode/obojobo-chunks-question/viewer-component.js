import './viewer-component.scss'

import React from 'react'
import { CSSTransition } from 'react-transition-group'

import Common from 'obojobo-document-engine/src/scripts/common'
import Viewer from 'obojobo-document-engine/src/scripts/viewer'
import isOrNot from 'obojobo-document-engine/src/scripts/common/util/isornot'
import { getLabel } from './feedback-labels'

const { OboComponent, OboQuestionComponent } = Viewer.components
const { FocusUtil, QuestionUtil, NavUtil } = Viewer.util
const { Button, Throbber } = Common.components
const { focus } = Common.page
const { QuestionResponseSendStates } = Viewer.stores.questionStore

import QuestionContent from './Content/viewer-component'
import QuestionFooter from './question-footer'
import QuestionExplanation from './question-explanation'
import QuestionOutcome from './question-outcome'

// 0.4s Card "flip" time plus an extra 50ms to handle delay
const DURATION_FLIP_TIME_MS = 450
const ANIMATION_TRANSITION_TIME_MS = 800
// const ANIMATION_TRANSITION_TIME_MS = 3000

const FOCUS_TARGET_EXPLANATION = 'explanation'
const FOCUS_TARGET_RESULTS = 'results'
const FOCUS_TARGET_QUESTION = 'question'

export default class Question extends OboQuestionComponent {
	constructor() {
		super()

		this.state = {
			isFlipping: false
		}

		this.assessmentComponentRef = React.createRef()
		this.resultsRef = React.createRef()

		this.onClickBlocker = this.onClickBlocker.bind(this)
		this.onClickReset = this.onClickReset.bind(this)
		this.onClickReveal = this.onClickReveal.bind(this)
		this.onFormSubmit = this.onFormSubmit.bind(this)
		this.onFormChange = this.onFormChange.bind(this)
		this.onClickShowExplanation = this.onClickShowExplanation.bind(this)
		this.onClickHideExplanation = this.onClickHideExplanation.bind(this)
		this.isShowingExplanation = this.isShowingExplanation.bind(this)
		this.getInstructions = this.getInstructions.bind(this)
	}

	static getQuestionAssessmentModel(questionModel) {
		return questionModel.children.at(questionModel.children.models.length - 1)
	}

	static focusOnContent(model, opts = {}) {
		const el = model.getDomEl()

		if (!el) return false

		const isHidden = el.classList.contains('is-hidden')
		let focusableEl = null

		// If question is hidden then we focus on the button to "flip" the question over.
		// Otherwise, focus on the first thing inside the question:
		if (isHidden) {
			focusableEl = el.querySelector('.blocker-front button')
		} else {
			const firstModel = model.children.at(0)
			if (firstModel) focusableEl = firstModel.getDomEl()
		}

		if (!focusableEl) return false

		focus(focusableEl, opts.scroll)
		return true
	}

	onFormChange(event) {
		if (this.props.isReview) return

		const prevResponse = QuestionUtil.getResponse(
			this.props.moduleData.questionState,
			this.props.model,
			this.props.moduleData.navState.context
		)

		const response = this.assessmentComponentRef.current.handleFormChange(event, prevResponse)

		// const response = this.assessmentComponentRef.current.composeResponse(event, prevResponse)
		QuestionUtil.setResponse(
			this.props.model.get('id'),
			response.state,
			response.targetId,
			this.props.moduleData.navState.context,
			this.props.moduleData.navState.context.split(':')[1],
			this.props.moduleData.navState.context.split(':')[2],
			response.sendResponseImmediately
		)

		this.nextFocus = FOCUS_TARGET_RESULTS
	}

	onFormSubmit(event) {
		event.preventDefault()

		if (this.getMode() !== 'practice') {
			return
		}

		this.submitResponse()

		event.target.reset()
	}

	submitResponse() {
		const model = this.props.model
		const id = model.get('id')
		const modelState = model.modelState
		const context = this.props.moduleData.navState.context
		const isSurvey = modelState.type === 'survey'

		this.scoreResponse()

		if (isSurvey) {
			QuestionUtil.submitResponse(id, context)
		} else {
			QuestionUtil.checkAnswer(id, context)
		}
	}

	scoreResponse() {
		if (this.props.isReview) return

		const model = this.props.model
		const id = model.get('id')
		const modelState = model.modelState
		const context = this.props.moduleData.navState.context
		const isSurvey = modelState.type === 'survey'

		const cacluatedScoreResponse = isSurvey
			? 'no-score'
			: this.assessmentComponentRef.current.calculateScore()
		const detailedText =
			this.assessmentComponentRef.current.getDetails(cacluatedScoreResponse.score) || null

		const feedbackText = getLabel(
			modelState.correctLabels,
			modelState.incorrectLabel,
			cacluatedScoreResponse.score,
			this.props.mode === 'review',
			isSurvey,
			true
		)

		QuestionUtil.setScore(
			id,
			cacluatedScoreResponse.score,
			cacluatedScoreResponse.details,
			feedbackText,
			detailedText,
			context
		)
	}

	onClickReset(event) {
		event.preventDefault()

		this.nextFocus = FOCUS_TARGET_QUESTION

		this.retry()
	}

	onClickReveal(event) {
		event.preventDefault()

		if (
			QuestionUtil.hasUnscoredResponse(
				this.props.moduleData.questionState,
				this.props.model,
				this.props.moduleData.navState.context
			)
		) {
			this.scoreResponse()
		}

		this.reveal()

		this.nextFocus = FOCUS_TARGET_RESULTS
	}

	retry() {
		QuestionUtil.retryQuestion(this.props.model.get('id'), this.props.moduleData.navState.context)
	}

	reveal() {
		QuestionUtil.revealAnswer(this.props.model.get('id'), this.props.moduleData.navState.context)
	}

	onClickBlocker() {
		const context = NavUtil.getContext(this.props.moduleData.navState)

		QuestionUtil.viewQuestion(this.props.model.get('id'), context)

		FocusUtil.focusComponent(this.props.model.get('id'), { fade: context === 'practice' })

		this.applyFlipCSS()
	}

	// Temporarily set the state to 'isFlipping', causing the card to play the flip animation.
	// The flipping state is removed after the flip is completed to be able to remove CSS
	// transforms, which can cause rendering issues.
	applyFlipCSS() {
		this.setState({ isFlipping: true })
		setTimeout(() => this.setState({ isFlipping: false }), DURATION_FLIP_TIME_MS)
	}

	getMode() {
		if (
			QuestionUtil.isAnswerRevealed(
				this.props.moduleData.questionState,
				this.props.model,
				this.props.moduleData.navState.context
			)
		) {
			return 'review'
		}

		const baseContext = this.props.moduleData.navState.context.split(':')[0]

		switch (baseContext) {
			case 'practice':
				return 'practice'

			case 'assessment':
				return 'assessment'

			case 'assessmentReview':
				return 'review'
		}

		return null
	}

	getScore() {
		return QuestionUtil.getScoreForModel(
			this.props.moduleData.questionState,
			this.props.model,
			this.props.moduleData.navState.context
		)
	}

	isShowingExplanationButton() {
		const isAnswerScored = this.getScore() !== null
		const hasSolution = this.props.model.modelState.solution !== null
		const isSurvey = this.props.type === 'survey'

		return isAnswerScored && hasSolution && !isSurvey
	}

	isShowingExplanation() {
		return QuestionUtil.isShowingExplanation(
			this.props.moduleData.questionState,
			this.props.model,
			this.props.moduleData.navState.context
		)
	}

	onClickShowExplanation(event) {
		event.preventDefault()

		this.nextFocus = FOCUS_TARGET_EXPLANATION

		QuestionUtil.showExplanation(this.props.model.get('id'), this.props.moduleData.navState.context)
	}

	hideExplanation() {
		QuestionUtil.hideExplanation(
			this.props.model.get('id'),
			this.props.moduleData.navState.context,
			'user'
		)
	}

	onClickHideExplanation(event) {
		event.preventDefault()

		this.hideExplanation()
	}

	componentDidUpdate() {
		switch (this.nextFocus) {
			case FOCUS_TARGET_EXPLANATION:
				delete this.nextFocus
				this.refExplanation.focusOnExplanation()
				break

			case FOCUS_TARGET_RESULTS:
				if (this.getScore() !== null) {
					delete this.nextFocus
					focus(this.resultsRef.current, false)
				}
				break

			case FOCUS_TARGET_QUESTION:
				delete this.nextFocus
				FocusUtil.focusComponent(this.props.model.get('id'), { scroll: false })

				break
		}
	}

	getFeedbackText(
		questionState,
		model,
		context,
		correctLabels,
		incorrectLabels,
		score,
		isReview,
		isSurvey,
		hasResponse
	) {
		const feedbackText = QuestionUtil.getFeedbackTextForModel(questionState, model, context)
		if (feedbackText) return feedbackText

		return getLabel(correctLabels, incorrectLabels, score, isReview, isSurvey, hasResponse)
	}

	getInstructions() {
		if (!this.assessmentComponentRef || !this.assessmentComponentRef.current) return null
		return this.assessmentComponentRef.current.getInstructions()
	}

	getShouldShowRevealAnswerButton(mode, type, score, revealAnswerMode, questionAssessmentModel) {
		// If we don't have a reference yet to the assessment component then abort
		if (!this.assessmentComponentRef || !this.assessmentComponentRef.current) return false

		// Should never show the Reveal Answer button on survey questions or outside of practice
		if (mode !== 'practice' || type !== 'default') {
			return false
		}

		// If the mode is 'default' then we ask the assessment component what to do:
		if (revealAnswerMode === 'default') {
			revealAnswerMode = this.assessmentComponentRef.current.getRevealAnswerDefault(
				this.props.model,
				questionAssessmentModel
			)
		}

		switch (revealAnswerMode) {
			case 'always':
				// Show when the question is unanswered or incorrect:
				return score !== 100

			case 'when-incorrect':
				// Show when the question has been answered incorrectly:
				return score !== null && score < 100

			case 'never':
			default:
				return false
		}
	}

	renderResponseSendState(responseSendState) {
		switch (responseSendState) {
			case QuestionResponseSendStates.NOT_SENT:
				return <span className="is-response-state-not-sent">&nbsp;</span>

			case QuestionResponseSendStates.SENDING:
				return (
					<span className="is-response-state-sending">
						<Throbber />
					</span>
				)

			case QuestionResponseSendStates.RECORDED:
				return <span className="is-response-state-recorded">Answer Saved</span>

			case QuestionResponseSendStates.ERROR:
				return <span className="is-response-state-error">✖ Error sending response, try again</span>

			case null:
			default:
				return <span className="is-response-state-other">&nbsp;</span>
		}
	}

	render() {
		if (this.props.showContentOnly) {
			return this.renderContentOnly()
		}

		const model = this.props.model
		const context = this.props.moduleData.navState.context
		const questionState = this.props.moduleData.questionState
		const mode = this.getMode()
		const type = model.modelState.type
		const revealAnswer = model.modelState.revealAnswer
		const score = this.getScore()
		const scoreClass = QuestionUtil.getScoreClass(score)
		const response = QuestionUtil.getResponse(
			this.props.moduleData.questionState,
			this.props.model,
			this.props.moduleData.navState.context
		)
		const hasResponse = QuestionUtil.hasResponse(questionState, model, context)
		const isAnswerScored = QuestionUtil.isScored(questionState, model, context)
		const isAnswerRevealed = QuestionUtil.isAnswerRevealed(questionState, model, context)
		const assessment = this.constructor.getQuestionAssessmentModel(model)
		const shouldShowRevealAnswerButton = this.getShouldShowRevealAnswerButton(
			mode,
			type,
			score,
			revealAnswer,
			assessment
		)
		const AssessmentComponent = assessment.getComponentClass()
		const feedbackText = this.getFeedbackText(
			questionState,
			model,
			context,
			model.modelState.correctLabels,
			model.modelState.incorrectLabels,
			score,
			mode === 'review',
			type === 'survey',
			hasResponse
		)
		const detailedText = QuestionUtil.getDetailedTextForModel(questionState, model, context)
		const isShowingExplanationValue = this.isShowingExplanation()
		const isShowingExplanationButtonValue = this.isShowingExplanationButton()
		const isAssessmentQuestion = mode === 'assessment'
		const responseSendState = QuestionUtil.getResponseSendState(questionState, model, context)
		const isResponseSending = responseSendState === QuestionResponseSendStates.SENDING
		const isFormDisabled = isResponseSending && isAssessmentQuestion
		const viewState =
			mode === 'review' ? 'active' : QuestionUtil.getViewState(questionState, model, context)
		const startQuestionAriaLabel =
			mode === 'practice'
				? 'Try Question'
				: 'Start Question ' +
				  (this.props.questionIndex + 1) +
				  ' of ' +
				  this.props.numQuestionsInBank

		const classNames =
			'obojobo-draft--chunks--question' +
			` ${scoreClass}` +
			` is-${viewState}` +
			` is-type-${type}` +
			` is-mode-${mode}` +
			isOrNot(isFormDisabled, 'form-disabled') +
			isOrNot(hasResponse, 'responded-to') +
			isOrNot(this.state.isFlipping, 'flipping')

		return (
			<OboComponent
				model={model}
				moduleData={this.props.moduleData}
				className={classNames}
				role="region"
				aria-label="Question"
				tag="form"
				onChange={this.onFormChange}
				onSubmit={this.onFormSubmit}
			>
				<div className="flipper">
					<div className="content-back">
						<QuestionContent model={model} moduleData={this.props.moduleData} />
						{isAnswerScored ? (
							<div className="for-screen-reader-only" ref={this.resultsRef} tabIndex="-1">
								<QuestionOutcome
									score={score}
									type={type}
									feedbackText={feedbackText}
									detailedText={detailedText}
									isForScreenReader
								/>
							</div>
						) : null}
						<fieldset disabled={isFormDisabled}>
							<legend className="instructions">
								{this.getInstructions(/*responseType, this.props.type*/)}
							</legend>
							<div className="assessment-component">
								<AssessmentComponent
									ref={this.assessmentComponentRef}
									key={assessment.get('id')}
									model={assessment}
									moduleData={this.props.moduleData}
									mode={mode}
									type={type}
									hasResponse={hasResponse}
									score={score}
									scoreClass={scoreClass}
									feedbackText={feedbackText}
									detailedText={detailedText}
									questionModel={this.props.model}
									response={response}
									disabled={isFormDisabled}
								/>
							</div>
						</fieldset>
						{!isAssessmentQuestion ? (
							<QuestionFooter
								score={score}
								hasResponse={hasResponse}
								shouldShowRevealAnswerButton={shouldShowRevealAnswerButton}
								isAnswerRevealed={isAnswerRevealed}
								mode={mode}
								type={type}
								feedbackText={feedbackText}
								detailedText={detailedText}
								onClickReset={this.onClickReset}
								onClickReveal={this.onClickReveal}
							/>
						) : null}
						<CSSTransition
							in={isShowingExplanationButtonValue}
							classNames="explanation"
							timeout={ANIMATION_TRANSITION_TIME_MS}
						>
							{isShowingExplanationButtonValue ? (
								<QuestionExplanation
									ref={component => (this.refExplanation = component)}
									isShowingExplanation={isShowingExplanationValue}
									solutionModel={this.props.model.modelState.solution}
									moduleData={this.props.moduleData}
									animationTransitionTime={ANIMATION_TRANSITION_TIME_MS}
									onClickShowExplanation={this.onClickShowExplanation}
									onClickHideExplanation={this.onClickHideExplanation}
								/>
							) : (
								<span />
							)}
						</CSSTransition>
					</div>
					<div className="blocker-front" key="blocker" onClick={this.onClickBlocker}>
						<Button
							value={mode === 'practice' ? 'Try Question' : 'Start Question'}
							ariaLabel={startQuestionAriaLabel}
							disabled={viewState !== 'hidden'}
						/>
					</div>
				</div>

				{isAssessmentQuestion ? (
					<div className="response-status-container">
						<CSSTransition
							in={responseSendState === QuestionResponseSendStates.NOT_SENT}
							classNames="response-status"
							timeout={ANIMATION_TRANSITION_TIME_MS}
						>
							<span className="is-response-state-not-sent">&nbsp;</span>
						</CSSTransition>

						<CSSTransition
							in={responseSendState === QuestionResponseSendStates.SENDING}
							classNames="response-status"
							timeout={ANIMATION_TRANSITION_TIME_MS}
						>
							<span className="is-response-state-sending">
								<Throbber />
							</span>
						</CSSTransition>

						<CSSTransition
							in={responseSendState === QuestionResponseSendStates.RECORDED}
							classNames="response-status"
							timeout={ANIMATION_TRANSITION_TIME_MS}
						>
							<span className="is-response-state-recorded">Answer Saved</span>
						</CSSTransition>

						<CSSTransition
							in={responseSendState === QuestionResponseSendStates.ERROR}
							classNames="response-status"
							timeout={ANIMATION_TRANSITION_TIME_MS}
						>
							<span className="is-response-state-error">✖ Error sending response</span>
						</CSSTransition>

						<CSSTransition
							in={!responseSendState}
							classNames="response-status"
							timeout={ANIMATION_TRANSITION_TIME_MS}
						>
							<span className="is-response-state-other">&nbsp;</span>
						</CSSTransition>
					</div>
				) : null}
			</OboComponent>
		)
	}

	renderContentOnly() {
		const score = this.getScore()
		const scoreClass = QuestionUtil.getScoreClass(score)
		const hasResponse = QuestionUtil.hasResponse(
			this.props.moduleData.questionState,
			this.props.model,
			this.props.moduleData.navState.context
		)
		const mode = this.getMode()
		const type = this.props.model.modelState.type

		const className =
			'obojobo-draft--chunks--question' +
			` ${scoreClass}` +
			' is-active' +
			` is-mode-${mode}` +
			` is-type-${type}` +
			isOrNot(hasResponse, 'answered')

		return (
			<OboComponent
				model={this.props.model}
				moduleData={this.props.moduleData}
				className={className}
				tabIndex="-1"
				role="region"
				aria-label="Question"
			>
				<div className="flipper">
					<div className="content-back">
						<QuestionContent model={this.props.model} moduleData={this.props.moduleData} />
						<div className="pad responses-hidden">(Responses Hidden)</div>
					</div>
				</div>
			</OboComponent>
		)
	}
}
