import { sql } from '@vercel/postgres';
import { 
  AgentData, 
  TaskData, 
  ScanResultData, 
  VulnerabilityData,
  TaskWithAgentData
} from '../definitions';
import { v4 as uuidv4 } from 'uuid';

// 确保在数据库操作出错时提供合理的替代数据
function handleDatabaseError(error: any, entityName: string): never {
  console.error(`Database Error fetching ${entityName}:`, error);
  throw new Error(`Failed to fetch ${entityName}`);
}

/* Agent Functions */

export async function getAgents() {
  try {
    const data = await sql`
      SELECT * FROM agents
      ORDER BY created_at DESC
    `;
    return data.rows as AgentData[];
  } catch (error) {
    console.error('Database Error:', error);
    // 如果在开发环境或测试环境，返回空数组而不是失败
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.warn('返回空的agents数组作为替代');
      return [];
    }
    throw new Error('Failed to fetch agent data');
  }
}

export async function getAgent(id: string) {
  try {
    const data = await sql`
      SELECT * FROM agents
      WHERE id = ${id}
    `;
    return data.rows[0] as AgentData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch agent data');
  }
}

export async function createAgent(agent: Omit<AgentData, 'created_at' | 'updated_at'>) {
  try {
    const id = agent.id || uuidv4();
    
    const data = await sql`
      INSERT INTO agents (
        id, name, status, capabilities, system_info, last_heartbeat
      )
      VALUES (
        ${id}, ${agent.name}, ${agent.status}, ${JSON.stringify(agent.capabilities)}, 
        ${JSON.stringify(agent.system_info)}, ${agent.last_heartbeat}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = ${agent.name},
        status = ${agent.status},
        capabilities = ${JSON.stringify(agent.capabilities)},
        system_info = ${JSON.stringify(agent.system_info)},
        last_heartbeat = ${agent.last_heartbeat},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    return data.rows[0] as AgentData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create/update agent');
  }
}

export async function updateAgentStatus(id: string, status: string) {
  try {
    const data = await sql`
      UPDATE agents
      SET status = ${status}, last_heartbeat = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return data.rows[0] as AgentData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update agent status');
  }
}

export async function deleteAgent(id: string) {
  try {
    // 首先获取与该代理相关的所有任务ID
    const tasksResult = await sql`
      SELECT id FROM tasks
      WHERE agent_id = ${id}
    `;
    
    const taskIds = tasksResult.rows.map(row => row.id);
    
    // 删除这些任务相关的所有漏洞数据
    if (taskIds.length > 0) {
      for (const taskId of taskIds) {
        await sql`
          DELETE FROM vulnerabilities
          WHERE task_id = ${taskId}
        `;
      }
    }
    
    // 删除代理相关的所有扫描结果
    await sql`
      DELETE FROM scan_results
      WHERE agent_id = ${id}
    `;
    
    // 删除代理相关的所有任务
    await sql`
      DELETE FROM tasks
      WHERE agent_id = ${id}
    `;
    
    // 最后删除代理本身
    await sql`
      DELETE FROM agents
      WHERE id = ${id}
    `;
    
    return true;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete agent');
  }
}

/* Task Functions */

export async function getTasks() {
  try {
    const data = await sql`
      SELECT t.*, a.name as agent_name
      FROM tasks t
      LEFT JOIN agents a ON t.agent_id = a.id
      ORDER BY t.created_at DESC
    `;
    return data.rows as TaskWithAgentData[];
  } catch (error) {
    console.error('Database Error:', error);
    // 如果在开发环境或测试环境，返回空数组而不是失败
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.warn('返回空的tasks数组作为替代');
      return [];
    }
    throw new Error('Failed to fetch tasks');
  }
}

export async function getTask(id: string) {
  try {
    const data = await sql`
      SELECT t.*, a.name as agent_name
      FROM tasks t
      LEFT JOIN agents a ON t.agent_id = a.id
      WHERE t.id = ${id}
    `;
    return data.rows[0] as TaskWithAgentData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch task');
  }
}

export async function getTasksByAgentId(agentId: string, status?: string) {
  try {
    let query = sql`
      SELECT * FROM tasks
      WHERE agent_id = ${agentId}
    `;
    
    if (status) {
      query = sql`
        SELECT * FROM tasks
        WHERE agent_id = ${agentId} AND status = ${status}
        ORDER BY created_at ASC
      `;
    }
    
    const data = await query;
    return data.rows as TaskData[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tasks for agent');
  }
}

export async function createTask(task: Omit<TaskData, 'id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at'>) {
  try {
    const id = uuidv4();
    
    const data = await sql`
      INSERT INTO tasks (
        id, agent_id, repository_url, branch, scanners, status, created_by
      )
      VALUES (
        ${id}, ${task.agent_id}, ${task.repository_url}, ${task.branch || null}, 
        ${JSON.stringify(task.scanners)}, ${task.status || 'pending'}, ${task.created_by || null}
      )
      RETURNING *
    `;
    
    return data.rows[0] as TaskData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create task');
  }
}

export async function updateTaskStatus(id: string, status: string) {
  try {
    let query;
    
    if (status === 'running') {
      query = sql`
        UPDATE tasks
        SET status = ${status}, started_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (status === 'completed' || status === 'failed') {
      query = sql`
        UPDATE tasks
        SET status = ${status}, completed_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      query = sql`
        UPDATE tasks
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `;
    }
    
    const data = await query;
    return data.rows[0] as TaskData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update task status');
  }
}

export async function deleteTask(id: string) {
  try {
    // 删除相关的漏洞数据
    await sql`
      DELETE FROM vulnerabilities
      WHERE task_id = ${id}
    `;
    
    // 删除相关的扫描结果
    await sql`
      DELETE FROM scan_results
      WHERE task_id = ${id}
    `;
    
    // 然后删除任务本身
    await sql`
      DELETE FROM tasks
      WHERE id = ${id}
    `;
    
    return true;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete task');
  }
}

/* Scan Result Functions */

export async function getScanResults() {
  try {
    const data = await sql`
      SELECT sr.*, t.repository_url, a.name as agent_name
      FROM scan_results sr
      JOIN tasks t ON sr.task_id = t.id
      JOIN agents a ON sr.agent_id = a.id
      ORDER BY sr.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    // 在所有环境下都返回空数组，确保UI正常渲染
    console.warn('返回空的scan_results数组作为替代');
    return [];
  }
}

export async function getScanResult(id: string) {
  try {
    const data = await sql`
      SELECT sr.*, t.repository_url, a.name as agent_name
      FROM scan_results sr
      JOIN tasks t ON sr.task_id = t.id
      JOIN agents a ON sr.agent_id = a.id
      WHERE sr.id = ${id}
    `;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch scan result');
  }
}

export async function getScanResultsByTaskId(taskId: string) {
  try {
    const data = await sql`
      SELECT * FROM scan_results
      WHERE task_id = ${taskId}
    `;
    return data.rows[0] as ScanResultData;
  } catch (error) {
    console.error('Database Error:', error);
    // 在所有环境下都返回null，确保UI正常渲染
    console.warn('返回null作为替代');
    return null;
  }
}

export async function createScanResult(result: Omit<ScanResultData, 'id' | 'created_at'>) {
  try {
    const id = uuidv4();
    
    // First update the task status
    await updateTaskStatus(result.task_id, result.status);
    
    // Then create the scan result
    const data = await sql`
      INSERT INTO scan_results (
        id, task_id, agent_id, status, scan_results, error, start_time, end_time
      )
      VALUES (
        ${id}, ${result.task_id}, ${result.agent_id}, ${result.status}, 
        ${JSON.stringify(result.scan_results)}, ${result.error || null}, 
        ${result.start_time}, ${result.end_time}
      )
      RETURNING *
    `;
    
    const scanResult = data.rows[0] as ScanResultData;
    
    // Process vulnerabilities if scan was successful
    if (result.status === 'completed' && result.scan_results) {
      await processVulnerabilities(scanResult);
    }
    
    return scanResult;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create scan result');
  }
}

/* Vulnerability Processing */

async function processVulnerabilities(scanResult: ScanResultData) {
  try {
    const { id: resultId, task_id: taskId, scan_results } = scanResult;
    
    // Process Bandit results
    if (scan_results.bandit && scan_results.bandit.success && scan_results.bandit.results) {
      const banditResults = scan_results.bandit.results.results || [];
      
      for (const finding of banditResults) {
        await createVulnerability({
          result_id: resultId,
          task_id: taskId,
          scanner: 'bandit',
          severity: finding.issue_severity.toLowerCase(),
          confidence: finding.issue_confidence.toLowerCase(),
          file_path: finding.filename,
          line_number: finding.line_number,
          code_snippet: finding.code,
          message: finding.issue_text,
          description: `${finding.test_name}: ${finding.test_id}`,
          cwe: finding.cwe ? finding.cwe.toString() : null
        });
      }
    }
    
    // Process Semgrep results
    if (scan_results.semgrep && scan_results.semgrep.success && scan_results.semgrep.results) {
      const semgrepResults = scan_results.semgrep.results.results || [];
      
      for (const finding of semgrepResults) {
        await createVulnerability({
          result_id: resultId,
          task_id: taskId,
          scanner: 'semgrep',
          severity: finding.extra.severity || 'medium',
          confidence: 'medium', // Semgrep doesn't provide confidence
          file_path: finding.path,
          line_number: finding.start.line,
          code_snippet: finding.extra.lines,
          message: finding.extra.message,
          description: finding.check_id,
          cwe: finding.extra.metadata && finding.extra.metadata.cwe ? 
            finding.extra.metadata.cwe.toString() : null
        });
      }
    }
  } catch (error) {
    console.error('Error processing vulnerabilities:', error);
    // Continue execution even if vulnerability processing fails
  }
}

/* Vulnerability Functions */

export async function getVulnerabilities(taskId?: string, severity?: string) {
  try {
    let query;
    
    if (taskId && severity) {
      query = sql`
        SELECT v.*, t.repository_url
        FROM vulnerabilities v
        JOIN tasks t ON v.task_id = t.id
        WHERE v.task_id = ${taskId} AND v.severity = ${severity}
        ORDER BY v.created_at DESC
      `;
    } else if (taskId) {
      query = sql`
        SELECT v.*, t.repository_url
        FROM vulnerabilities v
        JOIN tasks t ON v.task_id = t.id
        WHERE v.task_id = ${taskId}
        ORDER BY v.created_at DESC
      `;
    } else if (severity) {
      query = sql`
        SELECT v.*, t.repository_url
        FROM vulnerabilities v
        JOIN tasks t ON v.task_id = t.id
        WHERE v.severity = ${severity}
        ORDER BY v.created_at DESC
      `;
    } else {
      query = sql`
        SELECT v.*, t.repository_url
        FROM vulnerabilities v
        JOIN tasks t ON v.task_id = t.id
        ORDER BY v.created_at DESC
      `;
    }
    
    const data = await query;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    // 如果出错或在开发环境，返回空数组而不是失败
    console.warn('返回空的vulnerabilities数组作为替代');
    return [];
  }
}

async function createVulnerability(vulnerability: Omit<VulnerabilityData, 'id' | 'created_at'>) {
  try {
    const id = uuidv4();
    
    await sql`
      INSERT INTO vulnerabilities (
        id, result_id, task_id, scanner, severity, confidence, 
        file_path, line_number, code_snippet, message, description, cwe
      )
      VALUES (
        ${id}, ${vulnerability.result_id}, ${vulnerability.task_id}, 
        ${vulnerability.scanner}, ${vulnerability.severity}, ${vulnerability.confidence}, 
        ${vulnerability.file_path}, ${vulnerability.line_number}, ${vulnerability.code_snippet}, 
        ${vulnerability.message}, ${vulnerability.description}, ${vulnerability.cwe}
      )
    `;
    
    return true;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create vulnerability record');
  }
} 