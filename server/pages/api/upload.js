"use strict";
(() => {
var exports = {};
exports.id = 5039;
exports.ids = [5039];
exports.modules = {

/***/ 1180:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
function handler(req, res) {
    res.status(200).setHeader("Access-Control-Allow-Origin", "*").json({
        name: "Fake Upload Process"
    });
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(1180));
module.exports = __webpack_exports__;

})();