
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { docEntry } = req.query;

  if (!docEntry) {
    return res.status(400).json({ error: "Falta el parámetro docEntry" });
  }

  const exePath = `"C:\\SAP\\binaries\\report\\APP\\RIDEGUIAS.exe"`; 
  const pdfName = `Report_session_${docEntry}.pdf`;
  const pdfPath = path.join("C:\\SAP\\binaries\\report\\pdf", pdfName);

  console.log(`🧾 Ejecutando EXE con parámetro: ${docEntry}`);

  exec(`${exePath} ${docEntry}`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error ejecutando el EXE:", error.message);
      return res.status(500).json({ error: "Error generando PDF" });
    }

    console.log("✅ EXE ejecutado correctamente. Esperando PDF...");

    const maxRetries = 20; // Esperar hasta 20 segundos
    let retries = 0;

    const interval = setInterval(() => {
      if (fs.existsSync(pdfPath)) {
        clearInterval(interval);

        const stream = fs.createReadStream(pdfPath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${pdfName}`);
        stream.pipe(res);
      } else if (retries >= maxRetries) {
        clearInterval(interval);
        return res.status(500).json({ error: "⏱️ Timeout esperando PDF" });
      } else {
        retries++;
      }
    }, 1000);
  });
}
