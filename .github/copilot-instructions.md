# Copilot Instructions for FHIR-openEHR Integration UI

## Project Overview

This project provides a FHIR facade on top of an openEHR CDR (Clinical Data Repository), focusing on the International Patient Summary (IPS) use case. The UI serves as a user-friendly interface for non-technical users to interact with the FHIR-to-openEHR integration.

## Architecture Context

- **Backend API**: Firely Server with openFHIR plugin at `http://localhost:4080`
- **Frontend**: Astro-based UI at `http://localhost:3000` (or configurable port)
- **Deployment**: Docker Compose orchestration for seamless integration
- **Data Flow**: FHIR ↔️ openFHIR Plugin ↔️ openEHR CDR

## UI Requirements

### Core Functionality

1. **Patient Management**
   - Create new patients with FHIR-compliant data
   - Search existing patients by name, ID, or identifier
   - Display patient details including openEHR EHR ID
   - List all patients with pagination

2. **IPS Bundle Management**
   - **Pre-loaded Examples**: Dropdown/list to select from existing example files:
     - `examples/ips_example_evsclient.json`
     - `examples/ips.discrete.json`
     - `examples/ips.flat.json`
     - `examples/ips.real.json`
     - `tutorial/step6/ips_example.json`
     - `tutorial/step7/ips_example.json`
   - **File Upload**: Allow users to upload their own IPS Bundle JSON files
   - **Preview**: Display JSON preview before submission with syntax highlighting
   - **Validation**: Client-side validation for FHIR Bundle structure
   - **Auto-patching**: Automatically update `Composition.subject.reference` to match selected patient

3. **Patient Summary Viewer**
   - Fetch and display IPS summary via `GET /Patient/{id}/$summary`
   - Organized sections with collapsible/expandable panels:
     - **Allergies & Intolerances**
     - **Problem List / Conditions**
     - **Medication List**
     - **Medical Devices**
   - Human-readable formatting of FHIR resources
   - Raw JSON view toggle for technical users
   - Export summary as JSON file

4. **Dashboard/Home**
   - Quick stats: Total patients, recent activities
   - Quick actions: Create patient, Upload bundle, Search
   - System health indicator (API connectivity)
   - Tutorial/Getting Started guide

5. **Error Handling & Feedback**
   - User-friendly error messages for API errors, validation issues, and network problems
   - Success notifications for operations like patient creation and bundle submission
   - Loading indicators for async operations

6. **Git version control**
   - Use Git for version control with clear commit messages
   - Branching strategy for features, bug fixes, and releases
   - Regular commits to document progress and changes
   - Manage seecrets securely (e.g., API keys, environment variables) using GitHub Secrets or .env files (not committed to version control)
   - Do not include any sensitive information in commit messages or code comments as well as scripts or configuration files

### Technical Stack

```yaml
framework: Astro 4.x
ui_library: React (for interactive components/islands)
styling: Tailwind CSS
components:
  - Headless UI (for modals, dropdowns)
  - React JSON View (for JSON visualization)
  - Monaco Editor or CodeMirror (for JSON editing)
http_client: Fetch API or Axios
state: React Context/Zustand (for complex state)
forms: React Hook Form + Zod validation
icons: Lucide React or Heroicons
```

### Docker Integration

**Location**: `ui/` directory in project root

**Dockerfile specifications**:
```dockerfile
# Multi-stage build for optimization
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "./dist/server/entry.mjs"]
```

**docker-compose.yml addition**:
```yaml
ui:
  build: ./ui
  ports:
    - "3000:3000"
  environment:
    - FHIR_API_URL=http://firely:4080
    - PUBLIC_FHIR_API_URL=http://localhost:4080
  depends_on:
    - firely
  networks:
    - fhir-network
```

### API Integration

#### Endpoints to Implement

```typescript
// Base URL: http://localhost:4080

// 1. Create Patient
POST /Patient
Content-Type: application/fhir+json
Body: {
  "resourceType": "Patient",
  "active": true,
  "name": [{ "use": "official", "family": "Doe", "given": ["John"] }],
  "gender": "male",
  "birthDate": "1980-01-01"
}

// 2. Search Patients
GET /Patient?name=John
GET /Patient?_id=patient-123
GET /Patient?_count=20&_offset=0

// 3. Get Patient by ID
GET /Patient/{id}

// 4. Submit IPS Bundle
POST /
Content-Type: application/fhir+json
Body: <IPS Bundle JSON>

// 5. Get Patient Summary
GET /Patient/{id}/$summary
Returns: IPS Bundle with all sections
```

### File Structure

```
ui/
├── Dockerfile
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── public/
│   ├── examples/          # Symlink or copy from ../examples/
│   │   ├── ips_example_evsclient.json
│   │   ├── ips.discrete.json
│   │   ├── ips.flat.json
│   │   └── ips.real.json
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── Navigation.astro
│   │   ├── patient/
│   │   │   ├── PatientForm.tsx          # Create patient form
│   │   │   ├── PatientSearch.tsx        # Search interface
│   │   │   ├── PatientCard.tsx          # Patient display card
│   │   │   └── PatientList.tsx          # List with pagination
│   │   ├── ips/
│   │   │   ├── BundleUploader.tsx       # File selection/upload
│   │   │   ├── BundlePreview.tsx        # JSON preview
│   │   │   ├── ExampleSelector.tsx      # Pre-loaded examples
│   │   │   └── BundleValidator.tsx      # Client validation
│   │   ├── summary/
│   │   │   ├── SummaryViewer.tsx        # Main summary display
│   │   │   ├── AllergiesSection.tsx     # Allergies display
│   │   │   ├── ConditionsSection.tsx    # Conditions display
│   │   │   ├── MedicationsSection.tsx   # Medications display
│   │   │   ├── DevicesSection.tsx       # Medical devices
│   │   │   └── JsonToggle.tsx           # Raw JSON toggle
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Alert.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── fhir-client.ts               # API client wrapper
│   │   ├── fhir-utils.ts                # FHIR helpers
│   │   ├── validators.ts                # Zod schemas
│   │   └── constants.ts                 # API URLs, config
│   ├── types/
│   │   ├── fhir.ts                      # FHIR type definitions
│   │   └── app.ts                       # App-specific types
│   ├── layouts/
│   │   └── Layout.astro                 # Main layout
│   ├── pages/
│   │   ├── index.astro                  # Dashboard/Home
│   │   ├── patients/
│   │   │   ├── index.astro              # Patient list
│   │   │   ├── new.astro                # Create patient
│   │   │   └── [id].astro               # Patient details
│   │   ├── bundles/
│   │   │   └── upload.astro             # Upload IPS bundle
│   │   └── summary/
│   │       └── [id].astro               # Patient summary
│   └── styles/
│       └── global.css
└── .env.example
```

### Styling Guidelines

- **Design System**: Clean, medical/healthcare aesthetic
- **Color Palette**:
  - Primary: Blue (#3B82F6) - Trust, medical
  - Success: Green (#10B981) - Successful operations
  - Warning: Yellow (#F59E0B) - Warnings
  - Error: Red (#EF4444) - Errors
  - Neutral: Slate grays for text/backgrounds
- **Typography**: System font stack for readability
- **Spacing**: Generous padding, clear visual hierarchy
- **Accessibility**: WCAG 2.1 AA compliance minimum

### Example File Handling

**Approach**: Bundle example files into the UI container

```typescript
// src/lib/constants.ts
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
  }
];

// Load example file
export async function loadExampleFile(path: string) {
  const response = await fetch(path);
  return response.json();
}
```

### Key Features to Implement

1. **Auto-Reference Patching**
   ```typescript
   function patchBundleSubjectReference(bundle: any, patientId: string) {
     if (bundle.entry) {
       bundle.entry.forEach((entry: any) => {
         if (entry.resource?.resourceType === 'Composition') {
           entry.resource.subject = {
             reference: `Patient/${patientId}`
           };
         }
       });
     }
     return bundle;
   }
   ```

2. **Error Handling**
   - Display user-friendly error messages
   - Network error recovery
   - API error translation (FHIR OperationOutcome)
   - Validation error highlighting

3. **Loading States**
   - Skeleton loaders for data fetching
   - Progress indicators for file uploads
   - Optimistic UI updates where appropriate

4. **Responsive Design**
   - Mobile-first approach
   - Tablet and desktop optimized layouts
   - Touch-friendly interactive elements

### Environment Variables

```bash
# .env.example
PUBLIC_FHIR_API_URL=http://localhost:4080
PUBLIC_APP_NAME=FHIR-openEHR Integration
PUBLIC_APP_VERSION=1.0.0
```

### Testing Considerations

- API endpoint connectivity tests
- Form validation tests
- Bundle parsing tests
- Example file loading tests
- Mock FHIR server for development

### Documentation

Include in the UI:
- **Tutorial/Help Section**: Step-by-step guide for new users
- **API Status Page**: Show connection to backend
- **Example Workflow**: Create patient → Upload bundle → View summary
- **Tooltips**: Explain FHIR concepts for non-technical users

### Development Commands

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

### Additional Customization Parameters

When building the UI, consider these customizable aspects:

1. **Branding**
   - App name/logo
   - Color scheme override
   - Footer content (organization info)

2. **Feature Flags**
   - Enable/disable example files
   - Enable/disable file upload
   - Show/hide technical details (JSON, IDs)
   - Enable/disable patient editing

3. **Data Display**
   - Date format preferences
   - Resource display depth (summary vs detailed)
   - Section ordering in summary view

4. **Performance**
   - Pagination size
   - Cache duration
   - Request debouncing

5. **Accessibility**
   - High contrast mode
   - Font size options
   - Screen reader optimizations

## Implementation Notes

- Use TypeScript for type safety
- Implement proper error boundaries
- Add loading states for all async operations
- Use semantic HTML for accessibility
- Implement proper CORS handling if needed
- Consider adding toast notifications for user feedback
- Add confirmation dialogs for destructive actions
- Implement proper form validation with clear error messages

## Future Enhancements (Optional)

- Patient editing capabilities
- Bulk bundle upload
- Comparison view (before/after mapping)
- Search filters (by gender, age, etc.)
- Export reports as PDF
- openEHR composition viewer
- Mapping visualization (show FHIR ↔️ openEHR transformations)
- Analytics dashboard
- User authentication/authorization
- Audit log viewer
