-- Create agents table to store registered agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'offline',
  capabilities JSONB NOT NULL DEFAULT '[]',
  system_info JSONB,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table to store scan tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  repository_url TEXT NOT NULL,
  branch VARCHAR(255),
  scanners JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create scan_results table to store scan results
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  agent_id UUID REFERENCES agents(id),
  status VARCHAR(50) NOT NULL,
  scan_results JSONB,
  error TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vulnerabilities table for easier querying of individual findings
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID PRIMARY KEY,
  result_id UUID REFERENCES scan_results(id),
  task_id UUID REFERENCES tasks(id),
  scanner VARCHAR(50) NOT NULL,
  severity VARCHAR(50),
  confidence VARCHAR(50),
  file_path TEXT,
  line_number INTEGER,
  code_snippet TEXT,
  message TEXT,
  description TEXT,
  cwe VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_scan_results_task_id ON scan_results(task_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_result_id ON vulnerabilities(result_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_task_id ON vulnerabilities(task_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);

-- Create function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 检查触发器是否已存在，如果不存在则创建
DO $$ 
BEGIN
  -- 检查agents表的触发器
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_agents_timestamp') THEN
    CREATE TRIGGER update_agents_timestamp
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;

  -- 检查tasks表的触发器
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_timestamp') THEN
    CREATE TRIGGER update_tasks_timestamp
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;

  -- 检查users表的触发器
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_timestamp') THEN
    CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$; 