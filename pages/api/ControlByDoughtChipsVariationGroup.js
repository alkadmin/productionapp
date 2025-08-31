import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  let conn;
  const { GroupId, OriginNum, ParentId } = req.query;

  // Validación de parámetros
  if (!GroupId || typeof GroupId !== 'string' || !OriginNum || isNaN(OriginNum) || !ParentId || isNaN(ParentId)) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  try {
    conn = await getConnection();

    // Query con parámetros para prevenir inyección SQL
    const query = `CALL CTS_ARTESANO_CONTROL_DOUGHT_CHIPS_VARIATION(?, ?, ?)`;

    // Ejecutar query
    conn.prepare(query, (err, statement) => {
      if (err) {
        console.error('Error preparing statement', err);
        res.status(500).json({ error: err.message });
        return closeConnection(conn);
      }

      // Ejecutar el statement con parámetros
      statement.exec([GroupId, parseInt(OriginNum, 10), parseInt(ParentId, 10)], (err, result) => {
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
