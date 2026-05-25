import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { JsonToggle } from './JsonToggle';
import { getCodeableConceptDisplay, formatDateTime } from '@/lib/fhir-utils';
import type { FHIRMedicationStatement } from '@/types/fhir';

interface MedicationsSectionProps {
  medications: FHIRMedicationStatement[];
}

export function MedicationsSection({ medications }: MedicationsSectionProps) {
  if (medications.length === 0) {
    return (
      <Card title="Medication List">
        <p className="text-slate-600 text-sm">No medications recorded.</p>
      </Card>
    );
  }

  return (
    <Card title="Medication List" subtitle={`${medications.length} item(s)`}>
      <div className="space-y-3">
        {medications.map((medication, index) => (
          <Disclosure key={medication.id || index}>
            {({ open }) => (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Disclosure.Button className="flex justify-between items-center w-full px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start flex-1">
                    <BeakerIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-success-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {getCodeableConceptDisplay(medication.medicationCodeableConcept)}
                      </p>
                      {medication.status && (
                        <p className="text-sm text-slate-600 mt-1">
                          Status: <span className="capitalize">{medication.status}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronUpIcon className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'transform rotate-180' : ''}`} />
                </Disclosure.Button>
                
                <Disclosure.Panel className="px-4 py-3 bg-white border-t border-slate-200">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {medication.status && (
                        <div>
                          <span className="text-slate-600 font-medium">Status:</span>
                          <p className="text-slate-900 capitalize">{medication.status}</p>
                        </div>
                      )}
                      {medication.effectiveDateTime && (
                        <div>
                          <span className="text-slate-600 font-medium">Effective:</span>
                          <p className="text-slate-900">{formatDateTime(medication.effectiveDateTime)}</p>
                        </div>
                      )}
                      {medication.dateAsserted && (
                        <div>
                          <span className="text-slate-600 font-medium">Date Asserted:</span>
                          <p className="text-slate-900">{formatDateTime(medication.dateAsserted)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <JsonToggle data={medication} label="View Details (JSON)" />
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
