import ScoreActions from './post-assessment/score-actions'
// @TODO: Importing from the server code, we shouldn't do this:
import AssessmentRubric from '../../../server/assessment-rubric'

let Adapter = {
	construct(model, attrs) {
		// Set state if XML has the attributes.
		if (attrs && attrs.content) {
			let attempts = attrs.content.attempts || 'unlimited'
			model.modelState.attempts = attempts === 'unlimited' ? Infinity : parseInt(attempts, 10)
			model.modelState.review = attrs.content.review || 'never'
			model.modelState.scoreActions = new ScoreActions(attrs.content.scoreActions || null)
			model.modelState.rubric = new AssessmentRubric(attrs.content.rubric || null)
		} else {
			// Default state.
			model.modelState.attempts = Infinity
			model.modelState.review = 'never'
			model.modelState.scoreActions = new ScoreActions()
			model.modelState.rubric = new AssessmentRubric()
		}
	},

	// model.modelState.assessmentState =
	// 	inTest: false
	// 	scores: []
	// 	currentScore: 0

	clone(model, clone) {
		clone.modelState.attempts = model.modelState.attempts
		clone.modelState.scoreActions = model.modelState.scoreActions.clone()
		clone.modelState.rubric = model.modelState.rubric.clone()
	},

	//@TODO - necessary?
	// clone.modelState.assessmentState =
	// 	inTest: model.modelState.assessmentState.inTest
	// 	currentScore: model.modelState.assessmentState.currentScore
	// 	scores: Object.assign [], model.modelState.assessmentState.scores

	toJSON(model, json) {
		json.content.attempts = model.modelState.attempts
		json.content.scoreActions = model.modelState.scoreActions.toObject()
		json.content.rubric = model.modelState.rubric.toObject()
	}
}

export default Adapter
