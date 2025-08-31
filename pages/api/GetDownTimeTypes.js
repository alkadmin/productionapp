import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET allowed' });
  }

  const conn = await getConnection();
  try {
    const query = `CALL CTS_GET_DOWNTIME_TYPES()`;
    const result = await new Promise((resolve, reject) => {
      conn.exec(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    await closeConnection(conn);
    return res.status(200).json(result);
  } catch (err) {
    await closeConnection(conn);
    return res.status(500).json({ message: 'Error', error: err.message });
  }
}
