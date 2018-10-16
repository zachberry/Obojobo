const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const autoprefixer = require('autoprefixer')

const obojoboDraftConfig = {
	entry: {
		common: [path.join(__dirname, 'src', 'scripts', 'common', 'dist.js')]
	},
	output: {
		// must match config.webpack.output_dir
		path: path.join(__dirname, 'build'),
		publicPath: 'build/',
		filename: '[name].js'
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
				loaders: ['babel-loader?presets[]=react&presets[]=env']
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [autoprefixer]
						}
					},
					'sass-loader'
				]
			}
		]
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		backbone: 'Backbone',
		katex: 'katex',
		underscore: '_'
	},
	plugins: [new MiniCssExtractPlugin()]
}

const viewerConfig = {
	entry: {
		viewer: ['whatwg-fetch', path.join(__dirname, 'src', 'scripts', 'viewer', 'dist.js')]
	},
	output: {
		// must match config.webpack.output_dir
		path: path.join(__dirname, 'build'),
		publicPath: 'build/',
		filename: '[name].js'
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
				loaders: ['babel-loader?presets[]=react&presets[]=env']
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [autoprefixer]
						}
					},
					'sass-loader'
				]
			}
		]
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		backbone: 'Backbone',
		katex: 'katex',
		underscore: '_',
		Common: 'Common'
	},
	plugins: [new MiniCssExtractPlugin()]
}

const mainConfig = {
	entry: {
		'viewer-app': ['whatwg-fetch', path.join(__dirname, 'src', 'scripts', 'viewer', 'app.js')],
		'ObojoboDraft.Chunks.ActionButton': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'ActionButton', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Break': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Break', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Code': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Code', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Figure': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Figure', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Heading': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Heading', 'viewer.js')
		],
		'ObojoboDraft.Chunks.HTML': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'HTML', 'viewer.js')
		],
		'ObojoboDraft.Chunks.IFrame': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'IFrame', 'viewer.js')
		],
		'ObojoboDraft.Chunks.List': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'List', 'viewer.js')
		],
		'ObojoboDraft.Chunks.MathEquation': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'MathEquation', 'viewer.js')
		],
		'ObojoboDraft.Chunks.MCAssessment': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'MCAssessment', 'viewer.js')
		],
		'ObojoboDraft.Chunks.MCAssessment.MCChoice': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'MCAssessment', 'MCChoice', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Question': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Question', 'viewer.js')
		],
		'ObojoboDraft.Chunks.QuestionBank': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'QuestionBank', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Table': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Table', 'viewer.js')
		],
		'ObojoboDraft.Chunks.Text': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'Text', 'viewer.js')
		],
		'ObojoboDraft.Chunks.YouTube': [
			path.join(__dirname, 'ObojoboDraft', 'Chunks', 'YouTube', 'viewer.js')
		],
		'ObojoboDraft.Modules.Module': [
			path.join(__dirname, 'ObojoboDraft', 'Modules', 'Module', 'viewer.js')
		],
		'ObojoboDraft.Pages.Page': [path.join(__dirname, 'ObojoboDraft', 'Pages', 'Page', 'viewer.js')],
		'ObojoboDraft.Sections.Assessment': [
			path.join(__dirname, 'ObojoboDraft', 'Sections', 'Assessment', 'viewer.js')
		],
		'ObojoboDraft.Sections.Content': [
			path.join(__dirname, 'ObojoboDraft', 'Sections', 'Content', 'viewer.js')
		]
	},
	output: {
		// must match config.webpack.output_dir
		path: path.join(__dirname, 'build'),
		publicPath: 'build/',
		filename: '[name].js'
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
				loaders: ['babel-loader?presets[]=react&presets[]=env']
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [autoprefixer]
						}
					},
					'sass-loader'
				]
			}
		]
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		backbone: 'Backbone',
		katex: 'katex',
		underscore: '_',
		Common: 'Common',
		Viewer: 'Viewer'
	},
	plugins: [new MiniCssExtractPlugin()],
	resolve: {
		alias: {
			styles: path.join(__dirname, 'src', 'scss')
		}
	}
}








const themesConfig = {
	entry: {
		'theme.default': [path.join(__dirname, 'src', 'scss', 'themes', 'default.scss')],
		'theme.wacky': [path.join(__dirname, 'src', 'scss', 'themes', 'wacky.scss')],
		'theme.crazy': [path.join(__dirname, 'src', 'scss', 'themes', 'crazy.scss')],
		'theme.dyslexic': [path.join(__dirname, 'src', 'scss', 'themes', 'dyslexic.scss')]
	},
	output: {
		path: path.join(__dirname, 'build'),
		// publicPath: 'build/'
	},
	module: {
		rules: [
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [autoprefixer]
						}
					},
					'sass-loader'
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]'
				}
			}
		]
	},
	plugins: [new MiniCssExtractPlugin()]
}

module.exports = [themesConfig, obojoboDraftConfig, viewerConfig, mainConfig]
