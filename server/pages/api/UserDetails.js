"use strict";
(() => {
var exports = {};
exports.id = 610;
exports.ids = [610];
exports.modules = {

/***/ 2595:
/***/ ((module) => {

module.exports = require("@sap/hana-client");

/***/ }),

/***/ 5142:
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ 4131:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8970);

async function handler(req, res) {
    let conn;
    const { id  } = req.query;
    if (!id) {
        return res.status(400).json({
            error: "Missing id parameter"
        });
    }
    try {
        conn = await (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .getConnection */ .B)();
        const query = `CALL CTS_ARTESANO_PROD_GET_USERS('${id}')`;
        conn.exec(query, (err, result)=>{
            if (err) {
                console.error("Error executing query", err);
                res.status(500).json({
                    error: err.message
                });
            } else {
                const data = [];
                result.forEach((row)=>{
                    data.push(row);
                });
                res.status(200).json(data);
            }
            (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .closeConnection */ .x)(conn);
        });
    } catch (err) {
        console.error("Unexpected error", err);
        if (conn) {
            await (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .closeConnection */ .x)(conn);
        }
        res.status(500).json({
            error: err.message
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [8970], () => (__webpack_exec__(4131)));
module.exports = __webpack_exports__;

})();