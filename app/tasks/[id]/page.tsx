import { getTask, getScanResultsByTaskId, getVulnerabilities } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ServerIcon, BeakerIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  
  // Get task details
  const task = await getTask(id);
  if (!task) {
    notFound();
  }
  
  // Get scan results if available
  const scanResult = await getScanResultsByTaskId(id);
  
  // Get vulnerabilities
  const vulnerabilities = await getVulnerabilities(id);
  
  // Group vulnerabilities by severity
  const highVulnerabilities = vulnerabilities.filter(v => v.severity === 'high');
  const mediumVulnerabilities = vulnerabilities.filter(v => v.severity === 'medium');
  const lowVulnerabilities = vulnerabilities.filter(v => v.severity === 'low');
  
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
      
      {/* Task Status Banner */}
      <div className={`mb-6 rounded-md p-4 ${
        task.status === 'pending' 
          ? 'bg-yellow-50 border border-yellow-200' 
          : task.status === 'running'
            ? 'bg-blue-50 border border-blue-200'
            : task.status === 'completed'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {task.status === 'pending' && (
              <BeakerIcon className="h-5 w-5 text-yellow-400" />
            )}
            {task.status === 'running' && (
              <BeakerIcon className="h-5 w-5 text-blue-400" />
            )}
            {task.status === 'completed' && (
              <BeakerIcon className="h-5 w-5 text-green-400" />
            )}
            {task.status === 'failed' && (
              <BeakerIcon className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              task.status === 'pending' 
                ? 'text-yellow-800' 
                : task.status === 'running'
                  ? 'text-blue-800'
                  : task.status === 'completed'
                    ? 'text-green-800'
                    : 'text-red-800'
            }`}>
              Task Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </h3>
            <div className="mt-2 text-sm">
              <p className={
                task.status === 'pending' 
                  ? 'text-yellow-700' 
                  : task.status === 'running'
                    ? 'text-blue-700'
                    : task.status === 'completed'
                      ? 'text-green-700'
                      : 'text-red-700'
              }>
                {task.status === 'pending' && 'This task is waiting to be picked up by an agent.'}
                {task.status === 'running' && 'This task is currently being processed by an agent.'}
                {task.status === 'completed' && 'This task has been completed successfully.'}
                {task.status === 'failed' && 'This task failed to complete.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Task Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Repository: {task.repository_url}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Task ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.id}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Agent</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/agents/${task.agent_id}`} className="text-blue-600 hover:text-blue-500">
                  {task.agent_name || 'Unknown Agent'}
                </Link>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Branch</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {task.branch || 'Default branch'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Scanners</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {task.scanners.map((scanner: string) => (
                  <span key={scanner} className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {scanner}
                  </span>
                ))}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(task.created_at), 'PPP p')} ({formatDistanceToNow(new Date(task.created_at), { addSuffix: true })})
              </dd>
            </div>
            {task.started_at && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Started</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(task.started_at), 'PPP p')} ({formatDistanceToNow(new Date(task.started_at), { addSuffix: true })})
                </dd>
              </div>
            )}
            {task.completed_at && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Completed</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(task.completed_at), 'PPP p')} ({formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })})
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Vulnerability Summary */}
      {vulnerabilities.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Vulnerability Summary
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {vulnerabilities.length} vulnerabilities found
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">High Severity</p>
                  <p className="text-2xl font-bold text-red-600">{highVulnerabilities.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 font-semibold">Medium Severity</p>
                  <p className="text-2xl font-bold text-yellow-600">{mediumVulnerabilities.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold">Low Severity</p>
                  <p className="text-2xl font-bold text-blue-600">{lowVulnerabilities.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Vulnerabilities List */}
      {vulnerabilities.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Detected Vulnerabilities
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {vulnerabilities.map((vulnerability) => (
                <li key={vulnerability.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <ShieldExclamationIcon 
                        className={`h-5 w-5 ${
                          vulnerability.severity === 'high'
                            ? 'text-red-500'
                            : vulnerability.severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                        }`} 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {vulnerability.message}
                      </h4>
                      <div className="mt-1 flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vulnerability.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : vulnerability.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {vulnerability.severity}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          Confidence: {vulnerability.confidence}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          Scanner: {vulnerability.scanner}
                        </span>
                        {vulnerability.cwe && (
                          <span className="ml-2 text-xs text-gray-500">
                            CWE: {vulnerability.cwe}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {vulnerability.description}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          File: {vulnerability.file_path}:{vulnerability.line_number}
                        </p>
                      </div>
                      <div className="mt-2 bg-gray-50 p-2 rounded-md overflow-x-auto">
                        <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                          {vulnerability.code_snippet}
                        </pre>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* No Vulnerabilities */}
      {task.status === 'completed' && vulnerabilities.length === 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Scan Results
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center">
            <ShieldExclamationIcon className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Vulnerabilities Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The security scan did not find any vulnerabilities in this repository.
            </p>
          </div>
        </div>
      )}
      
      {/* No Results Yet */}
      {(task.status === 'pending' || task.status === 'running') && !scanResult && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Scan Results
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center">
            <BeakerIcon className="h-12 w-12 mx-auto text-yellow-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Scan In Progress</h3>
            <p className="mt-1 text-sm text-gray-500">
              {task.status === 'pending' 
                ? 'Waiting for an agent to pick up this task.'
                : 'The security scan is currently running.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {task.status === 'failed' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Scan Results
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center">
            <BeakerIcon className="h-12 w-12 mx-auto text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Scan Failed</h3>
            <p className="mt-1 text-sm text-gray-500">
              The security scan failed to complete.
            </p>
            {scanResult && scanResult.error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 p-4 rounded-md">
                <p className="font-medium">Error:</p>
                <p className="mt-1">{scanResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 