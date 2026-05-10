# converge-and-collaborate-dublin-hackaton

Let's build resources for Converge and Collaborate, Dublin 2026

## Lets Build: openEHR-to-FHIR IPS Integration

This session walks through building a working FHIR facade on top of an openEHR CDR, using the International Patient
Summary (IPS) as the target use case. The plan is split into six steps.

### Target Architecture

![Target Architecture](target_architecture.png)

The facade sits between FHIR clients and an openEHR CDR, translating FHIR requests into AQL queries and openEHR
compositions into FHIR resources on the fly using FHIRConnect mappings. Three key interaction flows are illustrated in
the sequence diagrams below.

| Flow                                                     | Diagram                           |
|----------------------------------------------------------|-----------------------------------|
| Querying FHIR resources (e.g. `GET /AllergyIntolerance`) | ![FHIR Query](fhir_query.png)     |
| Storing FHIR resources (e.g. `POST IPS Bundle`)          | ![FHIR Store](fhir_store.png)     |
| Fetching the IPS summary document (`$summary`)           | ![FHIR Summary](fhir_summary.png) |

---

### Step 1: Set up Firely Server

[Firely Server](https://fire.ly/firely-server-trial/) is the FHIR server that will host the facade. Get a trial license and run it locally.

**What to do:**

1. Request a trial license at https://fire.ly/firely-server-trial/.
2. Follow the Firely Server quickstart to run it locally (Docker is the easiest path).
3. Verify it is up: `GET http://localhost:4080/metadata` should return a CapabilityStatement.

---

### Step 2: Install the openFHIR Firely Plugin and point it at the public openEHR CDR

The [openFHIR Firely Plugin](https://github.com/openFHIR/openfhir-firely-plugin) is a Firely Server plugin that is able to intercept FHIR transactions and integrate with openFHIR.

**What to do:**

1. Clone the plugin repo and follow its installation instructions to load it into your Firely Server instance from Step 1.


---

### Step 3: Set up a local openFHIR Enterprise instance

[openFHIR Enterprise](https://open-fhir.com/documentation/2.2.0/installation.html) is a mapping engine that implements FHIR Connect speficiation. We'll do a basic set up and run in locally.

**What to do:**

1. Follow the [installation guide](https://open-fhir.com/documentation/2.2.0/installation.html) to start the openFHIR Enterprise stack (Docker Compose recommended).
2. Verify the API are accessible.

---

### Step 4: Point local Firely Server at both the public openEHR CDR and local openFHIR

Now wire everything together: the Firely Server facade should use both the public openEHR CDR as its data source and the local openFHIR Enterprise instance as its mapping engine.

**What to do:**

1. Update the Firely Server / plugin configuration to reference:
   - The **public openEHR CDR** base URL (for AQL queries and composition storage).
   - The **local openFHIR Enterprise** URL (for FHIRConnect mapping resolution).
2. Restart Firely Server and run a round-trip test — a `GET /Composition` call should trigger an AQL query on the CDR and return a mapped FHIR response.

---

### Step 5: Ingest existing IPS mappings into local openFHIR

The `fhirconnect/ips/` directory contains ready-made FHIRConnect mappings for the core IPS sections. Load these into the local openFHIR Enterprise instance.

| File | Maps |
|------|------|
| `ips.health_summary.v1.yml` | `COMPOSITION.health_summary.v1` → FHIR `Composition` (IPS profile) |
| `ips.section_problem_list.v1.yml` | Problem List section → FHIR `List` |
| `ips.section_allergies_and_intolerances.v1.yml` | Allergies section → FHIR `List` |
| `ips.section_medication_list.v1.yml` | Medication List section → FHIR `List` (stub — entries not yet mapped) |
| `ips.problem_diagnosis.v1.yml` | `EVALUATION.problem_diagnosis.v1` → FHIR `Condition` |
| `ips.allergies_and_intolerances.v1.yml` | `EVALUATION.adverse_reaction_risk.v2` → FHIR `AllergyIntolerance` |

**What to do:**

1. Ingest the mapping files above into openFHIR Enterprise via its API or bootstrap mechanism (see State configuration: https://open-fhir.com/documentation/2.2.0/stateconfiguration.html).
3. Test the existing mappings — use the example compositions (`ips_example_evsclient.json`, `ips.discrete.json`) to verify problems and allergies map correctly end-to-end through the facade.

---

### Step 6: Create FHIRConnect Mappings for Medication Summary

The medication section slot (`SECTION.adhoc.v1_medication_list`) exists in the IPS mapping but entry-level mappings are missing. The target FHIR resource is `MedicationStatement` (IPS profile: `MedicationStatement-uv-ips`).

**Archetypes to map:**

- `openEHR-EHR-INSTRUCTION.medication_order.v3` — primary archetype for a medication order in the IPS template.
- `openEHR-EHR-ACTION.medication.v1` — optionally, for administration/status details.

**Files to create:**

```
fhirconnect/ips/ips.medication_summary.v1.yml          # entry-level mapping
fhirconnect/ips/core/instruction/org/openehr/
  instruction/medication_order.v3.yml                  # medication order archetype mapping
  medication_order_conceptmap.json                     # status / route / form concept maps
```

**Key mappings to implement in `ips.medication_summary.v1.yml`:**

| FHIR (`MedicationStatement`)      | openEHR (`INSTRUCTION.medication_order.v3`)                                             |
|-----------------------------------|-----------------------------------------------------------------------------------------|
| `status`                          | `activities[at0001]/description[at0002]/items[at0044]` (order status, via concept map)  |
| `medication.concept.coding`       | `activities[at0001]/description[at0002]/items[at0070]` (medication name, coded)         |
| `dosage.text`                     | `activities[at0001]/description[at0002]/items[at0057]` (directions)                     |
| `dosage.route.coding`             | `activities[at0001]/description[at0002]/items[at0054]/items[at0057]` (route)            |
| `dosage.doseAndRate.doseQuantity` | `activities[at0001]/description[at0002]/items[at0054]/items[at0144]` (dose amount/unit) |
| `dosage.timing.repeat`            | `activities[at0001]/description[at0002]/items[at0054]/items[at0037]` (timing)           |
| `effectivePeriod.start`           | `activities[at0001]/description[at0002]/items[at0012]` (start date)                     |
| `effectivePeriod.end`             | `activities[at0001]/description[at0002]/items[at0013]` (stop date)                      |

Once written, wire the entry into `ips.section_medication_list.v1.yml` by replacing the commented-out `entry` block with a reference block pointing at `ips.medication_summary.v1`, then ingest the new mapping into openFHIR Enterprise and test via the facade.

---

### Resources

- [Firely Server trial license](https://fire.ly/firely-server-trial/)
- [openFHIR Firely Plugin](https://github.com/openFHIR/openfhir-firely-plugin)
- [openFHIR Enterprise installation](https://open-fhir.com/documentation/2.2.0/installation.html)
- [FHIRConnect specification](https://github.com/openFHIR/fhirconnect-spec)
- [IPS Implementation Guide](https://hl7.org/fhir/uv/ips/)
- Mapping files: `fhirconnect/ips/`
