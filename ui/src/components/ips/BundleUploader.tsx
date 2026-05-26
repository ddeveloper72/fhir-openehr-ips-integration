import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { Alert } from '@/components/ui/Alert';
import type { FHIRBundle } from '@/types/fhir';

interface BundleUploaderProps {
  patientId?: string;
}

export function BundleUploader({ patientId }: BundleUploaderProps) {
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('No file selected');
      return;
    }

    const file = acceptedFiles[0];

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const bundle = JSON.parse(content);
        
        if (bundle.resourceType !== 'Bundle') {
          setError('Invalid file: must be a FHIR Bundle');
          return;
        }
        
        // Dispatch event to parent page
        window.dispatchEvent(new CustomEvent('bundleSelected', { 
          detail: { bundle, patientId } 
        }));
      } catch (err) {
        setError('Failed to parse JSON file');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsText(file);
  }, [patientId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3">
          {isDragActive ? (
            <ArrowUpTrayIcon className="w-12 h-12 text-primary-500" />
          ) : (
            <DocumentIcon className="w-12 h-12 text-slate-400" />
          )}
          
          <div>
            <p className="text-lg font-medium text-slate-900">
              {isDragActive ? 'Drop your file here' : 'Upload IPS Bundle'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Drag and drop or click to select a JSON file
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
