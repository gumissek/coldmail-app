import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { saveEmailLog, getAccounts } from '../../../../data';

interface FromAccount {
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
}

interface AttachmentPayload {
  filename: string;
  content: string; // base64
  contentType: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, text, fromAccount, attachments } = body as {
      to: string;
      subject: string;
      html?: string;
      text?: string;
      fromAccount?: FromAccount;
      attachments?: AttachmentPayload[];
    };

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, html/text' }, { status: 400 });
    }

    // Resolve SMTP credentials: use selected account from body, fall back to .env
    let smtpHost = process.env.SMTP_SERVER;
    let smtpPort = Number(process.env.SMTP_PORT) || 587;
    let smtpUser = process.env.SMTP_USERNAME;
    let smtpPass = process.env.SMTP_PASSWORD;

    if (fromAccount?.smtp_username) {
      const accounts = getAccounts();
      const match = accounts.find((a) => a.smtp_username === fromAccount.smtp_username);
      if (match) {
        smtpHost = match.smtp_server;
        smtpPort = Number(match.smtp_port) || 587;
        smtpUser = match.smtp_username;
        smtpPass = match.smtp_password;
      }
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `<${smtpUser}>`,
      to,
      subject,
      html: html || text,
      text,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, 'base64'),
        contentType: a.contentType,
      })),
    });

    saveEmailLog({
      id: info.messageId,
      to,
      from: smtpUser ?? '',
      subject,
      content: text ?? html ?? '',
      status: 'sent',
      sentAt: new Date().toISOString(),
      files: attachments?.map((a) => a.filename) ?? [],
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
