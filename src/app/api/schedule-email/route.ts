import { NextRequest, NextResponse } from 'next/server';
import { saveScheduledEmail } from '../../../../data';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, from_account, subject, html, scheduled_date } = body as {
      to: string;
      from_account: string;
      subject: string;
      html: string;
      scheduled_date: string;
    };

    if (!to || !from_account || !subject || !html || !scheduled_date) {
      return NextResponse.json(
        { error: 'Brakujące pola: to, from_account, subject, html, scheduled_date' },
        { status: 400 }
      );
    }

    // Split recipients and create one scheduled email per recipient
    const recipients = to.split(',').map((e) => e.trim()).filter(Boolean);
    const ids: string[] = [];

    for (const recipient of recipients) {
      const id = randomUUID();
      ids.push(id);
      saveScheduledEmail({
        id,
        to: recipient,
        from_account,
        subject,
        html,
        scheduled_date: new Date(scheduled_date).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, ids, count: ids.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
