// 添加这些导出声明，确保路由是动态的并且不会被缓存
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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
    
    // 返回数据时添加禁用缓存的响应头
    return NextResponse.json({ 
      success: true, 
      message: 'Agent registered successfully',
      agent
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
} 