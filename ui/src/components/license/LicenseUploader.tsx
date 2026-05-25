import { useState, useCallback } from 'react';
import { ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

interface LicenseUploaderProps {
  onUploadSuccess?: () => void;
}

export function LicenseUploader({ onUploadSuccess }: LicenseUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [restarting, setRestarting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Security: Additional client-side validation
    if (file.size > 1024 * 1024) { // 1MB
      setUploadStatus({
        type: 'error',
        message: 'File too large. License files should be less than 1MB.',
      });
      return;
    }

    // Security: Validate filename
    if (!file.name.match(/^[a-zA-Z0-9._-]+\.json$/)) {
      setUploadStatus({
        type: 'error',
        message: 'Invalid filename. Please use the official firely-license.json file.',
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      // Upload the license file
      const formData = new FormData();
      formData.append('license', file);

      const response = await fetch('/api/license/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadStatus({
        type: 'success',
        message: `License uploaded successfully for ${result.licensee}. Click "Restart Server" to apply.`,
      });

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload license',
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    disabled: uploading || restarting,
  });

  const handleRestart = async () => {
    setRestarting(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/license/restart', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Restart failed');
      }

      setUploadStatus({
        type: 'success',
        message: result.message,
      });

      // Wait a moment then trigger callback to refresh server status
      setTimeout(() => {
        onUploadSuccess?.();
      }, 2000);

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to restart server',
      });
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
          }
          ${(uploading || restarting) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3">
          <ArrowUpTrayIcon className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Uploading license...</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your license file here' : 'Drag & drop your Firely license'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select <code className="bg-gray-100 px-2 py-1 rounded text-xs">firely-license.json</code>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus.type === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">{uploadStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{uploadStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Restart Button - shown after successful upload */}
      {uploadStatus.type === 'success' && !uploadStatus.message.includes('restarting') && (
        <button
          onClick={handleRestart}
          disabled={restarting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
        >
          {restarting ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Restarting Server...</span>
            </span>
          ) : (
            'Restart Server to Apply License'
          )}
        </button>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-medium mb-2">📝 How to get a license:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>
            Visit{' '}
            <a
              href="https://fire.ly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              fire.ly
            </a>{' '}
            to request an evaluation license
          </li>
          <li>You'll receive a <code className="bg-gray-200 px-1 rounded">firely-license.json</code> file via email</li>
          <li>Drag and drop that file here to configure the server</li>
          <li>Click the restart button to activate the license</li>
        </ol>
      </div>
    </div>
  );
}
