# Testing Mappings

## Create a Patient

To provision an ehr to integrated openEHR CDR, you need to create a Patient Resource against your FHIR Facade.

For example

```http request
POST http://localhost:4080/Patient

{
  "resourceType" : "Patient",
  "active" : true,
  "name" : [{
    "use" : "official",
    "family" : "Duck",
    "given" : ["Donald"]
  }],
  "gender" : "male"
}
```

This will create a Patient and an ehrid in openEHR CDR. EhrId will be added as an Identifier to this Patient record and
whenever
you'll be creating Resources for a patient, make sure to reference this logica patient id of your patient so the plugin
will be able to use
the correct ehrid for openEHR integration.

## FHIR to openEHR

Take an IPS Bundle from examples ([ips_example_evsclient.json](../../examples/ips_example_evsclient.json)) and POST it
to your
FHIR server base URL (http://localhost:4080/). As it matches the configure FhirCreateFilter parameter, it should invoke
the
openEHR data flow and data should end up in the configured openEHR CDR.

## openEHR to FHIR

GET /Patient/{your-px-id}/$summary