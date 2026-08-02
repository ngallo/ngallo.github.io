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
PIC-X
|
+-- PIC Token Service (PTS)
|   +-- OAuth Token Exchange endpoint
|   +-- PCA initialization and chain continuation
|   +-- Execution contract validation and binding
|   +-- Chain validation and aggregation
|   +-- Revocation
|   +-- PTS signing keys
|   `-- Chain verification
|
+-- Attestation services
+-- Trusted Anchors
`-- Guardrails and other PIC capabilities
```

The PIC-X discovery document therefore contains both PTS endpoints and other PIC-X capabilities.

## PIC-X Discovery Document

```json
{
  "issuer": "http://127.0.0.1:5556/pic-x",
  "profile": "https://pic-protocol.org/0.2",

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
    "https://pic-protocol.org/token-types/chain"
  ],

  "issued_token_types_supported": [
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
  "profile": "https://pic-protocol.org/0.2"
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

The current development profile advertises `token_endpoint_auth_methods_supported` as `none`. The caller is not separately authenticated as an OAuth client. PTS still validates the supplied subject token and all PIC artifacts before issuing a result.

PIC defines two token types:

```text
https://pic-protocol.org/token-types/pca
https://pic-protocol.org/token-types/chain
```

A PCA is an element of a PIC chain. It is not issued as the top-level result of the exchange.

The exchange always returns a signed PIC Chain JWT:

```json
{
  "grant_types_supported": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "subject_token_types_supported": [
    "urn:ietf:params:oauth:token-type:access_token",
    "https://pic-protocol.org/token-types/chain"
  ],
  "issued_token_types_supported": [
    "https://pic-protocol.org/token-types/chain"
  ],
  "token_exchange_parameters_supported": [
    "execution_contract",
    "chain"
  ]
}
```

PTS exposes one exchange interface with two inputs:

```text
OAuth access token
→ initializes PIC execution
→ PTS creates PCA 0
→ PTS returns PIC Chain 0

PIC Chain N + proposed PCA N+1
→ continues PIC execution
→ PTS validates the proposed PCA
→ PTS returns PIC Chain N+1
```

The returned artifact is therefore always a chain. For the first exchange, the chain has no previous chain:

```text
Chain 0.previous = null
```

The PCA created during initialization is already contained in Chain 0.

## 4. Initial Exchange: OAuth Access Token to Chain 0

The initial exchange receives an OAuth access token and returns the first signed PIC chain.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<oauth-access-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=https://pic-protocol.org/token-types/chain
&execution_contract=<json-object>
```

PTS validates the access token through the configured Exchange Profile, derives the initial PIC authority, validates the execution contract, creates PCA 0, and returns Chain 0.

Conceptually:

```text
OAuth access token
+
execution contract
+
Exchange Profile and local policy
=
PCA 0 inside PIC Chain 0
```

Example response:

```json
{
  "access_token": "<signed-pic-chain-0-jwt>",
  "issued_token_type": "https://pic-protocol.org/token-types/chain",
  "token_type": "N_A"
}
```

## 5. Continuation Exchange: Chain N and PCA N+1 to Chain N+1

A continuation exchange receives the current signed chain as the `subject_token` and a proposed next PCA as the standard OAuth Token Exchange `actor_token`.

The proposed PCA remains outside the chain until PTS validates it.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<signed-pic-chain-n-jwt>
&subject_token_type=https://pic-protocol.org/token-types/chain
&actor_token=<proposed-pca-n-plus-1>
&actor_token_type=https://pic-protocol.org/token-types/pca
&requested_token_type=https://pic-protocol.org/token-types/chain
```

```text
subject_token
→ PIC Chain N

actor_token
→ proposed PCA N+1, not yet part of the chain

requested_token_type
→ PIC Chain N+1
```

PTS validates the chain, the proposed PCA, the execution contract binding, revocation state, non-expansion of authority, and the rules of the selected chain mode.

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

The PIC-specific `chain` parameter remains advertised for chain-mode-specific extensions. The current centralized continuation flow carries the authoritative Chain N as the standard `subject_token`.

PIC-X advertises two chain modes:

```text
centralized-chain
→ PTS validates each transition and returns the next signed chain

decentralized-subchains
→ reserved capability whose detailed design is still under definition
```

## 6. Token Exchange Response

Every successful exchange returns a signed PIC Chain JWT.

```json
{
  "access_token": "<signed-pic-chain-jwt>",
  "issued_token_type": "https://pic-protocol.org/token-types/chain",
  "token_type": "N_A"
}
```

`access_token` is the response field defined by OAuth Token Exchange. The returned value is a PIC Chain JWT, not an OAuth Bearer access token.

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

## 10. Security Considerations

PIC artifacts are signed JWTs. Signatures protect integrity and authenticate a signer only after the signing key and its identity binding have been validated. They do not provide confidentiality and do not prevent copying or replay by themselves.

Deployments should therefore use:

```text
TLS for HTTP
mTLS or equivalent peer authentication where required
broker authentication and authorization for Kafka and messaging systems
revocation validation
execution-contract and chain validation
audience or execution-domain restrictions when defined
proof of possession when bearer-style forwarding is unacceptable
```

A PCA has no expiration by default. It remains valid until revoked or invalidated by the execution contract, chain rules, local policy, or an optional profile-defined expiration.

```text
jti or equivalent identifier
→ correlation, audit, lineage, and revocation

revocation
→ primary PCA invalidation mechanism

exp
→ optional; not required by PIC
```

A profile supporting long-lived PCAs must define how recipients obtain revocation status. The status-list format, offline verification model, detailed replay defenses, proof-of-possession mechanism, and decentralized-subchain security model are still design topics and should be treated in dedicated protocol articles.
