"use strict";
(() => {
var exports = {};
exports.id = 8874;
exports.ids = [8874];
exports.modules = {

/***/ 2595:
/***/ ((module) => {

module.exports = require("@sap/hana-client");

/***/ }),

/***/ 5142:
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ 109:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8970);
// pages/api/OneProductionOrder/[id].js

async function handler(req, res) {
    const { id  } = req.query;
    const conn = await (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .getConnection */ .B)();
    if (!conn) {
        res.status(500).json({
            error: "Connection to the database failed"
        });
        return;
    }
    try {
        const query = `CALL CTS_ARTESANO_PROD_GET_PRODUCTION_ORDER_BY_DOCENTRY(${id})`;
        conn.exec(query, (err, result)=>{
            if (err) {
                console.error("Database query error", err);
                res.status(500).json({
                    error: err.message
                });
            } else {
                res.status(200).json(result);
            }
            (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .closeConnection */ .x)(conn);
        });
    } catch (error) {
        console.error("Database error", error);
        res.status(500).json({
            error: error.message
        });
        (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .closeConnection */ .x)(conn);
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [8970], () => (__webpack_exec__(109)));
module.exports = __webpack_exports__;

})();