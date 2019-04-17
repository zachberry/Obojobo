import testObject from '../../../../../test-object.json'
import NetworkAdapter from './network-adapter'

class OfflineAdapter extends NetworkAdapter {
	static get OFFLINE_RESPONSE() {
		return {
			status: 'error',
			value: {
				type: 'offline',
				message: 'Functionality not available when offline'
			}
		}
	}

	static getOfflinePromise() {
		return Promise.resolve(OfflineAdapter.OFFLINE_RESPONSE)
	}

	getDraft() {
		const fakeResponse = {
			status: 'ok',
			value: testObject
		}

		return Promise.resolve(fakeResponse)
	}

	requestStart() {
		const fakeStart = {
			status: 'ok',
			value: {
				visitId: '00000000-0000-0000-0000-000000000000',
				isPreviewing: false,
				lti: { lisOutcomeServiceUrl: null },
				viewState: {},
				extensions: { ':ObojoboDraft.Sections.Assessment:attemptHistory': [] }
			}
		}

		return Promise.resolve(fakeStart)
	}

	postEvent() {
		return OfflineAdapter.getOfflinePromise()
	}

	getFullDraft() {
		return OfflineAdapter.getOfflinePromise()
	}

	startAttempt() {
		return OfflineAdapter.getOfflinePromise()
	}

	endAttempt() {
		return OfflineAdapter.getOfflinePromise()
	}

	resendLTIAssessmentScore() {
		return OfflineAdapter.getOfflinePromise()
	}

	clearPreviewScores() {
		return OfflineAdapter.getOfflinePromise()
	}

	postDraft() {
		return OfflineAdapter.getOfflinePromise()
	}
}

export default OfflineAdapter
