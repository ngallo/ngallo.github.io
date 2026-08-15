+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration"
date = "2026-08-01T11:00:00+02:00"
description = "This article defines the public discovery architecture of PIC-X. It explains the server-level control-plane discovery document and the per-realm PIC-X discovery document, including issuer metadata, token endpoints, JWKS, PIC authority and continuity capabilities, and the multi-realm trust model."
tags = ["pic", "pic-x", "authority continuity", "pts", "well-known", "discovery", "configuration", "metadata", "oauth", "token exchange", "pca", "continuity", "security", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-well-known-config.png" alt="Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration." loading="lazy">
  <figcaption>Designing PIC-X. Exposing Configuration through .well-known/pic-x-configuration.</figcaption>
</figure>

PIC-X exposes discovery at two levels: a server control-plane document and a per-realm PIC-X discovery document.

The server is not an issuer. A realm is an isolated trust domain and issuer boundary. Realm discovery publishes issuer-scoped endpoints, keys, token-exchange metadata, and PIC authority and continuity capabilities.

```text
/.well-known/server-configuration
        |
        +--> realm: acme
                |
                v
/realms/acme/.well-known/pic-x-configuration
```

## Discovery Model

The server-level document describes the PIC-X instance. The realm-level document describes the issuer clients use for PIC exchange and verification.

| Level | Role | Issuer | Keys |
| --- | --- | --- | --- |
| Server control plane | Catalogs the instance, supported profiles, and public realm entries. | No. | Does not publish realm token-signing keys. |
| Realm issuer plane | Defines one isolated trust domain. | Yes. | Publishes realm keys through the realm `jwks_uri`. |

A deployment may enumerate public realms from server discovery, but enumeration is not required. A client that already knows a realm path may begin directly at the realm discovery endpoint.

```text
/realms/acme/.well-known/pic-x-configuration
      |
      +--> token_endpoint
      +--> jwks_uri
      +--> pic_context_of_authority
      +--> pic_continuity_proposals
      +--> pic_continuity_transition
      +--> pic_continuity
      +--> pic_token
```

Each realm owns its issuer identity, signing keys, audit trail, token lifecycle, and PIC trust semantics.

## Server-Level Discovery

```text
/.well-known/server-configuration
```

The server-level document is control-plane metadata.

| Property | Meaning |
| --- | --- |
| Instance metadata | Identifies the PIC-X server and version. |
| Profile support | Lists supported PIC-X profiles, such as `https://pic-protocol.org/profiles/0.2`. |
| Realm entries | May list public realms and their discovery locations. |
| Issuer status | The server control plane is not a token issuer. |
| Signing keys | Server discovery does not publish realm token-signing keys. |

The exact server-configuration JSON schema is outside the scope of this article.

## Realm-Level Discovery

For realm `acme`, PIC-X discovery is exposed at:

```text
/realms/acme/.well-known/pic-x-configuration
```

The realm document contains issuer-scoped endpoints, keys, token-exchange metadata, attestation and trusted-anchor endpoints, and PIC-specific capabilities.

| Field group | Purpose |
| --- | --- |
| `issuer`, `profile` | Identify the realm issuer and selected PIC profile. |
| `token_endpoint`, `revocation_endpoint`, `jwks_uri` | Publish realm exchange, revocation, and verification metadata. |
| `attestations_endpoint`, `trust_anchors_endpoint` | Publish trusted attestation issuers and PIC Trusted Anchors. |
| OAuth Token Exchange metadata | Advertise grant type, subject token types, issued token types, and supported extension parameters. |
| PIC capability objects | Advertise PIC artifact formats, signing algorithms, proposal types, and continuity mode support. |

## Realm Discovery JSON

The following realm discovery JSON is canonical for this article:

```json
{
  "issuer": "http://127.0.0.1:5556/realms/acme",
  "profile": "https://pic-protocol.org/profiles/0.2",

  "token_endpoint": "http://127.0.0.1:5556/realms/acme/token",
  "revocation_endpoint": "http://127.0.0.1:5556/realms/acme/revoke",
  "jwks_uri": "http://127.0.0.1:5556/realms/acme/keys",

  "attestations_endpoint": "http://127.0.0.1:5556/realms/acme/attestations",
  "trust_anchors_endpoint": "http://127.0.0.1:5556/realms/acme/trust-anchors",

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

  "artifact_hash_alg_values_supported": [
    "sha-256"
  ],

  "token_endpoint_auth_methods_supported": [
    "none"
  ],

  "token_exchange_parameters_supported": [
    "continuity_proposal"
  ],

  "pic_context_of_authority": {
    "formats_supported": [
      "pic-pca+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  },

  "pic_continuity_proposals": {
    "parameter": "continuity_proposal",
    "types_supported": [
      "https://pic-protocol.org/definitions/proposal-types/continuity-initial"
    ]
  },

  "pic_continuity_transition": {
    "formats_supported": [
      "pic-continuity-transition+cose"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  },

  "pic_continuity": {
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

  "pic_token": {
    "token_type": "https://pic-protocol.org/definitions/token-types/pic",
    "formats_supported": [
      "pic+jwt"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  }
}
```

The `pic_context_of_authority`, `pic_continuity_proposals`, `pic_continuity_transition`, `pic_continuity`, and `pic_token` names are intentionally explicit. They identify top-level PIC-X profile capabilities rather than generic OAuth server capabilities.

## Capability Summary

| Capability | Meaning |
| --- | --- |
| `pic_context_of_authority` | Supported format and signing algorithms for PIC PCA COSE checkpoints. |
| `pic_continuity_proposals` | Supported self-describing proposal types carried by the `continuity_proposal` parameter. |
| `pic_continuity_transition` | Supported format and signing algorithms for PIC Continuity Transition COSE artifacts. |
| `pic_continuity` | Supported format, signing algorithms, and continuity advancement modes for PIC Continuity COSE artifacts. |
| `pic_token` | Supported token type, format, and signing algorithms for PIC Token JWTs. |

| Metadata | Meaning |
| --- | --- |
| `artifact_hash_alg_values_supported` | Hash algorithms for PIC signed-artifact references; Profile 0.2 advertises `sha-256`. |
| `token_endpoint_auth_methods_supported` | Current discovery advertises `none`; PIC-X still validates subject tokens and PIC artifacts. |
| `token_exchange_parameters_supported` | Extension parameters supported by the profile; current initialization uses `continuity_proposal`. |
| `attestations_endpoint` | Lists trusted attestation issuers and their capabilities. |
| `trust_anchors_endpoint` | Lists available PIC Trusted Anchors and their capabilities. |

The `formats_supported` values are PIC format identifiers. For COSE artifacts, they are not automatically RFC 9596 COSE `typ` values. Artifact hash algorithms describe PIC signed-artifact references, not JOSE/COSE signing algorithms or SD-JWT internal hashing.

`continuity_modes_supported = ["centralized-continuity"]` describes the supported continuity advancement model. It is not a generic feature or policy bag.

| Protocol object | Format | Role |
| --- | --- | --- |
| PIC Token JWT | `pic+jwt` | External OAuth-compatible envelope carrying `pic.root` and optional future `pic.compositions[]`. |
| PIC PCA COSE | `pic-pca+cose` | Signed representation of one PIC Context of Authority checkpoint. |
| PIC Continuity COSE | `pic-continuity+cose` | Signed continuity container carrying `root.pca` and either no proposed transition or one candidate transition. |
| PIC Continuity Transition COSE | `pic-continuity-transition+cose` | Workload-signed causal authority transition. |
| Initial Continuity Proposal | `application/json` | Self-describing JSON proposal used before PIC continuity exists. |

The Initial Continuity Proposal has:

```text
type = https://pic-protocol.org/definitions/proposal-types/continuity-initial
```

It is carried by the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url. It is not itself a JWT, COSE artifact, or signed PIC artifact.

In Profile 0.2, a settled Continuity has `transitions = null`. A candidate Continuity has `transitions` containing exactly one PIC Continuity Transition COSE.

Execution contract material is represented consistently across layers:

```text
initial proposal input -> executionContract
logical PCA -> execution.contract
canonical PIC PCA COSE Indexed Authority Map -> execution_contract
continuity attenuation -> attenuations.execution_contract.additions
```

The execution contract constrains execution. It does not grant authority. Accepted continuity additions may only add restrictions and are combined with existing constraints using logical AND.

## Token Exchange Summary

PIC-X uses OAuth Token Exchange as the exchange interface for this profile:

```text
urn:ietf:params:oauth:grant-type:token-exchange
```

OAuth is one entry and integration mechanism for PIC. It is not a universal dependency of the PIC model.

| Flow | `subject_token` | `continuity_proposal` | Result |
| --- | --- | --- | --- |
| Initialization | OAuth access token. | Initial Continuity Proposal with `type = https://pic-protocol.org/definitions/proposal-types/continuity-initial`. | Realm-signed settled PIC Token JWT 0. |
| Continuity advancement | Workload-signed candidate PIC Token JWT. | Omitted in current Profile 0.2. | Realm-signed settled PIC Token JWT N+1. |

`subject_token_types_supported` advertises both accepted subject token categories:

```text
urn:ietf:params:oauth:token-type:access_token
-> supported for OAuth-to-PIC initialization

https://pic-protocol.org/definitions/token-types/pic
-> supported for PIC-to-PIC continuity advancement
```

The returned artifact is a PIC Token JWT:

```json
{
  "access_token": "<signed-pic-token-jwt>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/pic",
  "token_type": "N_A"
}
```

`access_token` is the OAuth Token Exchange response field. The returned value is a PIC Token JWT, not an OAuth Bearer access token.

For initialization, PIC-X validates the OAuth access token and Initial Continuity Proposal, derives PCA 0, signs the initial PIC PCA COSE and settled PIC Continuity COSE, and returns PIC Token JWT 0.

For advancement, PIC-X parses the candidate PIC Token JWT, candidate PIC Continuity COSE, and embedded Transition as untrusted input. It then validates the current checkpoint, predecessor, position, challenge, Proof of Relationship, workload signatures, attenuation, non-expansion, revocation, local policy, and evidence or conformance checks required by the selected profile.

The detailed PCA derivation and centralized advancement walkthroughs are covered by the later PIC-X articles.

## Trust Boundary

`issuer` identifies the realm that issues settled PIC artifacts. The server control plane has no corresponding token issuer identity.

| Trust material | Used for | Published or accepted through |
| --- | --- | --- |
| Realm signing keys | Realm-signed settled PIC Token JWTs, settled PIC Continuity COSE artifacts, and PIC PCA COSE checkpoints. | Realm `jwks_uri`. |
| Workload verification key | Workload-signed candidate PIC Token JWT, candidate PIC Continuity COSE, and PIC Continuity Transition COSE. | Accepted from issuer-signed SD-JWT Proof of Relationship under Profile 0.2 validation. |
| Attestation issuers | Proof of Relationship credentials and issuer-specific capabilities. | `attestations_endpoint`. |
| PIC Trusted Anchors | Trust policy engines and anchor-specific capabilities. | `trust_anchors_endpoint`. |

Profile 0.2 uses `proof_of_relationship.type = "sd-jwt"` and issuer-signed SD-JWT presentation bytes in `proof_of_relationship.evidence` for PIC Continuity Transition COSE. SD-JWT support does not make every issuer automatically trusted for PoR; trust depends on selected realm configuration, issuer validation, key validation, and profile rules.

No separate SD-JWT KB-JWT is required for continuity advancement in this profile. Generic attestation proof-of-possession capabilities do not imply a mandatory PIC continuity mechanism.

Discovery advertises how the realm exchanges, issues, and validates artifacts. It does not change the non-expansion invariant: accepted PIC authority cannot expand beyond its established origins and valid restrictions.

## Transport / Security Notes

`PIC-Token` is the HTTP binding for a PIC Token JWT:

```http
PIC-Token: <signed-pic-token-jwt>
```

The underlying PIC Token JWT and embedded COSE artifacts are transport-independent. They may be carried over HTTP, RPC systems, event streams, queues, workflow engines, or storage-backed execution systems.

PIC artifacts are signed, not encrypted. Signatures protect integrity and identify a signer only after key identity and trust binding have been validated. They do not provide confidentiality and do not prevent copying by themselves.

Possessing a copied PIC Token JWT is distinct from being able to advance continuity. Advancement requires a valid Profile 0.2 relationship, accepted workload key, workload signatures, predecessor, challenge, position, attenuation, revocation, and policy validation.

Deployments still need transport security: TLS for HTTP, mTLS or equivalent peer authentication when required, broker authentication and authorization for messaging systems, and revocation validation for relevant PIC artifacts or continuity state.

A PCA has no mandatory independent expiration. Any expiration policy is profile-defined. A PIC PCA COSE is usable only as part of a valid PIC Continuity COSE carried by a PIC Token JWT and remains subject to revocation, continuity rules, execution-contract constraints, local policy, and any declared token or profile expiration.

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
