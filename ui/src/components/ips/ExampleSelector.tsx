import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { EXAMPLE_FILES } from '@/lib/constants';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ExampleFile } from '@/types/app';
import type { FHIRBundle } from '@/types/fhir';

interface ExampleSelectorProps {
  patientId?: string;
}

export function ExampleSelector({ patientId }: ExampleSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ExampleFile | null>(null);

  const handleSelectExample = async (example: ExampleFile) => {
    setIsLoading(true);
    setError(null);
    setSelectedFile(example);

    try {
      const response = await fetch(example.path);
      
      if (!response.ok) {
        throw new Error(`Failed to load example file: ${response.statusText}`);
      }
      
      const bundle = await response.json();
      
      // Dispatch event to parent page
      window.dispatchEvent(new CustomEvent('bundleSelected', { 
        detail: { bundle, example, patientId } 
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load example file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <Menu as="div" className="relative inline-block text-left w-full">
        <Menu.Button className="inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <div className="flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-slate-400" />
            {selectedFile ? selectedFile.name : 'Select an example file'}
          </div>
          <ChevronDownIcon className="w-5 h-5 ml-2 text-slate-400" />
        </Menu.Button>

        <Menu.Items className="absolute z-10 w-full mt-2 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {EXAMPLE_FILES.map((example) => (
              <Menu.Item key={example.id}>
                {({ active }) => (
                  <button
                    onClick={() => handleSelectExample(example)}
                    disabled={isLoading}
                    className={`${
                      active ? 'bg-primary-50 text-primary-900' : 'text-slate-900'
                    } group flex w-full items-start px-4 py-3 text-sm border-b border-slate-100 last:border-b-0`}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium">{example.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{example.description}</div>
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-slate-600">Loading example file...</span>
        </div>
      )}
    </div>
  );
}
