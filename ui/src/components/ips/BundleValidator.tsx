import React from 'react';
import { validateBundle } from '@/lib/validators';
import { Alert } from '@/components/ui/Alert';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { FHIRBundle } from '@/types/fhir';

interface BundleValidatorProps {
  bundle: FHIRBundle;
}

export function BundleValidator({ bundle }: BundleValidatorProps) {
  const validation = validateBundle(bundle);

  if (validation.valid) {
    return (
      <Alert
        type="success"
        message="Bundle validation passed! This is a valid IPS Bundle."
      />
    );
  }

  return (
    <div className="space-y-2">
      <Alert type="error" message="Bundle validation failed. Please fix the following errors:" />
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <ul className="space-y-2">
          {validation.errors.map((error, index) => (
            <li key={index} className="text-sm text-error-800 flex items-start">
              <span className="inline-block w-2 h-2 bg-error-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
              {error}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
