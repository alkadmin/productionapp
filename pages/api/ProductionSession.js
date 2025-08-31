import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const {
    Code,
    Line,
    Shift,
    StartDate,
    Supervisor,
    Mixer,
    StartTime,
    PauseTime,
    EndTime,
    EndDate,
    PauseDate,
    HeadCount,
    User
  } = req.body;

  console.log(req.body);

  const conn = await getConnection();

  try {
    console.log("🔍 Iniciando operación con Code:", Code);

    if (!Code) {
      // Solo validar estos campos si es INSERT
      if (!StartDate || !StartTime || !HeadCount || !Supervisor || !Mixer) {
        return res.status(400).json({ message: 'StartDate, StartTime, HeadCount, Supervisor and Mixer are required for new entries' });
      }

      if (!Line || !Shift || !Supervisor || !Mixer || !HeadCount) {
        return res.status(400).json({ message: 'Line, Shift, Headcount, Supervisor, and Mixer are required for new entries' });
      }

      const queryCode = `
        SELECT MAX(CAST("Code" AS INTEGER)) + 1  as "MaxCodes"
        FROM "@CTS_PRD_SESSION"
      `;

      conn.exec(queryCode, async (err, result) => {
        if (err) {
          console.error("❌ Error ejecutando el query:", err);
          await closeConnection(conn);
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        console.log(result[0]);

        const nextCode = result?.[0].MaxCodes || 1;
        const generatedCode = String(nextCode).padStart(7, '0');
        const generatedName = generatedCode;

        console.log("cod");
        console.log(nextCode);

        const insertQuery = `
          INSERT INTO "@CTS_PRD_SESSION"
          ("Code", "Name", "U_CTS_Line", "U_CTS_Shift", "U_CTS_ProductionDate", "U_CTS_Supervisor", "U_CTS_MixerOp", "U_CTS_STime", "U_CTS_PTime", "U_CTS_ETime", "U_CTS_EDate", "U_CTS_PDate", "U_CTS_HeadCount", "U_CTS_User")
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        `;

        const insertParams = [
          generatedCode,
          generatedName,
          Line,
          Shift,
          StartDate,
          Supervisor,
          Mixer,
          StartTime,
          PauseTime,
          EndTime,
          EndDate,
          PauseDate,
          HeadCount,
          User
        ];

        conn.prepare(insertQuery, (err, statement) => {
          if (err) {
            console.error("❌ Error preparando INSERT:", err);
            closeConnection(conn);
            return res.status(500).json({ message: "Prepare failed", error: err.message });
          }

          statement.exec(insertParams, async (err, resultInsert) => {
            await closeConnection(conn);

            if (err) {
              console.error("❌ Error ejecutando INSERT:", err);
              return res.status(500).json({ message: "Insert failed", error: err.message });
            } else {
              return res.status(200).json({ message: "✅ Session created", code: generatedCode });
            }
          });
        });
      });
    } else {
      const updateQuery = `
        UPDATE "@CTS_PRD_SESSION"
        SET 
          "U_CTS_PTime" = ?, 
          "U_CTS_ETime" = ?, 
          "U_CTS_EDate" = ?,
          "U_CTS_PDate" = ?,
          "U_CTS_SENDMAIL"='20000101'
        WHERE "Code" = ?
      `;

      const updateParams = [
        PauseTime,
        EndTime,
        EndDate,
        PauseDate,
        Code
      ];

      console.log("🛠 Ejecutando UPDATE:", updateQuery);
      console.log("🔧 Params:", updateParams);

      await new Promise((resolve, reject) => {
        conn.prepare(updateQuery, (err, statement) => {
          if (err) {
            console.error("❌ Error preparando UPDATE:", err);
            return reject(err);
          }

          statement.exec(updateParams, (err, resultUpdate) => {
            if (err) {
              console.error("❌ Error ejecutando UPDATE:", err);
              return reject(err);
            }
            resolve(resultUpdate);
          });
        });
      });

      await closeConnection(conn);

      return res.status(200).json({ message: "🔁 Session updated", code: Code });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await closeConnection(conn);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}
