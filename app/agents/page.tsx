import { getAgents } from '@/app/lib/db';
import { ServerIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default async function AgentsPage() {
  const agents = await getAgents();
  const onlineAgents = agents.filter(agent => agent.status === 'online');
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-gray-500">
          {onlineAgents.length} online / {agents.length} total
        </p>
      </div>
      
      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <ServerIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Agents</h3>
          <p className="mt-1 text-sm text-gray-500">
            No agents have registered with the console yet.
          </p>
          <div className="mt-6">
            <div className="rounded-md shadow">
              <a
                href="https://github.com/your-repo/sast-system"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {agents.map((agent) => (
              <li key={agent.id}>
                <Link href={`/agents/${agent.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {agent.status === 'online' ? (
                            <SignalIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <SignalSlashIcon className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-blue-600 truncate">
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
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <ServerIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {agent.system_info?.platform || 'Unknown platform'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Last heartbeat: {agent.last_heartbeat 
                            ? formatDistanceToNow(new Date(agent.last_heartbeat), { addSuffix: true }) 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 