/* eslint-disable no-console */

const path = require('path')
// const xmlParserPath = path.dirname(require.resolve('obojobo-document-xml-parser'))

module.exports =
	// built client files
	(env, argv) => {
		// const commonPath = path.join(
		// 	__dirname,
		// 	'..',
		// 	'obojobo-document-engine',
		// 	'src',
		// 	'scripts',
		// 	'common',
		// 	'dist.js'
		// )

		return {
			entry: {
				xmlParser: [
					// common (to both viewer and editor)
					// commonPath,
					// the application logic
					'./something.js'
				]
			},
			module: {
				rules: [
					{
						test: /\.svg/,
						use: {
							loader: 'svg-url-loader',
							options: {
								stripdeclarations: true,
								iesafe: true
							}
						}
					},
					{
						test: /\.js?$/,
						exclude: '/node_modules',
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-react', '@babel/preset-env']
							}
						}
					}
				]
			},
			output: {
				path: path.join(__dirname, 'xmlParser')
			}
		}
	}
