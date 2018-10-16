const Adapter = {
	construct(model) {
		model.setStateProp('start', null)
		model.setStateProp('theme', null)
	},

	clone(model, clone) {
		clone.modelState.start = model.modelState.start
		clone.modelState.theme = model.modelState.theme
	},

	toJSON(model, json) {
		json.content.start = model.modelState.start
		json.content.theme = model.modelState.theme
	}
}

export default Adapter
