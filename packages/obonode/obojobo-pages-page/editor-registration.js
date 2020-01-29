import React from 'react'

import Node from './editor-component'
import Converter from './converter'

const PAGE_NODE = 'ObojoboDraft.Pages.Page'

const Page = {
	name: PAGE_NODE,
	menuLabel: 'Page',
	isInsertable: false,
	supportsChildren: true,
	helpers: Converter,
	plugins: {
		renderNode(props) {
			return <Node {...props} {...props.attributes} />
		}
	},
	getNavItem(model) {
		let label

		if (model.title) {
			label = '' + model.title
		} else {
			const pages = model.parent.children.models.filter(
				child => child.get('type') === 'ObojoboDraft.Pages.Page'
			)
			label = `Page ${pages.indexOf(model) + 1}`
		}

		return {
			type: 'link',
			label,
			path: [label.toLowerCase().replace(/ /g, '-')],
			showChildren: false
		}
	}
}

export default Page
