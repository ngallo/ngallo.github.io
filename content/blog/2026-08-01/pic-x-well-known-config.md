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

It receives authorization material from an external mechanism, derives PIC authority, and returns a PIC Continuity JWT.

In the OAuth-based flow described here, the PIC-X token endpoint implements the PIC profile of OAuth Token Exchange.

```text
external authorization material
        |
        v
PIC-X
+-- validates the incoming material
+-- issues or validates a PCA JWT
+-- issues a PIC Continuity JWT
`-- returns a PIC Continuity JWT
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
    "https://pic-protocol.org/definitions/token-types/continuity"
  ],

  "issued_token_types_supported": [
    "https://pic-protocol.org/definitions/token-types/continuity"
  ],

  "token_endpoint_auth_methods_supported": [
    "none"
  ],

  "token_exchange_parameters_supported": [
    "continuity_proposal",
    "continuity_proposal_type"
  ],

  "pca": {
    "formats_supported": [
      "pic-pca+jwt"
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
    "token_type": "https://pic-protocol.org/definitions/token-types/continuity",
    "pca_signing_alg_values_supported": [
      "ES256"
    ],
    "continuity_signing_alg_values_supported": [
      "ES256"
    ],
    "transition_signing_alg_values_supported": [
      "ES256"
    ],
    "jws_serializations_supported": [
      "compact-jws"
    ],
    "formats_supported": [
      "pic-pca+jwt",
      "pic-continuity+jwt"
    ],
    "transition_formats_supported": [
      "pic-continuity-transition+jwt"
    ],
    "continuity_modes_supported": [
      "centralized-continuity",
      "decentralized-continuity"
    ],
    "continuity_mode_settings": {
      "decentralized-continuity": {
        "max_subchain_length": 8
      }
    }
  }
}
```

The `max_subchain_length` value `8` is an illustrative deployment value in this example only; it is not a protocol default.

## 1. Issuer and Protocol Profile

```json
{
  "issuer": "http://127.0.0.1:5556/pic-x",
  "profile": "https://pic-protocol.org/profiles/0.2"
}
```

`issuer` identifies the PIC-X deployment in discovery metadata. PIC Continuity JWTs issued by this PIC-X deployment use the standard JWT `iss` claim.

`profile` identifies the supported PIC protocol profile and therefore selects the applicable protocol version, schemas, and validation rules.

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
→ publishes the keys used to verify PCA JWTs, PIC Continuity JWTs, and Continuity Transition JWTs issued by this PIC-X deployment
```

The token endpoint and the discovery document are both exposed by PIC-X.

Holder-signed transition keys are resolved and validated according to the selected decentralized continuity profile, not merely because they appear in the PIC-X JWKS.

## 3. PIC Profile of OAuth Token Exchange

PIC-X uses the standard OAuth Token Exchange grant:

```text
urn:ietf:params:oauth:grant-type:token-exchange
```

The current development profile advertises `token_endpoint_auth_methods_supported` as `none`. The caller is not separately authenticated as an OAuth client. PIC-X still validates the supplied subject token and all PIC artifacts before issuing a result.

The PIC-X Token Exchange Profile uses stable definition URIs for token and proposal types. The selected PIC profile determines the applicable schemas, validation rules, and protocol behavior. The `continuity_proposal` and `continuity_proposal_type` parameters, together with the related discovery members, are defined by the PIC Token Exchange Profile.

PIC uses the following concepts:

```text
PIC Context of Authority (PCA)
→ logical Context of Authority
→ signed representation is a PCA JWT

Continuity Proposal
→ structured input used to initialize or advance continuity
→ submitted to PIC-X for initialization and centralized continuation

Continuity Graph
→ transported by the PIC Continuity JWT
→ starts from root_pca_jwt
→ carries numbered continuity transitions when continuity advances

PIC Continuity JWT
→ signed JWT transport for one Continuity Graph
```

The profile and definition identifiers used in this article are:

```text
https://pic-protocol.org/profiles/0.2
https://pic-protocol.org/definitions/token-types/continuity
https://pic-protocol.org/definitions/proposal-types/continuity-initial
https://pic-protocol.org/definitions/proposal-types/continuity
```

The initial and continuation proposal types may use different schemas. Their exact fields, Proof of Relationship representation, supporting evidence, cryptographic binding, and validation rules are intentionally deferred to a dedicated protocol article.

The value of `continuity_proposal` is the unpadded Base64url encoding of the compact UTF-8 JSON serialization of the proposal object. This transport encoding does not by itself make the proposal a JWT or a signed object.

The exchange always returns a PIC Continuity JWT:

```json
{
  "grant_types_supported": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "subject_token_types_supported": [
    "urn:ietf:params:oauth:token-type:access_token",
    "https://pic-protocol.org/definitions/token-types/continuity"
  ],
  "issued_token_types_supported": [
    "https://pic-protocol.org/definitions/token-types/continuity"
  ],
  "token_exchange_parameters_supported": [
    "continuity_proposal",
    "continuity_proposal_type"
  ]
}
```

PIC-X exposes one exchange interface with two proposal forms:

```text
OAuth access token + initial continuity proposal
→ initializes PIC execution
→ the proposal supplies the execution contract
→ PIC-X issues PCA JWT 0
→ PIC-X returns PIC Continuity JWT 0

PIC Continuity JWT N + continuity proposal
→ centralized-continuity advancement
→ the proposal carries continuation material for PIC-X
→ PIC-X validates the proposal
→ PIC-X returns PIC Continuity JWT N+1
```

The returned artifact is therefore always a PIC Continuity JWT.

For the first exchange, PIC-X issues the initial PCA JWT as root_pca_jwt.

The returned PIC Continuity JWT transports one Continuity Graph.

The internal structure of the PIC Continuity JWT is intentionally deferred to a dedicated protocol article.

The initial PCA JWT becomes the root_pca_jwt transported in the initial PIC Continuity JWT.

## 4. Initial Exchange: OAuth Access Token to Continuity JWT 0

The initial exchange receives an OAuth access token and an initial continuity proposal, then returns the first PIC Continuity JWT.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<oauth-access-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=https://pic-protocol.org/definitions/token-types/continuity
&continuity_proposal=<initial-proposal>
&continuity_proposal_type=https://pic-protocol.org/definitions/proposal-types/continuity-initial
```

Conceptual initial proposal before Base64url encoding:

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

PIC-X validates the access token through the configured Exchange Profile and validates the initial continuity proposal. In the flow described here, that proposal contains the execution contract. PIC-X then derives PCA 0, issues the initial PCA JWT, and returns the initial PIC Continuity JWT. The PCA JWT signs the root authority state and carries the root challenge used to initialize the first continuity transition.

Conceptually:

```text
OAuth access token
+
initial continuity proposal
+
Exchange Profile and local policy
=
PCA JWT 0 and PIC Continuity JWT 0
```

Example response:

```json
{
  "access_token": "<signed-pic-continuity-jwt-0>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/continuity",
  "token_type": "N_A"
}
```

## 5. Continuity Advancement and Central Re-Issuance

### 5.1 Centralized Continuation

In `centralized-continuity`, the current PIC Continuity JWT is sent to PIC-X as the standard OAuth Token Exchange `subject_token`, and the continuation proposal is sent through the PIC-specific `continuity_proposal` parameter.

The proposal type is identified separately through `continuity_proposal_type`. For continuation, the type is:

```text
https://pic-protocol.org/definitions/proposal-types/continuity
```

A centralized continuation proposal carries material used to produce the next Continuity Transition JWT. Its exact schema and validation sequence are intentionally deferred to a dedicated protocol article.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<signed-pic-continuity-jwt-n>
&subject_token_type=https://pic-protocol.org/definitions/token-types/continuity
&requested_token_type=https://pic-protocol.org/definitions/token-types/continuity
&continuity_proposal=<proposal>
&continuity_proposal_type=https://pic-protocol.org/definitions/proposal-types/continuity
```

```text
subject_token
→ PIC Continuity JWT N

continuity_proposal
→ proposed continuation material to be validated by PIC-X

continuity_proposal_type
→ identifies the proposal schema and semantics

requested_token_type
→ PIC Continuity JWT N+1
```

PIC-X validates the current PIC Continuity JWT and the continuity proposal, including execution-contract binding, revocation state, non-expansion of authority, continuation material, and selected continuity mode. PIC-X creates the central-signed Continuity Transition JWT N+1 and issues PIC Continuity JWT N+1.

```text
PIC Continuity JWT N
+
continuity proposal
        |
        v
PIC-X validation
        |
        v
central-signed Continuity Transition JWT N+1
        |
        v
PIC Continuity JWT N+1
```

Example response:

```json
{
  "access_token": "<signed-pic-continuity-jwt-n-plus-1>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/continuity",
  "token_type": "N_A"
}
```

The current PIC Continuity JWT N is carried as the standard `subject_token`. This OAuth Token Exchange request belongs to the centralized advancement path.

### 5.2 Decentralized Local Advancement

In `decentralized-continuity`, a node or workload does not send raw continuation material to PIC-X for every hop. The continuation input may be consumed locally by a PIC library, runtime, or workload to construct the next holder-signed continuity state.

```text
PIC Continuity JWT N
+
local continuation input
        |
        v
PIC library / runtime / workload
        |
        +-- constructs Continuity Transition JWT N+1
        +-- updates the Continuity Graph
        +-- signs the outer PIC Continuity JWT according to the selected decentralized profile
        |
        v
holder-signed PIC Continuity JWT N+1
```

The artifact passed to another workload or service remains a PIC Continuity JWT. The trusted authority root remains the PCA JWT carried by that continuity artifact.

### 5.3 Central Validation and Re-Issuance

When a decentralized subchain is returned to PIC-X, the input to PIC-X is the already constructed holder-signed PIC Continuity JWT, not a previous token plus raw continuation material.

```text
centrally issued PIC Continuity JWT at position N
        |
        v
one or more local holder-signed transitions
        |
        v
holder-signed PIC Continuity JWT at position M
        |
        v
PIC-X validation / re-issuance
        |
        v
centrally issued PIC Continuity JWT at position M
```

where `M > N`.

PIC-X validates the complete candidate continuity state according to the selected profile, including the trusted root, transition signatures, predecessor hashes, challenge continuity, Proof of Relationship, authority non-expansion, revocation/local policy, and configured `max_subchain_length`.

Central re-issuance does not advance continuity by itself:

```text
holder-signed candidate current_position = M
central re-issued current_position       = M
```

PIC-X re-signs the accepted continuity envelope for the same materialized continuity state. It does not manufacture a Continuity Transition JWT, does not reset `max_subchain_length`, and does not change authority state merely because the outer envelope was re-issued. A new transition to `M+1` happens only when continuity actually advances again.

Centralized advancement is distinct from central same-position re-issuance:

```text
PIC Continuity JWT M
+
continuity proposal
        |
        v
PIC-X
        |
        v
central-signed Continuity Transition JWT M+1
        |
        v
PIC Continuity JWT M+1
```

A central-signed Continuity Transition JWT created by actual centralized advancement terminates the previous holder-signed tail and establishes the next trusted transition boundary. Snapshot, re-root, or compaction behavior is out of scope here.

Central re-issuance can submit the holder-signed candidate as the standard OAuth Token Exchange `subject_token`:

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<holder-signed-pic-continuity-jwt-at-position-m>
&subject_token_type=https://pic-protocol.org/definitions/token-types/continuity
&requested_token_type=https://pic-protocol.org/definitions/token-types/continuity
```

This re-issuance request does not include `continuity_proposal` or `continuity_proposal_type`, because the proposed advancement has already been materialized and signed into the submitted PIC Continuity JWT. `actor_token` remains unused unless a distinct OAuth actor credential is introduced.

## 6. Token Exchange Response

Every successful exchange returns a PIC Continuity JWT.

```json
{
  "access_token": "<signed-pic-continuity-jwt>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/continuity",
  "token_type": "N_A"
}
```

`access_token` is the response field defined by OAuth Token Exchange. The returned value is a PIC Continuity JWT, not an OAuth Bearer access token.

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

## 8. PCA and Continuity Capabilities

PCA JWT signing, PIC Continuity JWT signing, execution contract placement or binding, artifact format, and continuity modes are separate capabilities.

```json
{
  "pca": {
    "formats_supported": [
      "pic-pca+jwt"
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
    "token_type": "https://pic-protocol.org/definitions/token-types/continuity",
    "pca_signing_alg_values_supported": [
      "ES256"
    ],
    "continuity_signing_alg_values_supported": [
      "ES256"
    ],
    "transition_signing_alg_values_supported": [
      "ES256"
    ],
    "jws_serializations_supported": [
      "compact-jws"
    ],
    "formats_supported": [
      "pic-pca+jwt",
      "pic-continuity+jwt"
    ],
    "transition_formats_supported": [
      "pic-continuity-transition+jwt"
    ],
    "continuity_modes_supported": [
      "centralized-continuity",
      "decentralized-continuity"
    ],
    "continuity_mode_settings": {
      "decentralized-continuity": {
        "max_subchain_length": 8
      }
    }
  }
}
```

The `max_subchain_length` value `8` is an illustrative deployment value in this example only; it is not a protocol default.

```text
continuity.pca_signing_alg_values_supported
→ algorithms used to sign PCA JWTs

continuity.continuity_signing_alg_values_supported
→ algorithms used to sign PIC Continuity JWTs

continuity.transition_signing_alg_values_supported
→ algorithms used to sign Continuity Transition JWTs

continuity.jws_serializations_supported
→ JWS serializations supported for signed PIC JWT artifacts in this continuity profile

pca.execution_contract_binding_methods_supported
→ methods used to place or bind the validated execution contract in the PCA

continuity_proposals.types_supported
→ proposal types accepted for initialization and centralized continuation flows

continuity.token_type
→ semantic identifier of the PIC Continuity JWT

continuity.formats_supported
→ serialization formats supported for PCA JWTs and PIC Continuity JWTs

continuity.transition_formats_supported
→ serialization formats supported for Continuity Transition JWTs

continuity.continuity_mode_settings["decentralized-continuity"].max_subchain_length
→ maximum number of consecutive holder-signed Continuity Transition JWTs at the tail of the current Continuity Graph after the most recent trusted-central Transition JWT, or after the root PCA JWT when no such central transition exists
```

PIC Profile 0.2 advertises only compact-jws. This means PCA JWTs, PIC Continuity JWTs, and Continuity Transition JWTs are transported and embedded as compact signed JWT strings. Future profiles may advertise additional serializations only when their signature, canonicalization, hashing, and transport rules are explicitly defined.

PCAs are represented as PCA JWTs. Each PIC Continuity JWT transports one Continuity Graph. The precise signer roles, proof structures, and algorithm negotiation for decentralized continuity remain part of the decentralized-continuity design.

With the `embedded` binding method, PIC-X validates the execution contract and places the validated contract directly in the PCA under `execution.contract`. The contract is therefore protected by the signed PCA JWT that represents the PCA.

`max_subchain_length` counts consecutive holder-signed Continuity Transition JWTs at the tail of the current Continuity Graph, based on Transition JWT signer provenance. It does not count the root PCA JWT, centrally signed Continuity Transition JWTs, or the outer PIC Continuity JWT itself. Same-position central re-issuance does not reset the holder-signed tail count because it creates no new transition. Once the configured maximum is reached, another holder-signed transition must not be appended locally; further advancement must create an allowed new trusted-central transition boundary or use a future explicitly defined snapshot/re-root mechanism.

### Continuity modes

```text
centralized-continuity
→ PIC-X validates each continuation request
→ PIC-X issues the next PIC Continuity JWT
→ only PIC-X can mint the next PIC Continuity JWT
→ state persistence requirements are profile-defined

decentralized-continuity
→ nodes may produce Continuity Transition JWTs and update the Continuity Graph according to profile rules
→ max_subchain_length limits consecutive holder-signed transitions at the graph tail
→ detailed signer, proof, and verification rules are not defined here
```

The continuity model uses the following conceptual structure:

```text
PIC Continuity JWT
`-- transports one Continuity Graph
    |-- starts from root_pca_jwt
    `-- carries numbered continuity transitions when continuity advances
```

A **PCA JWT** is the signed representation of one PCA.

The PCA is the logical Context of Authority. The PCA JWT signs the root authority state and carries the root challenge used to initialize the first continuity transition.

The PIC model may support different Continuity Graph representations, depending on the selected continuity mode.

This PIC-X discovery document advertises the supported continuity modes and the configured decentralized `max_subchain_length`. Detailed holder signer acceptance, proof_of_relationship-bound outer signature verification, consecutive holder-key reuse, replay protection, collusion limits, compaction, snapshot/re-root behavior, and advanced central re-issuance policy beyond the basic same-state re-signing flow are intentionally deferred to a dedicated continuity-mode article.

## 9. PIC-Token Transport

OAuth access tokens and PIC authorization artifacts serve different purposes.

OAuth is one possible entry mechanism for PIC, not a universal dependency of the PIC model. In an OAuth-based entry flow, an access token may authorize access to an API, gateway, or external system boundary:

```http
Authorization: Bearer <oauth-access-token>
```

A PIC authorization artifact is transported separately through the `PIC-Token` header:

```http
PIC-Token: <signed-pic-continuity-jwt>
```

A complete HTTP request may therefore carry both:

```http
POST /payments HTTP/1.1
Host: api.example.com
Authorization: Bearer <oauth-access-token>
PIC-Token: <signed-pic-continuity-jwt>
Content-Type: application/json
```

```text
OAuth access token
→ may authorize access to an API, gateway, or external boundary in an OAuth-based entry flow

PIC-Token
→ carries the PIC Continuity JWT
→ carries the Continuity Graph
→ starts from root_pca_jwt
→ carries numbered continuity transitions when continuity advances
→ carries the current execution authority
→ binds execution constraints and authorization invariants
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
→ derived from the current PIC authority
→ restricted by local policy
```

The PIC Continuity JWT must never expand beyond the authority established by its origin and subsequent valid restrictions.

The OAuth access token does not become part of PIC continuity and does not need to be propagated through the internal execution path.

Likewise, a PIC Continuity JWT is not an OAuth Bearer access token merely because OAuth Token Exchange returns it in the `access_token` response field.

### PIC-Token is an HTTP binding

`PIC-Token` is the HTTP transport binding for a PIC continuity artifact.

The underlying PCA JWT and PIC Continuity JWT representation are transport-independent. They may be carried through:

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
pic-token = <signed-pic-continuity-jwt>
```

Alternatively, an application envelope may carry it explicitly:

```json
{
  "event": {
    "type": "payment.requested",
    "payload": {}
  },
  "pic_token": "<signed-pic-continuity-jwt>"
}
```

The transport binding may change, but the authorization semantics represented by the PCA remain the same.

## 10. Security Considerations

PIC Continuity JWTs are signed JWTs. PCAs are represented by signed PCA JWTs. The PIC Continuity JWT transports one Continuity Graph.

Signatures protect integrity and authenticate a signer only after the signing key and its identity binding have been validated. They do not provide confidentiality and do not prevent copying by themselves.

Possession of a copied PIC Continuity JWT should not by itself grant the ability to advance continuity. Any accepted continuity advancement must result in a valid Continuity Transition JWT carrying the Proof of Relationship required by the selected profile.

A stolen token may still expose authority, identity, and execution-context information because PIC Continuity JWTs are signed but not encrypted. Depending on the transport and verification profile, copying may also enable replay of the current artifact even when it does not enable continuation.

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

A PCA has no mandatory independent expiration. Any expiration policy is profile-defined. A PCA JWT is usable only as part of a valid PIC Continuity JWT and remains subject to revocation, continuity rules, execution-contract constraints, local policy, and any declared token or profile expiration.

```text
jti
→ identifies a JWT instance for correlation and audit

revocation
→ invalidates the relevant PIC artifact or continuity state according to the selected profile

exp
→ optional on the signed PIC Continuity JWT when defined by the selected profile
```

A profile supporting long-lived PCAs must define how recipients obtain revocation status. The status-list format, offline verification model, detailed replay defenses, proof-of-possession mechanism, and decentralized-continuity security model are still design topics and should be treated in dedicated protocol articles.

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
- [Designing PIC-X: PCA JWT, PIC Continuity JWT, and the Continuity Graph](/blog/2026-08-11/pic-x-jwts-authority-graph/)
