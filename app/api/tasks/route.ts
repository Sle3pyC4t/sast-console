import { NextResponse } from 'next/server';
import { getTasks, createTask } from '@/app/lib/db';
import { TaskData } from '@/app/lib/definitions';

// GET all tasks
export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST new task
export async function POST(request: Request) {
  try {
    const json = await request.json();
    
    // Validate required fields
    if (!json.agent_id || !json.repository_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Prepare task data
    const taskData: Omit<TaskData, 'id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at'> = {
      agent_id: json.agent_id,
      repository_url: json.repository_url,
      branch: json.branch || null,
      scanners: json.scanners || ['bandit', 'semgrep'],
      status: 'pending',
      created_by: json.created_by || null
    };
    
    // Create the task in the database
    const task = await createTask(taskData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 