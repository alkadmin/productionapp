(() => {
var exports = {};
exports.id = 6090;
exports.ids = [6090];
exports.modules = {

/***/ 469:
/***/ (() => {

// // pages/api/getAllProductionOrder.js
// import { getConnection } from '../../lib/dbConnection';
// export default async function handler(req, res) {
//   const conn = getConnection();
//   try {
//     const query = 'CALL CTS_ARTESANO_PROD_GET_PRODUCTION_ORDERS()';
//     conn.exec(query, (err, result) => {
//       if (err) {
//         res.status(500).json({ error: err.message });
//       } else {
//         res.status(200).json(result);
//       }
//       conn.disconnect();
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(469));
module.exports = __webpack_exports__;

})();