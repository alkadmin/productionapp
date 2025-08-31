import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb' // Ajusta si necesitas más
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { base64pdf } = req.body;
    const base64Data = base64pdf.replace(/^data:application\/pdf;base64,/, '');

    const dir = path.join(process.cwd(), 'public', 'pdfs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `ProductionReport_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, base64Data, 'base64');

    console.log('[saveReportFile] PDF saved at:', filePath);

    res.status(200).json({ message: 'PDF saved successfully', path: `/pdfs/${filename}` });
  } catch (err) {
    console.error('[saveReportFile] Error:', err);
    res.status(500).json({ error: err.message });
  }
}