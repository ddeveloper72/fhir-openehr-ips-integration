import axios, { AxiosError } from 'axios';
import { FHIR_API_URL } from './constants';
import type { FHIRPatient, FHIRBundle, FHIROperationOutcome } from '@/types/fhir';
import type { ApiError, ServerStatus } from '@/types/app';

const apiClient = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
  },
});

// Error handler
function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<FHIROperationOutcome>;
    
    if (axiosError.response?.data?.resourceType === 'OperationOutcome') {
      const outcome = axiosError.response.data;
      const firstIssue = outcome.issue[0];
      return {
        message: firstIssue.diagnostics || firstIssue.details?.text || 'API error occurred',
        statusCode: axiosError.response.status,
        details: JSON.stringify(outcome.issue, null, 2),
      };
    }
    
    return {
      message: axiosError.message,
      statusCode: axiosError.response?.status,
      details: axiosError.response?.statusText,
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'Unknown error occurred',
  };
}

// Patient operations
export async function createPatient(patient: Partial<FHIRPatient>): Promise<FHIRPatient> {
  try {
    const response = await apiClient.post<FHIRPatient>('/Patient', patient);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function searchPatients(params: {
  name?: string;
  id?: string;
  _count?: number;
  _offset?: number;
}): Promise<FHIRBundle> {
  try {
    const response = await apiClient.get<FHIRBundle>('/Patient', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getPatient(id: string): Promise<FHIRPatient> {
  try {
    const response = await apiClient.get<FHIRPatient>(`/Patient/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// Bundle operations
export async function submitBundle(bundle: FHIRBundle): Promise<FHIRBundle> {
  try {
    const response = await apiClient.post<FHIRBundle>('/', bundle);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// Summary operations
export async function getPatientSummary(patientId: string): Promise<FHIRBundle> {
  try {
    const response = await apiClient.get<FHIRBundle>(`/Patient/${patientId}/$summary`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// Health check
export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get('/metadata');
    return true;
  } catch {
    return false;
  }
}

// Detailed server status check
export async function checkServerStatus(): Promise<ServerStatus> {
  try {
    const response = await apiClient.get('/metadata', {
      timeout: 5000,
    });
    
    return {
      isAvailable: true,
      isLicenseValid: true,
      isInitializing: false,
      message: 'Server is operational',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<FHIROperationOutcome>;
      
      // Check if it's a 423 Locked response (server initializing)
      if (axiosError.response?.status === 423) {
        const outcome = axiosError.response.data;
        const issue = outcome?.issue?.[0];
        
        if (issue?.code === 'lock-error') {
          return {
            isAvailable: true,
            isLicenseValid: true,
            isInitializing: true,
            message: issue.details?.text || 'Server is initializing. Please wait...',
            errorCode: 'INITIALIZING',
          };
        }
      }
      
      // Check for connection errors
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ECONNABORTED') {
        return {
          isAvailable: false,
          isLicenseValid: false,
          isInitializing: false,
          message: 'Cannot connect to FHIR server. Please ensure the server is running.',
          errorCode: 'CONNECTION_ERROR',
        };
      }
      
      // Check for 500 errors that might indicate license issues
      if (axiosError.response?.status === 500) {
        return {
          isAvailable: true,
          isLicenseValid: false,
          isInitializing: false,
          message: 'Server error detected. This may indicate a license issue.',
          errorCode: 'SERVER_ERROR',
        };
      }
    }
    
    // Generic error
    return {
      isAvailable: false,
      isLicenseValid: false,
      isInitializing: false,
      message: 'Failed to connect to FHIR server',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
}
