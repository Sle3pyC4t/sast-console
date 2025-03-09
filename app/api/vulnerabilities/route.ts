// 添加这些导出声明，确保路由是动态的并且不会被缓存
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getVulnerabilities } from '@/app/lib/db';

// GET all vulnerabilities, with optional task_id and severity filters
export async function GET(request: Request) {
  try {
    // Get URL and extract query parameters
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id') || undefined;
    const severity = searchParams.get('severity') || undefined;
    
    const vulnerabilities = await getVulnerabilities(
      taskId as string | undefined, 
      severity as string | undefined
    );
    
    // 返回数据时添加禁用缓存的响应头
    return NextResponse.json({ vulnerabilities }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vulnerabilities' },
      { status: 500 }
    );
  }
} 