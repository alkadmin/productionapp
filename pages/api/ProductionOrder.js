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
