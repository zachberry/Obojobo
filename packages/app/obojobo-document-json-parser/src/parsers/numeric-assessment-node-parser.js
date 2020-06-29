const processAttrs = require('../process-attrs')
const processTriggers = require('../process-triggers')

const numericAssessmentNodeParser = (node, childrenParser) => {
	const id = node.id ? ` id="${node.id}"` : ''
	const attrs = processAttrs(node.content, ['triggers', 'actions'])
	const triggersXML = processTriggers(node.content.triggers)

	return (
		`<NumericAssessment${attrs}${id}>` +
		childrenParser(node.children) +
		triggersXML +
		`</NumericAssessment>`
	)
}

module.exports = numericAssessmentNodeParser