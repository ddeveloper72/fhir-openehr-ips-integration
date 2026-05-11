# Step 6: Create Medical Devices Mappings and Test the Full Flow

## Background

The IPS medical devices section is not yet mapped. In this step you will create FHIRConnect mappings from the openEHR
`EVALUATION.device_summary.v0` archetype (and its nested `CLUSTER.device.v1`) to the FHIR `DeviceUseStatement` and
`Device` resources, as defined in the IPS IG.

The full field-level mapping is specified in [`Medica_ Devices.csv`](Medica_%20Devices.csv).

## Mapping Table

### Section level

| openEHR archetype | openEHR name | FHIR path | Notes |
|-------------------|--------------|-----------|-------|
| `SECTION.adhoc.v1` | EPS Medical Devices | `Composition.section:sectionMedicalDevices` | Section header |
| `EVALUATION.absence.v2` | Absence of information | — | Used when no device data is available |
| `/items[…absence.v2]/data[at0001]/items[at0002]/value` | Absence statement | — | Free text, no FHIR mapping |
| `/items[…absence.v2]/data[at0001]/items[at0005]/value` | Reason for absence | `Composition.section:sectionMedicalDevices.emptyReason` | |
| `EVALUATION.clinical_synopsis.v1` | Clinical synopsis | — | Narrative only |
| `/items[…clinical_synopsis.v1]/data[at0001]/items[at0002]/value` | Synopsis | `Composition.section:sectionMedicalDevices.text` | Human-readable narrative |

### Entry level: `EVALUATION.device_summary.v0` → `DeviceUseStatement`

| openEHR name | openEHR path | FHIR path | Cardinality | Notes |
|--------------|--------------|-----------|-------------|-------|
| Status | `/items[…device_summary.v0]/data[at0001]/items[at0002]/value` | `DeviceUseStatement.status` | 1..1 | Requires concept map — openEHR values (`Never`, `Current`, `Previous`) do not align with FHIR `DeviceUseStatementStatus` |
| Description | `/items[…device_summary.v0]/data[at0001]/items[at0015]/value` | `DeviceUseStatement.text` | 0..1 | |
| Start date | `/items[…device_summary.v0]/data[at0001]/items[at0022]/items[at0008]/value` | `DeviceUseStatement.timing[x]:timingPeriod.start` | 0..1 | FHIR timing is a choice of `Timing`, `Period`, `dateTime` |
| End date | `/items[…device_summary.v0]/data[at0001]/items[at0022]/items[at0009]/value` | `DeviceUseStatement.timing[x]:timingPeriod.end` | 0..1 | |
| Body site | `/items[…device_summary.v0]/data[at0001]/items[at0022]/items[at0012]/value` | `DeviceUseStatement.bodySite` | 0..1 | Preferred binding: SNOMEDCTBodyStructures |

### Nested cluster: `CLUSTER.device.v1` → `Device`

| openEHR name | openEHR path | FHIR path | Cardinality | Notes |
|--------------|--------------|-----------|-------------|-------|
| Device name | `/items[…device.v1]/items[at0001]/value` | `Device.deviceName.name` | 1..1 | |
| Type | `/items[…device.v1]/items[at0003]/value` | `Device.type` | 0..1 | Preferred binding: Medical Devices IPS (`http://hl7.org/fhir/uv/ips/ValueSet/medical-devices-uv-ips`) |
| Description | `/items[…device.v1]/items[at0002]/value` | `Device.text` | 0..1 | |
| UDI | `/items[…device.v1]/items[at0021]/value` | `Device.udiCarrier.deviceIdentifier` | 0..1 | |
| Manufacturer | `/items[…device.v1]/items[at0004]/value` | `Device.manufacturer` | 0..1 | |
| Date of manufacture | `/items[…device.v1]/items[at0005]/value` | `Device.manufactureDate` | 0..1 | |
| Date of expiry | `/items[…device.v1]/items[at0007]/value` | `Device.expirationDate` | 0..1 | |
| Serial number | `/items[…device.v1]/items[at0020]/value` | `Device.serialNumber` | 0..1 | |
| Model number | `/items[…device.v1]/items[at0023]/value` | `Device.modelNumber` | 0..1 | |
| Batch/Lot number | `/items[…device.v1]/items[at0006]/value` | `Device.lotNumber` | 0..1 | |
| Software version | `/items[…device.v1]/items[at0025]/value` | `Device.version.value` | 0..1 | |
| Other identifier | `/items[…device.v1]/items[at0024'Other identifier']/value` | `Device.identifier` | 0..* | |
| Distinct identifier | `/items[…device.v1]/items[at0024'Distinct identifier']/value` | `Device.distinctIdentifier` | 0..1 | |
| Comment | `/items[…device.v1]/items[at0008]/value` | `Device.note` | 0..1 | openEHR 0..1 vs FHIR 0..* — cardinality mismatch |

## Create the Mapping Files

Create the following files in `fhirconnect/ips/`:

```
fhirconnect/ips/ips.medical_devices.v1.yml              # entry-level mapping: device_summary → DeviceUseStatement + Device
fhirconnect/ips/ips.section_medical_devices.v1.yml      # section mapping
fhirconnect/ips/core/evaluation/org/openehr/
  evaluation/device_summary.v0.yml                      # device_summary archetype mapping
  device_summary_conceptmap.json                        # status concept map (Never/Current/Previous → FHIR codes)
```

Use `ips.problem_diagnosis.v1.yml` as a structural reference for the entry-level mapping and
`ips.section_problem_list.v1.yml` for the section wiring pattern.

After adding the files, restart the openFHIR container to bootstrap the new mappings:

```bash
docker compose restart openfhir
```

Verify the mapping was loaded:

```bash
curl http://localhost:8083/fc/context
```

The response should now include the medical devices mapping.

## Testing the Full Flow

### 1. Create a Patient

First create a Patient through the FHIR facade. This also provisions an EHR in the openEHR CDR and stores the EHR ID
back as a Patient identifier.

```http
POST http://localhost:4080/Patient
Content-Type: application/fhir+json

{
  "resourceType": "Patient",
  "active": true,
  "name": [{ "use": "official", "family": "Duck", "given": ["Donald"] }],
  "gender": "male"
}
```

Note the `id` returned — you will use it as `{patient-id}` below. Also note the `identifier` containing the openEHR
EHR ID; the plugin uses this to route subsequent requests to the correct EHR.

### 2. FHIR to openEHR (store an IPS Bundle)

POST an IPS Bundle to the FHIR facade. Because the bundle's `Composition` resource carries the IPS profile
(`http://hl7.org/fhir/uv/ips/StructureDefinition/Composition-uv-ips`), the plugin's `FhirCreateFilter` will intercept
it and store the data as an openEHR composition in the CDR instead of in the local FHIR store.

```bash
curl -X POST http://localhost:4080/ \
  -H "Content-Type: application/fhir+json" \
  --data-binary @fhirconnect/ips/ips_example_evsclient.json
```

### 3. openEHR to FHIR (retrieve the IPS summary)

```http
GET http://localhost:4080/Patient/{patient-id}/$summary
```

The plugin will query the CDR via AQL, call openFHIR to map the composition, and return a FHIR IPS Bundle — including
the now-populated `MedicationStatement` section.