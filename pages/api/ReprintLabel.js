import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  // Obtener el PalletID de los parámetros de la consulta (query string)
  const { PalletID } = req.query;

  if (!PalletID) {
    return res.status(400).json({ message: 'PalletID is required' });
  }

  let conn;
  try {
    // Establecer la conexión a la base de datos
    conn = await getConnection();

    // Llamar al procedimiento almacenado para imprimir la etiqueta del pallet
    const query = `CALL "CTS_PRINT_LABEL_PRODUCTION_PALLET"(?)`;
    const params = [PalletID];

    await new Promise((resolve, reject) => {
      conn.prepare(query, (err, statement) => {
        if (err) {
          console.error('Prepare error:', err);
          reject(err);
        } else {
          statement.exec(params, (err) => {
            if (err) {
              console.error('Execution error:', err);
              reject(err);
            } else {
              statement.drop(); // Asegúrate de cerrar el statement
              resolve();
            }
          });
        }
      });
    });

    // Respuesta exitosa con un mensaje simple en JSON
    res.status(200).json({ message: "Success" });
    
  } catch (error) {
    console.error('Error al llamar al procedimiento almacenado:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
    
  } finally {
    if (conn) {
      await closeConnection(conn); // Cierra la conexión a la base de datos
    }
  }
}
