import { NextResponse } from 'next/server';
import { getEmailLogs } from '../../../../data';

export async function GET() {
  const logs = getEmailLogs();
  return NextResponse.json(logs);
}
