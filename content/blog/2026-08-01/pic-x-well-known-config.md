+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration"
date = "2026-08-01T11:00:00+02:00"
description = "This article defines the PIC-X discovery document exposed through .well-known/pic-x-configuration. It explains the PIC profile of OAuth Token Exchange, PCA initialization and continuity propagation, execution contract binding, supported continuity modes, transport bindings, attestation services, Trusted Anchors, revocation, and transport security."
tags = ["pic", "pic-x", "authority continuity", "pts", "well-known", "discovery", "configuration", "metadata", "oauth", "token exchange", "pca", "continuity", "security", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-well-known-config.png" alt="Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration." loading="lazy">
  <figcaption>Designing PIC-X. Exposing Configuration through .well-known/pic-x-configuration.</figcaption>
</figure>

When PIC-X starts, it exposes its public configuration at:

```text
http://127.0.0.1:5556/pic-x/.well-known/pic-x-configuration
```

The document exposes public PIC-X endpoints and supported protocol capabilities. Internal Exchange Profiles are not exposed.

## PIC-X as an Exchange into PIC

PIC-X provides the exchange interface into PIC.

It receives authorization material from an external mechanism, derives PIC authority, and returns a PIC Token JWT.

In the OAuth-based flow described here, the PIC-X token endpoint implements the PIC profile of OAuth Token Exchange.

```text
external authorization material
        |
        v
PIC-X
+-- validates the incoming material
+-- issues or validates a PIC PCA COSE
+-- issues a PIC Continuity COSE
`-- returns a PIC Token JWT
```

The PIC-X discovery document exposes the public endpoints and protocol capabilities required to perform and verify this exchange.

## PIC-X Discovery Document

```json
{
  "issuer": "http://127.0.0.1:5556/pic-x",
  "profile": "https://pic-protocol.org/profiles/0.2",

  "token_endpoint": "http://127.0.0.1:5556/pic-x/token",
  "revocation_endpoint": "http://127.0.0.1:5556/pic-x/revoke",
  "jwks_uri": "http://127.0.0.1:5556/pic-x/keys",

  "attestations_endpoint": "http://127.0.0.1:5556/pic-x/attestations",
  "trust_anchors_endpoint": "http://127.0.0.1:5556/pic-x/trust-anchors",

  "grant_types_supported": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],

  "subject_token_types_supported": [
    "urn:ietf:params:oauth:token-type:access_token",
    "https://pic-protocol.org/definitions/token-types/pic"
  ],

  "issued_token_types_supported": [
    "https://pic-protocol.org/definitions/token-types/pic"
  ],

  "token_endpoint_auth_methods_supported": [
    "none"
  ],

  "token_exchange_parameters_supported": [
    "continuity_proposal",
    "continuity_proposal_type"
  ],

  "continuity_proposals": {
    "parameter": "continuity_proposal",
    "type_parameter": "continuity_proposal_type",
    "types_supported": [
      "https://pic-protocol.org/definitions/proposal-types/continuity-initial",
      "https://pic-protocol.org/definitions/proposal-types/continuity"
    ]
  },

  "pic_token": {
    "token_type": "https://pic-protocol.org/definitions/token-types/pic",
    "formats_supported": [
      "pic+jwt"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  },

  "pca": {
    "formats_supported": [
      "pic-pca+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ],
    "execution_contract_binding_methods_supported": [
      "embedded"
    ]
  },

  "continuity": {
    "formats_supported": [
      "pic-continuity+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ],
    "continuity_modes_supported": [
      "centralized-continuity"
    ]
  },

  "continuity_transition": {
    "formats_supported": [
      "pic-continuity-transition+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  }
}
```

## 1. Issuer and Protocol Profile

```json
{
  "issuer": "http://127.0.0.1:5556/pic-x",
  "profile": "https://pic-protocol.org/profiles/0.2"
}
```

`issuer` identifies the PIC-X server deployment that publishes this discovery document. It is the server identifier clients use to associate endpoints, keys, and PIC-X-issued artifacts with this deployment.

`profile` identifies the PIC protocol profile implemented by this PIC-X server configuration and selects the applicable schemas, processing rules, and validation behavior.

PIC-X-issued PIC Token JWTs use the corresponding server identity in their standard JWT `iss` claim according to the selected profile.

The issuer must match the public URL exposed to clients.

## 2. PIC-X Endpoints

```json
{
  "token_endpoint": "http://127.0.0.1:5556/pic-x/token",
  "revocation_endpoint": "http://127.0.0.1:5556/pic-x/revoke",
  "jwks_uri": "http://127.0.0.1:5556/pic-x/keys"
}
```

```text
token_endpoint
→ exposes the PIC profile of OAuth Token Exchange

revocation_endpoint
→ requests revocation according to the PIC revocation specification

jwks_uri
→ publishes PIC-X public signing keys used to verify PIC Token JWTs
  and PIC-X-signed COSE artifacts, according to the selected profile
```

The token endpoint and the discovery document are both exposed by PIC-X.

JWK is the published key representation. Implementations use the corresponding key material for the advertised JOSE and COSE algorithms. If a PIC PCA COSE is signed by an authority other than PIC-X, signer trust and key resolution follow the applicable trusted-authority/profile mechanism rather than automatically assuming the PIC-X JWKS.

PIC Continuity Transition COSE artifacts are signed by workloads, not by PIC-X. PIC-X therefore does not verify their signatures using its own JWKS. Instead, PIC-X verifies the transition signature using the workload key accepted or proven through the selected Proof of Relationship and Profile 0.2 validation rules. A workload key is not trusted merely because a key identifier is present in the COSE artifact.

## 3. PIC Profile of OAuth Token Exchange

PIC-X uses the standard OAuth Token Exchange grant:

```text
urn:ietf:params:oauth:grant-type:token-exchange
```

The current profile advertises `token_endpoint_auth_methods_supported` as `none`. The caller is not separately authenticated as an OAuth client. PIC-X still validates the supplied subject token and all PIC artifacts before issuing a result.

The PIC-X Token Exchange Profile uses stable definition URIs for token and proposal types. The selected PIC profile determines the applicable schemas, validation rules, and protocol behavior. The `continuity_proposal` and `continuity_proposal_type` parameters, together with the related discovery members, are defined by the PIC Token Exchange Profile.

PIC uses the following concepts:

```text
PIC Context of Authority (PCA)
→ logical authority context
→ not itself a signed artifact
→ represented in Profile 0.2 by a PIC PCA COSE

PIC PCA COSE
→ trusted signed representation of the root PCA
→ issued during initialization

PIC Token JWT
→ external OAuth-compatible transport envelope
→ carries `pic.root` as the current PIC Continuity COSE
→ may carry future `pic.compositions[]` values as additional PIC Continuity COSE artifacts

Initial Continuity Proposal
→ input used before continuity exists
→ supplies initialization material such as executionContract

Continuation Proposal
→ optional/profile-defined support material for later centralized advancement
→ is not the transition and is not the settled result

PIC Continuity COSE
→ trusted settled continuity artifact when issued by PIC-X
→ carried by `pic.root` in the PIC Token JWT

PIC Continuity Transition COSE
→ workload-signed proposal for exactly one non-root advancement
→ submitted for centralized validation according to the selected profile/schema
→ not carried forward in the settled result after PIC-X accepts the advancement
```

The profile and definition identifiers used in this article are:

```text
https://pic-protocol.org/profiles/0.2
https://pic-protocol.org/definitions/token-types/pic
https://pic-protocol.org/definitions/proposal-types/continuity-initial
https://pic-protocol.org/definitions/proposal-types/continuity
```

The initial and continuation proposal types may use different schemas. Their exact fields, supporting evidence, cryptographic binding, and validation rules are intentionally deferred to a dedicated protocol article. Proof of Relationship is carried by PIC Continuity Transition COSE artifacts according to the selected profile.

The Initial Continuity Proposal is used by the OAuth-based initialization flow before PIC continuity exists. A Continuation Proposal is support material used only when required by the selected centralized advancement profile/schema; it is not the PIC Token JWT, the PIC Continuity Transition COSE, or the settled PIC Continuity COSE.

The value of `continuity_proposal` is the unpadded Base64url encoding of the compact UTF-8 JSON serialization of the proposal object. This transport encoding does not by itself make the proposal a JWT, COSE artifact, or signed object.

The exchange always returns a PIC Token JWT:

```json
{
  "grant_types_supported": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "subject_token_types_supported": [
    "urn:ietf:params:oauth:token-type:access_token",
    "https://pic-protocol.org/definitions/token-types/pic"
  ],
  "issued_token_types_supported": [
    "https://pic-protocol.org/definitions/token-types/pic"
  ],
  "token_exchange_parameters_supported": [
    "continuity_proposal",
    "continuity_proposal_type"
  ]
}
```

PIC-X exposes one exchange interface with two continuity flows:

```text
OAuth access token + Initial Continuity Proposal
→ initializes PIC execution
→ the proposal supplies the execution contract
→ PIC-X issues PIC PCA COSE 0 and PIC Continuity COSE 0
→ PIC-X returns PIC Token JWT 0 with `pic.root`

PIC Token JWT N
+ profile-required continuation support material, when applicable
+ workload-signed PIC Continuity Transition COSE N+1
→ PIC-X validates one proposed advancement
→ PIC-X returns PIC Token JWT N+1 with settled `pic.root`
```

The returned artifact is therefore always a PIC Token JWT.

For the first exchange, PIC-X issues the initial PIC PCA COSE and embeds it in the root PIC Continuity COSE carried as `pic.root`.

The returned PIC Token JWT is the external transport envelope. Its `pic.root` value is the centrally trusted PIC Continuity COSE.

For advancement, the workload-produced material carries one PIC Continuity Transition COSE according to the selected profile/schema.

The initial PIC PCA COSE becomes `root.pca` in the initial PIC Continuity COSE.

## 4. Initial Exchange: OAuth Access Token to PIC Token JWT 0

The initial exchange receives an OAuth access token and an Initial Continuity Proposal, then returns the first PIC Token JWT.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<oauth-access-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=https://pic-protocol.org/definitions/token-types/pic
&continuity_proposal=<initial-proposal>
&continuity_proposal_type=https://pic-protocol.org/definitions/proposal-types/continuity-initial
```

Conceptual Initial Continuity Proposal before Base64url encoding:

```json
{
  "executionContract": {
    "corporation": "acme",
    "departments": [
      "engineering",
      "operations"
    ]
  }
}
```

PIC-X validates the access token through the configured Exchange Profile and validates the Initial Continuity Proposal. In the flow described here, that proposal contains the execution contract. PIC-X then derives PCA 0, issues the initial PIC PCA COSE and PIC Continuity COSE 0, and returns the initial PIC Token JWT. The PIC PCA COSE signs the root authority state and carries the root challenge used to initialize the first continuity transition.

Conceptually:

```text
OAuth access token
+
Initial Continuity Proposal
+
Exchange Profile and local policy
=
PIC PCA COSE 0, PIC Continuity COSE 0, and PIC Token JWT 0
```

Example response:

```json
{
  "access_token": "<signed-pic-token-jwt-0>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/pic",
  "token_type": "N_A"
}
```

## 5. Centralized Continuity Advancement

In PIC Profile 0.2, continuity advancement is PIC-X-mediated. The current trusted PIC Token JWT is sent to PIC-X as the standard OAuth Token Exchange `subject_token`; its `pic.root` carries the trusted PIC Continuity COSE N. The workload supplies one signed PIC Continuity Transition COSE N+1 according to the selected profile/schema.

Continuation Proposal support material may also be supplied when required by the selected profile/schema. It is not the PIC Token JWT, the PIC Continuity Transition COSE, or the settled PIC Continuity COSE.

When Continuation Proposal support material is used, its type is:

```text
https://pic-protocol.org/definitions/proposal-types/continuity
```

The exact OAuth form parameter used to carry the workload-produced transition is not assigned in this article. The selected profile/schema definition must specify how the transition is submitted.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<signed-pic-token-jwt-n>
&subject_token_type=https://pic-protocol.org/definitions/token-types/pic
&requested_token_type=https://pic-protocol.org/definitions/token-types/pic
```

```text
subject_token
→ trusted PIC Token JWT N issued by PIC-X
→ carries trusted PIC Continuity COSE N in `pic.root`

workload-produced transition
→ signed PIC Continuity Transition COSE N+1
→ submitted according to the selected profile/schema definition

requested_token_type
→ PIC Token JWT N+1
```

PIC-X validates the previous trusted PIC Token JWT and its `pic.root` PIC Continuity COSE, the proposed PIC Continuity Transition COSE, the Proof of Relationship and key binding, predecessor binding, challenge continuity, executor evidence and execution-contract conformance when required, attenuation, authority non-expansion, revocation/local policy, and other applicable profile rules.

```text
PIC Token JWT N
`-- pic.root = trusted PIC Continuity COSE N
        |
        v
workload creates and signs PIC Continuity Transition COSE N+1
with the PoR-bound private key
        |
        v
PIC-X token exchange
        |
        +-- validates previous trusted PIC Token and Continuity
        +-- validates transition signature
        +-- validates PoR/key binding
        +-- validates one proposed transition
        +-- validates predecessor, challenge, PoR/conformance, attenuation, non-expansion, and policy
        |
        v
PIC Token JWT N+1 signed by PIC-X
`-- pic.root = settled PIC Continuity COSE N+1
```

Example response:

```json
{
  "access_token": "<signed-pic-token-jwt-n-plus-1>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/pic",
  "token_type": "N_A"
}
```

The current PIC Token JWT N is carried as the standard `subject_token`. `actor_token` is not used unless a distinct OAuth actor credential is introduced. PIC Profile 0.2 defines only centralized PIC-X-mediated continuity advancement.

## 6. Token Exchange Response

Every successful exchange returns a PIC Token JWT.

```json
{
  "access_token": "<signed-pic-token-jwt>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/pic",
  "token_type": "N_A"
}
```

`access_token` is the response field defined by OAuth Token Exchange. The returned value is a PIC Token JWT, not an OAuth Bearer access token.

## 7. Attestation and Trusted Anchors

```json
{
  "attestations_endpoint": "http://127.0.0.1:5556/pic-x/attestations",
  "trust_anchors_endpoint": "http://127.0.0.1:5556/pic-x/trust-anchors"
}
```

```text
attestations_endpoint
→ lists trusted attestation issuers and their capabilities

trust_anchors_endpoint
→ lists available PIC Trusted Anchors
```

Attestation capabilities belong to each attestation issuer, not to PIC-X globally.

Example response from the attestations endpoint:

```json
{
  "attestation_issuers": [
    {
      "issuer": "https://attestation.example.com",
      "jwks_uri": "https://attestation.example.com/keys",
      "formats_supported": [
        "sd-jwt"
      ],
      "signing_alg_values_supported": [
        "ES256"
      ],
      "proof_of_possession_methods_supported": [
        "jws-nonce"
      ]
    },
    {
      "issuer": "https://workload-identity.example.net",
      "jwks_uri": "https://workload-identity.example.net/keys",
      "formats_supported": [
        "sd-jwt"
      ],
      "signing_alg_values_supported": [
        "RS256"
      ],
      "proof_of_possession_methods_supported": [
        "jws-nonce"
      ]
    }
  ]
}
```

Trusted Anchor capabilities belong to each anchor.

Example response from the Trusted Anchors endpoint:

```json
{
  "trust_anchors": [
    {
      "type": "guardrail",
      "issuer": "https://guardrail.example.com",
      "jwks_uri": "https://guardrail.example.com/keys",
      "signing_alg_values_supported": [
        "ES256"
      ]
    },
    {
      "type": "guardrail",
      "issuer": "https://guardrail-backup.example.net",
      "jwks_uri": "https://guardrail-backup.example.net/keys",
      "signing_alg_values_supported": [
        "RS256"
      ]
    }
  ]
}
```

## 8. PIC Token and COSE Capabilities

PIC Token JWT signing, PIC PCA COSE signing, PIC Continuity COSE signing, PIC Continuity Transition COSE signing, execution contract placement or binding, artifact format, and continuity modes are separate capabilities.

The `formats_supported` values are PIC format identifiers. For COSE artifacts, they are not automatically RFC 9596 COSE `typ` values.

```json
{
  "pic_token": {
    "token_type": "https://pic-protocol.org/definitions/token-types/pic",
    "formats_supported": [
      "pic+jwt"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  },

  "pca": {
    "formats_supported": [
      "pic-pca+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ],
    "execution_contract_binding_methods_supported": [
      "embedded"
    ]
  },

  "continuity_proposals": {
    "parameter": "continuity_proposal",
    "type_parameter": "continuity_proposal_type",
    "types_supported": [
      "https://pic-protocol.org/definitions/proposal-types/continuity-initial",
      "https://pic-protocol.org/definitions/proposal-types/continuity"
    ]
  },

  "continuity": {
    "formats_supported": [
      "pic-continuity+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ],
    "continuity_modes_supported": [
      "centralized-continuity"
    ]
  },

  "continuity_transition": {
    "formats_supported": [
      "pic-continuity-transition+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  }
}
```

```text
pic_token.token_type
→ OAuth Token Exchange token type identifier of the external PIC Token JWT

pic_token.formats_supported
→ serialization formats supported for PIC Token JWTs

pic_token.signing_alg_values_supported
→ algorithms used to sign PIC Token JWTs

pca.formats_supported
→ serialization formats supported for PIC PCA COSE artifacts

pca.signing_alg_values_supported
→ algorithms used to sign PIC PCA COSE artifacts

continuity.formats_supported
→ serialization formats supported for PIC Continuity COSE artifacts

continuity.signing_alg_values_supported
→ algorithms used to sign PIC Continuity COSE artifacts

continuity_transition.formats_supported
→ serialization formats supported for PIC Continuity Transition COSE artifacts

continuity_transition.signing_alg_values_supported
→ signing algorithms accepted for workload-signed PIC Continuity Transition COSE artifacts

pca.execution_contract_binding_methods_supported
→ methods used to place or bind the validated execution contract in the PCA

continuity_proposals.types_supported
→ proposal types accepted for initialization and centralized advancement support

```

PIC Profile 0.2 uses a JWT/JWS envelope for the external PIC Token JWT and native CBOR/COSE for PIC PCA COSE, PIC Continuity COSE, and PIC Continuity Transition COSE. When COSE artifacts are embedded inside the textual JWT envelope, the enclosing JWT transport must encode those binary values, but the native COSE artifacts remain binary.

PCAs are represented as PIC PCA COSE artifacts. PIC-X-issued PIC Continuity COSE artifacts are centrally trusted continuity artifacts. Workload-produced PIC Continuity Transition COSE artifacts propose exactly one advancement for the current exchange.

With the `embedded` binding method, PIC-X validates the `executionContract` supplied by the Initial Continuity Proposal and incorporates it into the logical root PCA as `execution.contract`. When that PCA is serialized as a PIC PCA COSE, the contract is represented in the canonical `execution_contract` section and is therefore protected by the root PIC PCA COSE signature.

The root contract is immutable. Later continuity advancements do not replace or modify it. They may only introduce additional execution constraints through `attenuations.execution_contract.additions`. Accepted additions are accumulated with the existing constraints using logical AND, producing the effective execution contract for the new continuity state.

```text
initial proposal input → executionContract
logical PCA → execution.contract
canonical PIC PCA COSE Indexed Authority Map → execution_contract
continuity attenuation → attenuations.execution_contract.additions
```

In the canonical PIC PCA COSE representation, `execution_contract` uses compact tuple entries with explicit section-local numeric indexes. Proposed additions in `attenuations.execution_contract.additions` carry compact `[key, value]` tuples without numeric indexes; PIC-X canonically orders accepted additions and assigns indexes only after accepting the transition.

Removal attenuation may apply to `identity_context` and `execution.invariants` according to the selected profile/schema. Execution-contract restriction does not use a removal bitmap.

### Continuity modes

```text
centralized-continuity
→ PIC-X validates each proposed advancement
→ each advancement submits exactly one PIC Continuity Transition COSE
→ PIC-X issues the next settled PIC Continuity COSE inside a PIC Token JWT
→ state persistence requirements are profile-defined
```

The Profile 0.2 continuity model uses the following conceptual structure:

```text
PIC Token JWT N
→ carries PIC-X-issued PIC Continuity COSE N in `pic.root`
→ trusted settled continuity artifact
→ contains no PIC Continuity Transition COSE

workload-produced transition
→ exactly one PIC Continuity Transition COSE
→ submitted to PIC-X for validation

PIC Token JWT N+1
→ carries PIC-X-issued PIC Continuity COSE N+1 in `pic.root`
→ next trusted settled continuity artifact
→ contains no PIC Continuity Transition COSE
```

A **PIC PCA COSE** is the signed representation of one PCA.

The PCA is the logical Context of Authority. The PIC PCA COSE signs the root authority state and carries the root challenge used to initialize the first continuity transition.

PIC Profile 0.2 defines only centralized PIC-X-mediated continuity advancement.

## 9. PIC-Token Transport

OAuth access tokens and PIC authorization artifacts serve different purposes.

OAuth is one possible entry mechanism for PIC, not a universal dependency of the PIC model. In an OAuth-based entry flow, an access token may authorize access to an API, gateway, or external system boundary:

```http
Authorization: Bearer <oauth-access-token>
```

A PIC authorization artifact is transported separately through the `PIC-Token` header:

```http
PIC-Token: <signed-pic-token-jwt>
```

A complete HTTP request may therefore carry both:

```http
POST /payments HTTP/1.1
Host: api.example.com
Authorization: Bearer <oauth-access-token>
PIC-Token: <signed-pic-token-jwt>
Content-Type: application/json
```

```text
OAuth access token
→ may authorize access to an API, gateway, or external boundary in an OAuth-based entry flow

PIC-Token
→ carries the PIC Token JWT
→ carries `pic.root` as the PIC Continuity COSE for the current execution state
→ may carry future `pic.compositions[]` values as additional PIC Continuity COSE artifacts
→ binds the execution to its trusted root authority and continuity state
→ preserves verifiable continuity across the execution path
```

PIC does not depend on OAuth.

This profile uses OAuth Token Exchange because an OAuth access token is a common authorization artifact at an application or API boundary and can serve as the entry point into PIC.

Other PIC initialization mechanisms may be defined in the future, including mechanisms designed specifically for machine-to-machine and workload-to-workload interactions.

In this OAuth-based initialization flow, PIC-X derives the initial PIC authority from the validated OAuth access token, the Exchange Profile, the execution contract, and local policy.

```text
initial PCA authority
→ derived from the validated OAuth authority
→ mapped by the Exchange Profile
→ constrained by the execution contract
→ restricted by local policy
```

After initialization, OAuth does not need to participate in every internal authorization decision:

```text
effective execution authority
→ derived from the current PIC authority context
→ restricted by local policy
```

The PIC Token JWT and its carried PIC Continuity COSE values must never expand beyond the authority established by their origins and subsequent valid restrictions.

The OAuth access token does not become part of PIC continuity and does not need to be propagated through the internal execution path.

Likewise, a PIC Token JWT is not an OAuth Bearer access token merely because OAuth Token Exchange returns it in the `access_token` response field.

### PIC-Token is an HTTP binding

`PIC-Token` is the HTTP transport binding for a PIC Token JWT.

The underlying PIC Token JWT and embedded COSE artifacts are transport-independent. They may be carried through:

```text
HTTP
Apache Kafka
message brokers
event streams
job queues
RPC frameworks
workflow engines
storage-backed execution systems
```

For Apache Kafka, the PIC continuity artifact may be placed in a record header:

```text
pic-token = <signed-pic-token-jwt>
```

Alternatively, an application envelope may carry it explicitly:

```json
{
  "event": {
    "type": "payment.requested",
    "payload": {}
  },
  "pic_token": "<signed-pic-token-jwt>"
}
```

The transport binding may change, but the authorization semantics represented by the PCA remain the same.

## 10. Security Considerations

PIC Token JWTs are signed JWT envelopes. PCAs are represented by signed PIC PCA COSE artifacts. PIC-X-issued PIC Continuity COSE artifacts are trusted settled continuity artifacts.

Signatures protect integrity and authenticate a signer only after the signing key and its identity binding have been validated. They do not provide confidentiality and do not prevent copying by themselves.

Possession of a copied PIC Token JWT should not by itself grant the ability to advance continuity. Any accepted continuity advancement must result in a valid PIC Continuity Transition COSE carrying the Proof of Relationship required by the selected profile.

A stolen token may still expose authority, identity, and execution-context information because PIC Token JWTs and the carried COSE artifacts are signed but not encrypted. Depending on the transport and verification profile, copying may also enable replay of the current artifact even when it does not enable continuation.

Transport authentication and confidentiality therefore remain necessary. TLS, and mTLS where peer authentication is required, protect PIC artifacts against interception, disclosure, substitution, and man-in-the-middle attacks while they are in transit.

Deployments should therefore use:

```text
TLS for HTTP
mTLS or equivalent peer authentication where required
broker authentication and authorization for Kafka and messaging systems
revocation validation
execution-contract and continuity validation
audience or execution-domain restrictions when defined
proof of possession or another continuation-authorization proof
```

A PCA has no mandatory independent expiration. Any expiration policy is profile-defined. A PIC PCA COSE is usable only as part of a valid PIC Continuity COSE carried by a PIC Token JWT and remains subject to revocation, continuity rules, execution-contract constraints, local policy, and any declared token or profile expiration.

```text
jti
→ identifies a JWT instance for correlation and audit

revocation
→ invalidates the relevant PIC artifact or continuity state according to the selected profile

exp
→ optional on the signed PIC Token JWT when defined by the selected profile
```

A profile supporting long-lived PCAs must define how recipients obtain revocation status. The status-list format, offline verification model, detailed replay defenses, and proof-of-possession mechanism are still design topics and should be treated in dedicated protocol articles.

## References

### External References

- [RFC 8414 — OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414)
- [RFC 8693 — OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)
- [RFC 7517 — JSON Web Key (JWK)](https://www.rfc-editor.org/rfc/rfc7517)
- [RFC 7519 — JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [PIC Protocol](https://www.pic-protocol.org/)
- [PIC Prover and Verifier Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html)
- [PIC Revocation Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-revocation-spec.html)
- [PIC Sandboxed Execution](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-lineage-guardrail-spec.html)
- [PIC Architecture and Deployment Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-architecture-deployment-spec.html)

### PIC-X Series

- [Designing PIC-X: From Specification to Architecture to Code](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/)
- [Designing PIC-X: PIC Token JWT and COSE Artifacts](/blog/2026-08-11/pic-x-token-types-jwts/)
