import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;
  const { originNum, DocEntry } = req.query;

  // Validación de parámetros
  if (!originNum || isNaN(originNum) || !DocEntry || isNaN(DocEntry)) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  try {
    conn = await getConnection();

    // Query con parámetros para prevenir inyección SQL
    const query = `CALL CTS_ARTESANO_DOUGHT_VALIDATION_CHIPS_VARIATION(?, ?)`;

    // Ejecutar query
    conn.prepare(query, (err, statement) => {
      if (err) {
        console.error('Error preparing statement', err);
        res.status(500).json({ error: err.message });
        return closeConnection(conn);
      }

      // Ejecutar el statement con parámetros
      statement.exec([parseInt(originNum, 10), parseInt(DocEntry, 10)], (err, result) => {
        if (err) {
          console.error('Error executing query', err);
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(result);
        }
        // Cerrar la conexión después de ejecutar
        statement.drop(() => closeConnection(conn));
      });
    });
  } catch (err) {
    console.error('Unexpected error', err);
    if (conn) {
      await closeConnection(conn);
    }
    res.status(500).json({ error: err.message });
  }
}
