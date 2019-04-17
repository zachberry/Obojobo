import '../../../scss/main.scss'
import './viewer-app.scss'

import AssessmentStore from '../../viewer/stores/assessment-store'
import Common from 'Common'
import FocusStore from '../../viewer/stores/focus-store'
import FocusUtil from '../../viewer/util/focus-util'
import Header from '../../viewer/components/header'
import IdleTimer from 'react-idle-timer'
import InlineNavButton from '../../viewer/components/inline-nav-button'
import MediaStore from '../../viewer/stores/media-store'
import Nav from './nav'
import NavStore from '../../viewer/stores/nav-store'
import NavUtil from '../../viewer/util/nav-util'
import QuestionStore from '../../viewer/stores/question-store'
import React from 'react'
import ReactDOM from 'react-dom'
import getLTIOutcomeServiceHostname from '../../viewer/util/get-lti-outcome-service-hostname'
import getNetworkAdapter from '../../viewer/net/get-network-adapter'

const IDLE_TIMEOUT_DURATION_MS = 600000 // 10 minutes
const NAV_CLOSE_DURATION_MS = 400

const { DOMUtil, focus } = Common.page
const { OboModel } = Common.models
const { Dispatcher } = Common.flux
const { FocusBlocker, ModalContainer } = Common.components
const { SimpleDialog } = Common.components.modal
const { ModalUtil } = Common.util
const { ModalStore } = Common.stores

Dispatcher.on('viewer:alert', payload =>
	ModalUtil.show(
		<SimpleDialog ok title={payload.value.title}>
			{payload.value.message}
		</SimpleDialog>
	)
)

export default class ViewerApp extends React.Component {
	// === REACT LIFECYCLE METHODS ===

	constructor(props) {
		super(props)

		this.navRef = React.createRef()
		this.nextRef = React.createRef()
		this.prevRef = React.createRef()
		this.containerRef = React.createRef()
		this.idleTimerRef = React.createRef()

		Dispatcher.on('viewer:scrollToTop', payload => {
			this.scrollToTop(payload && payload.value ? payload.value.animateScroll : false)
		})
		Dispatcher.on('getTextForVariable', this.getTextForVariable.bind(this))
		Dispatcher.on('viewer:pushState', payload => {
			if (this.state.isOffline) return
			window.history.pushState({}, document.title, payload.url)
		})

		const urlTokens = document.location.pathname.split('/')
		const draftIdFromUrl = urlTokens[2] ? urlTokens[2] : null
		console.log(draftIdFromUrl)

		const state = {
			model: null,
			navState: null,
			mediaState: null,
			questionState: null,
			assessmentState: null,
			modalState: null,
			focusState: null,
			loading: true,
			requestStatus: 'unknown',
			isPreviewing: false,
			isOffline: draftIdFromUrl === null,
			lti: { outcomeServiceHostname: null }
		}
		this.networkAdapter = getNetworkAdapter({ isOffline: draftIdFromUrl === null })
		this.navTargetId = null
		this.onNavStoreChange = () => this.setState({ navState: NavStore.getState() })
		this.onQuestionStoreChange = () => this.setState({ questionState: QuestionStore.getState() })
		this.onAssessmentStoreChange = () =>
			this.setState({
				assessmentState: AssessmentStore.getState()
			})
		this.onModalStoreChange = () =>
			this.setState({
				modalState: ModalStore.getState()
			})
		this.onFocusStoreChange = () =>
			this.setState({
				focusState: FocusStore.getState()
			})
		this.onMediaStoreChange = () =>
			this.setState({
				mediaState: MediaStore.getState()
			})

		this.onIdle = this.onIdle.bind(this)
		this.onReturnFromIdle = this.onReturnFromIdle.bind(this)
		this.onBeforeWindowClose = this.onBeforeWindowClose.bind(this)
		this.onWindowClose = this.onWindowClose.bind(this)
		this.onVisibilityChange = this.onVisibilityChange.bind(this)

		this.state = state

		// === SET UP DATA STORES ===
		NavStore.onChange(this.onNavStoreChange)
		QuestionStore.onChange(this.onQuestionStoreChange)
		AssessmentStore.onChange(this.onAssessmentStoreChange)
		ModalStore.onChange(this.onModalStoreChange)
		FocusStore.onChange(this.onFocusStoreChange)
		MediaStore.onChange(this.onMediaStoreChange)
	}

	componentDidMount() {
		document.addEventListener('visibilitychange', this.onVisibilityChange)

		let visitIdFromApi
		let attemptHistory
		let viewState
		let isPreviewing
		let outcomeServiceURL = 'the external system'

		const urlTokens = document.location.pathname.split('/')
		const visitIdFromUrl = urlTokens[4] ? urlTokens[4] : null
		const draftIdFromUrl = urlTokens[2] ? urlTokens[2] : null

		Dispatcher.trigger('viewer:loading')

		this.networkAdapter
			.requestStart(visitIdFromUrl, draftIdFromUrl)
			.then(visit => {
				QuestionStore.init(this.networkAdapter)
				ModalStore.init(this.networkAdapter)
				FocusStore.init(this.networkAdapter)
				MediaStore.init(this.networkAdapter)

				if (visit.status !== 'ok') throw 'Invalid Visit Id'

				visitIdFromApi = visit.value.visitId
				viewState = visit.value.viewState
				attemptHistory = visit.value.extensions[':ObojoboDraft.Sections.Assessment:attemptHistory']
				isPreviewing = visit.value.isPreviewing
				outcomeServiceURL = visit.value.lti.lisOutcomeServiceUrl

				return this.networkAdapter.getDraft(draftIdFromUrl)
			})
			.then(({ value: draftModel }) => {
				const model = OboModel.create(draftModel)

				NavStore.init(
					this.networkAdapter,
					model,
					model.modelState.start,
					window.location.pathname,
					visitIdFromApi,
					viewState
				)

				//@HACK
				if (this.state.isOffline) {
					NavUtil.close()
					NavUtil.lock()
				}

				AssessmentStore.init(this.networkAdapter, attemptHistory)

				window.onbeforeunload = this.onBeforeWindowClose
				window.onunload = this.onWindowClose
				window.onresize = this.onResize.bind(this)

				this.boundOnDelayResize = this.onDelayResize.bind(this)
				Dispatcher.on('nav:open', this.boundOnDelayResize)
				Dispatcher.on('nav:close', this.boundOnDelayResize)
				Dispatcher.on('nav:toggle', this.boundOnDelayResize)

				this.setState(
					{
						model,
						navState: NavStore.getState(),
						mediaState: MediaStore.getState(),
						questionState: QuestionStore.getState(),
						assessmentState: AssessmentStore.getState(),
						modalState: ModalStore.getState(),
						focusState: FocusStore.getState(),
						lti: Object.assign(this.state.lti, {
							outcomeServiceHostname: getLTIOutcomeServiceHostname(outcomeServiceURL)
						}),
						loading: false,
						requestStatus: 'ok',
						isPreviewing
					},
					() => Dispatcher.trigger('viewer:loaded', true)
				)
			})
			.catch(err => {
				console.error(err) /* eslint-disable-line no-console */
				this.setState({ loading: false, requestStatus: 'invalid' }, () =>
					Dispatcher.trigger('viewer:loaded', false)
				)
			})
	}

	componentWillUnmount() {
		NavStore.offChange(this.onNavStoreChange)
		QuestionStore.offChange(this.onQuestionStoreChange)
		AssessmentStore.offChange(this.onAssessmentStoreChange)
		ModalStore.offChange(this.onModalStoreChange)
		FocusStore.offChange(this.onFocusStoreChange)
		MediaStore.offChange(this.onMediaStoreChange)

		document.removeEventListener('visibilitychange', this.onVisibilityChange)
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !nextState.loading
	}

	isDOMFocusInsideNav() {
		if (!this.navRef.current) {
			return false
		}
		/* eslint-disable-next-line */
		return ReactDOM.findDOMNode(this.navRef.current).contains(document.activeElement)
	}

	isNavTargetChanging(prevState) {
		return NavUtil.getNavTarget(prevState.navState) !== NavUtil.getNavTarget(this.state.navState)
	}

	scrollToTopIfNavTargetChanging(prevState) {
		if (this.isNavTargetChanging(prevState)) {
			this.scrollToTop()
		}
	}

	focusOnContentIfNavTargetChanging(prevState) {
		const focussedItem = FocusUtil.getFocussedItem(this.state.focusState)

		if (
			!this.isDOMFocusInsideNav() &&
			this.isNavTargetChanging(prevState) &&
			focussedItem.type === null
		) {
			FocusUtil.focusOnNavTarget()
		}
	}

	componentDidUpdate(prevProps, prevState) {
		// remove loading element
		if (prevState.loading && !this.state.loading) {
			const loadingEl = document.getElementById('viewer-app-loading')
			if (loadingEl && loadingEl.parentElement) {
				document.getElementById('viewer-app').classList.add('is-loaded')
				loadingEl.parentElement.removeChild(loadingEl)
				this.scrollToTop()
			}
		}

		this.focusOnContentIfNavTargetChanging(prevState)
		this.scrollToTopIfNavTargetChanging(prevState)

		// use Focus Store values to update DOM Focus
		this.updateDOMFocus()
	}

	updateDOMFocus() {
		const focussedItem = FocusUtil.getFocussedItemAndClear(this.state.focusState)

		switch (focussedItem.type) {
			case FocusStore.TYPE_COMPONENT: {
				return this.focusComponent(OboModel.models[focussedItem.target], focussedItem.options)
			}

			case FocusStore.TYPE_NAV_TARGET: {
				return this.focusComponent(
					NavUtil.getNavTargetModel(this.state.navState),
					focussedItem.options
				)
			}

			case FocusStore.TYPE_VIEWER: {
				return this.focusViewer(focussedItem.target)
			}
		}

		return false
	}

	focusViewer(viewerFocusTarget) {
		switch (viewerFocusTarget) {
			case FocusStore.VIEWER_TARGET_NAVIGATION: {
				if (!NavUtil.isNavEnabled(this.state.navState) || !NavUtil.isNavOpen(this.state.navState)) {
					return false
				}

				this.navRef.current.focus()

				return true
			}
		}

		return false
	}

	focusComponent(model, opts) {
		if (!model) return false

		// Save the current scroll location since focus() will scroll the page (there is a
		// preventScroll option but it is not widely supported). Once focus is called we'll
		// quickly reset the scroll location to what it was before the focus. This allows
		// the smooth scroll to move from where the page was rather than scrolling from an
		// unexpected location.
		const currentScrollTop = this.containerRef.current.scrollTop
		const el = model.getDomEl()

		const Component = model.getComponentClass ? model.getComponentClass() : null

		if (Component && Component.focusOnContent) {
			Component.focusOnContent(model, opts)
		} else {
			focus(el)
		}

		if (opts.animateScroll) {
			this.containerRef.current.scrollTop = currentScrollTop
			el.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}

		return true
	}

	onVisibilityChange() {
		if (document.hidden) {
			this.leftEpoch = new Date()

			this.networkAdapter
				.postEvent({
					draftId: this.state.model.get('draftId'),
					action: 'viewer:leave',
					eventVersion: '1.0.0',
					visitId: this.state.navState.visitId
				})
				.then(res => {
					this.leaveEvent = res.value
				})
		} else {
			this.networkAdapter.postEvent({
				draftId: this.state.model.get('draftId'),
				action: 'viewer:return',
				eventVersion: '2.0.0',
				visitId: this.state.navState.visitId,
				payload: {
					relatedEventId: this.leaveEvent.extensions.internalEventId,
					leftTime: this.leftEpoch,
					duration: Date.now() - this.leftEpoch
				}
			})

			delete this.leaveEvent
			delete this.leftEpoch
		}
	}

	getTextForVariable(event, variable, textModel) {
		return (event.text = Common.Registry.getTextForVariable(variable, textModel, this.state))
	}

	scrollToTop(animateScroll = false) {
		if (!this.state.model || !this.state.model.getDomEl || !this.state.model.getDomEl()) {
			return false
		}

		if (animateScroll) {
			this.state.model.getDomEl().scrollIntoView({ behavior: 'smooth', block: 'start' })
		} else {
			this.state.model.getDomEl().scrollIntoView()
		}

		return true
	}

	// === NON REACT LIFECYCLE METHODS ===

	onMouseDown(event) {
		this.clearFadeEffect(event.target)
	}

	onFocus(event) {
		this.clearFadeEffect(event.target)
	}

	clearFadeEffect(el) {
		// When focusing on another element we want to remove
		// the focus effect if the element is not part of the focused element

		const visuallyFocussedModel = FocusUtil.getVisuallyFocussedModel(this.state.focusState)

		if (visuallyFocussedModel) {
			const focussedElement = visuallyFocussedModel.getDomEl()

			if (!focussedElement || !focussedElement.contains(el)) {
				FocusUtil.clearFadeEffect()
			}
		}
	}

	onScroll() {
		const focusState = this.state.focusState

		if (!focusState.visualFocusTarget) {
			return
		}

		const component = FocusUtil.getVisuallyFocussedModel(focusState)
		if (!component) {
			return
		}

		const el = component.getDomEl()
		if (!el) {
			return
		}
		if (!DOMUtil.isElementVisible(el)) {
			return FocusUtil.clearFadeEffect()
		}
	}

	onResize() {
		Dispatcher.trigger(
			'viewer:contentAreaResized',
			/* eslint-disable-next-line */
			ReactDOM.findDOMNode(this.containerRef.current).getBoundingClientRect().width
		)
	}

	onDelayResize() {
		window.setTimeout(this.onResize.bind(this), NAV_CLOSE_DURATION_MS)
	}

	onIdle() {
		this.lastActiveEpoch = new Date(this.idleTimerRef.current.getLastActiveTime())

		this.networkAdapter
			.postEvent({
				draftId: this.state.model.get('draftId'),
				action: 'viewer:inactive',
				eventVersion: '3.0.0',
				visitId: this.state.navState.visitId,
				payload: {
					lastActiveTime: this.lastActiveEpoch,
					inactiveDuration: IDLE_TIMEOUT_DURATION_MS
				}
			})
			.then(res => {
				this.inactiveEvent = res.value
			})
	}

	onReturnFromIdle() {
		this.networkAdapter.postEvent({
			draftId: this.state.model.get('draftId'),
			action: 'viewer:returnFromInactive',
			eventVersion: '2.1.0',
			visitId: this.state.navState.visitId,
			payload: {
				lastActiveTime: this.lastActiveEpoch,
				inactiveDuration: Date.now() - this.lastActiveEpoch,
				relatedEventId: this.inactiveEvent.extensions.internalEventId
			}
		})

		delete this.lastActiveEpoch
		delete this.inactiveEvent
	}

	onBeforeWindowClose() {
		let closePrevented = false
		// calling this function will prevent the window from closing
		const preventClose = () => {
			closePrevented = true
		}

		Dispatcher.trigger('viewer:closeAttempted', preventClose)

		if (closePrevented) {
			return true // Returning true will cause browser to ask user to confirm leaving page
		}

		/* eslint-disable-next-line */
		return undefined // Returning undefined will allow browser to close normally
	}

	onWindowClose() {
		this.networkAdapter.postEvent({
			draftId: this.state.model.get('draftId'),
			action: 'viewer:close',
			eventVersion: '1.0.0',
			visitId: this.state.navState.visitId
		})
	}

	clearPreviewScores() {
		this.networkAdapter
			.clearPreviewScores({
				draftId: this.state.model.get('draftId'),
				visitId: this.state.navState.visitId
			})
			.then(res => {
				if (res.status === 'error' || res.error) {
					return ModalUtil.show(
						<SimpleDialog ok width="15em">
							{res.value && res.value.message
								? `There was an error resetting assessments and questions: ${res.value.message}.`
								: 'There was an error resetting assessments and questions'}
						</SimpleDialog>
					)
				}

				AssessmentStore.init(this.networkAdapter)
				QuestionStore.init(this.networkAdapter)

				AssessmentStore.triggerChange()
				QuestionStore.triggerChange()

				return ModalUtil.show(
					<SimpleDialog ok width="15em">
						Assessment attempts and all question responses have been reset.
					</SimpleDialog>
				)
			})
	}

	unlockNavigation() {
		return NavUtil.unlock()
	}

	render() {
		if (this.state.loading) return null

		if (this.state.requestStatus === 'invalid') {
			return (
				<div className="viewer--viewer-app--visit-error">
					{`There was a problem starting your visit. Please return to ${
						this.state.lti.outcomeServiceHostname
							? this.state.lti.outcomeServiceHostname
							: 'the external system'
					} and relaunch this module.`}
				</div>
			) //`There was a problem starting your visit. Please return to ${outcomeServiceURL} and relaunch this module.`
		}

		let nextComp, nextItem, prevComp, prevItem
		window.__lo = this.state.model
		window.__s = this.state

		const ModuleComponent = this.state.model.getComponentClass()

		const navTargetItem = NavUtil.getNavTarget(this.state.navState)
		let navTargetLabel = ''
		if (navTargetItem && navTargetItem.label) {
			navTargetLabel = navTargetItem.label
		}

		const isNavEnabled = NavUtil.isNavEnabled(this.state.navState)

		const visuallyFocussedModel = FocusUtil.getVisuallyFocussedModel(this.state.focusState)

		if (isNavEnabled) {
			const canNavigate = NavUtil.canNavigate(this.state.navState)

			prevItem = NavUtil.getPrev(this.state.navState)
			if (prevItem) {
				const navText = prevItem.label ? 'Back: ' + prevItem.label : 'Back'
				const navLabel = prevItem.label ? 'Go back to ' + prevItem.label : 'Go back'
				prevComp = (
					<InlineNavButton
						ref={this.prevRef}
						type="prev"
						title={navText}
						ariaLabel={navLabel}
						disabled={!canNavigate}
					/>
				)
			} else {
				prevComp = (
					<InlineNavButton
						ref={this.prevRef}
						type="prev"
						title={`Start of ${this.state.model.title}`}
						ariaLabel={`This is the start of ${this.state.model.title}.`}
						disabled
					/>
				)
			}

			nextItem = NavUtil.getNext(this.state.navState)
			if (nextItem) {
				const navText = nextItem.label ? 'Next: ' + nextItem.label : 'Next'
				const navLabel = nextItem.label ? 'Go forward to ' + nextItem.label : 'Go forward'
				nextComp = (
					<InlineNavButton
						ref={this.nextRef}
						type="next"
						title={navText}
						ariaLabel={navLabel}
						disabled={!canNavigate}
					/>
				)
			} else {
				nextComp = (
					<InlineNavButton
						ref={this.nextRef}
						type="next"
						title={`End of ${this.state.model.title}`}
						ariaLabel={`You have reached the end of ${this.state.model.title}.`}
						disabled
					/>
				)
			}
		}

		const modalItem = ModalUtil.getCurrentModal(this.state.modalState)
		const hideViewer = modalItem && modalItem.hideViewer

		const classNames = [
			'viewer--viewer-app',
			this.state.isPreviewing ? 'is-previewing' : 'is-not-previewing',
			this.state.navState.locked ? 'is-locked-nav' : 'is-unlocked-nav',
			this.state.navState.open ? 'is-open-nav' : 'is-closed-nav',
			this.state.navState.disabled ? 'is-disabled-nav' : 'is-enabled-nav',
			visuallyFocussedModel ? 'is-focus-state-active' : 'is-focus-state-inactive'
		].join(' ')

		return (
			<IdleTimer
				ref={this.idleTimerRef}
				element={window}
				timeout={IDLE_TIMEOUT_DURATION_MS}
				idleAction={this.onIdle}
				activeAction={this.onReturnFromIdle}
			>
				<div
					ref={this.containerRef}
					onMouseDown={this.onMouseDown.bind(this)}
					onFocus={this.onFocus.bind(this)}
					onScroll={this.onScroll.bind(this)}
					className={classNames}
				>
					{hideViewer ? null : (
						<Header moduleTitle={this.state.model.title} location={navTargetLabel} />
					)}
					{hideViewer ? null : <Nav ref={this.navRef} navState={this.state.navState} />}
					{hideViewer ? null : prevComp}
					{hideViewer ? null : <ModuleComponent model={this.state.model} moduleData={this.state} />}
					{hideViewer ? null : nextComp}
					{this.state.isPreviewing ? (
						<div className="preview-banner">
							<span>You are previewing this module</span>
							<div className="controls">
								<span>Preview options:</span>
								<button
									onClick={this.unlockNavigation.bind(this)}
									disabled={!this.state.navState.locked}
								>
									Unlock navigation
								</button>
								<button
									className="button-clear-scores"
									onClick={this.clearPreviewScores.bind(this)}
								>
									Reset assessments &amp; questions
								</button>
							</div>
							<div className="border" />
						</div>
					) : null}
					<FocusBlocker moduleData={this.state} />
					{modalItem && modalItem.component ? (
						<ModalContainer>{modalItem.component}</ModalContainer>
					) : null}
				</div>
			</IdleTimer>
		)
	}
}
