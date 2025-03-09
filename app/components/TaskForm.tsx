'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentData, TaskFormData } from '@/app/lib/definitions';

export default function TaskForm({ agents }: { agents: AgentData[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TaskFormData>({
    agent_id: agents.length > 0 ? agents[0].id : '',
    repository_url: '',
    branch: '',
    scanners: ['gitleaks', 'codeql']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push(`/tasks/${data.task.id}`);
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleScannerChange = (scanner: string) => {
    setFormData(prev => {
      const scanners = [...prev.scanners];
      if (scanners.includes(scanner)) {
        return { ...prev, scanners: scanners.filter(s => s !== scanner) };
      } else {
        return { ...prev, scanners: [...scanners, scanner] };
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700">
          Agent
        </label>
        <select
          id="agent_id"
          name="agent_id"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={formData.agent_id}
          onChange={handleChange}
          required
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} {agent.status === 'online' ? '(Online)' : '(Offline)'}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="repository_url" className="block text-sm font-medium text-gray-700">
          Repository URL
        </label>
        <input
          type="url"
          name="repository_url"
          id="repository_url"
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="https://github.com/username/repository"
          value={formData.repository_url}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
          Branch (optional)
        </label>
        <input
          type="text"
          name="branch"
          id="branch"
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="main"
          value={formData.branch}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">Scanners</legend>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="gitleaks"
                name="scanners"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.scanners.includes('gitleaks')}
                onChange={() => handleScannerChange('gitleaks')}
              />
              <label htmlFor="gitleaks" className="ml-3 text-sm text-gray-700">
                GitLeaks (Secrets Scanning)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="codeql"
                name="scanners"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.scanners.includes('codeql')}
                onChange={() => handleScannerChange('codeql')}
              />
              <label htmlFor="codeql" className="ml-3 text-sm text-gray-700">
                CodeQL (Multiple Languages)
              </label>
            </div>
          </div>
        </fieldset>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          onClick={() => router.push('/tasks')}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
} 