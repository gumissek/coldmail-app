import { NextRequest, NextResponse } from 'next/server';
import { getScheduledEmails, deleteScheduledEmail } from '../../../../data';

export async function GET() {
  try {
    const emails = getScheduledEmails();
    return NextResponse.json(emails);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: 'Brak id' }, { status: 400 });
    }

    deleteScheduledEmail(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
