import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET allowed' });
  }

  const { line, shift } = req.query;

  const conn = await getConnection();
  try {
    const query = `CALL CTS_GET_DOWNTIMES_BY_LINE_SHIFT('${line}', '${shift}')`;
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
