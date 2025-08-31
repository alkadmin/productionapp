import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { docEntry, U_CTS_GroupChips } = req.body;

  if (!docEntry || U_CTS_GroupChips === undefined) {
    return res.status(400).json({ message: 'docEntry and U_CTS_GroupChips are required' });
  }

  try {
    const conn = await getConnection();

    // Step 1: Update the main production order
    const mainQuery = 'UPDATE OWOR SET "U_CTS_GroupChips" = ? WHERE "DocEntry" = ?';
    const mainParams = [U_CTS_GroupChips, docEntry];

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
              originNum = result[0].OriginNum;
              resolve();
            }
          });
        }
      });
    });

    if (!originNum) {
      throw new Error('OriginNum not found');
    }

    // Step 3: Update the related production orders (Kid)
    const relatedQuery = 'UPDATE OWOR SET "U_CTS_GroupChips" = ? WHERE "OriginNum" = ? AND "U_CTS_Type" = \'Kid\' AND "ItemCode" LIKE \'DOH%\'';
    const relatedParams = [`${U_CTS_GroupChips}_DOH`, originNum];

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
