import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Application Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure your SAST system
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center">
          <Cog6ToothIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">
            Settings configuration will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
} 