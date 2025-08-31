import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  const conn = await getConnection();

  try {
    const query = `CALL CTS_ARTESANO_PROD_GET_SESSION_BY_CODE(?)`;

    conn.prepare(query, (err, statement) => {
      if (err) {
        console.error('❌ Prepare failed:', err);
        closeConnection(conn);
        return res.status(500).json({ error: err.message });
      }

      statement.exec([code], async (err, results) => {
        await closeConnection(conn);
        if (err) {
          console.error('❌ Execution failed:', err);
          return res.status(500).json({ error: err.message });
        }

        const data = results[0] || null;
        return res.status(200).json(data);
      });
    });
  } catch (error) {
    console.error('❌ General error:', error);
    await closeConnection(conn);
    res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
}
