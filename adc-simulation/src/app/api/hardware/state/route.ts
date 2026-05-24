import { NextResponse } from 'next/server';
import { globalState } from '@/lib/globalState';


export async function POST(request: Request) {
  try {
    const { state } = await request.json();
    if (!state) {
      return NextResponse.json({ success: false, error: 'Missing state' }, { status: 400 });
    }
    
    globalState.setHardwareData({ state });
    return NextResponse.json({ success: true, message: 'State updated' });
  } catch (error) {
    console.error('Error updating state:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid JSON or internal server error' },
      { status: 500 }
    );
  }
}
