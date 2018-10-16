/* eslint-disable no-console */

global.oboRequire = name => {
	return require(`${__dirname}/${name}`)
}
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const getInstalledModules = require('./obo_get_installed_modules')
const docEngineBasePath = path.join(
	__dirname,
	'..',
	'..',
	'node_modules',
	'obojobo-document-engine',
	'build'
)

module.exports = (env, argv) => {
	const is_production = argv.mode === 'production'
	const filename_with_min = is_production ? '[name].min' : '[name]'
	console.log(`Building assets for ${is_production ? 'production' : 'development'}`)

	return {
		target: 'web',
		devServer: {
			https: true,
			host: '127.0.0.1',
			setup: app => {
				require('./middleware.default')(app)
			},
			publicPath: '/static/',
			contentBase: '/static/',
			watchContentBase: true,
			watchOptions: { ignored: '/node_modules/' },
			stats: { children: false }
		},
		entry: {
			viewer: [
				`${docEngineBasePath}/common.js`,
				`${docEngineBasePath}/common.css`,
				`${docEngineBasePath}/viewer.js`,
				`${docEngineBasePath}/viewer.css`,
				`${docEngineBasePath}/viewer-app.js`
			].concat(getInstalledModules(is_production ? 'production' : 'development').assets),
			'OpenDyslexic-Regular.otf': `${docEngineBasePath}/OpenDyslexic-Regular.otf`,
			'OpenDyslexic-Bold.otf': `${docEngineBasePath}/OpenDyslexic-Bold.otf`,
			'OpenDyslexic-Italic.otf': `${docEngineBasePath}/OpenDyslexic-Italic.otf`,
			'OpenDyslexic-BoldItalic.otf': `${docEngineBasePath}/OpenDyslexic-BoldItalic.otf`,
			'theme.default': `${docEngineBasePath}/theme.default.css`,
			'theme.wacky': `${docEngineBasePath}/theme.wacky.css`,
			'theme.crazy': `${docEngineBasePath}/theme.crazy.css`,
			'theme.dyslexic': `${docEngineBasePath}/theme.dyslexic.css`
		},
		module: {
			rules: [
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/, loader: 'file-loader', options: {
						name: '[name].[ext]'
					} },
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { url: false } }]
				}
			]
		},
		output: {
			path: path.join(__dirname, 'public', 'compiled'),
			filename: `${
				filename_with_min // { test: /\.(woff|woff2|eot|ttf|otf)$/, loader: 'file-loader' } // 'theme.dyslexic': `${docEngineBasePath}/theme.dyslexic.css` // publicPath: '/static',
			}.js`
		},
		plugins: [
			// new WriteFilePlugin({
			// 	useHashIndex: false,
			// 	log: true
			// }),
			// new CopyWebpackPlugin(
			// 	[
			// 		{
			// 			from: `${docEngineBasePath}/*.otf`,
			// 			to: blah
			// 		}
			// 	],
			// 	{ debug: 'debug' }
			// ),
			new MiniCssExtractPlugin({ filename: `${filename_with_min}.css` })
		]
	}
}
