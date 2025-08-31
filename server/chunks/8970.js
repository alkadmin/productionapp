"use strict";
exports.id = 8970;
exports.ids = [8970];
exports.modules = {

/***/ 8970:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "B": () => (/* binding */ getConnection),
/* harmony export */   "x": () => (/* binding */ closeConnection)
/* harmony export */ });
/* harmony import */ var _sap_hana_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2595);
/* harmony import */ var _sap_hana_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_sap_hana_client__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5142);
/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(dotenv__WEBPACK_IMPORTED_MODULE_1__);


dotenv__WEBPACK_IMPORTED_MODULE_1___default().config();
const hanaConfig = {
    serverNode: process.env.HANA_SERVER,
    uid: process.env.HANA_USER,
    pwd: process.env.HANA_PASSWORD
};
console.log(hanaConfig);
async function getConnection() {
    const conn = _sap_hana_client__WEBPACK_IMPORTED_MODULE_0___default().createConnection();
    try {
        await new Promise((resolve, reject)=>{
            conn.connect(hanaConfig, (err)=>{
                if (err) {
                    console.error("Connection error", err);
                    reject(new Error("Connection error: " + err.message));
                } else {
                    resolve();
                }
            });
        });
        console.log("Connected to SAP HANA");
        // Seleccionar la base de datos específica
        await new Promise((resolve, reject)=>{
            conn.exec(`SET SCHEMA ${process.env.HANA_SCHEMA}`, (err)=>{
                if (err) {
                    console.error("Error selecting database:", err);
                    reject(new Error("Error selecting database: " + err.message));
                } else {
                    console.log(`Database ${process.env.HANA_SCHEMA} selected`);
                    resolve();
                }
            });
        });
        return conn;
    } catch (error) {
        console.error("Error connecting to SAP HANA:", error);
        throw error;
    }
}
async function closeConnection(conn) {
    try {
        await new Promise((resolve, reject)=>{
            conn.disconnect((err)=>{
                if (err) {
                    console.error("Error disconnecting from SAP HANA:", err);
                    reject(new Error("Error disconnecting from SAP HANA: " + err.message));
                } else {
                    console.log("Disconnected from SAP HANA");
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error("Error disconnecting from SAP HANA:", error);
        throw error;
    }
}


/***/ })

};
;