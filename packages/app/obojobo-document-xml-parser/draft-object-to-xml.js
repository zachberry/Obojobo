let builder = require('xmlbuilder')
let format = require('xml-formatter')

// import Common from 'obojobo-document-engine/src/scripts/common'

const StyleableText = require('../obojobo-document-engine/src/scripts/common/text/styleable-text')
const StyleableTextRenderer = require('../obojobo-document-engine/src/scripts/common/text/styleable-text-renderer')
const TextGroup = require('../obojobo-document-engine/src/scripts/common/text-group/text-group')

// const createXMLNode = (xml, o) => {
// 	if(o.id && o.type) {
// 		return createXMLOboNode(xml, o)
// 	}
// 	else if(o.textGroup) {

// 	}
// }

const createTextGroupItem = (node, o) => {
	console.log(o)
	const t = node.ele('t', {}, o.text.value)
}

const createTextGroup = (node, o) => {
	const tg = node.ele('textGroup')
	console.log(o)
	throw 'u'
	//@TODO - special case for textGroup textGroup
	if (o.textGroup) return
	o.forEach(t => {
		createTextGroupItem(tg, t)
	})
}

const createContentEle = (node, attrName, o) => {
	// console.log('cce', attrName, o)
	switch (attrName) {
		case 'textGroup':
			return createTextGroup(node, o)
	}

	return builder.create('void')
}

const createXML = (xml, o) => {
	//@TODO
	if (!o.id || !o.type) return xml

	const node = xml.ele(o.type, { id: o.id })

	Object.keys(o.content).forEach(keyName => {
		// console.log('keyName', keyName)
		const contentItem = o.content[keyName]

		if (typeof contentItem !== 'object') {
			node.att(keyName, o.content[keyName])
		} else {
			createContentEle(node, keyName, o.content[keyName])
		}
	})

	o.children.forEach(child => {
		createXML(node, child)
	})
}

// const convert = o => {
// 	if (o.type) {
// 		o['@type'] = o.type
// 		delete o.type
// 	}

// 	Object.keys(o.content).forEach(keyName => {
// 		const contentItem = o.content[keyName]

// 		if (typeof contentItem === 'string') {
// 			o[keyName] = o.content[keyName]
// 		} else {
// 			//node.ele(createContentEle(keyName, o.content[keyName]))
// 		}
// 	})

// 	o.children.forEach(c => {
// 		o[c]
// 	})

// 	// return o
// }

module.exports = json => {
	// console.log('converting', json, typeof json)

	const o = JSON.parse(json)

	const root = builder.create('ObojoboDraftDoc')
	// convert(o)
	// console.log(o)
	// const root = builder.create(o)
	// return format(root.toString())

	createXML(root, o)

	// const root = xml.ele('ObojoboDraftDoc')

	const xml = root.toString()
	const formattedXML = format(xml)

	return formattedXML
}
