import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { smtp_server, smtp_port, smtp_username, smtp_password } = await req.json();

    if (!smtp_server || !smtp_port || !smtp_username || !smtp_password) {
      return NextResponse.json({ ok: false, error: 'Brakujące dane konfiguracji SMTP' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp_server,
      port: Number(smtp_port),
      secure: Number(smtp_port) === 465,
      auth: { user: smtp_username, pass: smtp_password },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
    });

    await transporter.verify();
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
