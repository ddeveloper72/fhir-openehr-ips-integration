import React from 'react';
import { UserIcon, CalendarIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { getPatientDisplayName, getOpenEHREhrId, formatDate } from '@/lib/fhir-utils';
import type { FHIRPatient } from '@/types/fhir';

interface PatientCardProps {
  patient: FHIRPatient;
  onClick?: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const displayName = getPatientDisplayName(patient);
  const ehrId = getOpenEHREhrId(patient);

  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}>
      <div onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{displayName}</h4>
              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                {patient.gender && (
                  <span className="capitalize">{patient.gender}</span>
                )}
                {patient.birthDate && (
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(patient.birthDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600">FHIR ID:</span>
              <span className="ml-2 font-mono text-slate-900">{patient.id || 'N/A'}</span>
            </div>
            {ehrId && (
              <div className="flex items-center">
                <IdentificationIcon className="w-4 h-4 text-slate-500 mr-1" />
                <span className="text-slate-600">EHR ID:</span>
                <span className="ml-2 font-mono text-slate-900 truncate">{ehrId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
