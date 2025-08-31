// pages/api/getProductionOrdersByItemGroup.js
import { getConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  const { itemGroup } = req.query;
  const conn = getConnection();
  
  try {
    const query = `CALL CTS_ARTESANO_PROD_GET_PRODUCTION_ORDERS_BY_ITEMGROUP(${itemGroup})`;
    conn.exec(query, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
      conn.disconnect();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
