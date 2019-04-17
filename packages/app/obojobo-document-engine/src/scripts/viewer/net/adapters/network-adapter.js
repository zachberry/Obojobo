class NetworkAdapter {
	static get NOT_IMPLEMENTED_RESPONSE() {
		return {
			status: 'error',
			value: {
				type: 'not-implemented',
				message: 'Functionality not implemented'
			}
		}
	}

	static getNotImplementedPromise() {
		return Promise.resolve(NetworkAdapter.NOT_IMPLEMENTED_RESPONSE)
	}

	get isOffline() {
		return true
	}

	postEvent() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	getDraft() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	getFullDraft() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	requestStart() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	startAttempt() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	endAttempt() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	resendLTIAssessmentScore() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	clearPreviewScores() {
		return NetworkAdapter.getNotImplementedPromise()
	}

	postDraft() {
		return NetworkAdapter.getNotImplementedPromise()
	}
}

export default NetworkAdapter
