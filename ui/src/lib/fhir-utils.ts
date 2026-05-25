import type { FHIRPatient, FHIRBundle } from '@/types/fhir';

export function getPatientDisplayName(patient: FHIRPatient): string {
  if (!patient.name || patient.name.length === 0) {
    return 'Unknown Patient';
  }
  
  const name = patient.name[0];
  
  if (name.text) {
    return name.text;
  }
  
  const given = name.given?.join(' ') || '';
  const family = name.family || '';
  
  return `${given} ${family}`.trim() || 'Unknown Patient';
}

export function getOpenEHREhrId(patient: FHIRPatient): string | undefined {
  return patient.identifier?.find(
    id => id.system === 'http://www.openehr.org/id/ehr_id'
  )?.value;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getCodingDisplay(coding: Array<{ display?: string; code?: string }> | undefined): string {
  if (!coding || coding.length === 0) return 'N/A';
  return coding[0].display || coding[0].code || 'N/A';
}

export function getCodeableConceptDisplay(codeableConcept: {
  coding?: Array<{ display?: string; code?: string }>;
  text?: string;
} | undefined): string {
  if (!codeableConcept) return 'N/A';
  
  if (codeableConcept.text) return codeableConcept.text;
  
  return getCodingDisplay(codeableConcept.coding);
}

export function patchBundleSubjectReference(bundle: FHIRBundle, patientId: string): FHIRBundle {
  const patchedBundle = JSON.parse(JSON.stringify(bundle));
  
  if (patchedBundle.entry) {
    patchedBundle.entry.forEach((entry: any) => {
      if (entry.resource?.resourceType === 'Composition') {
        entry.resource.subject = {
          reference: `Patient/${patientId}`
        };
      }
    });
  }
  
  return patchedBundle;
}

export function extractResourcesFromBundle<T>(bundle: FHIRBundle, resourceType: string): T[] {
  if (!bundle.entry) return [];
  
  return bundle.entry
    .filter(entry => entry.resource?.resourceType === resourceType)
    .map(entry => entry.resource as T);
}

export function downloadJson(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
