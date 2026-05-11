# Step 4: Integrating services

By this point, we have a local FHIR server capable of integrating to openEHR and to openFHIR. And we have a local
instance of openFHIR.

What's left is for us to connect all the pieces together.

## Integrating Firely Server with openFHIR

In step2, we have enabled a plugin in Firely Server that can seamlessly integrate with openFHIR. What we still need to
do is tell that plugin
where openFHIR actually lives.

To do that, add OpenFhir.BaseUrl in Firely Server's `appsettings.json`. Alternatively, if you've decided to integrate
with a sanbox instance of openFHIR, configure OAuth2 properties.

```json
"OpenFhir": {
"BaseUrl": "https://sandbox.open-fhir.com",
// Below is relevantuf using sandbox
"OAuth2": {
"TokenUrl": "https://sandbox.open-fhir.com/auth/realms/open-fhir/protocol/openid-connect/token",
"ClientId": "",
"ClientSecret": "",
"Scope": ""
}
}
```

## Configuring openEHR Integration

Now we need to tell our openFHIR Firely Plugin where openEHR CDR actually lives and based on what it should decide how
to route calls to it's local FHIR store or to an openEHR CDR.

To do that, we need the following configuration sections:

`Interceptor` is a configuration property telling our Interceptor where exactly openEHR CDRs live and how it can connect
to them.

`FhirCreateFiler` tells our plugin for which incoming FHIR payloads it should route to openEHR CDR instead of to its own
local FHIR store.

`FhirQueryFilter` tell ours plugin which FHIR Queries should be translated to AQLs and invoked on integrated CDR rather
than on its own local FHIR store.

### CDRs

Configuring integrated openEHR CDRs happens with a yaml file referenced in CdrsConfigFile.

Example of cdrs.yml as follows:

```yml
- id: local
  name: EHRbase
  baseUrl: http://ips.open-fhir.com/ehrbase/rest
  authMethod: basic
  basicAuth:
    username: ehrbase-user
    password: SuperSecretPassword
```

### Filters

in FhirQueryFilter section of the configuration, you define for which FHIR queries you want the plugin to invoke
openFHIR and openEHR.

Similarly, you do that in FhirCreateFilter for the create flow, where you define for which FHIR IGs you want to invoke
an openEHR flow of data.

## Assertion of the Step 4

Verify your appsettings.json and docker-compose.yml match that of the step4 subfolder of this tutorial.