export interface ExampleFile {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface PatientStats {
  totalPatients: number;
  recentActivities: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ServerStatus {
  isAvailable: boolean;
  isLicenseValid: boolean;
  isInitializing: boolean;
  message?: string;
  errorCode?: string;
}
