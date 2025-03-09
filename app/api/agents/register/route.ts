// 添加这些导出声明，确保路由是动态的并且不会被缓存
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createAgent } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST new agent registration
export async function POST(request: Request) {
  try {
    const json = await request.json();
    
    // Validate required fields
    if (!json.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate agent ID if not provided
    const agentId = json.id || uuidv4();
    
    // Prepare agent data with defaults if values not provided
    const agentData = {
      id: agentId,
      name: json.name,
      status: json.status || 'online',
      capabilities: json.capabilities || [],
      system_info: json.system_info || {},
      last_heartbeat: new Date().toISOString()
    };
    
    // Create the agent in the database
    const agent = await createAgent(agentData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Agent registered successfully',
      agent
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
} 