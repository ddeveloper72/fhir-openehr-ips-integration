import { z } from 'zod';

export const patientSchema = z.object({
  family: z.string().min(1, 'Family name is required'),
  given: z.string().min(1, 'Given name is required'),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const bundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  type: z.string(),
  entry: z.array(z.object({
    resource: z.object({
      resourceType: z.string(),
    }).passthrough(),
  })).optional(),
});

export function validateBundle(bundle: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!bundle || typeof bundle !== 'object') {
    errors.push('Invalid bundle: not an object');
    return { valid: false, errors };
  }
  
  if (bundle.resourceType !== 'Bundle') {
    errors.push('Invalid bundle: resourceType must be "Bundle"');
  }
  
  if (!bundle.type) {
    errors.push('Invalid bundle: missing type');
  }
  
  if (!bundle.entry || !Array.isArray(bundle.entry)) {
    errors.push('Invalid bundle: entry must be an array');
  }
  
  // Check for IPS Composition
  const hasComposition = bundle.entry?.some(
    (entry: any) => entry.resource?.resourceType === 'Composition'
  );
  
  if (!hasComposition) {
    errors.push('Invalid IPS bundle: missing Composition resource');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
