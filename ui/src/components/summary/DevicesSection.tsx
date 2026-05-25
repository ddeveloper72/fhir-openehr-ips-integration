import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { JsonToggle } from './JsonToggle';
import { getCodeableConceptDisplay, formatDate } from '@/lib/fhir-utils';
import type { FHIRDeviceUseStatement, FHIRDevice } from '@/types/fhir';

interface DevicesSectionProps {
  deviceUseStatements: FHIRDeviceUseStatement[];
  devices: FHIRDevice[];
}

export function DevicesSection({ deviceUseStatements, devices }: DevicesSectionProps) {
  if (deviceUseStatements.length === 0) {
    return (
      <Card title="Medical Devices">
        <p className="text-slate-600 text-sm">No medical devices recorded.</p>
      </Card>
    );
  }

  // Helper to find device by reference
  const findDevice = (reference: string | undefined): FHIRDevice | undefined => {
    if (!reference) return undefined;
    const deviceId = reference.split('/').pop();
    return devices.find(d => d.id === deviceId);
  };

  return (
    <Card title="Medical Devices" subtitle={`${deviceUseStatements.length} item(s)`}>
      <div className="space-y-3">
        {deviceUseStatements.map((statement, index) => {
          const device = findDevice(statement.device?.reference);
          
          return (
            <Disclosure key={statement.id || index}>
              {({ open }) => (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Disclosure.Button className="flex justify-between items-center w-full px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-start flex-1">
                      <CpuChipIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary-500" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {device?.deviceName?.[0]?.name || 'Medical Device'}
                        </p>
                        {device?.type && (
                          <p className="text-sm text-slate-600 mt-1">
                            Type: {getCodeableConceptDisplay(device.type)}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronUpIcon className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'transform rotate-180' : ''}`} />
                  </Disclosure.Button>
                  
                  <Disclosure.Panel className="px-4 py-3 bg-white border-t border-slate-200">
                    <div className="space-y-3 text-sm">
                      {statement.bodySite && (
                        <div>
                          <span className="text-slate-600 font-medium">Body Site:</span>
                          <p className="text-slate-900">{getCodeableConceptDisplay(statement.bodySite)}</p>
                        </div>
                      )}
                      
                      {device && (
                        <div className="grid grid-cols-2 gap-4">
                          {device.manufacturer && (
                            <div>
                              <span className="text-slate-600 font-medium">Manufacturer:</span>
                              <p className="text-slate-900">{device.manufacturer}</p>
                            </div>
                          )}
                          {device.modelNumber && (
                            <div>
                              <span className="text-slate-600 font-medium">Model:</span>
                              <p className="text-slate-900">{device.modelNumber}</p>
                            </div>
                          )}
                          {device.serialNumber && (
                            <div>
                              <span className="text-slate-600 font-medium">Serial Number:</span>
                              <p className="text-slate-900 font-mono text-xs">{device.serialNumber}</p>
                            </div>
                          )}
                          {device.manufactureDate && (
                            <div>
                              <span className="text-slate-600 font-medium">Manufactured:</span>
                              <p className="text-slate-900">{formatDate(device.manufactureDate)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-slate-200">
                        <JsonToggle 
                          data={{ statement, device }} 
                          label="View Details (JSON)" 
                        />
                      </div>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          );
        })}
      </div>
    </Card>
  );
}
