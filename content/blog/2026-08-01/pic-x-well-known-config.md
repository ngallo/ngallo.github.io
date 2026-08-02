+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration"
date = "2026-08-01T11:00:00+02:00"
description = "This article defines the PIC-X discovery document exposed through .well-known/pic-x-configuration. It explains the relationship between PIC-X and the PIC Token Service, the PIC profile of OAuth Token Exchange, PCA initialization and chain continuation, execution contract binding, supported chain modes, transport bindings, attestation services, Trusted Anchors, revocation, and transport security."
tags = ["pic", "pic-x", "pts", "well-known", "discovery", "configuration", "metadata", "oauth", "token exchange", "pca", "subchain", "security", "software engineering", "design"]
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

## PIC-X and the PIC Token Service

PIC-X is the overall system.

The PIC Token Service, or PTS, is the PIC-X component that implements the PIC profile of OAuth Token Exchange.

```text
┌───────────────────────────────────────────────┐
│                    PIC-X                      │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │       PIC Token Service — PTS           │  │
│  │                                         │  │
│  │  • OAuth Token Exchange endpoint        │  │
│  │  • PCA initialization and continuation  │  │
│  │  • execution contract validation        │  │
│  │    and binding                          │  │
│  │  • chain validation and aggregation     │  │
│  │  • revocation                           │  │
│  │  • PTS signing keys and chain verification       │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Attestation services                         │
│  Trusted Anchors                              │
│  Guardrails and other PIC capabilities        │
└───────────────────────────────────────────────┘
```

The PIC-X discovery document therefore contains both PTS endpoints and other PIC-X capabilities.

## PIC-X Discovery Document

```json
{
  "issuer": "http://127.0.0.1:5556/pic-x",
  "profile": "https://pic-protocol.org/0.1",

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
    "https://pic-protocol.org/token-types/pca"
  ],

  "issued_token_types_supported": [
    "https://pic-protocol.org/token-types/pca",
    "https://pic-protocol.org/token-types/chain"
  ],

  "token_endpoint_auth_methods_supported": [
    "none"
  ],

  "token_exchange_parameters_supported": [
    "execution_contract",
    "chain"
  ],

  "pca": {
    "signing_alg_values_supported": [
      "ES256"
    ],
    "execution_contract_binding_methods_supported": [
      "digest"
    ]
  },

  "chain": {
    "token_type": "https://pic-protocol.org/token-types/chain",
    "formats_supported": [
      "jwt"
    ],
    "chain_modes_supported": [
      "centralized-chain",
      "decentralized-subchains"
    ]
  }
}
```

## 1. Issuer and Protocol Profile

```json
{
  "issuer": "http://127.0.0.1:5556/pic-x",
  "profile": "https://pic-protocol.org/0.1"
}
```

`issuer` identifies the PIC-X deployment.

`profile` identifies the supported PIC protocol profile.

The issuer must match the public URL exposed to clients.

## 2. PIC Token Service Endpoints

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
→ publishes the keys used to verify PCA signatures
```

The token endpoint belongs to the PTS component, while the discovery document belongs to the wider PIC-X system.

## 3. PIC Profile of OAuth Token Exchange

PTS uses the standard OAuth Token Exchange grant:

```text
urn:ietf:params:oauth:grant-type:token-exchange
```

The current development profile advertises `token_endpoint_auth_methods_supported` as `none`. This means that the caller is not separately authenticated as an OAuth client at the token endpoint. It does not mean that the exchange is unauthenticated: PTS still validates the supplied OAuth access token, PCA, and chain artifact before issuing a result. A later production profile may add explicit client or workload authentication without changing the PIC exchange semantics.

PIC defines its own token type:

```text
https://pic-protocol.org/token-types/pca
```

The URI is controlled by the PIC project. It does not use the IETF namespace because the PCA token type is defined by PIC rather than registered by the IETF.

```json
{
  "grant_types_supported": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "subject_token_types_supported": [
    "urn:ietf:params:oauth:token-type:access_token",
    "https://pic-protocol.org/token-types/pca"
  ],
  "issued_token_types_supported": [
    "https://pic-protocol.org/token-types/pca",
    "https://pic-protocol.org/token-types/chain"
  ],
  "token_exchange_parameters_supported": [
    "execution_contract",
    "chain"
  ]
}
```

PTS supports two exchange paths:

```text
OAuth access token → PCA
→ creates the initial PCA proposal

PIC Chain N + PCA N+1 → PIC Chain N+1
→ validates a proposed next PCA and appends it to the signed chain
```

The initial exchange receives an OAuth access token as the `subject_token` and returns an initial signed PCA.

For continuation, the next PCA is first produced outside the chain as a proposal. The exchange receives that proposed PCA as the `subject_token` and receives the current signed chain through the PIC-specific `chain` parameter. After validation, PTS returns a new signed chain containing the accepted PCA.

## 4. Initial Exchange: OAuth Access Token to PCA

The initial exchange creates the first PCA from an OAuth access token.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<oauth-access-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=https://pic-protocol.org/token-types/pca
&execution_contract=<json-object>
```

```text
subject_token
→ the OAuth access token received by the application or gateway

subject_token_type
→ urn:ietf:params:oauth:token-type:access_token

requested_token_type
→ https://pic-protocol.org/token-types/pca

execution_contract
→ the application-supplied execution context used to initialize the PCA
```

PTS validates the access token through the configured Exchange Profile, maps its authority into PIC execution invariants, validates the execution contract, binds its digest to the PCA, and issues the initial PCA.

Example response:

```json
{
  "access_token": "<signed-pca>",
  "issued_token_type": "https://pic-protocol.org/token-types/pca",
  "token_type": "N_A"
}
```

## 5. Continuation Exchange: Chain N and PCA N+1 to Chain N+1

A continuation exchange receives the current signed chain and a proposed next PCA. The proposed PCA exists outside the chain until PTS validates and accepts it.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<proposed-pca-n-plus-1>
&subject_token_type=https://pic-protocol.org/token-types/pca
&requested_token_type=https://pic-protocol.org/token-types/chain
&chain=<signed-chain-n-jwt>
```

```text
subject_token
→ the proposed PCA N+1, not yet included in the chain

subject_token_type
→ https://pic-protocol.org/token-types/pca

requested_token_type
→ https://pic-protocol.org/token-types/chain

chain
→ the current signed PIC Chain N JWT
```

PTS validates:

```text
→ the signature and validity of Chain N
→ the current authority represented by Chain N
→ the proposed PCA N+1
→ the execution contract binding
→ non-expansion of authority
→ revocation state
→ the rules of the selected chain mode
```

If validation succeeds, PTS appends the proposed PCA to the chain and returns a new signed `PIC Chain N+1` JWT.

```text
PIC Chain N
+
proposed PCA N+1
+
PTS validation
=
PIC Chain N+1
```

Example response:

```json
{
  "access_token": "<signed-pic-chain-n-plus-1-jwt>",
  "issued_token_type": "https://pic-protocol.org/token-types/chain",
  "token_type": "N_A"
}
```

The `chain` parameter is singular and carries one signed JWT chain artifact.

PIC-X currently advertises two chain modes:

```text
centralized-chain
→ PTS validates each proposed transition and maintains the authoritative chain

decentralized-subchains
→ reserved for bounded decentralized execution segments
```

The detailed structure, signing model, checkpoint rules, workload identity requirements, and verification algorithm for `decentralized-subchains` remain active protocol design topics and are intentionally not defined in this discovery document.

## 6. Token Exchange Responses

The response follows the OAuth Token Exchange response structure. The semantic type of the returned value is determined by `issued_token_type`.

### Initial exchange response

```json
{
  "access_token": "<signed-pca>",
  "issued_token_type": "https://pic-protocol.org/token-types/pca",
  "token_type": "N_A"
}
```

### Continuation exchange response

```json
{
  "access_token": "<signed-pic-chain-n-plus-1-jwt>",
  "issued_token_type": "https://pic-protocol.org/token-types/chain",
  "token_type": "N_A"
}
```

`access_token` is the response field defined by OAuth Token Exchange. The returned value is not necessarily an OAuth access token and must not be interpreted only from the field name.

```text
issued_token_type = https://pic-protocol.org/token-types/pca
→ access_token contains a signed PCA

issued_token_type = https://pic-protocol.org/token-types/chain
→ access_token contains a signed PIC Chain JWT

token_type = N_A
→ the returned artifact is not used as an OAuth Bearer access token
```

OAuth Token Exchange provides the interoperable issuance protocol. PIC defines the authorization semantics of the returned artifact.

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
      "key_binding_methods_supported": [
        "cnf-jwk"
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
      "key_binding_methods_supported": [
        "cnf-jwk"
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

## 8. PCA and Chain Capabilities

PCA signing, execution contract binding, chain format, and chain modes are separate capabilities.

```json
{
  "pca": {
    "signing_alg_values_supported": [
      "ES256"
    ],
    "execution_contract_binding_methods_supported": [
      "digest"
    ]
  },

  "chain": {
    "token_type": "https://pic-protocol.org/token-types/chain",
    "formats_supported": [
      "jwt"
    ],
    "chain_modes_supported": [
      "centralized-chain",
      "decentralized-subchains"
    ]
  }
}
```

```text
pca.signing_alg_values_supported
→ algorithms used by PTS to sign PCA tokens

pca.execution_contract_binding_methods_supported
→ methods used to bind the validated execution contract to the PCA

chain.token_type
→ semantic identifier of the PIC chain artifact

chain.formats_supported
→ serialization formats supported for the chain artifact

All PIC artifacts described here are represented as signed JWTs. The precise signer roles and algorithm negotiation for decentralized subchains remain part of the subchain design.
```

With the `digest` binding method, PTS validates the execution contract and places a cryptographic digest of the validated contract in the PCA. Any change to the contract produces a different digest and breaks the binding.

### Chain modes

```text
centralized-chain
→ PTS validates each transition
→ PTS issues the next PCA
→ PTS maintains the authoritative chain centrally
→ the propagated token remains bounded in size

decentralized-subchains
→ identifies support for bounded decentralized execution segments
→ advertised as a protocol capability
→ detailed token structure and verification rules are not defined here
```

The PIC model may support a complete chain representation. Whether a deployment transports the full chain, stores it centrally, or uses bounded subchains is an implementation choice.

This PIC-X discovery document only advertises the supported chain modes.

The detailed design of `decentralized-subchains` remains an active protocol design topic. Its chain token structure, PCA sequencing, signature model, attestation requirements, checkpoint rules, key rotation behavior, replay protection, and collusion limits are intentionally left unspecified in this document.

## 9. PIC-Token Transport

OAuth access tokens and PIC authorization artifacts serve different purposes.

OAuth is one possible entry mechanism for PIC, not a universal dependency of the PIC model. In an OAuth-based entry flow, an access token may authorize access to an API, gateway, or external system boundary:

```http
Authorization: Bearer <oauth-access-token>
```

A PIC authorization artifact is transported separately through the `PIC-Token` header:

```http
PIC-Token: <signed-pic-chain-jwt>
```

A complete HTTP request may therefore carry both:

```http
POST /payments HTTP/1.1
Host: api.example.com
Authorization: Bearer <oauth-access-token>
PIC-Token: <signed-pic-chain-jwt>
Content-Type: application/json
```

```text
OAuth access token
→ may authorize access to an API, gateway, or external boundary in an OAuth-based entry flow

PIC-Token
→ carries the PIC chain artifact
→ carries the current execution authority
→ binds execution constraints and authorization invariants
→ preserves verifiable continuity across the execution path
```

OAuth and PIC are complementary.

In an OAuth-based initialization flow, PTS derives the initial PIC authority from the validated OAuth access token, the Exchange Profile, the execution contract, and local policy.

```text
initial PCA authority
⊆
OAuth subject-token authority
∩
Exchange Profile
∩
execution contract
∩
local policy
```

After initialization, OAuth does not need to participate in every internal authorization decision:

```text
effective execution authority
=
current PIC authority
∩
local policy
```

The PIC chain must never expand beyond the authority established by its origin and subsequent valid restrictions.

The OAuth access token does not become part of the PIC lineage and does not need to be propagated through the internal execution path. PIC may also be initialized by other entry mechanisms when a future PIC profile explicitly defines them.

Likewise, a PCA is not an OAuth access token and must not be interpreted as one merely because OAuth Token Exchange returns it in the `access_token` response field.

### PIC-Token is an HTTP binding

`PIC-Token` is the HTTP transport binding for a PIC chain artifact.

The underlying PCA and chain representation are transport-independent. They may be carried through:

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

For Apache Kafka, the PIC chain artifact may be placed in a record header:

```text
pic-token = <signed-pic-chain-jwt>
```

Alternatively, an application envelope may carry it explicitly:

```json
{
  "event": {
    "type": "payment.requested",
    "payload": {}
  },
  "pic_token": "<signed-pic-chain-jwt>"
}
```

The transport binding may change, but the authorization semantics represented by the PCA remain the same.

## 10. Security Considerations for Transport

A PCA and a PIC chain artifact are signed authorization artifacts, but they are still transported as sequences of bytes.

The signature protects integrity and allows recipients to authenticate the signer only after validating the signing key and its binding to the claimed identity or issuer. It does not, by itself, provide confidentiality and does not prevent an attacker from copying and forwarding an unmodified token.

Transport security remains necessary.

HTTP deployments should use TLS. Deployments requiring mutual workload authentication should use mTLS or another authenticated transport. Message brokers and streaming systems should provide equivalent confidentiality, integrity, peer authentication, and access-control guarantees.

Without a protected transport, an attacker may:

```text
→ observe a PCA or PIC chain token
→ copy or forward it
→ replay it against another endpoint
→ observe request or response data
→ impersonate an unprotected transport peer
```

These risks may originate from an unprotected transport, a compromised intermediary, broker, endpoint, or token store. Secure transport reduces exposure, while PIC-level controls constrain how a copied artifact may be reused.

PIC authorization and secure transport address different layers:

```text
TLS, mTLS, or encrypted messaging
→ protect communication between peers

PCA signatures and PIC validation
→ protect authorization semantics and execution integrity
```

A deployment must not rely on PCA signatures as a replacement for secure transport.

### Forwarding and replay

A valid signature proves that an artifact was issued or signed by an authorized entity. It does not prove that the entity presenting the artifact is the intended presenter.

An on-path attacker that can read an unprotected token may forward it unchanged. The signature will still be valid because the bytes were not modified.

PIC deployments should therefore combine transport protection with protocol-level replay and forwarding defenses, including:

```text
revocation validation
optional expiration, when defined by the profile
audience or execution-domain restriction, when present
unique PCA identifiers
execution contract binding
chain and lineage validation
workload identity binding, where required
proof of possession, where required
```

### Audience and execution-domain restrictions

A PIC profile may bind a PCA or chain to an execution domain, service, workload group, or other authorized audience.

When such a restriction is present, a recipient MUST reject the artifact when it is outside the authorized audience or execution domain.

Audience restriction limits where a copied artifact can be replayed, but it does not replace authenticated transport.

### PCA validity, identifiers, and revocation

A PCA has no expiration by default. It may remain valid for the lifetime required by the authorized execution.

PIC does not require PCAs to be short-lived. PCA validity is determined by the execution contract, the applicable PIC profile, local policy, chain state, and revocation state.

```text
jti or equivalent PCA identifier
→ uniquely identifies the PCA
→ supports correlation, auditing, lineage validation, and revocation

revocation
→ invalidates a PCA or its execution authority according to the PIC revocation specification

exp
→ may optionally define a time-based validity limit
→ is not required by the PIC model
```

A PCA remains valid until an applicable invalidation condition occurs, such as:

```text
→ explicit revocation
→ invalidation of its execution contract
→ supersession according to the chain rules
→ an optional expiration time being reached
→ another profile-specific invalidation condition
```

Whether a PCA may be presented more than once depends on the execution contract, chain rules, revocation state, and local policy.

A profile that permits long-lived PCAs MUST define how recipients obtain revocation status. Online recipients may consult PTS or another trusted revocation source.

The status-list representation and the rules for offline or intermittently connected verification have not yet been defined by the current PIC-X profile. They remain an active protocol design topic.

### Execution contract binding

The execution contract binding ensures that a PCA cannot be reused with a different execution contract without detection.

With the `digest` method, the PCA contains a digest of the validated execution contract.

```text
execution contract
→ canonicalization
→ cryptographic digest
→ digest included in the PCA
```

A recipient must recompute or otherwise obtain the expected digest and reject the PCA when the binding does not match.

### Proof of possession

Proof of possession may be used when bearer-style forwarding is not acceptable.

A PCA may be bound to a workload key or another authenticated execution identity. The presenter then proves possession of the corresponding private key when invoking the next workload.

Conceptually:

```text
PCA
→ contains or references a confirmation key

request
→ contains a signature or authenticated proof

recipient
→ verifies that the presenter controls the bound key
```

Proof of possession reduces the value of a copied PCA because possession of the token bytes alone is not sufficient.

The exact proof-of-possession mechanism is profile-specific and is not defined by this discovery document.

### Message brokers and streaming systems

For asynchronous transports such as Apache Kafka, transport protection must include both the network connection and broker-level authorization.

A secure deployment should consider:

```text
TLS between producers, brokers, and consumers
mutual authentication where required
topic-level authorization
record-header integrity
retention and access controls
consumer-group isolation
encryption at rest where required
```

A signed PCA can detect unauthorized modification, but it does not prevent an unauthorized broker operator, producer, or consumer from reading or replaying the token when the surrounding system permits it.

### Layered security model

The intended separation is:

```text
secure transport
→ protects bytes in transit

OAuth access token
→ may authorize access to an API, gateway, or external boundary in an OAuth-based entry flow

PCA
→ represents application and execution authority

PIC chain validation
→ protects continuity and authorization history

proof of possession
→ binds presentation to an authorized key or workload
```

These controls are complementary. None of them should be treated as a universal replacement for the others.

