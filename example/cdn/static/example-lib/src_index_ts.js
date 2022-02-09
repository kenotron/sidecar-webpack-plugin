"use strict";
(self["webpackChunkexample_lib"] = self["webpackChunkexample_lib"] || []).push([["src_index_ts"],{

/***/ "./src/ExampleLibComponent.tsx":
/*!*************************************!*\
  !*** ./src/ExampleLibComponent.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ExampleLibComponent": () => (/* binding */ ExampleLibComponent)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const ExampleLibComponent = () => {
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: { backgroundColor: "red" }
  }, "This is a component from the lib with a shared react value of ", (react__WEBPACK_IMPORTED_MODULE_0___default().version));
};


/***/ }),

/***/ "./src/getName.ts":
/*!************************!*\
  !*** ./src/getName.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getName": () => (/* binding */ getName)
/* harmony export */ });
function getName() {
  return "World";
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getName": () => (/* reexport safe */ _getName__WEBPACK_IMPORTED_MODULE_0__.getName),
/* harmony export */   "ExampleLibComponent": () => (/* reexport safe */ _ExampleLibComponent__WEBPACK_IMPORTED_MODULE_1__.ExampleLibComponent)
/* harmony export */ });
/* harmony import */ var _getName__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getName */ "./src/getName.ts");
/* harmony import */ var _ExampleLibComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ExampleLibComponent */ "./src/ExampleLibComponent.tsx");




/***/ })

}]);
//# sourceMappingURL=src_index_ts.js.map