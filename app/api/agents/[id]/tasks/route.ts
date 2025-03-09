import { NextResponse } from 'next/server';
import { getTasksByAgentId } from '@/app/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    
    // Get the status from query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Validate the agent ID
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    // Get tasks for the agent with optional status filter
    const tasks = await getTasksByAgentId(agentId, status || undefined);
    
    return NextResponse.json({ 
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 