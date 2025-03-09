import Link from 'next/link';
import { getAgents } from '@/app/lib/db';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import TaskForm from '@/app/components/TaskForm';

export default async function NewTaskPage() {
  const agents = await getAgents();
  const onlineAgents = agents.filter(agent => agent.status === 'online');
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Tasks
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New Task
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Create a new security scanning task to assign to an agent
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {onlineAgents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">
                No online agents are available to run tasks.
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                View Agents
              </Link>
            </div>
          ) : (
            <TaskForm agents={onlineAgents} />
          )}
        </div>
      </div>
    </div>
  );
} 