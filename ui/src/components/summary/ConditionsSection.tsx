import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { JsonToggle } from './JsonToggle';
import { getCodeableConceptDisplay, formatDateTime, getCodingDisplay } from '@/lib/fhir-utils';
import type { FHIRCondition } from '@/types/fhir';

interface ConditionsSectionProps {
  conditions: FHIRCondition[];
}

export function ConditionsSection({ conditions }: ConditionsSectionProps) {
  if (conditions.length === 0) {
    return (
      <Card title="Problem List / Conditions">
        <p className="text-slate-600 text-sm">No conditions recorded.</p>
      </Card>
    );
  }

  return (
    <Card title="Problem List / Conditions" subtitle={`${conditions.length} item(s)`}>
      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <Disclosure key={condition.id || index}>
            {({ open }) => (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Disclosure.Button className="flex justify-between items-center w-full px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start flex-1">
                    <HeartIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {getCodeableConceptDisplay(condition.code)}
                      </p>
                      {condition.clinicalStatus && (
                        <p className="text-sm text-slate-600 mt-1">
                          Status: {getCodingDisplay(condition.clinicalStatus.coding)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronUpIcon className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'transform rotate-180' : ''}`} />
                </Disclosure.Button>
                
                <Disclosure.Panel className="px-4 py-3 bg-white border-t border-slate-200">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {condition.clinicalStatus && (
                        <div>
                          <span className="text-slate-600 font-medium">Clinical Status:</span>
                          <p className="text-slate-900">{getCodingDisplay(condition.clinicalStatus.coding)}</p>
                        </div>
                      )}
                      {condition.verificationStatus && (
                        <div>
                          <span className="text-slate-600 font-medium">Verification:</span>
                          <p className="text-slate-900">{getCodingDisplay(condition.verificationStatus.coding)}</p>
                        </div>
                      )}
                      {condition.severity && (
                        <div>
                          <span className="text-slate-600 font-medium">Severity:</span>
                          <p className="text-slate-900">{getCodeableConceptDisplay(condition.severity)}</p>
                        </div>
                      )}
                      {condition.onsetDateTime && (
                        <div>
                          <span className="text-slate-600 font-medium">Onset:</span>
                          <p className="text-slate-900">{formatDateTime(condition.onsetDateTime)}</p>
                        </div>
                      )}
                    </div>
                    
                    {condition.category && condition.category.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium">Category:</span>
                        <p className="text-slate-900">
                          {condition.category.map(cat => getCodeableConceptDisplay(cat)).join(', ')}
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-slate-200">
                      <JsonToggle data={condition} label="View Details (JSON)" />
                    </div>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </Card>
  );
}
