import { useState } from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { Button } from '@/components/ui/Button';
import { CodeBracketIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface JsonToggleProps {
  data: any;
  label?: string;
}

export function JsonToggle({ data, label = 'View Raw JSON' }: JsonToggleProps) {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowJson(!showJson)}
      >
        {showJson ? (
          <>
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Hide JSON
          </>
        ) : (
          <>
            <CodeBracketIcon className="w-4 h-4 mr-2" />
            {label}
          </>
        )}
      </Button>

      {showJson && (
        <div className="bg-slate-50 rounded-lg p-4 overflow-auto max-h-96 border border-slate-200">
          <JsonView
            src={data}
            collapsed={2}
          />
        </div>
      )}
    </div>
  );
}
