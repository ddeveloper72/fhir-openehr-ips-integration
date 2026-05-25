// FHIR Resource Types
export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  identifier?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  active?: boolean;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    text?: string;
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id?: string;
  type: string;
  timestamp?: string;
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource?: any;
    search?: {
      mode?: string;
    };
  }>;
}

export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  verificationStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  type?: string;
  category?: string[];
  criticality?: string;
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  patient?: {
    reference?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  reaction?: Array<{
    substance?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    manifestation?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
      text?: string;
    }>;
    severity?: string;
  }>;
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  verificationStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  severity?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
}

export interface FHIRMedicationStatement {
  resourceType: 'MedicationStatement';
  id?: string;
  status?: string;
  medicationCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference?: string;
  };
  effectiveDateTime?: string;
  dateAsserted?: string;
}

export interface FHIRDeviceUseStatement {
  resourceType: 'DeviceUseStatement';
  id?: string;
  status?: string;
  subject?: {
    reference?: string;
  };
  device?: {
    reference?: string;
  };
  bodySite?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
}

export interface FHIRDevice {
  resourceType: 'Device';
  id?: string;
  deviceName?: Array<{
    name?: string;
    type?: string;
  }>;
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  manufacturer?: string;
  manufactureDate?: string;
  expirationDate?: string;
  serialNumber?: string;
  modelNumber?: string;
  lotNumber?: string;
}

export interface FHIROperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: {
      text?: string;
    };
    diagnostics?: string;
  }>;
}
