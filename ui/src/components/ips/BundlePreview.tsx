import { useState } from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { FHIRBundle } from '@/types/fhir';

interface BundlePreviewProps {
  bundle: FHIRBundle;
  title?: string;
}

export function BundlePreview({ bundle, title = 'Bundle Preview' }: BundlePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <EyeSlashIcon className="w-4 h-4 mr-2" />
              Collapse
            </>
          ) : (
            <>
              <EyeIcon className="w-4 h-4 mr-2" />
              Expand All
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-slate-50 rounded-lg p-4 overflow-auto max-h-96 border border-slate-200">
        <JsonView
          src={bundle}
          collapsed={!isExpanded ? 2 : false}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-600">Resource Type:</span>
          <span className="ml-2 font-mono text-slate-900">{bundle.resourceType}</span>
        </div>
        <div>
          <span className="text-slate-600">Bundle Type:</span>
          <span className="ml-2 font-mono text-slate-900">{bundle.type}</span>
        </div>
        <div>
          <span className="text-slate-600">Entries:</span>
          <span className="ml-2 font-mono text-slate-900">{bundle.entry?.length || 0}</span>
        </div>
        {bundle.timestamp && (
          <div>
            <span className="text-slate-600">Timestamp:</span>
            <span className="ml-2 font-mono text-slate-900 text-xs">{bundle.timestamp}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
