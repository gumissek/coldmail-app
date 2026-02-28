import { NextRequest, NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '../../../../data';

export async function GET() {
  try {
    const accounts = getAccounts();
    const safe = accounts.map((a) => ({
      smtp_server: a.smtp_server,
      smtp_port: a.smtp_port,
      smtp_username: a.smtp_username,
    }));
    return NextResponse.json(safe);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { smtp_server, smtp_port, smtp_username, smtp_password } = body;

    if (!smtp_server || !smtp_port || !smtp_username || !smtp_password) {
      return NextResponse.json({ error: 'Wszystkie pola są wymagane' }, { status: 400 });
    }

    const accounts = getAccounts();
    if (accounts.find((a) => a.smtp_username === smtp_username)) {
      return NextResponse.json({ error: 'Konto z tym użytkownikiem już istnieje' }, { status: 409 });
    }

    accounts.push({ smtp_server, smtp_port, smtp_username, smtp_password });
    saveAccounts(accounts);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { smtp_username } = await req.json();
    if (!smtp_username) {
      return NextResponse.json({ error: 'Brakuje smtp_username' }, { status: 400 });
    }

    const accounts = getAccounts();
    const filtered = accounts.filter((a) => a.smtp_username !== smtp_username);

    if (filtered.length === accounts.length) {
      return NextResponse.json({ error: 'Nie znaleziono konta' }, { status: 404 });
    }

    saveAccounts(filtered);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
