import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { docEntry } = req.body;

  if (!docEntry) {
    return res.status(400).json({ message: 'docEntry is required' });
  }

  let conn;
  try {
    conn = await getConnection();

    // Step 1: Update the main production order, setting U_CTS_GroupChips to NULL
    const mainQuery = `UPDATE OWOR SET "U_CTS_GroupChips" = NULL WHERE "DocEntry" = ?`;
    const mainParams = [docEntry];

    await new Promise((resolve, reject) => {
      conn.prepare(mainQuery, (err, statement) => {
        if (err) {
          console.error('Prepare error:', err);
          reject(err);
        } else {
          statement.exec(mainParams, (err, rows) => {
            if (err) {
              console.error('Execution error:', err);
              reject(err);
            } else {
              statement.drop(); // Ensure statement is closed
              resolve(rows);
            }
          });
        }
      });
    });

    // Step 2: Get the OriginNum of the main production order
    const originNumQuery = 'SELECT "OriginNum" FROM OWOR WHERE "DocEntry" = ?';
    const originNumParams = [docEntry];
    let originNum;

    await new Promise((resolve, reject) => {
      conn.prepare(originNumQuery, (err, statement) => {
        if (err) {
          console.error('Prepare error:', err);
          reject(err);
        } else {
          statement.exec(originNumParams, (err, result) => {
            if (err) {
              console.error('Execution error:', err);
              reject(err);
            } else {
              if (result.length > 0) {
                originNum = result[0].OriginNum;
              }
              statement.drop(); // Ensure statement is closed
              resolve();
            }
          });
        }
      });
    });

    if (!originNum) {
      throw new Error('OriginNum not found');
    }

    // Step 3: Update the related production orders (Kid), setting U_CTS_GroupChips to NULL
    const relatedQuery = `UPDATE OWOR SET "U_CTS_GroupChips" = NULL WHERE "OriginNum" = ? AND "U_CTS_Type" = 'Kid' AND "ItemCode" LIKE 'DOH%'`;
    const relatedParams = [originNum];

    await new Promise((resolve, reject) => {
      conn.prepare(relatedQuery, (err, statement) => {
        if (err) {
          console.error('Prepare error:', err);
          reject(err);
        } else {
          statement.exec(relatedParams, (err, rows) => {
            if (err) {
              console.error('Execution error:', err);
              reject(err);
            } else {
              statement.drop(); // Ensure statement is closed
              resolve(rows);
            }
          });
        }
      });
    });

    res.status(200).json({ message: 'Production order updated successfully' });
  } catch (error) {
    console.error('Error updating production order:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  } finally {
    if (conn) {
      await closeConnection(conn); // Ensure the connection is closed
    }
  }
}
