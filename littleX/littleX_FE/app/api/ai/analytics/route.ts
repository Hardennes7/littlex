import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const r = await fetch('http://localhost:3000/api/ai/analytics');
    const j = await r.json();
    return NextResponse.json(j);
  } catch (e) {
    return NextResponse.json({ success: false, message: 'backend unreachable' }, { status: 502 });
  }
}
