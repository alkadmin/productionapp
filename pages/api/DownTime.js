import { getConnection, closeConnection } from '../../dataBase/dbConnection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const {
    Code, // requerido solo para update
    Line, // U_CTS_Line
    Shift, // U_CTS_Shift
    User, // U_CTS_User
    DateIn, // U_CTS_DateIn
    TimeIn, // U_CTS_TimeIn
    Session, // U_CTS_Session
    // Datos solo requeridos para UPDATE
    DateFin, // U_CTS_DateFin
    TimeFin, // U_CTS_TimeFin
    Reason, // U_CTS_Reason
    Type, // U_CTA_Type
    Comments, // U_CTS_Comments
    CorrActions // U_CTS_CorrActions
  } = req.body;

  const conn = await getConnection();

  try {
    if (!Code) {
      if (!Line || !Shift || !User || !DateIn || !TimeIn || !Session) {
        return res.status(400).json({ message: 'Line, Shift, User, DateIn, TimeIn, and Session are required for new entries' });
      }

      const queryCode = `
        SELECT MAX(CAST("Code" AS INTEGER)) + 1 AS MaxCodes
        FROM "@CTS_PRD_DWTIME"
      `;


      conn.exec(queryCode, async (err, result) => {
        if (err) {
          console.error("❌ Error ejecutando el query:", err);
          await closeConnection(conn);
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        console.log(result[0]);

        const nextCode = result?.[0].MAXCODES || 1;
        const generatedCode = String(nextCode).padStart(7, '0');
        const generatedName = generatedCode;

        console.log("cod");
        console.log(nextCode);

        const insertQuery = `
          INSERT INTO "@CTS_PRD_DWTIME"
          ("Code", "Name", "U_CTS_Line", "U_CTS_Shift", "U_CTS_User", "U_CTS_DateIn", "U_CTS_TimeIn", "U_CTS_Session")
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
          generatedCode,
          generatedName,
          Line,
          Shift,
          User,
          DateIn,
          TimeIn,
          Session
        ];

        conn.prepare(insertQuery, (err, statement) => {
          if (err) {
            closeConnection(conn);
            return res.status(500).json({ message: 'Prepare failed', error: err.message });
          }

          statement.exec(insertParams, async (err) => {
            await closeConnection(conn);
            if (err) {
              return res.status(500).json({ message: 'Insert failed', error: err.message });
            }
            return res.status(200).json({ message: '✅ Downtime inserted', code: generatedCode });
          });
        });
      });
    } else {
      const updateQuery = `
        UPDATE "@CTS_PRD_DWTIME"
        SET
          "U_CTS_DateFin" = ?,
          "U_CTS_TimeFin" = ?,
          "U_CTS_Reason" = ?,
          "U_CTA_Type" = ?,
          "U_CTS_Comments" = ?,
          "U_CTS_CorrActions" = ?
        WHERE "Code" = ?
      `;

      const updateParams = [
        DateFin,
        TimeFin,
        Reason,
        Type,
        Comments,
        CorrActions,
        Code
      ];

      conn.prepare(updateQuery, (err, statement) => {
        if (err) {
          closeConnection(conn);
          return res.status(500).json({ message: 'Prepare failed', error: err.message });
        }

        statement.exec(updateParams, async (err) => {
          await closeConnection(conn);
          if (err) {
            return res.status(500).json({ message: 'Update failed', error: err.message });
          }
          return res.status(200).json({ message: '🔁 Downtime updated', code: Code });
        });
      });
    }
  } catch (error) {
    await closeConnection(conn);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}
