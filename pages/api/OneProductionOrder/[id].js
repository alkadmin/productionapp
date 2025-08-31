// pages/api/OneProductionOrder/[id].js
import { getConnection, closeConnection } from '../../../dataBase/dbConnection';

export default async function handler(req, res) {
  const { id } = req.query;

  const conn = await getConnection();
  if (!conn) {
    res.status(500).json({ error: 'Connection to the database failed' });
    return;
  }

  try {
    const query = `CALL CTS_ARTESANO_PROD_GET_PRODUCTION_ORDER_BY_DOCENTRY_UPDATED(${id})`;
    conn.exec(query, (err, result) => {
      if (err) {
        console.error('Database query error', err);
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
      closeConnection(conn);
    });
  } catch (error) {
    console.error('Database error', error);
    res.status(500).json({ error: error.message });
    closeConnection(conn);
  }
}
