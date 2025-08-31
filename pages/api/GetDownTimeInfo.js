import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Missing downtime code' });
  }

  const conn = await getConnection();

  try {
    const query = `CALL CTS_GET_DOWNTIME_INFO(?)`;

    conn.exec(query, [code], async (err, result) => {
      await closeConnection(conn);

      if (err) {
        console.error("❌ Error ejecutando SP:", err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (result && result.length > 0) {
        return res.status(200).json(result[0]);
      } else {
        return res.status(404).json({ message: 'Downtime not found' });
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    await closeConnection(conn);
    return res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
}
