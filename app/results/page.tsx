import { getScanResults, getVulnerabilities } from '@/app/lib/db';
import Link from 'next/link';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default async function ResultsPage() {
  // Fetch scan results and vulnerabilities
  const results = await getScanResults();
  const vulnerabilities = await getVulnerabilities();
  
  // Count vulnerabilities by severity
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Security Results</h1>
      </div>
      
      {/* Vulnerability Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Vulnerability Summary
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {vulnerabilities.length} vulnerabilities found across {results.length} scans
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{highCount}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">Medium Severity</p>
              <p className="text-2xl font-bold text-yellow-600">{mediumCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold">Low Severity</p>
              <p className="text-2xl font-bold text-blue-600">{lowCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Scan Results */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Scan Results
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {results.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <ShieldExclamationIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Scan Results</h3>
              <p className="mt-1 text-sm text-gray-500">
                No security scans have been completed yet.
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
            <ul className="divide-y divide-gray-200">
              {results.map((result) => (
                <li key={result.id} className="px-4 py-4 sm:px-6">
                  <Link href={`/tasks/${result.task_id}`} className="block hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {result.repository_url}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Agent: {result.agent_name || 'Unknown'}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {result.end_time ? (
                            `Duration: ${formatDuration(new Date(result.start_time), new Date(result.end_time))}`
                          ) : (
                            'No end time recorded'
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {result.end_time ? (
                            `Completed ${formatDistanceToNow(new Date(result.end_time), { addSuffix: true })}`
                          ) : (
                            `Started ${formatDistanceToNow(new Date(result.start_time), { addSuffix: true })}`
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Recent Vulnerabilities */}
      {vulnerabilities.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Vulnerabilities
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {vulnerabilities.slice(0, 10).map((vulnerability) => (
                <li key={vulnerability.id} className="px-4 py-4 sm:px-6">
                  <Link href={`/tasks/${vulnerability.task_id}`} className="block hover:bg-gray-50">
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
                        <h4 className="text-sm font-medium text-gray-900 truncate">
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
                            Scanner: {vulnerability.scanner}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">
                            File: {vulnerability.file_path}:{vulnerability.line_number}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">
                            Repository: {vulnerability.repository_url}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {vulnerabilities.length > 10 && (
              <div className="px-4 py-3 bg-gray-50 text-center sm:px-6">
                <p className="text-sm text-gray-700">
                  Showing 10 of {vulnerabilities.length} vulnerabilities
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format duration between two dates
function formatDuration(start: Date, end: Date): string {
  const durationMs = end.getTime() - start.getTime();
  const seconds = Math.floor(durationMs / 1000);
  
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes} min ${remainingSeconds} sec`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours} hr ${remainingMinutes} min`;
} 