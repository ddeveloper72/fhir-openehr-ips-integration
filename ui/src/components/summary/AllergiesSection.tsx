import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { JsonToggle } from './JsonToggle';
import { getCodeableConceptDisplay, formatDateTime, getCodingDisplay } from '@/lib/fhir-utils';
import type { FHIRAllergyIntolerance } from '@/types/fhir';

interface AllergiesSectionProps {
  allergies: FHIRAllergyIntolerance[];
}

export function AllergiesSection({ allergies }: AllergiesSectionProps) {
  if (allergies.length === 0) {
    return (
      <Card title="Allergies & Intolerances">
        <p className="text-slate-600 text-sm">No allergies or intolerances recorded.</p>
      </Card>
    );
  }

  return (
    <Card title="Allergies & Intolerances" subtitle={`${allergies.length} item(s)`}>
      <div className="space-y-3">
        {allergies.map((allergy, index) => (
          <Disclosure key={allergy.id || index}>
            {({ open }) => (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Disclosure.Button className="flex justify-between items-center w-full px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start flex-1">
                    <ExclamationTriangleIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                      allergy.criticality === 'high' ? 'text-error-500' : 'text-warning-500'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900">
                        {getCodeableConceptDisplay(allergy.code)}
                      </p>
                      {allergy.category && (
                        <p className="text-sm text-slate-600 mt-1">
                          Type: <span className="capitalize">{allergy.category.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronUpIcon className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'transform rotate-180' : ''}`} />
                </Disclosure.Button>
                
                <Disclosure.Panel className="px-4 py-3 bg-white border-t border-slate-200">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {allergy.clinicalStatus && (
                        <div>
                          <span className="text-slate-600 font-medium">Clinical Status:</span>
                          <p className="text-slate-900">{getCodingDisplay(allergy.clinicalStatus.coding)}</p>
                        </div>
                      )}
                      {allergy.verificationStatus && (
                        <div>
                          <span className="text-slate-600 font-medium">Verification:</span>
                          <p className="text-slate-900">{getCodingDisplay(allergy.verificationStatus.coding)}</p>
                        </div>
                      )}
                      {allergy.criticality && (
                        <div>
                          <span className="text-slate-600 font-medium">Criticality:</span>
                          <p className="text-slate-900 capitalize">{allergy.criticality}</p>
                        </div>
                      )}
                      {allergy.onsetDateTime && (
                        <div>
                          <span className="text-slate-600 font-medium">Onset:</span>
                          <p className="text-slate-900">{formatDateTime(allergy.onsetDateTime)}</p>
                        </div>
                      )}
                    </div>
                    
                    {allergy.reaction && allergy.reaction.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium block mb-2">Reactions:</span>
                        <ul className="space-y-2 ml-4">
                          {allergy.reaction.map((reaction, idx) => (
                            <li key={idx} className="text-slate-900">
                              {reaction.manifestation?.map(m => m.text || getCodingDisplay(m.coding)).join(', ')}
                              {reaction.severity && (
                                <span className="ml-2 text-slate-600">({reaction.severity})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-slate-200">
                      <JsonToggle data={allergy} label="View Details (JSON)" />
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
