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

  "attestation_endpoint": "http://127.0.0.1:5556/pic-x/attestations",
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

`issuer` identifies the PIC-X deployment in discovery metadata. Signed PIC Continuity JWTs use the standard JWT `iss` claim.

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
→ publishes the keys used to verify PCA JWT and PIC Continuity JWT signatures
```

The token endpoint and the discovery document are both exposed by PIC-X.

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
→ structured input submitted to initialize or advance continuity
→ validated by PIC-X before continuity is advanced

Continuity Graph
→ transported by the PIC Continuity JWT
→ starts from root_authority_jwt
→ carries numbered continuity transitions

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
→ continues PIC execution
→ the proposal carries continuation material
→ PIC-X validates the proposal
→ PIC-X returns PIC Continuity JWT N+1
```

The returned artifact is therefore always a PIC Continuity JWT.

For the first exchange, PIC-X issues the initial PCA JWT as root_authority_jwt. The returned PIC Continuity JWT transports one Continuity Graph.

The internal structure of the PIC Continuity JWT is intentionally deferred to a dedicated protocol article.

The initial PCA JWT becomes the root_authority_jwt transported in the initial PIC Continuity JWT.

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

## 5. Continuation Exchange: Continuity JWT N and Continuity Proposal to Continuity JWT N+1

A continuation exchange receives the current PIC Continuity JWT as the standard OAuth Token Exchange `subject_token` and receives the proposed continuation material through the PIC-specific `continuity_proposal` parameter.

The proposal type is identified separately through `continuity_proposal_type`. For continuation, the type is:

```text
https://pic-protocol.org/definitions/proposal-types/continuity
```

A continuation proposal carries continuation material used to produce the next Continuity Transition JWT. Its exact schema, validation sequence, and continuation flow are intentionally deferred to a dedicated protocol article.

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
→ proposed continuation material to be validated

continuity_proposal_type
→ identifies the proposal schema and semantics

requested_token_type
→ PIC Continuity JWT N+1
```

PIC-X validates the current PIC Continuity JWT and the continuity proposal, including execution-contract binding, revocation state, non-expansion of authority, continuation material, and selected continuity mode. After successful validation, PIC-X returns PIC Continuity JWT N+1. The internal structure of the PIC Continuity JWT is intentionally deferred to a dedicated protocol article.

```text
PIC Continuity JWT N
+
continuity proposal
+
PIC-X validation
=
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

The current PIC Continuity JWT N is carried as the standard `subject_token`. `actor_token` is not used by this profile to transport the continuity proposal. A future profile may use it only when a distinct external actor credential must be represented according to OAuth Token Exchange semantics.

PIC-X advertises two continuity modes:

```text
centralized-continuity
→ PIC-X validates each continuation request
→ PIC-X issues the next PIC Continuity JWT
→ only PIC-X can mint the next PIC Continuity JWT
→ PIC-X does not need to persist the complete continuity state

decentralized-continuity
→ reserved capability whose detailed design is still under definition
```

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
  "attestation_endpoint": "http://127.0.0.1:5556/pic-x/attestations",
  "trust_anchors_endpoint": "http://127.0.0.1:5556/pic-x/trust-anchors"
}
```

```text
attestation_endpoint
→ lists trusted attestation issuers and their capabilities

trust_anchors_endpoint
→ lists available PIC Trusted Anchors
```

Attestation capabilities belong to each attestation issuer, not to PIC-X globally.

Example response from the attestation endpoint:

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
    ]
  }
}
```

```text
continuity.pca_signing_alg_values_supported
→ algorithms used to sign PCA JWTs

continuity.continuity_signing_alg_values_supported
→ algorithms used to sign PIC Continuity JWTs

pca.execution_contract_binding_methods_supported
→ methods used to place or bind the validated execution contract in the PCA

continuity_proposals.types_supported
→ proposal types accepted for initialization and continuation

continuity.token_type
→ semantic identifier of the PIC Continuity JWT

continuity.formats_supported
→ serialization formats supported for PCA JWTs and PIC Continuity JWTs

continuity.transition_formats_supported
→ serialization formats supported for Continuity Transition JWTs
```

PCAs are represented as PCA JWTs. Each PIC Continuity JWT transports one Continuity Graph. The precise signer roles, proof structures, and algorithm negotiation for decentralized continuity remain part of the decentralized-continuity design.

With the `embedded` binding method, PIC-X validates the execution contract and places the validated contract directly in the PCA under `execution.contract`. The contract is therefore protected by the signed PCA JWT that represents the PCA.

### Continuity modes

```text
centralized-continuity
→ PIC-X validates each continuation request
→ PIC-X issues the next PIC Continuity JWT
→ only PIC-X can mint the next PIC Continuity JWT
→ PIC-X does not need to persist the complete continuity state

decentralized-continuity
→ nodes may produce Continuity Transition JWTs and update the Continuity Graph according to profile rules
→ advertised as a reserved protocol capability
→ detailed token structure and verification rules are not defined here
```

The continuity model uses the following conceptual structure:

```text
PIC Continuity JWT
`-- transports one Continuity Graph
    |-- starts from root_authority_jwt
    `-- carries numbered continuity transitions
```

A **PCA JWT** is the signed representation of one PCA.

The PCA is the logical Context of Authority. The PCA JWT signs the root authority state and carries the root challenge used to initialize the first continuity transition.

The PIC model may support different Continuity Graph representations, depending on the selected continuity mode.

This PIC-X discovery document advertises the supported continuity modes only. The detailed design of `decentralized-continuity` remains an active protocol-design topic. Its Continuity Graph structure, proof handling, attestation requirements, continuity rules, key rotation behavior, replay protection, and collusion limits are intentionally left unspecified in this document.

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
→ starts from root_authority_jwt
→ carries numbered continuity transitions
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

Possession of a copied PIC Continuity JWT should not by itself grant the ability to advance continuity. A continuation request must include valid Proof of Relationship in a Continuity Transition JWT.

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
jti or equivalent token identifier
→ correlation, audit, lineage, and revocation

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
