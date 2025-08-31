import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const {
    No_Pallet,
    ID_PALLET, PO, SKU, LOT, BEST_BEFORE,
    CASE_PALLET, QTY, PO_DOCENTRY
  } = req.body;

  // 🔹 Validar que se envíen todos los datos necesarios
  if (!No_Pallet||!ID_PALLET || !PO || !SKU || !LOT || !BEST_BEFORE || !CASE_PALLET || !QTY || !PO_DOCENTRY) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const conn = await getConnection();

    const query = `
      CALL CTS_ARTESANO_UPDATE_PALLET(?,?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [No_Pallet,
      ID_PALLET, PO, SKU, LOT, BEST_BEFORE,
      CASE_PALLET, QTY, PO_DOCENTRY
    ];

    // 🔹 Ejecutar el procedimiento almacenado
    await new Promise((resolve, reject) => {
      conn.prepare(query, (err, statement) => {
        if (err) {
          console.error('Prepare error:', err);
          reject(err);
        } else {
          statement.exec(params, (err, result) => {
            if (err) {
              console.error('Execution error:', err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        }
      });
    });

    await closeConnection(conn);

    res.status(200).json({ message: '✅ Pallet updated successfully' });

  } catch (error) {
    console.error('❌ Error updating pallet:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
}
