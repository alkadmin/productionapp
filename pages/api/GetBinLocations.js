import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;

  // Obtener el almacén del query o del body
  const { warehouse } = req.query;

  if (!warehouse) {
    return res.status(400).json({ error: 'Warehouse parameter is required.' });
  }

  try {
    conn = await getConnection();

    // Modificar la consulta para que utilice el almacén como parámetro
    const query = `call CTS_ARTESANO_PROD_GET_BINLOCATIONS('${warehouse}')`;

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
