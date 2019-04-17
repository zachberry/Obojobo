import NetworkAdapter from './network-adapter'

class OnlineAdapter extends NetworkAdapter {
	static processJsonResults(res) {
		return Promise.resolve(res.json()).then(json => {
			if (json.status === 'error') {
				console.error(json.value) //eslint-disable-line no-console
			}

			return json
		})
	}

	static get(endpoint) {
		return fetch(endpoint, {
			method: 'GET',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		})
	}

	static post(endpoint, body) {
		if (!body) body = {}

		return fetch(endpoint, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(body),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		})
	}

	get isOffline() {
		return false
	}

	postEvent({ draftId, action, eventVersion, visitId, payload = {} }) {
		return (
			OnlineAdapter.post('/api/events', {
				event: {
					action,
					draft_id: draftId,
					actor_time: new Date().toISOString(),
					event_version: eventVersion,
					visitId,
					payload
				}
			})
				.then(OnlineAdapter.processJsonResults)
				// TODO: Send Caliper event to client host.
				.then(res => {
					if (res && res.status === 'ok' && res.value) {
						parent.postMessage(res.value, '*')
					}

					return res
				})
		)
	}

	getDraft(id) {
		return fetch(`/api/drafts/${id}`).then(OnlineAdapter.processJsonResults)
	}

	getFullDraft(id) {
		return fetch(`/api/drafts/${id}/full`).then(OnlineAdapter.processJsonResults)
	}

	requestStart(visitId, draftId) {
		return OnlineAdapter.post('/api/visits/start', {
			visitId,
			draftId
		}).then(OnlineAdapter.processJsonResults)
	}

	startAttempt({ draftId, assessmentId, visitId }) {
		return OnlineAdapter.post('/api/assessments/attempt/start', {
			draftId,
			assessmentId,
			visitId
		}).then(OnlineAdapter.processJsonResults)
	}

	endAttempt({ attemptId, draftId, visitId }) {
		return OnlineAdapter.post(`/api/assessments/attempt/${attemptId}/end`, {
			draftId,
			visitId
		}).then(OnlineAdapter.processJsonResults)
	}

	resendLTIAssessmentScore({ draftId, assessmentId, visitId }) {
		return OnlineAdapter.post('/api/lti/sendAssessmentScore', {
			draftId,
			assessmentId,
			visitId
		}).then(OnlineAdapter.processJsonResults)
	}

	clearPreviewScores({ draftId, visitId }) {
		return OnlineAdapter.post('/api/assessments/clear-preview-scores', {
			draftId,
			visitId
		}).then(OnlineAdapter.processJsonResults)
	}

	postDraft(id, draftJSON) {
		return OnlineAdapter.post(`/api/drafts/${id}`, draftJSON).then(OnlineAdapter.processJsonResults)
	}
}

export default OnlineAdapter
