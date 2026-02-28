import { NextRequest, NextResponse } from 'next/server';
import { getLinks, saveLinks, Link } from '../../../../data';

export async function GET() {
  const links = getLinks();
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, link, index } = body;
  const links = getLinks();

  if (action === 'add') {
    links.push(link as Link);
    saveLinks(links);
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    links.splice(index, 1);
    saveLinks(links);
    return NextResponse.json({ success: true });
  }

  if (action === 'update') {
    links[index] = link as Link;
    saveLinks(links);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
