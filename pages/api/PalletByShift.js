import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;
  const { docentry, shift,line } = req.query;

  if (!docentry || !shift|| !line) {
    return res.status(400).json({ error: 'Missing docentry or shift parameter' });
  }

  try {
    conn = await getConnection();

    const query = `CALL CTS_ARTESANO_PROD_GET_PALLETS_SHIFT_UPDATED_10082024(${docentry}, ${shift},${line})`;
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
