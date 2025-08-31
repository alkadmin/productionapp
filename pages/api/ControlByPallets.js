import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;
  const { originNum } = req.query;

  if (!originNum) {
    return res.status(400).json({ error: 'Missing originNum parameter' });
  }

  try {
    conn = await getConnection();

    const query = `CALL CTS_ARTESANO_DOUGHT_VALIDATION(${originNum})`;
    conn.exec(query, (err, result) => {
      if (err) {
        console.error('Error executing query', err);
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
    console.error('Unexpected error', err);
    if (conn) {
      await closeConnection(conn);
    }
    res.status(500).json({ error: err.message });
  }
}
