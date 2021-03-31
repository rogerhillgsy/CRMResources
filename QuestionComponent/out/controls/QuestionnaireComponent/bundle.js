var pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad =
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./QuestionnaireComponent/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./QuestionnaireComponent/index.ts":
/*!*****************************************!*\
  !*** ./QuestionnaireComponent/index.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.QuestionnaireComponent = void 0;\n\nvar QuestionnaireComponent =\n/** @class */\nfunction () {\n  function QuestionnaireComponent() {\n    this._columnText = new Array();\n    this._showInputField = false;\n  }\n  /**\r\n   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.\r\n   * Data-set values are not initialized here, use updateView.\r\n   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.\r\n   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.\r\n   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.\r\n   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.\r\n   */\n\n\n  QuestionnaireComponent.prototype.init = function (context, notifyOutputChanged, state, container) {\n    // Save context\n    this._context = context;\n    this._container = container;\n    this._notifyOutputChanged = notifyOutputChanged;\n    this._showInputField = context.parameters.ShowInputField.raw != \"0\"; // this._questionnaireDataSource = new QuestionnaireTestSource();\n    // this._questionnaireDataSource.getQuestionnaireData(\"Test Questionnaire\",context).then( (data) => {\n    // \tthis._questionnaireData = data;\n    // \tthis.displayQuestionnaire()\n    // } )\n\n    this.addIfnotNull(this._columnText, context.parameters.Col1);\n    this.addIfnotNull(this._columnText, context.parameters.Col2);\n    this.addIfnotNull(this._columnText, context.parameters.Col3);\n    this.addIfnotNull(this._columnText, context.parameters.Col4);\n    this.addIfnotNull(this._columnText, context.parameters.Col5);\n    this.displayQuestion();\n  };\n\n  QuestionnaireComponent.prototype.addIfnotNull = function (array, text) {\n    if (!!text && !!text.raw && text.raw.length !== 0 && !!text.raw.trim()) {\n      array.push(text.raw);\n    }\n  };\n\n  QuestionnaireComponent.prototype.displayQuestion = function () {\n    var _this = this;\n\n    var table = document.createElement(\"table\");\n    table.setAttribute(\"class\", \"questionnaireTable\");\n\n    this._container.appendChild(table);\n\n    var headerRow = table.createTHead();\n    headerRow.setAttribute(\"class\", \"questionTableHeaderRow\");\n    var header = document.createElement(\"th\");\n    header.setAttribute(\"class\", \"questionTableHeader\");\n    header.innerHTML = this._context.parameters.Header.raw || \"\";\n    header.colSpan = this._columnText.length + (this._showInputField ? 1 : 0);\n    headerRow.appendChild(header);\n    var row = table.insertRow();\n\n    this._columnText.forEach(function (r) {\n      var col = document.createElement(\"td\");\n      col.setAttribute(\"class\", \"questionTableData\");\n      col.innerHTML = r;\n      row.appendChild(col);\n    });\n\n    if (this._showInputField) {\n      var inputCol = document.createElement(\"td\");\n      inputCol.setAttribute(\"class\", \"questionTableInput\");\n      var growWrap = document.createElement(\"div\");\n      growWrap.setAttribute(\"class\", \"grow-wrap\");\n      inputCol.appendChild(growWrap);\n      this._inputField = document.createElement(\"textarea\");\n\n      this._inputField.setAttribute(\"class\", \"questionTableInput\");\n\n      this._inputField.setAttribute(\"onInput\", \"this.parentNode.dataset.replicatedValue = this.value\");\n\n      var notifyChanged_1 = function notifyChanged_1() {\n        return _this._notifyOutputChanged();\n      };\n\n      this._inputField.addEventListener(\"input\", function () {\n        // @ts-ignore\n        this.parentNode.dataset.replicatedValue = this.value;\n        notifyChanged_1();\n      });\n\n      growWrap.appendChild(this._inputField);\n      row.appendChild(inputCol);\n    }\n  };\n  /**\r\n   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.\r\n   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions\r\n   */\n\n\n  QuestionnaireComponent.prototype.updateView = function (context) {\n    // Add code to update control view\n    this._context = context;\n    this._inputField.value = context.parameters.Question.raw || \"\";\n    debugger;\n\n    if (context.mode.isControlDisabled) {\n      this._inputField.setAttribute(\"disabled\", \"true\");\n    } else {\n      this._inputField.removeAttribute(\"disabled\");\n    } // @ts-ignore\n\n\n    this._inputField.parentNode.dataset.replicatedValue = this._inputField.value;\n  };\n  /**\r\n   * It is called by the framework prior to a control receiving new data.\r\n   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”\r\n   */\n\n\n  QuestionnaireComponent.prototype.getOutputs = function () {\n    var result = {\n      Question: this._inputField.value\n    };\n    return result;\n  };\n  /**\r\n   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.\r\n   * i.e. cancelling any pending remote calls, removing listeners, etc.\r\n   */\n\n\n  QuestionnaireComponent.prototype.destroy = function () {// Add code to cleanup control if necessary\n  };\n\n  return QuestionnaireComponent;\n}();\n\nexports.QuestionnaireComponent = QuestionnaireComponent;\n\n//# sourceURL=webpack://pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad/./QuestionnaireComponent/index.ts?");

/***/ })

/******/ });
if (window.ComponentFramework && window.ComponentFramework.registerControl) {
	ComponentFramework.registerControl('Arup.PCF.QuestionnaireComponent', pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad.QuestionnaireComponent);
} else {
	var Arup = Arup || {};
	Arup.PCF = Arup.PCF || {};
	Arup.PCF.QuestionnaireComponent = pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad.QuestionnaireComponent;
	pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad = undefined;
}