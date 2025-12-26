
import { NextResponse } from 'next/server';
import { REPORT_STORE } from '@/lib/store';
import { MOCK_REPORT } from '@/lib/mock-data';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const report = REPORT_STORE[params.id];
    
    if (report) {
        return NextResponse.json(report);
    }
    
    // Fallback or 404
    return NextResponse.json(MOCK_REPORT, { status: 200 }); // Serving Mock if not found for smoother demo
}
