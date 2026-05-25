# FHIR-openEHR Integration UI

This directory contains the Astro-based user interface for the FHIR-to-openEHR integration project.

## Features

- **Patient Management**: Create, search, and view patient records
- **IPS Bundle Upload**: Submit FHIR IPS bundles with pre-loaded examples or custom files
- **Patient Summary Viewer**: View IPS summaries organized by sections (Allergies, Conditions, Medications, Devices)
- **Automatic Reference Patching**: Updates bundle patient references automatically
- **Export Functionality**: Download patient summaries as JSON files

## Technology Stack

- **Framework**: Astro 4.x with SSR
- **UI Library**: React (for interactive islands)
- **Styling**: Tailwind CSS
- **Components**: Headless UI, Heroicons
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Backend FHIR API running at `http://localhost:4080`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The UI will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Docker

### Build the image

```bash
docker build -t fhir-openehr-ui .
```

### Run the container

```bash
docker run -p 3000:3000 \
  -e PUBLIC_FHIR_API_URL=http://localhost:4080 \
  fhir-openehr-ui
```

## Project Structure

```
ui/
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Header, Footer
│   │   ├── patient/      # Patient management
│   │   ├── ips/          # Bundle upload/preview
│   │   ├── summary/      # Summary viewer
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities and API client
│   ├── types/            # TypeScript definitions
│   ├── layouts/          # Astro layouts
│   ├── pages/            # Astro pages (routes)
│   └── styles/           # Global styles
├── public/
│   └── examples/         # Pre-loaded IPS examples
├── Dockerfile
├── package.json
└── astro.config.mjs
```

## Available Routes

- `/` - Dashboard with quick actions
- `/patients` - Patient list with search
- `/patients/new` - Create new patient
- `/patients/[id]` - Patient details
- `/bundles/upload` - Upload IPS bundle
- `/summary/[id]` - View patient summary

## Environment Variables

- `PUBLIC_FHIR_API_URL` - FHIR API base URL (default: `http://localhost:4080`)
- `PUBLIC_APP_NAME` - Application name (default: `FHIR-openEHR Integration`)
- `PUBLIC_APP_VERSION` - Application version (default: `1.0.0`)

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run astro check

# Build for production
npm run build
```

## Integration with Docker Compose

This UI is designed to run alongside the FHIR server and openEHR components. See the main project's `docker-compose.yml` for the full stack configuration.
