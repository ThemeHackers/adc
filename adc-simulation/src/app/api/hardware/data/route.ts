import { NextResponse } from 'next/server';
import { globalState } from '@/lib/globalState';


export async function GET() {
  const data = globalState.getHardwareData();
  return NextResponse.json(data);
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    globalState.setHardwareData(body);
    return NextResponse.json({ success: true, message: 'Data received' });
  } catch (error) {
    console.error('Error updating hardware data:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid JSON or internal server error' },
      { status: 500 }
    );
  }
}
