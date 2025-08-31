import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { docEntry, updateData } = req.body;

  if (!docEntry || !updateData) {
    return res.status(400).json({ message: 'docEntry and updateData are required' });
  }

  try {
    const conn = await getConnection();

    // Construir la consulta y los parámetros dinámicamente
    let query = 'UPDATE OWOR SET ';
    const params = [];
    const setClauses = [];

    if (updateData.U_CTS_PDate) {
      setClauses.push('"U_CTS_PDate" = ?');
      params.push(updateData.U_CTS_PDate);
    }
    if (updateData.U_CTS_PTime) {
      setClauses.push('"U_CTS_PTime" = ?');
      params.push(updateData.U_CTS_PTime);
    }
    if (updateData.U_CTS_Paused) {
      setClauses.push('"U_CTS_Paused" = ?');
      params.push(updateData.U_CTS_Paused);
    }
    if (updateData.U_CTS_CosumeT) {
      setClauses.push('"U_CTS_CosumeT" = ?');
      params.push(updateData.U_CTS_CosumeT);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    query += setClauses.join(', ');
    query += ' WHERE "DocEntry" = ?';
    params.push(docEntry);

    await new Promise((resolve, reject) => {
      conn.prepare(query, (err, statement) => {
        if (err) {
          console.error('Prepare error:', err);
          reject(err);
        } else {
          statement.exec(params, (err, rows) => {
            if (err) {
              console.error('Execution error:', err);
              reject(err);
            } else {
              resolve(rows);
            }
          });
        }
      });
    });

    await closeConnection(conn);

    res.status(200).json({ message: 'Production order updated successfully' });
  } catch (error) {
    console.error('Error updating production order:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
}
