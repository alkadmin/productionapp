// /pages/api/produccion/downtime.js
import { getConnection, closeConnection } from '../../../dataBase/dbConnection';
export default async function handler(req, res) {
  let conn;
  const { id, type } = req.query;

  if (!id || !type) return res.status(400).json({ error: 'Missing parameters' });

  try {
    conn = await getConnection();
    const query = `CALL CTS_ARTESANO_PROD_GET_ISSUE_DETAILS_BY_TYPE('${id}', '${type}')`;

    conn.exec(query, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(result);
      closeConnection(conn);
    });
  } catch (err) {
    if (conn) await closeConnection(conn);
    res.status(500).json({ error: err.message });
  }
}
