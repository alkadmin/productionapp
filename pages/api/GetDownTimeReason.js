// pages/api/GetDowntimeReasons.js
import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  const { type } = req.query;

  if (!type) {
    return res.status(400).json({ message: 'Missing type parameter' });
  }

  const conn = await getConnection();

  try {
    const query = `CALL CTS_ARTESANO_PROD_GET_REASON_BY_TYPE(?)`;

    conn.prepare(query, (err, statement) => {
      if (err) {
        console.error('❌ Prepare error:', err);
        closeConnection(conn);
        return res.status(500).json({ message: 'Error preparing query', error: err.message });
      }

      statement.exec([type], async (err, results) => {
        await closeConnection(conn);

        if (err) {
          console.error('❌ Execution error:', err);
          return res.status(500).json({ message: 'Error executing query', error: err.message });
        }

        const data = results.map(r => ({
          Type: r.U_CTS_Type,
          SubType: r.U_CTS_SubType,
          Name: r.U_CTS_Name
        }));

        return res.status(200).json(data);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
    await closeConnection(conn);
    return res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
}
