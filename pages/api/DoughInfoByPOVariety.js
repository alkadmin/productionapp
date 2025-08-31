// pages/api/getProductionMixes.js
import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;
  const { id, full, idParent } = req.query;

  // Validar que los parámetros existan
  if (!id || !full || !idParent) {
    return res.status(400).json({ error: 'Missing required parameters (id, full, idParent)' });
  }

  try {
    conn = await getConnection();

    // Crear el query con los parámetros
    const query = `CALL CTS_ARTESANO_PROD_GET_DOUGH_TO_ISSUE_VARIETY(${id}, ${full}, ${idParent})`;

    console.log('Executing query:', query);

    conn.exec(query, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: err.message });
      } else {
        const data = [];
        result.forEach((row) => {
          data.push(row);
        });
        res.status(200).json(data);
      }
      closeConnection(conn);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    if (conn) {
      await closeConnection(conn);
    }
    res.status(500).json({ error: err.message });
  }
}
