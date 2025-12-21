import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const r = await fetch('http://localhost:3000/api/trending');
    const j = await r.json();
    return NextResponse.json({ ...j, source: 'backend' });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'backend unreachable' }, { status: 502 });
  }
}
