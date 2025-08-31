import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;

 
  const { method } = req;
  const {  warehouse } = method === 'GET' ? req.query : req.body;

  try {
    conn = await getConnection( warehouse);

    const query = `call CTS_ARTESANO_PROD_GET_BINLOCATION_BY_WAREHOUSE( ${warehouse})`;
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
