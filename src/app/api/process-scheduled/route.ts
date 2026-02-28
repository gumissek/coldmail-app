import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  getScheduledEmails,
  getAccounts,
  getBrands,
  updateScheduledEmailStatus,
  updateScheduledEmailNextSend,
  saveEmailLog,
} from '../../../../data';

/**
 * Process scheduled emails that are due.
 *
 * Strategy for natural-looking sends:
 * - Only process emails whose `scheduled_date` <= now
 * - Among those, respect `next_send_after` — skip if current time is before that value
 * - After sending one email, assign a random 1-3h `next_send_after` to the next pending email
 * - This staggers sends so they look natural and not automated
 */
export async function POST() {
  try {
    const allEmails = getScheduledEmails();
    const now = new Date();

    // Filter emails that are due and still pending
    const dueEmails = allEmails
      .filter((e) => e.status === 'pending' && new Date(e.scheduled_date) <= now)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

    if (dueEmails.length === 0) {
      return NextResponse.json({ processed: 0, sent: 0, failed: 0, remaining: 0 });
    }

    const accounts = getAccounts();
    const brands = getBrands();

    let sent = 0;
    let failed = 0;
    let processed = 0;

    for (let i = 0; i < dueEmails.length; i++) {
      const email = dueEmails[i];

      // Check next_send_after constraint — if set and in the future, stop processing
      if (email.next_send_after && new Date(email.next_send_after) > now) {
        break; // Don't process this one or any later ones
      }

      // Find matching SMTP account
      const account = accounts.find((a) => a.smtp_username === email.from_account);
      if (!account) {
        updateScheduledEmailStatus(email.id, 'failed');
        failed++;
        processed++;
        continue;
      }

      try {
        const transporter = nodemailer.createTransport({
          host: account.smtp_server,
          port: Number(account.smtp_port) || 587,
          secure: false,
          auth: {
            user: account.smtp_username,
            pass: account.smtp_password,
          },
        });

        // Personalize {{name}} placeholder
        const brand = brands.find((b) => b.email.trim() === email.to.trim());
        const personalizedHtml = brand
          ? email.html.replace(/\{\{name\}\}/g, brand.name.trim())
          : email.html;

        const info = await transporter.sendMail({
          from: `<${account.smtp_username}>`,
          to: email.to,
          subject: email.subject,
          html: personalizedHtml,
        });

        updateScheduledEmailStatus(email.id, 'sent');

        // Log the sent email
        saveEmailLog({
          id: info.messageId,
          to: email.to,
          from: account.smtp_username,
          subject: email.subject,
          content: personalizedHtml,
          status: 'sent',
          sentAt: new Date().toISOString(),
          files: [],
        });

        sent++;
        processed++;

        // Assign random 1-3h delay to next pending email
        if (i + 1 < dueEmails.length) {
          const delayMs = (1 + Math.random() * 2) * 60 * 60 * 1000; // 1-3 hours in ms
          const nextTime = new Date(Date.now() + delayMs).toISOString();
          updateScheduledEmailNextSend(dueEmails[i + 1].id, nextTime);
          break; // Stop — wait for the delay before processing the next one
        }
      } catch {
        updateScheduledEmailStatus(email.id, 'failed');
        failed++;
        processed++;
      }
    }

    const remaining = allEmails.filter((e) => e.status === 'pending').length - sent - failed;

    return NextResponse.json({ processed, sent, failed, remaining });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
