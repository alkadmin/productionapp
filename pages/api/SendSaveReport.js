import nodemailer from 'nodemailer';
import path from 'path';

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { relativePath } = req.body;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);

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
      from: 'vanessa.guevara@celeritech.biz',
      to: 'vanea.gs@hotmail.com',
      subject: 'Production Report PDF',
      text: 'Hi Vanessa,\n\nAttached is the production summary report.\n\nRegards,\nProduction System',
      attachments: [
        {
          filename: 'ProductionReport.pdf',
          path: absolutePath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('[sendSavedReport] Email sent successfully');
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('[sendSavedReport] Error sending email:', error);
    res.status(500).json({ error: error.message });
  }
}
