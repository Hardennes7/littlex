import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch('http://localhost:3000/api/join-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    return NextResponse.json(j);
  } catch (e) {
    return NextResponse.json({ success: false, message: 'backend unreachable' }, { status: 502 });
  }
}
