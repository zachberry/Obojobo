import '../../viewer-component.scss'

import React from 'react'

const Line = props => (
	<span
		className={'text align-' + props.element.content.align}
		data-indent={props.element.content.indent}>
		{props.children}
	</span>
)

export default Line
