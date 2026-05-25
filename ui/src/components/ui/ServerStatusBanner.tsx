import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { checkServerStatus } from '@/lib/fhir-client';
import type { ServerStatus } from '@/types/app';
import { LicenseUploader } from '@/components/license/LicenseUploader';

export function ServerStatusBanner() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const serverStatus = await checkServerStatus();
        setStatus(serverStatus);
      } catch (error) {
        setStatus({
          isAvailable: false,
          isLicenseValid: false,
          isInitializing: false,
          message: 'Failed to check server status',
          errorCode: 'CHECK_FAILED',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    
    // Recheck every 30 seconds if there's an issue
    const interval = setInterval(() => {
      if (status && (!status.isAvailable || status.isInitializing || !status.isLicenseValid)) {
        checkStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status?.isAvailable, status?.isInitializing, status?.isLicenseValid]);

  // Callback when license upload is successful
  const handleUploadSuccess = () => {
    setIsLoading(true);
    // Recheck status after upload
    setTimeout(async () => {
      try {
        const serverStatus = await checkServerStatus();
        setStatus(serverStatus);
      } catch (error) {
        console.error('Failed to recheck status:', error);
      } finally {
        setIsLoading(false);
      }
    }, 3000);
  };

  if (isLoading) {
    return null;
  }

  if (!status) {
    return null;
  }

  // Server is fully operational
  if (status.isAvailable && status.isLicenseValid && !status.isInitializing) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900 mb-1">FHIR Server Connected</h3>
            <p className="text-sm text-green-700">
              The FHIR server is operational and ready to use.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Server is initializing
  if (status.isInitializing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Server Initializing</h3>
            <p className="text-sm text-blue-700 mb-2">
              {status.message || 'The FHIR server is loading conformance resources. This typically takes 3-5 minutes on first startup.'}
            </p>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-600">Checking again in 30 seconds...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Server not available or license issue
  if (!status.isAvailable || !status.isLicenseValid) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">FHIR Server Configuration Required</h3>
              <p className="text-sm text-red-700">
                {status.message || 'The FHIR server is not available or requires configuration.'}
              </p>
            </div>
            
            {/* License Upload Component */}
            <div className="bg-white rounded-lg p-4">
              <LicenseUploader onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Toggle for Manual Instructions */}
            <div>
              <button
                onClick={() => setShowManualInstructions(!showManualInstructions)}
                className="text-sm text-red-700 hover:text-red-900 underline font-medium"
              >
                {showManualInstructions ? '▼ Hide' : '▶ Show'} manual setup instructions
              </button>
            </div>

            {/* Manual Instructions (collapsible) */}
            {showManualInstructions && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-sm">
                <h4 className="font-semibold text-red-900 mb-2">
                  💻 Alternative: Manual Setup via Command Line
                </h4>
                
                <div className="space-y-2 text-red-800">
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Copy the license template:
                      <code className="block mt-1 bg-red-200 px-2 py-1 rounded text-xs font-mono">
                        cp config/firely-license.json.template config/firely-license.json
                      </code>
                    </li>
                    <li>
                      Get your license from{' '}
                      <a 
                        href="https://fire.ly" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-red-900 font-medium"
                      >
                        fire.ly
                      </a>
                      {' '}(evaluation licenses available)
                    </li>
                    <li>Paste your license into <code className="bg-red-200 px-1 rounded font-mono">config/firely-license.json</code></li>
                    <li>Restart the Docker containers:
                      <code className="block mt-1 bg-red-200 px-2 py-1 rounded text-xs font-mono">
                        docker compose restart firely
                      </code>
                    </li>
                  </ol>
                </div>

                <div className="mt-3 pt-3 border-t border-red-300">
                  <p className="text-xs text-red-700">
                    <strong>Note:</strong> The license file is automatically excluded from Git commits (.gitignore).
                    Each developer needs their own license file.
                  </p>
                </div>
              </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-xs text-red-600">Checking server status every 30 seconds...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
