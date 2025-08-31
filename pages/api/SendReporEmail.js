import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { base64pdf } = req.body;
    console.log('[API] PDF recibido en base64');

    // Ruta temporal segura (usa OS tmp dir)
    const filePath = path.join(os.tmpdir(), `ProductionReport_${Date.now()}.pdf`);
    const base64Data = base64pdf.replace(/^data:application\/pdf;base64,/, '');

    // Escribir archivo
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`[API] Archivo guardado en ${filePath}`);

    // SMTP con Outlook (Office365)
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'vanessa.guevara@celeritech.biz',
        pass: 'S@sita17'
      }
    });

    const mailOptions = {
      from: '"Production System" <vanessa.guevara@celeritech.biz>',
      to: 'vanea.gs@hotmail.com',
      subject: 'Production Report PDF',
      text: 'Hi Vanessa,\n\nAttached is the production summary report.\n\nRegards,\nProduction System',
      attachments: [
        {
          filename: 'ProductionReport.pdf',
          path: filePath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('[API] Correo enviado correctamente');

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('[API] Error al enviar:', error);
    res.status(500).json({ error: error.message });
  }
}
