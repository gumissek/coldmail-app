import { NextRequest, NextResponse } from 'next/server';
import { getBrands, saveBrands, Brand } from '../../../../data';

export async function GET() {
  const brands = getBrands();
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, brand, index } = body;
  const brands = getBrands();

  if (action === 'add') {
    brands.push(brand as Brand);
    saveBrands(brands);
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    brands.splice(index, 1);
    saveBrands(brands);
    return NextResponse.json({ success: true });
  }

  if (action === 'update') {
    brands[index] = brand as Brand;
    saveBrands(brands);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
