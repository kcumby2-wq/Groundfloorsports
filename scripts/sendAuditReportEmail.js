// scripts/sendAuditReportEmail.js
import nodemailer from 'nodemailer';
import fs from 'fs';

async function sendAuditReport() {
  const csv = fs.readFileSync('audit-report.csv', 'utf8');
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your SMTP provider
    auth: {
      user: process.env.AUDIT_EMAIL_USER,
      pass: process.env.AUDIT_EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.AUDIT_EMAIL_USER,
    to: process.env.AUDIT_EMAIL_RECIPIENTS, // comma-separated
    subject: 'Automated Audit Report',
    text: 'See attached audit report.',
    attachments: [{ filename: 'audit-report.csv', content: csv }]
  });
  console.log('Audit report emailed to admins.');
}

sendAuditReport();
