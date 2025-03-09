import { NextResponse } from 'next/server';
import { getScanResultsByTaskId, createScanResult } from '@/app/lib/db';
import { ScanResultData } from '@/app/lib/definitions';

// GET scan results for a task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const result = await getScanResultsByTaskId(taskId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Scan results not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching scan results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scan results' },
      { status: 500 }
    );
  }
}

// POST scan results for a task
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const json = await request.json();
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    if (!json.agent_id || !json.status || !json.start_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Prepare scan result data
    const resultData: Omit<ScanResultData, 'id' | 'created_at'> = {
      task_id: taskId,
      agent_id: json.agent_id,
      status: json.status,
      scan_results: json.scan_results || {},
      error: json.error || null,
      start_time: json.start_time,
      end_time: json.end_time || null
    };
    
    // Create the scan result in the database
    const result = await createScanResult(resultData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Scan results submitted successfully',
      result
    });
  } catch (error) {
    console.error('Error submitting scan results:', error);
    return NextResponse.json(
      { error: 'Failed to submit scan results' },
      { status: 500 }
    );
  }
} 