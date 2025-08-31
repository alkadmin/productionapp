import jsPDF from 'jspdf';

export async function generateAndSendPDF(title = 'Production Report', content = 'This is your report content.') {
  const pdf = new jsPDF();

  pdf.setFontSize(14);
  pdf.text(title, 10, 20);
  pdf.setFontSize(10);
  pdf.text(content, 10, 40);

  const blob = pdf.output('blob');
  const formData = new FormData();
  formData.append('file', new File([blob], 'ProductionReport.pdf', { type: 'application/pdf' }));

  const res = await fetch('/api/send-report-email', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Email sending failed');
  return await res.json();
}
