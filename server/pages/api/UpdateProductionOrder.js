"use strict";
(() => {
var exports = {};
exports.id = 3675;
exports.ids = [3675];
exports.modules = {

/***/ 2595:
/***/ ((module) => {

module.exports = require("@sap/hana-client");

/***/ }),

/***/ 5142:
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ 9443:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8970);

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Only POST requests allowed"
        });
    }
    const { docEntry , updateData  } = req.body;
    if (!docEntry || !updateData) {
        return res.status(400).json({
            message: "docEntry and updateData are required"
        });
    }
    try {
        const conn = await (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .getConnection */ .B)();
        // Construir la consulta y los parámetros dinámicamente
        let query = "UPDATE OWOR SET ";
        const params = [];
        const setClauses = [];
        if (updateData.U_CTS_PDate) {
            setClauses.push('"U_CTS_PDate" = ?');
            params.push(updateData.U_CTS_PDate);
        }
        if (updateData.U_CTS_PTime) {
            setClauses.push('"U_CTS_PTime" = ?');
            params.push(updateData.U_CTS_PTime);
        }
        if (updateData.U_CTS_Paused) {
            setClauses.push('"U_CTS_Paused" = ?');
            params.push(updateData.U_CTS_Paused);
        }
        if (updateData.U_CTS_CosumeT) {
            setClauses.push('"U_CTS_CosumeT" = ?');
            params.push(updateData.U_CTS_CosumeT);
        }
        if (setClauses.length === 0) {
            return res.status(400).json({
                message: "No fields to update"
            });
        }
        query += setClauses.join(", ");
        query += ' WHERE "DocEntry" = ?';
        params.push(docEntry);
        await new Promise((resolve, reject)=>{
            conn.prepare(query, (err, statement)=>{
                if (err) {
                    console.error("Prepare error:", err);
                    reject(err);
                } else {
                    statement.exec(params, (err, rows)=>{
                        if (err) {
                            console.error("Execution error:", err);
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                }
            });
        });
        await (0,_dataBase_dbConnection__WEBPACK_IMPORTED_MODULE_0__/* .closeConnection */ .x)(conn);
        res.status(200).json({
            message: "Production order updated successfully"
        });
    } catch (error) {
        console.error("Error updating production order:", error);
        res.status(500).json({
            message: "An unexpected error occurred",
            error: error.message
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
var __webpack_exports__ = __webpack_require__.X(0, [8970], () => (__webpack_exec__(9443)));
module.exports = __webpack_exports__;

})();