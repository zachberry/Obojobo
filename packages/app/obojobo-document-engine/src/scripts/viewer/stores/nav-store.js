import Common from 'Common'

import NavUtil from '../../viewer/util/nav-util'
import FocusUtil from '../../viewer/util/focus-util'

const { Store } = Common.flux
const { Dispatcher } = Common.flux
const { OboModel } = Common.models

class NavStore extends Store {
	constructor() {
		let item
		let oldNavTargetId
		super('navstore')

		Dispatcher.on(
			{
				'nav:setContext': payload => {
					this.state.context = payload.value.context
					return this.triggerChange()
				},
				'nav:rebuildMenu': payload => {
					this.buildMenu(payload.value.model)
					this.triggerChange()
				},
				'nav:gotoPath': payload => {
					oldNavTargetId = this.state.navTargetId
					if (this.gotoItem(this.state.itemsByPath[payload.value.path])) {
						this.networkAdapter.postEvent({
							draftId: OboModel.getRoot().get('draftId'),
							action: 'nav:gotoPath',
							eventVersion: '1.0.0',
							visitId: this.state.visitId,
							payload: {
								from: oldNavTargetId,
								to: this.state.itemsByPath[payload.value.path].id
							}
						})
					}
				},
				'nav:setFlag': payload => {
					const navItem = this.state.itemsById[payload.value.id]
					navItem.flags[payload.value.flagName] = payload.value.flagValue
					this.triggerChange()
				},
				'nav:prev': () => {
					oldNavTargetId = this.state.navTargetId
					const prev = NavUtil.getPrev(this.state)
					if (this.gotoItem(prev)) {
						this.networkAdapter.postEvent({
							draftId: OboModel.getRoot().get('draftId'),
							action: 'nav:prev',
							eventVersion: '1.0.0',
							visitId: this.state.visitId,
							payload: {
								from: oldNavTargetId,
								to: prev.id
							}
						})
					}
				},
				'nav:next': () => {
					oldNavTargetId = this.state.navTargetId
					const next = NavUtil.getNext(this.state)
					if (this.gotoItem(next)) {
						this.networkAdapter.postEvent({
							draftId: OboModel.getRoot().get('draftId'),
							action: 'nav:next',
							eventVersion: '1.0.0',
							visitId: this.state.visitId,
							payload: {
								from: oldNavTargetId,
								to: next.id
							}
						})
					}
				},
				'nav:goto': payload => {
					oldNavTargetId = this.state.navTargetId
					if (this.gotoItem(this.state.itemsById[payload.value.id])) {
						this.networkAdapter.postEvent({
							draftId: OboModel.getRoot().get('draftId'),
							action: 'nav:goto',
							eventVersion: '1.0.0',
							visitId: this.state.visitId,
							payload: {
								from: oldNavTargetId,
								to: this.state.itemsById[payload.value.id].id
							}
						})
					}
				},
				'nav:lock': () => {
					this.networkAdapter.postEvent({
						draftId: OboModel.getRoot().get('draftId'),
						action: 'nav:lock',
						eventVersion: '1.0.0',
						visitId: this.state.visitId
					})
					this.setAndTrigger({ locked: true })
				},
				'nav:unlock': () => {
					this.networkAdapter.postEvent({
						draftId: OboModel.getRoot().get('draftId'),
						action: 'nav:unlock',
						eventVersion: '1.0.0',
						visitId: this.state.visitId
					})
					this.setAndTrigger({ locked: false })
				},
				'nav:close': () => {
					this.networkAdapter.postEvent({
						draftId: OboModel.getRoot().get('draftId'),
						action: 'nav:close',
						eventVersion: '1.0.0',
						visitId: this.state.visitId
					})
					this.setAndTrigger({ open: false })
				},
				'nav:open': () => {
					this.networkAdapter.postEvent({
						draftId: OboModel.getRoot().get('draftId'),
						action: 'nav:open',
						eventVersion: '1.0.0',
						visitId: this.state.visitId
					})
					this.setAndTrigger({ open: true })
				},
				'nav:toggle': () => {
					const updatedState = { open: !this.state.open }
					this.networkAdapter.postEvent({
						draftId: OboModel.getRoot().get('draftId'),
						action: 'nav:toggle',
						eventVersion: '1.0.0',
						visitId: this.state.visitId,
						payload: updatedState
					})
					this.setAndTrigger(updatedState)
				},
				'nav:openExternalLink': payload => {
					window.open(payload.value.url)
					this.triggerChange()
				},
				'nav:showChildren': payload => {
					item = this.state.itemsById[payload.value.id]
					item.showChildren = true
					this.triggerChange()
				},
				'nav:hideChildren': payload => {
					item = this.state.itemsById[payload.value.id]
					item.showChildren = false
					this.triggerChange()
				},
				'question:scoreSet': payload => {
					const navItem = this.state.itemsById[payload.value.id]
					if (navItem) {
						NavUtil.setFlag(payload.value.id, 'correct', payload.value.score === 100)
					}
				}
			},
			this
		)
	}

	init(networkAdapter, model, startingId, startingPath, visitId, viewState = {}) {
		this.networkAdapter = networkAdapter
		this.state = {
			items: {},
			itemsById: {},
			itemsByPath: {},
			itemsByFullPath: {},
			navTargetHistory: [],
			navTargetId: null,
			locked:
				viewState['nav:isLocked'] !== null && typeof viewState['nav:isLocked'] !== 'undefined'
					? viewState['nav:isLocked'].value
					: false,
			open:
				viewState['nav:isOpen'] !== null && typeof viewState['nav:isOpen'] !== 'undefined'
					? viewState['nav:isOpen'].value
					: true,
			context: 'practice',
			visitId
		}

		this.buildMenu(model)
		NavUtil.gotoPath(startingPath)

		if (startingId !== null && typeof startingId !== 'undefined') {
			NavUtil.goto(startingId)
		} else {
			const first = NavUtil.getFirst(this.state)

			if (first && first.id) NavUtil.goto(first.id)
		}
	}

	buildMenu(model) {
		this.state.itemsById = {}
		this.state.itemsByPath = {}
		this.state.itemsByFullPath = {}
		this.state.items = this.generateNav(model)
	}

	gotoItem(navItem) {
		if (!navItem) {
			return false
		}

		if (this.state.navTargetId !== null && typeof this.state.navTargetId !== 'undefined') {
			if (this.state.navTargetId === navItem.id) {
				return
			}

			const navTargetModel = NavUtil.getNavTargetModel(this.state)
			if (navTargetModel && navTargetModel.processTrigger) {
				navTargetModel.processTrigger('onNavExit')
			}
			this.state.navTargetHistory.push(this.state.navTargetId)
			this.state.itemsById[this.state.navTargetId].showChildren = false
		}

		if (navItem.showChildrenOnNavigation) {
			navItem.showChildren = true
		}

		FocusUtil.clearFadeEffect()
		Dispatcher.trigger('viewer:pushState', { url: navItem.fullFlatPath })
		this.state.navTargetId = navItem.id
		NavUtil.getNavTargetModel(this.state).processTrigger('onNavEnter')
		this.triggerChange()
		return true
	}

	generateNav(model, indent) {
		if (!model) return {}

		if (indent === null || typeof indent === 'undefined') {
			indent = ''
		}
		const item = Common.Registry.getItemForType(model.get('type'))

		let navItem = null
		if (item.getNavItem !== null && typeof item.getNavItem !== 'undefined') {
			navItem = item.getNavItem(model)
		}

		if (navItem === null || typeof navItem === 'undefined') {
			navItem = {}
		}

		navItem = Object.assign(
			{
				type: 'hidden',
				label: '',
				path: '',
				showChildren: true,
				showChildrenOnNavigation: true,
				parent: null
			},
			navItem
		)

		navItem.flags = []
		navItem.children = []
		navItem.id = model.get('id')
		navItem.fullPath = [].concat(navItem.path).filter(item => item !== '')
		navItem.flags = {
			complete: false,
			correct: false
		}

		for (const child of Array.from(model.children.models)) {
			const childNavItem = this.generateNav(child, indent + '_')
			childNavItem.parent = navItem
			navItem.children.push(childNavItem)
			childNavItem.fullPath = navItem.fullPath
				.concat(childNavItem.fullPath)
				.filter(item => item !== '')

			// flatPath = ['view', model.getRoot().get('_id'), childNavItem.fullPath.join('/')].join('/')
			const flatPath = childNavItem.fullPath.join('/')
			childNavItem.flatPath = flatPath
			childNavItem.fullFlatPath = [
				'/view',
				model.getRoot().get('draftId'),
				'visit',
				this.state.visitId,
				flatPath
			].join('/')
			this.state.itemsByPath[flatPath] = childNavItem
			this.state.itemsByFullPath[childNavItem.fullFlatPath] = childNavItem
		}

		this.state.itemsById[model.get('id')] = navItem

		return navItem
	}
}

const navStore = new NavStore()
window.__ns = navStore
export default navStore
