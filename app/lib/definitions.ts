// Type definitions for our data models

// Agent types
export interface AgentData {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  system_info: {
    platform: string;
    python: string;
    hostname: string;
    [key: string]: any;
  };
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
}

// Task types
export interface TaskData {
  id: string;
  agent_id: string;
  repository_url: string;
  branch: string | null;
  scanners: string[];
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface TaskWithAgentData extends TaskData {
  agent_name: string | null;
}

// Scan result types
export interface ScanResultData {
  id: string;
  task_id: string;
  agent_id: string;
  status: string;
  scan_results: {
    bandit?: {
      success: boolean;
      exit_code?: number;
      results?: any;
      error?: string;
    };
    semgrep?: {
      success: boolean;
      exit_code?: number;
      results?: any;
      error?: string;
    };
    [key: string]: any;
  };
  error: string | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

export interface ScanResultWithDetails extends ScanResultData {
  repository_url: string;
  agent_name: string;
}

// Vulnerability types
export interface VulnerabilityData {
  id: string;
  result_id: string;
  task_id: string;
  scanner: string;
  severity: string;
  confidence: string;
  file_path: string;
  line_number: number;
  code_snippet: string;
  message: string;
  description: string;
  cwe: string | null;
  created_at: string;
}

export interface VulnerabilityWithDetails extends VulnerabilityData {
  repository_url: string;
}

// Form data types
export interface TaskFormData {
  agent_id: string;
  repository_url: string;
  branch?: string;
  scanners: string[];
}

// Dashboard types
export interface AgentStats {
  total: number;
  online: number;
  offline: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface VulnerabilityStats {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface DashboardData {
  agents: AgentStats;
  tasks: TaskStats;
  vulnerabilities: VulnerabilityStats;
  recentTasks: TaskWithAgentData[];
  recentVulnerabilities: VulnerabilityWithDetails[];
} 