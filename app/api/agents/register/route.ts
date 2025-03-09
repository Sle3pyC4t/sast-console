import { NextResponse } from 'next/server';
import { createAgent } from '@/app/lib/db';
import { AgentData } from '@/app/lib/definitions';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    
    // Validate the request body
    if (!json.agent_id || !json.agent_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Prepare agent data
    const agentData: Omit<AgentData, 'created_at' | 'updated_at'> = {
      id: json.agent_id,
      name: json.agent_name,
      status: 'online',
      capabilities: json.capabilities || [],
      system_info: json.system_info || {},
      last_heartbeat: new Date().toISOString()
    };
    
    // Create or update the agent in the database
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