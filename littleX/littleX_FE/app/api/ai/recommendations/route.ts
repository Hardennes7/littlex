import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const profile = url.searchParams.get('profile_jid');
    const r = await fetch(`http://localhost:3000/api/ai/recommendations?profile_jid=${encodeURIComponent(profile||'')}`);
    const j = await r.json();
    return NextResponse.json(j);
  } catch (e) {
    return NextResponse.json({ success: false, message: 'backend unreachable' }, { status: 502 });
  }
}
