import { NextRequest, NextResponse } from 'next/server';
import { getAccounts } from '../../../../../data';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { smtp_username } = await req.json();
    if (!smtp_username) {
      return NextResponse.json({ ok: false, error: 'Brakuje smtp_username' }, { status: 400 });
    }

    const accounts = getAccounts();
    const account = accounts.find((a) => a.smtp_username === smtp_username);
    if (!account) {
      return NextResponse.json({ ok: false, error: 'Konto nie istnieje' }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      host: account.smtp_server,
      port: Number(account.smtp_port),
      secure: Number(account.smtp_port) === 465,
      auth: { user: account.smtp_username, pass: account.smtp_password },
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
