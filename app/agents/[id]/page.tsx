import { getAgent, getTasksByAgentId } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  ServerIcon, 
  ClipboardDocumentListIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  
  // Get agent details
  const agent = await getAgent(id);
  if (!agent) {
    notFound();
  }
  
  // Get agent's tasks
  const tasks = await getTasksByAgentId(id);
  
  // Group tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const runningTasks = tasks.filter(task => task.status === 'running');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const failedTasks = tasks.filter(task => task.status === 'failed');
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href="/agents"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Agents
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Agent Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {agent.name}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              agent.status === 'online' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {agent.status}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Agent ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{agent.id}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Heartbeat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {agent.last_heartbeat 
                  ? formatDistanceToNow(new Date(agent.last_heartbeat), { addSuffix: true })
                  : 'Never'
                }
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Capabilities</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {agent.capabilities.map((cap: string) => (
                  <span key={cap} className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {cap}
                  </span>
                ))}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">System Info</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="space-y-1">
                  <li>Platform: {agent.system_info?.platform || 'Unknown'}</li>
                  <li>Python: {agent.system_info?.python || 'Unknown'}</li>
                  <li>Hostname: {agent.system_info?.hostname || 'Unknown'}</li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mt-8 mb-4">Tasks</h2>
      
      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Tasks</h3>
          <p className="mt-1 text-sm text-gray-500">
            This agent hasn't been assigned any tasks yet.
          </p>
          <div className="mt-6">
            <Link
              href="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Task
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-yellow-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pending Tasks ({pendingTasks.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {pendingTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {task.repository_url}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {task.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {pendingTasks.length === 0 && (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  No pending tasks
                </li>
              )}
            </ul>
          </div>
          
          {/* Running Tasks */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-blue-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Running Tasks ({runningTasks.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {runningTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {task.repository_url}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {task.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {runningTasks.length === 0 && (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  No running tasks
                </li>
              )}
            </ul>
          </div>
          
          {/* Completed Tasks */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-green-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Completed Tasks ({completedTasks.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {completedTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {task.repository_url}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {task.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {completedTasks.length === 0 && (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  No completed tasks
                </li>
              )}
            </ul>
          </div>
          
          {/* Failed Tasks */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-red-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Failed Tasks ({failedTasks.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {failedTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {task.repository_url}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {task.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {failedTasks.length === 0 && (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  No failed tasks
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 