import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data_source'); 

export interface Brand {
  name: string;
  email: string;
}

export interface Link {
  'website name': string;
  url: string;
}

export interface Account {
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
}

export interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  content: string;
  status: 'sent' | 'failed';
  sentAt: string;
  files?: string[];
  error?: string;
}

export function getBrands(): Brand[] {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'brands.csv'), 'utf-8');
    return parse(content, { columns: true, skip_empty_lines: true });
  } catch {
    return [];
  }
}

export function saveBrands(brands: Brand[]): void {
  const content = stringify(brands, { header: true });
  fs.writeFileSync(path.join(DATA_DIR, 'brands.csv'), content);
}

export function getLinks(): Link[] {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'links.csv'), 'utf-8');
    return parse(content, { columns: true, skip_empty_lines: true });
  } catch {
    return [];
  }
}

export function getAccounts(): Account[] {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'accounts.csv'), 'utf-8');
    return parse(content, { columns: true, skip_empty_lines: true });
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  const content = stringify(accounts, { header: true });
  fs.writeFileSync(path.join(DATA_DIR, 'accounts.csv'), content);
}

export function saveLinks(links: Link[]): void {
  const content = stringify(links, { header: true });
  fs.writeFileSync(path.join(DATA_DIR, 'links.csv'), content);
}

const SENT_MAILS_FILE = path.join(DATA_DIR, 'sent_mails.csv');
const CSV_COLUMNS = ['id', 'to', 'from', 'subject', 'content', 'status', 'sentAt', 'files'];

export function getEmailLogs(): EmailLog[] {
  try {
    const content = fs.readFileSync(SENT_MAILS_FILE, 'utf-8');
    const rows = parse(content, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>;
    return rows.map((r) => ({
      ...r,
      files: r.files ? (() => { try { return JSON.parse(r.files); } catch { return []; } })() : [],
    })) as unknown as EmailLog[];
  } catch {
    return [];
  }
}

export function saveEmailLog(log: EmailLog): void {
  const fileExists = fs.existsSync(SENT_MAILS_FILE);
  const serialized = {
    ...log,
    files: JSON.stringify(log.files ?? []),
  };
  const row = stringify([serialized], { header: !fileExists, columns: CSV_COLUMNS });
  fs.appendFileSync(SENT_MAILS_FILE, row);
}

// ── Scheduled Emails ────────────────────────────────────────────────────────

const SCHEDULED_FILE = path.join(DATA_DIR, 'emails_to_sent.csv');
const SCHEDULED_COLUMNS = ['id', 'to', 'from_account', 'subject', 'html', 'scheduled_date', 'status', 'created_at', 'next_send_after'];

export interface ScheduledEmail {
  id: string;
  to: string;
  from_account: string;   // smtp_username
  subject: string;
  html: string;
  scheduled_date: string; // ISO date-time
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  next_send_after?: string; // ISO date-time — earliest time this email can be sent
}

export function getScheduledEmails(): ScheduledEmail[] {
  try {
    const content = fs.readFileSync(SCHEDULED_FILE, 'utf-8');
    return parse(content, { columns: true, skip_empty_lines: true }) as ScheduledEmail[];
  } catch {
    return [];
  }
}

export function saveScheduledEmail(email: ScheduledEmail): void {
  const fileExists = fs.existsSync(SCHEDULED_FILE);
  let hasContent = false;
  if (fileExists) {
    const content = fs.readFileSync(SCHEDULED_FILE, 'utf-8').trim();
    hasContent = content.length > 0;
  }
  const row = stringify([email], { header: !hasContent, columns: SCHEDULED_COLUMNS });
  fs.appendFileSync(SCHEDULED_FILE, row);
}

function rewriteScheduledFile(emails: ScheduledEmail[]): void {
  const content = stringify(emails, { header: true, columns: SCHEDULED_COLUMNS });
  fs.writeFileSync(SCHEDULED_FILE, content);
}

export function updateScheduledEmailStatus(id: string, status: 'sent' | 'failed'): void {
  const emails = getScheduledEmails();
  const updated = emails.map((e) => (e.id === id ? { ...e, status } : e));
  rewriteScheduledFile(updated);
}

export function updateScheduledEmailNextSend(id: string, nextSendAfter: string): void {
  const emails = getScheduledEmails();
  const updated = emails.map((e) => (e.id === id ? { ...e, next_send_after: nextSendAfter } : e));
  rewriteScheduledFile(updated);
}

export function deleteScheduledEmail(id: string): void {
  const emails = getScheduledEmails();
  const filtered = emails.filter((e) => e.id !== id);
  rewriteScheduledFile(filtered);
}
