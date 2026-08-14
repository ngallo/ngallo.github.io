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

PIC-X exposes public discovery at two levels: the **server control plane** and the **realm issuer plane**.

The server itself is not an issuer. It does not publish token-signing keys and does not issue PIC Token JWTs. Its public discovery document describes the PIC-X instance, its version, the PIC-X profiles it supports, and the realms that the deployment chooses to enumerate publicly.

```text
/.well-known/server-configuration
```

Each realm is an isolated trust domain and an issuer in its own right. A realm has its own path, for example:

```text
/realms/acme/
```

and exposes its own PIC-X discovery document at:

```text
/realms/acme/.well-known/pic-x-configuration
```

That realm document publishes the issuer metadata and protocol capabilities needed to interact with that realm, including its `token_endpoint`, `jwks_uri`, supported grants and token types, and PIC-specific authority and continuity capabilities.

The separation is intentional:

- the PIC-X server orchestrates and catalogs; it is not itself an issuer;
- each realm is an isolated trust domain;
- each realm owns its token-signing keys;
- each realm owns its audit trail, pseudonymisation key, and operational lifecycle;
- a realm may be listed by the server control plane or remain non-enumerated while still being reachable by clients that already know its path.

Conceptually:

```text
Client
  |
  v
/.well-known/server-configuration
  |
  +--> profile: https://pic-protocol.org/profiles/0.2
        |
        +--> realm: acme
              |
              v
        /realms/acme/.well-known/pic-x-configuration
              |
              +--> token_endpoint
              +--> jwks_uri
              +--> pic_context_of_authority
              +--> pic_continuity_proposals
              +--> pic_continuity
```

## Server-Level Discovery

The server-level document is control-plane metadata. It tells a client which PIC-X instance it is talking to, which version is running, which PIC-X profiles are supported, and which realms are publicly listed.

It is deliberately **not** an issuer metadata document:

```text
/.well-known/server-configuration
→ describes the PIC-X server/control plane
→ does not identify a token issuer
→ does not publish token-signing keys
→ does not issue PIC Token JWTs
→ may enumerate public realms
```

A deployment is not required to enumerate every realm. Non-enumerated realms remain discoverable to clients that know the realm path through their realm-specific PIC-X discovery endpoint. The exact server-configuration JSON schema is outside the scope of this article.

## Realm-Level Discovery

The realm is the issuer boundary. For the example realm `acme`, discovery is exposed at:

```text
/realms/acme/.well-known/pic-x-configuration
```

The realm document contains issuer-scoped endpoints, keys, token-exchange metadata, and PIC-specific capabilities. The following example keeps the existing Profile 0.2 capability model but scopes it to the realm:

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
    "continuity_proposal",
    "continuity_proposal_type"
  ],

  "pic_context_of_authority": {
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

  "pic_continuity_proposals": {
    "parameter": "continuity_proposal",
    "type_parameter": "continuity_proposal_type",
    "types_supported": [
      "https://pic-protocol.org/definitions/proposal-types/continuity-initial",
      "https://pic-protocol.org/definitions/proposal-types/continuity"
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
    ],
    "transition": {
      "formats_supported": [
        "pic-continuity-transition+cose"
      ],
      "signing_alg_values_supported": [
        "ES256"
      ]
    }
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

The `pic_context_of_authority`, `pic_continuity_proposals`, and `pic_continuity` names are intentionally explicit. They identify PIC-X profile capabilities rather than generic OAuth server capabilities.

The realm owns the cryptographic and operational trust state behind these endpoints. In particular, `jwks_uri` publishes the realm's token-signing keys, not server-level keys. Realm-local audit data, pseudonymisation key material, and lifecycle state are likewise isolated to that realm and are not part of the server-level discovery document.

## Discovery Flow

A client that starts from the PIC-X server performs discovery in two steps:

```text
1. GET /.well-known/server-configuration
2. inspect supported PIC-X profiles and public realm entries
3. select/follow a realm, for example `acme`
4. GET /realms/acme/.well-known/pic-x-configuration
5. read issuer, token_endpoint, jwks_uri, token types, and PIC capabilities
```

A client that already knows the realm path may start directly from the realm discovery endpoint; server-level enumeration is not a prerequisite for reachability.

## Issuer and Realm Trust Boundary

For a realm document:

```json
{
  "issuer": "http://127.0.0.1:5556/realms/acme",
  "profile": "https://pic-protocol.org/profiles/0.2"
}
```

`issuer` identifies the realm that issues settled PIC artifacts. Artifacts issued by that realm use the realm issuer identity according to the selected profile. The server-level control plane has no corresponding token issuer identity because it does not mint realm tokens.

The realm's `jwks_uri` publishes the public keys used to verify realm-signed settled PIC Token JWTs, realm-signed settled PIC Continuity COSE artifacts, and realm-signed PIC PCA COSE checkpoints. Workload-signed candidate PIC Token JWT, candidate PIC Continuity COSE, and PIC Continuity Transition COSE artifacts are still verified through the workload key accepted from the issuer-signed SD-JWT Proof of Relationship and Profile 0.2 validation rules, not through the realm JWKS.

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
→ signed trusted authority checkpoint representation
→ initial checkpoint has position 0
→ later checkpoints may have position > 0

PIC Token JWT
→ external OAuth-compatible transport envelope
→ carries `pic.root` as PIC Continuity COSE
→ may be workload-signed candidate or realm-signed settled result
→ may carry future `pic.compositions[]` values as additional PIC Continuity COSE artifacts

Initial Continuity Proposal
→ input used before continuity exists
→ supplies initialization material such as executionContract

Continuation Proposal
→ optional/profile-defined support material for later centralized advancement
→ is not the transition and is not the settled result

PIC Continuity COSE
→ signed continuity container
→ carries exact signed PIC PCA COSE bytes for the current trusted checkpoint in `root.pca`
→ carries `transitions: null` when settled
→ carries a proposed transition chain when candidate

PIC Continuity Transition COSE
→ workload-signed causal authority transition
→ Profile 0.2 accepts exactly one transition in a candidate
→ not carried forward after PIC-X checkpoints it into a new PCA
```

The profile and definition identifiers used in this article are:

```text
https://pic-protocol.org/profiles/0.2
https://pic-protocol.org/definitions/token-types/pic
https://pic-protocol.org/definitions/proposal-types/continuity-initial
https://pic-protocol.org/definitions/proposal-types/continuity
```

The initial and continuation proposal types may use different schemas. Their exact fields, supporting evidence, cryptographic binding, and validation rules are intentionally deferred to a dedicated protocol article. Proof of Relationship is carried by PIC Continuity Transition COSE artifacts according to the selected profile.

The Initial Continuity Proposal is used by the OAuth-based initialization flow before PIC continuity exists. A Continuation Proposal is optional support material used only when required by a selected advancement profile/schema; it is not the PIC Token JWT, the PIC Continuity Transition COSE, or the settled PIC Continuity COSE. Current Profile 0.2 PIC-to-PIC advancement omits both `continuity_proposal` and `continuity_proposal_type`.

When present, the value of `continuity_proposal` is the unpadded Base64url encoding of the compact UTF-8 JSON serialization of the proposal object. This transport encoding does not by itself make the proposal a JWT, COSE artifact, or signed object.

The PIC-X exchange response returns a PIC Token JWT:

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

`subject_token_types_supported` means:

```text
urn:ietf:params:oauth:token-type:access_token
→ supported as `subject_token` for OAuth-to-PIC initialization

https://pic-protocol.org/definitions/token-types/pic
→ supported as `subject_token` for PIC-to-PIC continuity advancement
  using a workload-signed candidate PIC Token JWT
```

`token_exchange_parameters_supported` advertises extension parameters supported by this profile. The initial exchange uses `continuity_proposal` and `continuity_proposal_type`; current Profile 0.2 PIC-to-PIC advancement omits them unless a future profile defines Continuation Proposal support material.

PIC-X exposes one exchange interface with two continuity flows:

```text
INITIAL EXCHANGE

subject_token = OAuth access token
continuity_proposal = Initial Continuity Proposal
→ PIC-X
→ settled PIC Token JWT 0

CONTINUITY ADVANCEMENT

subject_token = workload-signed candidate PIC Token JWT
continuity_proposal = omitted in current Profile 0.2
→ PIC-X
→ settled PIC Token JWT N+1
```

The returned artifact is therefore always a PIC Token JWT.

For the first exchange, PIC-X operates in the selected realm context to create the initial realm-signed PIC PCA COSE and embed it as the current checkpoint in the settled PIC Continuity COSE carried as `pic.root`.

The returned PIC Token JWT is the external transport envelope. Its `pic.root` value is the centrally trusted PIC Continuity COSE.

For advancement, the workload produces a candidate PIC Token JWT carrying a candidate Continuity. The candidate PIC Token JWT itself is the RFC 8693 `subject_token`. Profile 0.2 candidate Continuity carries the exact signed PIC PCA COSE bytes for the current trusted checkpoint and exactly one PIC Continuity Transition COSE.

In a settled Continuity, `root.pca` contains the exact signed PIC PCA COSE bytes for the current trusted checkpoint. After advancement, it changes from PIC PCA COSE N to PIC PCA COSE N+1.

## 4. Initial Exchange: OAuth Access Token to PIC Token JWT 0

The initial exchange receives an OAuth access token and an Initial Continuity Proposal, then returns the first PIC Token JWT.

```http
POST /realms/acme/token HTTP/1.1
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

PIC-X validates the access token through the configured Exchange Profile and validates the Initial Continuity Proposal. In the flow described here, that proposal contains the execution contract. PIC-X then derives PCA 0, issues the initial PIC PCA COSE and settled PIC Continuity COSE 0 with `transitions: null`, and returns the initial PIC Token JWT. The realm-signed PIC PCA COSE is the signed representation of the initial authority checkpoint and carries `challenge.next_challenge` used to initialize the first continuity transition.

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

In PIC Profile 0.2, continuity advancement is PIC-X-mediated. The workload assembles a workload-signed candidate PIC Token JWT. That candidate carries a workload-signed candidate PIC Continuity COSE whose `root.pca` contains the exact signed PIC PCA COSE bytes for the current trusted checkpoint and whose `transitions` array contains exactly one workload-signed PIC Continuity Transition COSE.

Current Profile 0.2 PIC-to-PIC advancement omits `continuity_proposal` and `continuity_proposal_type`. A future profile may define optional Continuation Proposal support material; it is not the PIC Token JWT, the PIC Continuity Transition COSE, or the settled PIC Continuity COSE.

When Continuation Proposal support material is used, its type is:

```text
https://pic-protocol.org/definitions/proposal-types/continuity
```

The workload-signed candidate PIC Token JWT is carried as the standard RFC 8693 `subject_token`.

```http
POST /realms/acme/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<workload-signed-candidate-pic-token-jwt>
&subject_token_type=https://pic-protocol.org/definitions/token-types/pic
&requested_token_type=https://pic-protocol.org/definitions/token-types/pic
```

```text
subject_token
→ workload-signed candidate PIC Token JWT
→ carries workload-signed candidate PIC Continuity COSE in `pic.root`
→ candidate Continuity carries exact signed PIC PCA COSE bytes for the current trusted checkpoint and exactly one Transition

continuity_proposal
→ omitted in current Profile 0.2 PIC-to-PIC advancement

requested_token_type
→ PIC Token JWT N+1
```

PIC-X parses the candidate PIC Token JWT, candidate PIC Continuity COSE, and embedded Transition as untrusted input. It validates the issuer-signed SD-JWT Proof of Relationship first to obtain the accepted workload verification key, then verifies the workload signatures over the Transition, candidate Continuity, and candidate JWT before applying predecessor, position, challenge, execution-contract constraints, attenuation, non-expansion, revocation, local policy, and evidence/conformance checks when required.

```text
candidate PIC Token JWT
`-- pic.root = candidate PIC Continuity COSE
    +-- root.pca = exact signed PIC PCA COSE N bytes
    `-- transitions = [Transition N+1]
        |
        v
workload signs candidate token, candidate Continuity, and Transition
with the private key accepted from the SD-JWT PoR
        |
        v
PIC-X token exchange
        |
  +-- parses candidate token, Continuity, and Transition as untrusted
  +-- validates SD-JWT PoR/key binding and obtains workload key
  +-- verifies transition, candidate Continuity, and candidate token signatures
  +-- validates the trusted current PIC PCA COSE checkpoint artifact
  +-- validates predecessor, position, challenge, PoR, attenuation, non-expansion, and policy
  +-- validates executor evidence / conformance when required
  +-- checkpoints accepted authority into a new PIC PCA COSE
        |
        v
realm-signed PIC Token JWT N+1
`-- pic.root = settled PIC Continuity COSE N+1
    +-- root.pca = exact signed PIC PCA COSE N+1 bytes
    `-- transitions = null
```

Example response:

```json
{
  "access_token": "<signed-pic-token-jwt-n-plus-1>",
  "issued_token_type": "https://pic-protocol.org/definitions/token-types/pic",
  "token_type": "N_A"
}
```

`actor_token` is not used unless a distinct OAuth actor credential is introduced. PIC Profile 0.2 defines only centralized PIC-X-mediated continuity advancement.

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
  "attestations_endpoint": "http://127.0.0.1:5556/realms/acme/attestations",
  "trust_anchors_endpoint": "http://127.0.0.1:5556/realms/acme/trust-anchors"
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

Profile 0.2 uses issuer-signed SD-JWT presentation bytes for `proof_of_relationship` in PIC Continuity Transition COSE. SD-JWT support does not make every issuer automatically trusted for PoR; trust depends on the selected Profile 0.2 trust configuration and issuer/key validation rules. The `proof_of_possession_methods_supported` values shown for attestation issuers describe generic attestation issuance capabilities; they do not mean Profile 0.2 continuity advancement requires a separate JWS nonce proof or KB-JWT.

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

PIC Token JWT signing, PIC PCA COSE signing, PIC Continuity COSE signing, PIC Continuity Transition COSE signing, execution contract placement or binding, artifact format, signed-artifact hash algorithm, and continuity modes are separate capabilities.

The `formats_supported` values are PIC format identifiers. For COSE artifacts, they are not automatically RFC 9596 COSE `typ` values. Artifact hash algorithms describe PIC signed-artifact references, not JOSE/COSE signing algorithms or SD-JWT internal hashing.

```json
{
  "artifact_hash_alg_values_supported": [
    "sha-256"
  ],

  "pic_token": {
    "token_type": "https://pic-protocol.org/definitions/token-types/pic",
    "formats_supported": [
      "pic+jwt"
    ],
    "signing_alg_values_supported": [
      "ES256"
    ]
  },

  "pic_context_of_authority": {
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

  "pic_continuity_proposals": {
    "parameter": "continuity_proposal",
    "type_parameter": "continuity_proposal_type",
    "types_supported": [
      "https://pic-protocol.org/definitions/proposal-types/continuity-initial",
      "https://pic-protocol.org/definitions/proposal-types/continuity"
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
    ],
    "transition": {
      "formats_supported": [
        "pic-continuity-transition+cose"
      ],
      "signing_alg_values_supported": [
        "ES256"
      ]
    }
  }
}
```

Profile 0.2 uses a shared advertised signing algorithm set where the same artifact family has both realm-signed settled and workload-signed candidate forms. This is a Profile 0.2 simplification; future profiles may distinguish realm outbound signing algorithms from externally accepted workload-signature algorithms without defining that future metadata here.

```text
artifact_hash_alg_values_supported
→ cryptographic hash algorithms supported for PIC signed-artifact references
→ Profile 0.2 currently uses SHA-256

pic_token.token_type
→ OAuth Token Exchange token type identifier of the external PIC Token JWT

pic_token.formats_supported
→ serialization formats supported for PIC Token JWTs

pic_token.signing_alg_values_supported
→ shared Profile 0.2 algorithms for PIC Token JWT signatures
→ used by the realm for settled PIC Token JWTs
→ accepted by PIC-X for workload-signed candidate PIC Token JWTs

pic_context_of_authority.formats_supported
→ serialization formats supported for PIC PCA COSE artifacts

pic_context_of_authority.signing_alg_values_supported
→ algorithms used to sign PIC PCA COSE artifacts

pic_continuity.formats_supported
→ serialization formats supported for PIC Continuity COSE artifacts

pic_continuity.signing_alg_values_supported
→ shared Profile 0.2 algorithms for PIC Continuity COSE signatures
→ used by the realm for settled PIC Continuity COSE artifacts
→ accepted by PIC-X for workload-signed candidate PIC Continuity COSE artifacts

pic_continuity.transition.formats_supported
→ serialization formats supported for PIC Continuity Transition COSE artifacts

pic_continuity.transition.signing_alg_values_supported
→ signing algorithms accepted by PIC-X for workload-signed PIC Continuity Transition COSE artifacts
→ Transition COSE signature proves possession/control of the PoR-bound workload private key
→ workload key must be accepted from the SD-JWT PoR

pic_context_of_authority.execution_contract_binding_methods_supported
→ methods used to place or bind the validated execution contract in the PCA

pic_continuity_proposals.types_supported
→ proposal types accepted when proposal support material is present
→ current initialization uses `continuity-initial`
→ current PIC-to-PIC advancement omits Continuation Proposal parameters

```

PIC Profile 0.2 uses a JWT/JWS envelope for the external PIC Token JWT and native CBOR/COSE for PIC PCA COSE, PIC Continuity COSE, and PIC Continuity Transition COSE. When COSE artifacts are embedded inside the textual JWT envelope, the enclosing JWT transport must encode those binary values, but the native COSE artifacts remain binary.

PCAs are represented as PIC PCA COSE checkpoint artifacts. A workload-produced candidate PIC Continuity COSE carries the exact signed PIC PCA COSE bytes for the current trusted checkpoint and, in Profile 0.2, exactly one workload-signed PIC Continuity Transition COSE. A realm-issued settled PIC Continuity COSE carries the exact signed PIC PCA COSE bytes for the new trusted checkpoint and `transitions: null`.

With the `embedded` binding method, PIC-X validates the `executionContract` supplied by the Initial Continuity Proposal and incorporates it into the logical initial PCA as `execution.contract`. When that PCA is serialized as a PIC PCA COSE, the contract is represented in the canonical `execution_contract` section and is therefore protected by the PIC PCA COSE signature.

Existing execution-contract constraints are not removed, replaced, or weakened during continuity advancement. Accepted transitions may only introduce additional execution constraints through `attenuations.execution_contract.additions`; accepted additions are combined with existing constraints using logical AND and materialized into the new PCA checkpoint.

```text
initial proposal input → executionContract
logical PCA → execution.contract
canonical PIC PCA COSE Indexed Authority Map → execution_contract
continuity attenuation → attenuations.execution_contract.additions
```

In the canonical PIC PCA COSE representation, `execution_contract` uses compact tuple entries with explicit section-local numeric indexes. Proposed additions in `attenuations.execution_contract.additions` carry canonical compact `[key, value]` tuples without numeric indexes; PIC-X validates and orders accepted canonical additions and assigns indexes only after accepting the transition.

Removal attenuation may apply to `identity_context` and `execution.invariants` according to the selected profile/schema. Execution-contract restriction does not use a removal bitmap.

### Continuity modes

```text
centralized-continuity
→ PIC-X validates each proposed advancement
→ each candidate Continuity carries exactly one PIC Continuity Transition COSE
→ PIC-X materializes the accepted transition into a new PCA checkpoint
→ the realm issues the next settled PIC Continuity COSE with `transitions: null`
→ PIC-X returns the next realm-signed settled PIC Token JWT
```

The Profile 0.2 continuity model uses the following conceptual structure:

```text
realm-signed PIC Token JWT N
→ carries settled PIC Continuity COSE N in `pic.root`
→ root.pca is exact signed PIC PCA COSE N bytes
→ transitions = null

workload-signed candidate PIC Token JWT
→ carries candidate PIC Continuity COSE
→ root.pca is exact signed PIC PCA COSE N bytes
→ transitions = [Transition N+1]

realm-signed PIC Token JWT N+1
→ carries settled PIC Continuity COSE N+1 in `pic.root`
→ root.pca is exact signed PIC PCA COSE N+1 bytes
→ transitions = null
```

A **PIC PCA COSE** is the signed representation of one PCA.

The PCA is the logical Context of Authority. The realm-signed PIC PCA COSE is the signed representation of the current authority checkpoint and carries `challenge.next_challenge` for the next transition.

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
→ binds the execution to its current trusted PIC PCA COSE checkpoint artifact and continuity state
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

PIC Token JWTs are signed JWT envelopes. PCAs are represented by signed PIC PCA COSE checkpoint artifacts. Candidate PIC Token JWT and Continuity artifacts are workload-signed proposals; realm-issued PIC Token JWT and Continuity artifacts are trusted settled artifacts after validation.

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
Transition COSE signature proving PoR-bound workload key control
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

A profile supporting long-lived PCAs must define how recipients obtain revocation status. The status-list format, offline verification model, detailed replay defenses, and any additional or future proof-of-possession mechanisms remain design topics. Profile 0.2 already uses the PIC Continuity Transition COSE signature as proof of possession/control of the private key corresponding to the workload verification key accepted from the SD-JWT PoR; continuity validation still also depends on predecessor, hash, position, challenge, attenuation, evidence, revocation, and policy checks.

## Multi-Realm PIC-X

PIC-X is therefore orchestrated as a multi-realm platform. The server-level control plane makes the public topology readable; realm discovery defines the issuer boundary and exposes the cryptographic and semantic capabilities of that trust domain. The server catalogs and coordinates, while each realm retains authority over its own keys, audit trail, pseudonymisation state, token lifecycle, and PIC trust semantics.

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
