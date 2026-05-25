import React from 'react';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';
import { AllergiesSection } from './AllergiesSection';
import { ConditionsSection } from './ConditionsSection';
import { MedicationsSection } from './MedicationsSection';
import { DevicesSection } from './DevicesSection';
import { Button } from '@/components/ui/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { extractResourcesFromBundle, downloadJson } from '@/lib/fhir-utils';
import type { 
  FHIRBundle, 
  FHIRAllergyIntolerance, 
  FHIRCondition, 
  FHIRMedicationStatement,
  FHIRDeviceUseStatement,
  FHIRDevice
} from '@/types/fhir';

interface SummaryViewerProps {
  bundle: FHIRBundle;
  patientId?: string;
}

export function SummaryViewer({ bundle, patientId }: SummaryViewerProps) {
  const allergies = extractResourcesFromBundle<FHIRAllergyIntolerance>(bundle, 'AllergyIntolerance');
  const conditions = extractResourcesFromBundle<FHIRCondition>(bundle, 'Condition');
  const medications = extractResourcesFromBundle<FHIRMedicationStatement>(bundle, 'MedicationStatement');
  const deviceUseStatements = extractResourcesFromBundle<FHIRDeviceUseStatement>(bundle, 'DeviceUseStatement');
  const devices = extractResourcesFromBundle<FHIRDevice>(bundle, 'Device');

  const handleExport = () => {
    const filename = patientId 
      ? `patient-${patientId}-summary.json` 
      : 'patient-summary.json';
    downloadJson(bundle, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Patient Summary</h2>
        <Button variant="outline" onClick={handleExport}>
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Export Summary
        </Button>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 p-1">
          {['Allergies', 'Conditions', 'Medications', 'Devices'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                clsx(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-primary-700 shadow'
                    : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-800'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <AllergiesSection allergies={allergies} />
          </Tab.Panel>
          <Tab.Panel>
            <ConditionsSection conditions={conditions} />
          </Tab.Panel>
          <Tab.Panel>
            <MedicationsSection medications={medications} />
          </Tab.Panel>
          <Tab.Panel>
            <DevicesSection 
              deviceUseStatements={deviceUseStatements} 
              devices={devices} 
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
