import { 
  UserGroupIcon, 
  ServerIcon, 
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { getAgents, getTasks, getVulnerabilities } from '@/app/lib/db';

export default async function Home() {
  // 从数据库获取实际数据
  const agents = await getAgents();
  const tasks = await getTasks();
  const vulnerabilities = await getVulnerabilities();
  
  // 计算数据统计
  const onlineAgents = agents.filter(agent => agent.status === 'online');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Agents Status Card */}
        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <ServerIcon className="h-12 w-12 text-gray-700" />
            <div>
              <p className="text-sm text-gray-500">Agents</p>
              <p className="text-2xl font-bold">{onlineAgents.length} / {agents.length}</p>
              <p className="text-sm text-gray-500">Online / Total</p>
            </div>
          </div>
        </div>
        
        {/* Tasks Status Card */}
        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <UserGroupIcon className="h-12 w-12 text-gray-700" />
            <div>
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold">{completedTasks.length} / {tasks.length}</p>
              <p className="text-sm text-gray-500">Completed / Total</p>
            </div>
          </div>
        </div>
        
        {/* Vulnerabilities Card */}
        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <ShieldExclamationIcon className="h-12 w-12 text-gray-700" />
            <div>
              <p className="text-sm text-gray-500">Vulnerabilities</p>
              <p className="text-2xl font-bold">{vulnerabilities.length}</p>
              <p className="text-sm text-gray-500">Found in all scans</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {tasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.repository_url}</p>
                      <p className="text-sm text-gray-500">Agent: {task.agent_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 px-6 py-4">
              <p className="text-center text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent vulnerabilities */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Recent Vulnerabilities</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {vulnerabilities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {vulnerabilities.slice(0, 5).map((vuln) => (
                <li key={vuln.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vuln.message}</p>
                      <p className="text-sm text-gray-500">{vuln.file_path}:{vuln.line_number}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      vuln.severity === 'high' ? 'bg-red-100 text-red-800' :
                      vuln.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {vuln.severity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 px-6 py-4">
              <p className="text-center text-gray-500">No vulnerabilities found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 