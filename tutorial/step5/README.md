# Step 5: FHIRConnect Mappings

In this step, we'll provision existing IPS FHIRConnect mappings to our openFHIR setup. This can be done in two ways, either
by bootstrapping them or by provisioning them through a RESTful API (https://open-fhir.com/documentation/2.2.0/stateconfiguration.html).

## Bootstrapping openFHIR State

[fhirconnect](../../fhirconnect) subdirectory already includes all existing IPS mappings. The only thing we need to do
is mount this subdirectory to the configured bootstrap location ot our openFHIR container and restart the engine.

Engine will scan this directory and provision all FHIRConnect mappings in there. Add the following under `volumes`

```yaml
  - .../../fhirconnect/:/app/bootstrap/
```

and restart the engine. You should see in the startup log that these files are being provisioned.

## Assertion of Step 5

`GET http://localhost:8083/fc/context` should give you provisioned context model mapping for our IPS.