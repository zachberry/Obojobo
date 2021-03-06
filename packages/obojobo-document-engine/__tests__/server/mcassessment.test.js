import MCAssessment from '../../server/mcassessment'

const Draft = oboRequire('models/draft')
const DraftNode = oboRequire('models/draft_node')

describe('MCAssessment', () => {
	let rootNode
	let mcAssessment
	const events = { onCalculateScore: 'ObojoboDraft.Chunks.Question:calculateScore' }
	const setScore = jest.fn()

	beforeEach(() => {
		jest.resetAllMocks()
		let getChildNodeByIdMock = id => mcAssessment.children.filter(i => i.node.id === id)[0]

		mcAssessment = new MCAssessment({ getChildNodeById: getChildNodeByIdMock }, { id: 'test' })
		mcAssessment.children = [
			new DraftNode({}, { id: 'test', content: { score: 100 } }, {}),
			new DraftNode({}, { id: 'test1', content: { score: 100 } }, {}),
			new DraftNode({}, { id: 'test2', content: { score: 0 } }, {}),
			new DraftNode({}, { id: 'test3', content: { score: 0 } }, {})
		]

		// set up the immediate children
		mcAssessment.children.forEach(c => {
			mcAssessment.immediateChildrenSet.add(c.node.id)
		})
	})

	it('registers for the expected events', () => {
		expect(mcAssessment.registerEvents).toHaveBeenCalled()
		expect(mcAssessment.registerEvents.mock.calls[0]).toMatchSnapshot()
	})

	it("returns if question doesn't contain 'this' node on calulate score", () => {
		let question = { contains: () => false }
		let res = mcAssessment.onCalculateScore({}, question, {}, setScore)
		expect(res).toBe(undefined)
		expect(setScore).not.toHaveBeenCalled()
	})

	it('sets score to 100 on correct answer chosen (pick-one)', () => {
		let question = { contains: () => true }
		const responseRecord = { response: { ids: ['test'] } }
		mcAssessment.node.content = { responseType: 'pick-one' }
		expect(setScore).not.toHaveBeenCalled()
		let res = mcAssessment.onCalculateScore({}, question, responseRecord, setScore)
		expect(setScore).toHaveBeenCalledWith(100)
	})

	it('sets score to 0 on wrong answer chosen (pick-one)', () => {
		let question = { contains: () => true }
		const responseRecord = { response: { ids: ['test3'] } }
		mcAssessment.node.content = { responseType: 'pick-one' }
		expect(setScore).not.toHaveBeenCalled()
		let res = mcAssessment.onCalculateScore({}, question, responseRecord, setScore)
		expect(setScore).toHaveBeenCalledWith(0)
	})

	it('sets score to 0 if number of chosen !== number of correct answers (pick-all)', () => {
		let question = { contains: () => true }
		const responseRecord = { response: { ids: ['test'] } }
		mcAssessment.node.content = { responseType: 'pick-all' }

		expect(setScore).not.toHaveBeenCalled()
		let res = mcAssessment.onCalculateScore({}, question, responseRecord, setScore)
		expect(setScore).toHaveBeenCalledWith(0)
	})

	it('sets score to 0 if any chosen answers are not the correct answer (pick-all)', () => {
		let question = { contains: () => true }
		const responseRecord = { response: { ids: ['test', 'test1', 'test2'] } }
		mcAssessment.node.content = { responseType: 'pick-all' }

		expect(setScore).not.toHaveBeenCalled()
		let res = mcAssessment.onCalculateScore({}, question, responseRecord, setScore)
		expect(setScore).toHaveBeenCalledWith(0)
	})

	it('sets score to 100 on correct answers chosen (pick-all)', () => {
		let question = { contains: () => true }
		const responseRecord = { response: { ids: ['test', 'test1'] } }
		mcAssessment.node.content = { responseType: 'pick-all' }

		expect(setScore).not.toHaveBeenCalled()
		let res = mcAssessment.onCalculateScore({}, question, responseRecord, setScore)
		expect(setScore).toHaveBeenCalledWith(100)
	})

	it('does not require responseType to be specified and will use a default', () => {
		let question = { contains: () => true }
		const responseRecord = { response: { ids: ['test'] } }
		mcAssessment.node.content = {}
		expect(setScore).not.toHaveBeenCalled()
		let res = mcAssessment.onCalculateScore({}, question, responseRecord, setScore)
		expect(setScore).toHaveBeenCalledWith(100)
	})
})
