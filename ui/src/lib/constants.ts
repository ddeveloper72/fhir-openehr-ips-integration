export const FHIR_API_URL = import.meta.env.PUBLIC_FHIR_API_URL || 'http://localhost:4080';
export const APP_NAME = import.meta.env.PUBLIC_APP_NAME || 'FHIR-openEHR Integration';
export const APP_VERSION = import.meta.env.PUBLIC_APP_VERSION || '1.0.0';

export const EXAMPLE_FILES = [
  {
    id: 'evsclient',
    name: 'IPS Example (EVS Client)',
    description: 'Standard IPS example with all sections',
    path: '/examples/ips_example_evsclient.json'
  },
  {
    id: 'discrete',
    name: 'IPS Discrete Format',
    description: 'Discrete composition format',
    path: '/examples/ips.discrete.json'
  },
  {
    id: 'flat',
    name: 'IPS Flat Format',
    description: 'Flattened composition structure',
    path: '/examples/ips.flat.json'
  },
  {
    id: 'real',
    name: 'IPS Real Example',
    description: 'Real-world example data',
    path: '/examples/ips.real.json'
  },
  {
    id: 'step6',
    name: 'Tutorial Step 6',
    description: 'Example from step 6 tutorial',
    path: '/examples/step6_ips_example.json'
  },
  {
    id: 'step7',
    name: 'Tutorial Step 7',
    description: 'Example from step 7 tutorial with devices',
    path: '/examples/step7_ips_example.json'
  }
];

export const PAGINATION_SIZE = 20;
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const REQUEST_DEBOUNCE_MS = 300;
