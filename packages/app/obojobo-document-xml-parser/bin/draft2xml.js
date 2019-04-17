let fs = require('fs')
let argv = require('minimist')(process.argv.slice(2))

let draftObjectToXML = require('../draft-object-to-xml')

// if (process.argv.length <= 2 || argv._.length === 0) {
// 	console.error('Usage: draft2xml.js json-file.json [--spaces=N] [--generate-ids]')
// 	return process.exit(1)
// }

fs.readFile(argv._[0], (err, data) => {
	let o = draftObjectToXML(data.toString(), argv['generate-ids'] === true)
	// console.log(JSON.stringify(o, null, argv['spaces']))
	console.log(o)
})
