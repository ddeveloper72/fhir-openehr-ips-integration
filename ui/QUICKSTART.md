# FHIR-openEHR Integration UI - Quick Start Guide

## Overview

The UI provides a user-friendly interface for testing the FHIR-to-openEHR integration without needing to use REST clients like Postman or curl.

## Features

✅ **Patient Management** - Create and search patients  
✅ **Bundle Upload** - Submit IPS bundles with pre-loaded examples  
✅ **Patient Summary** - View IPS data organized by sections  
✅ **Auto-patching** - Automatically updates patient references  
✅ **Export** - Download summaries as JSON files  

## Quick Start

### Option 1: Docker Compose (Recommended)

Run the entire stack including the UI:

```bash
# From project root
docker compose up

# The UI will be available at http://localhost:3000
# Backend API at http://localhost:4080
```

### Option 2: Local Development

Run the UI in development mode:

```bash
# Navigate to UI directory
cd ui

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# UI available at http://localhost:3000
```

**Note**: Make sure the backend FHIR API is running at `http://localhost:4080` before using the UI.

## Workflow

### 1. Create a Patient

1. Navigate to "Create Patient" from the dashboard
2. Fill in patient details (name, gender, birth date)
3. Click "Create Patient"
4. Note the Patient ID and openEHR EHR ID in the identifiers

### 2. Upload an IPS Bundle

1. Click "Upload Bundle" from the dashboard
2. Choose from:
   - **Pre-loaded examples**: Select from dropdown (ips_example_evsclient.json, ips.discrete.json, etc.)
   - **Upload your own**: Drag & drop or select a JSON file
3. The patient reference will be auto-patched if you came from a patient's page
4. Click "Submit Bundle"

### 3. View Patient Summary

1. Navigate to a patient's detail page
2. Click "View Summary"
3. Explore the organized sections:
   - Allergies & Intolerances
   - Problem List / Conditions
   - Medication List
   - Medical Devices
4. Toggle between human-readable and raw JSON views
5. Export the summary as a JSON file

## Available Example Files

- `ips_example_evsclient.json` - Standard IPS with all sections
- `ips.discrete.json` - Discrete composition format
- `ips.flat.json` - Flattened composition structure
- `ips.real.json` - Real-world example data
- `step6_ips_example.json` - Tutorial step 6 example
- `step7_ips_example.json` - Tutorial step 7 with medical devices

## Architecture

```
Browser (UI:3000) → Firely Server (API:4080) → openFHIR Plugin → openEHR CDR
```

The UI communicates with the Firely Server API, which uses the openFHIR plugin to translate between FHIR and openEHR formats.

## Troubleshooting

### UI not connecting to API

- Verify the backend is running: `curl http://localhost:4080/metadata`
- Check environment variable: `PUBLIC_FHIR_API_URL` in `.env`
- Review browser console for CORS or network errors

### Bundle upload fails

- Validate JSON syntax
- Ensure bundle has `resourceType: "Bundle"`
- Check that Composition resource exists in the bundle
- Verify patient exists before submitting bundle

### Summary not loading

- Confirm patient has data (upload a bundle first)
- Check that patient ID is correct
- Verify openFHIR mappings are loaded

## Development

```bash
# Type checking
npm run astro check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

```bash
PUBLIC_FHIR_API_URL=http://localhost:4080
PUBLIC_APP_NAME=FHIR-openEHR Integration
PUBLIC_APP_VERSION=1.0.0
```

## Support

For issues or questions:
- Review the main project README
- Check the tutorial steps in `tutorial/`
- Consult the [IPS Implementation Guide](https://hl7.org/fhir/uv/ips/)
