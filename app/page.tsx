import { 
  UserGroupIcon, 
  ServerIcon, 
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

export default async function Home() {
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
              <p className="text-2xl font-bold">0 / 0</p>
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
              <p className="text-2xl font-bold">0 / 0</p>
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
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Found in all scans</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="bg-gray-50 px-6 py-4">
            <p className="text-center text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
      
      {/* Recent vulnerabilities */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Recent Vulnerabilities</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="bg-gray-50 px-6 py-4">
            <p className="text-center text-gray-500">No vulnerabilities found</p>
          </div>
        </div>
      </div>
    </main>
  );
} 