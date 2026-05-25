import React, { useState, useEffect } from 'react';
import { PatientCard } from './PatientCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { searchPatients } from '@/lib/fhir-client';
import { PAGINATION_SIZE } from '@/lib/constants';
import type { FHIRPatient, FHIRBundle } from '@/types/fhir';

interface PatientListProps {
  patients?: FHIRPatient[];
  onPatientClick?: (patient: FHIRPatient) => void;
}

export function PatientList({ patients: externalPatients, onPatientClick }: PatientListProps) {
  const [patients, setPatients] = useState<FHIRPatient[]>(externalPatients || []);
  const [isLoading, setIsLoading] = useState(!externalPatients);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (externalPatients) {
      setPatients(externalPatients);
      setIsLoading(false);
      return;
    }

    loadPatients();
  }, [externalPatients]);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const bundle: FHIRBundle = await searchPatients({
        _count: PAGINATION_SIZE,
        _offset: offset,
      });
      
      const newPatients = bundle.entry?.map(entry => entry.resource as FHIRPatient) || [];
      setPatients(newPatients);
      setHasMore(newPatients.length === PAGINATION_SIZE);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientClick = (patient: FHIRPatient) => {
    if (onPatientClick) {
      onPatientClick(patient);
    } else {
      window.location.href = `/patients/${patient.id}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onClick={() => handlePatientClick(patient)}
        />
      ))}
    </div>
  );
}
