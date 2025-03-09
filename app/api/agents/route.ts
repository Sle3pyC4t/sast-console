// 添加这些导出声明，确保路由是动态的并且不会被缓存
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getAgents } from '@/app/lib/db';

// GET all agents
export async function GET() {
  try {
    const agents = await getAgents();
    // 返回数据时添加禁用缓存的响应头
    return NextResponse.json({ agents }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 