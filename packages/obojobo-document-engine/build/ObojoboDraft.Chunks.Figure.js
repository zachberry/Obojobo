/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 289);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = Common;

/***/ }),

/***/ 108:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Common = __webpack_require__(0);

var _Common2 = _interopRequireDefault(_Common);

var _selectionHandler = __webpack_require__(216);

var _selectionHandler2 = _interopRequireDefault(_selectionHandler);

var _adapter = __webpack_require__(214);

var _adapter2 = _interopRequireDefault(_adapter);

var _viewerComponent = __webpack_require__(217);

var _viewerComponent2 = _interopRequireDefault(_viewerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_Common2.default.Store.registerModel('ObojoboDraft.Chunks.Figure', {
	type: 'chunk',
	adapter: _adapter2.default,
	componentClass: _viewerComponent2.default,
	selectionHandler: new _selectionHandler2.default()
});

/***/ }),

/***/ 214:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Common = __webpack_require__(0);

var _Common2 = _interopRequireDefault(_Common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TextGroupAdapter = _Common2.default.chunk.textChunk.TextGroupAdapter;


var Adapter = {
	construct: function construct(model, attrs) {
		TextGroupAdapter.construct(model, attrs);
		model.modelState.textGroup.maxItems = 1;

		if (__guard__(attrs != null ? attrs.content : undefined, function (x) {
			return x.url;
		})) {
			model.modelState.url = attrs.content.url;
		} else {
			model.modelState.url = null;
		}

		if (__guard__(attrs != null ? attrs.content : undefined, function (x1) {
			return x1.size;
		})) {
			model.modelState.size = attrs.content.size;
		} else {
			model.modelState.size = 'small';
		}

		if (__guard__(attrs != null ? attrs.content : undefined, function (x2) {
			return x2.width;
		})) {
			model.modelState.width = attrs.content.width;
		} else {
			model.modelState.width = null;
		}

		if (__guard__(attrs != null ? attrs.content : undefined, function (x3) {
			return x3.height;
		})) {
			model.modelState.height = attrs.content.height;
		} else {
			model.modelState.height = null;
		}

		if (__guard__(attrs != null ? attrs.content : undefined, function (x4) {
			return x4.alt;
		})) {
			model.modelState.alt = attrs.content.alt;
		} else {
			model.modelState.alt = null;
		}
	},
	clone: function clone(model, _clone) {
		TextGroupAdapter.clone(model, _clone);
		_clone.modelState.url = model.modelState.url;
		_clone.modelState.size = model.modelState.size;
		_clone.modelState.width = model.modelState.width;
		_clone.modelState.height = model.modelState.height;
		_clone.modelState.alt = model.modelState.alt;
	},
	toJSON: function toJSON(model, json) {
		TextGroupAdapter.toJSON(model, json);
		json.content.url = model.modelState.url;
		json.content.size = model.modelState.size;
		json.content.width = model.modelState.width;
		json.content.height = model.modelState.height;
		json.content.alt = model.modelState.alt;
	},
	toText: function toText(model) {
		return 'Image: ' + model.modelState.url + '\n Caption: ' + (TextGroupAdapter.toText(model) || model.modelState.alt);
	}
};

exports.default = Adapter;

function __guard__(value, transform) {
	return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}

/***/ }),

/***/ 215:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Common = __webpack_require__(0);

var _Common2 = _interopRequireDefault(_Common);

__webpack_require__(265);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (props) {
	var imgStyles = void 0;
	var data = props.chunk.modelState;

	if (data.url == null) {
		return React.createElement('div', { className: 'img-placeholder' });
	}

	switch (data.size) {
		case 'small':
		case 'medium':
		case 'large':
			return React.createElement('img', { src: data.url, unselectable: 'on', alt: data.alt });
		case 'custom':
			imgStyles = {};

			if (data.width != null) {
				imgStyles.width = data.width + 'px';
			}

			if (data.height != null) {
				imgStyles.height = data.height + 'px';
			}

			return React.createElement('img', { src: data.url, unselectable: 'on', alt: data.alt, style: imgStyles });
	}
};

/***/ }),

/***/ 216:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Common = __webpack_require__(0);

var _Common2 = _interopRequireDefault(_Common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectionHandler = void 0;
var TextGroupSelectionHandler = _Common2.default.chunk.textChunk.TextGroupSelectionHandler;
var FocusableSelectionHandler = _Common2.default.chunk.focusableChunk.FocusableSelectionHandler;
var Chunk = _Common2.default.models.Chunk;

exports.default = SelectionHandler = function (_TextGroupSelectionHa) {
	_inherits(SelectionHandler, _TextGroupSelectionHa);

	function SelectionHandler() {
		_classCallCheck(this, SelectionHandler);

		return _possibleConstructorReturn(this, (SelectionHandler.__proto__ || Object.getPrototypeOf(SelectionHandler)).apply(this, arguments));
	}

	_createClass(SelectionHandler, [{
		key: 'selectStart',
		value: function selectStart(selection, chunk) {
			return FocusableSelectionHandler.prototype.selectStart(selection, chunk);
		}
	}]);

	return SelectionHandler;
}(TextGroupSelectionHandler);

/***/ }),

/***/ 217:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

__webpack_require__(266);

var _image = __webpack_require__(215);

var _image2 = _interopRequireDefault(_image);

var _Common = __webpack_require__(0);

var _Common2 = _interopRequireDefault(_Common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OboComponent = _Common2.default.components.OboComponent;
var TextGroupEl = _Common2.default.chunk.textChunk.TextGroupEl;
var NonEditableChunk = _Common2.default.chunk.NonEditableChunk;

exports.default = function (props) {
	return React.createElement(
		OboComponent,
		{ model: props.model, moduleData: props.moduleData },
		React.createElement(
			NonEditableChunk,
			{
				className: 'obojobo-draft--chunks--figure viewer ' + props.model.modelState.size
			},
			React.createElement(
				'div',
				{ className: 'container' },
				React.createElement(
					'figure',
					{ unselectable: 'on' },
					React.createElement(_image2.default, { chunk: props.model }),
					props.model.modelState.textGroup.first.text.length > 0 ? React.createElement(
						'figcaption',
						null,
						React.createElement(TextGroupEl, {
							parentModel: props.model,
							textItem: props.model.modelState.textGroup.first,
							groupIndex: '0'
						})
					) : null
				)
			)
		)
	);
};

/***/ }),

/***/ 265:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 266:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 289:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(108);


/***/ })

/******/ });