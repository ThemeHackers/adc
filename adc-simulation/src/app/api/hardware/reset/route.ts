import { NextResponse } from 'next/server';
import { globalState } from '@/lib/globalState';


export async function POST() {
  try {
    globalState.resetHardwareData();
    return NextResponse.json({ success: true, message: 'Data reset to default' });
  } catch (error) {
    console.error('Error resetting hardware data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
