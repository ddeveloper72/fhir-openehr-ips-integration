import type { APIRoute } from 'astro';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Security constants
const MAX_FILE_SIZE = 1024 * 1024; // 1MB - Firely licenses are typically < 10KB
const ALLOWED_LICENSE_FIELDS = [
  'LicenseOptions',
  'Licensee',
  'Plugins',
  'Validation',
  'RequestOptions',
  'SupportedInteractions',
  'SupportedModel'
];

interface FirelyLicense {
  LicenseOptions: {
    Kind?: string;
    ValidUntil?: string;
    Plugins?: string[];
    [key: string]: any;
  };
  Licensee: {
    Name?: string;
    Email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

function sanitizeString(input: string): string {
  // Remove any potentially dangerous characters
  return input.replace(/[<>\"'`]/g, '');
}

function validateFirelyLicense(data: any): { valid: boolean; error?: string; license?: FirelyLicense } {
  // Check if it's an object
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, error: 'License must be a JSON object' };
  }

  // Check for required root fields
  if (!data.LicenseOptions) {
    return { valid: false, error: 'Missing required field: LicenseOptions' };
  }

  if (!data.Licensee) {
    return { valid: false, error: 'Missing required field: Licensee' };
  }

  // Validate LicenseOptions structure
  if (typeof data.LicenseOptions !== 'object' || Array.isArray(data.LicenseOptions)) {
    return { valid: false, error: 'LicenseOptions must be an object' };
  }

  // Validate Licensee structure
  if (typeof data.Licensee !== 'object' || Array.isArray(data.Licensee)) {
    return { valid: false, error: 'Licensee must be an object' };
  }

  // Check for suspicious fields (potential injection attempts)
  const suspiciousPatterns = [
    /__proto__/,
    /constructor/,
    /prototype/,
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // event handlers
    /eval\(/,
    /Function\(/
  ];

  const jsonString = JSON.stringify(data);
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(jsonString)) {
      return { valid: false, error: 'License contains suspicious content' };
    }
  }

  // Validate date format if ValidUntil exists
  if (data.LicenseOptions.ValidUntil) {
    const dateStr = data.LicenseOptions.ValidUntil;
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return { valid: false, error: 'Invalid ValidUntil date format. Expected ISO 8601 format.' };
    }
  }

  // Check that all root-level fields are expected
  const rootKeys = Object.keys(data);
  const unexpectedFields = rootKeys.filter(key => !ALLOWED_LICENSE_FIELDS.includes(key));
  
  if (unexpectedFields.length > 5) {
    // Allow some flexibility, but not too many unexpected fields
    return { valid: false, error: 'License contains too many unexpected fields' };
  }

  return { valid: true, license: data as FirelyLicense };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('license') as File;

    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No license file provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024}KB` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Security: Validate file extension
    if (!file.name.endsWith('.json')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'License file must be a JSON file (.json extension required)' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Security: Validate filename (prevent path traversal)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    if (safeName !== file.name || file.name.includes('..') || file.name.includes('/')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid filename' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read file content
    const text = await file.text();

    // Security: Validate it's valid JSON
    let licenseData;
    try {
      licenseData = JSON.parse(text);
    } catch (e) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON format in license file' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Security: Validate Firely license structure
    const validation = validateFirelyLicense(licenseData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: validation.error || 'Invalid license format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Write to config directory (mounted volume)
    // Use fixed filename to prevent path traversal
    const configPath = join('/app/config', 'firely-license.json');
    
    // Type guard - we know license exists here because validation passed
    if (!validation.license) {
      throw new Error('License validation succeeded but license data is missing');
    }
    
    // Pretty print with sanitization
    const sanitizedJson = JSON.stringify(validation.license, null, 2);
    await writeFile(configPath, sanitizedJson, 'utf-8');

    // Sanitize licensee name for response
    const licenseeName = validation.license.Licensee?.Name 
      ? sanitizeString(String(validation.license.Licensee.Name))
      : 'Unknown';

    return new Response(JSON.stringify({ 
      success: true,
      message: 'License uploaded successfully. Click "Restart Server" to apply changes.',
      licensee: licenseeName
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('License upload error:', error);
    
    // Don't expose internal errors to clients
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to upload license. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
