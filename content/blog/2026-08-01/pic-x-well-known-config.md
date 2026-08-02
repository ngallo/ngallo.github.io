+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration"
date = "2026-08-01T11:00:00+02:00"
description = "This article defines the PIC-X discovery document exposed through .well-known/pic-x-configuration. It explains the relationship between the PIC-X platform and the PIC Token Service, the PIC profile of OAuth Token Exchange, PCA initialization and continuation, subchain submission, attestation services, Trusted Anchors, and lineage capabilities."
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

The document exposes public platform endpoints and supported protocol capabilities. Internal Exchange Profiles are not exposed.

## PIC-X and the PIC Token Service

PIC-X is the platform.

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
│  │  • PCA and chain JWT signing keys       │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Attestation services                         │
│  Trusted Anchors                              │
│  Guardrails and other PIC capabilities        │
└───────────────────────────────────────────────┘
```

The platform discovery document therefore contains both PTS endpoints and other PIC-X capabilities.

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
    "https://pic-protocol.org/token-types/pca"
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
    "signing_alg_values_supported": [
      "ES256"
    ],
    "chain_modes_supported": [
      "centralized-chain",
      "snapshot-based-subchain"
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
→ requests PCA revocation

jwks_uri
→ publishes the keys used to verify PCA signatures
```

The token endpoint belongs to the PTS component, while the discovery document belongs to the wider PIC-X platform.

## 3. PIC Profile of OAuth Token Exchange

PTS uses the standard OAuth Token Exchange grant:

```text
urn:ietf:params:oauth:grant-type:token-exchange
```

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
    "https://pic-protocol.org/token-types/pca"
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
→ initializes a new PIC authorization chain

PCA → PCA
→ continues an existing PIC authorization chain
```

The initial exchange receives an OAuth access token as the `subject_token`.

A continuation exchange receives an existing PCA as the `subject_token`.

The lineage is supplied separately through the PIC-specific `chain` parameter as one signed JWT chain artifact.

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

## 5. Continuation Exchange: PCA to PCA

A continuation exchange receives the current PCA and one signed chain artifact, then returns the next PCA.

```http
POST /pic-x/token HTTP/1.1
Host: 127.0.0.1:5556
Content-Type: application/x-www-form-urlencoded
```

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<current-pca>
&subject_token_type=https://pic-protocol.org/token-types/pca
&requested_token_type=https://pic-protocol.org/token-types/pca
&chain=<signed-chain-jwt>
```

```text
subject_token
→ the current PCA

subject_token_type
→ https://pic-protocol.org/token-types/pca

requested_token_type
→ https://pic-protocol.org/token-types/pca

chain
→ one signed JWT carrying the centralized chain, a local subchain, or an aggregated snapshot
```

The `chain` parameter is singular. Multiple hops or segments are represented inside the signed JWT rather than by repeating the request parameter.

Example decoded JWT header:

```json
{
  "typ": "pic-chain+jwt",
  "alg": "ES256",
  "kid": "chain-signing-key-1"
}
```

Example decoded JWT payload:

```json
{
  "mode": "snapshot-based-subchain",
  "chain_id": "chain-123",
  "base_pca": "pca-456",
  "hops": [
    {
      "sequence": 1,
      "executor": "executor-a",
      "previous": "sha256:..."
    },
    {
      "sequence": 2,
      "executor": "executor-b",
      "previous": "sha256:..."
    }
  ]
}
```

```text
centralized-chain
→ PTS creates and manages the chain artifact

snapshot-based-subchain
→ local nodes create a signed JWT containing the subchain
→ PTS validates the JWT signature, ordering, linkage, and PCA binding
→ PTS incorporates the verified chain state into the next PCA
```

PTS validates the current PCA, validates the signed chain JWT, applies the configured PIC rules, and issues the next PCA.

Example response:

```json
{
  "access_token": "<next-signed-pca>",
  "issued_token_type": "https://pic-protocol.org/token-types/pca",
  "token_type": "N_A"
}
```

## 6. Token Exchange Response

The response follows the OAuth Token Exchange response structure:

```json
{
  "access_token": "<signed-pca>",
  "issued_token_type": "https://pic-protocol.org/token-types/pca",
  "token_type": "N_A"
}
```

`access_token` is the response field defined by OAuth Token Exchange.

The returned value is not an OAuth access token. Its semantic type is determined by `issued_token_type`.

```text
access_token
→ contains the signed PCA

issued_token_type
→ identifies the PIC PCA token type

token_type: N_A
→ the PCA is not used as an OAuth Bearer access token
```

The PCA remains an application-level authorization artifact while OAuth Token Exchange provides the interoperable issuance protocol.

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

PCA signing, execution contract binding, and chain JWT signing are separate capabilities.

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
    "signing_alg_values_supported": [
      "ES256"
    ],
    "chain_modes_supported": [
      "centralized-chain",
      "snapshot-based-subchain"
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

chain.signing_alg_values_supported
→ algorithms used to sign chain JWTs
```

With the `digest` binding method, PTS validates the execution contract and places a cryptographic digest of the validated contract in the PCA. Any change to the contract produces a different digest and breaks the binding.

```text
centralized-chain
→ the chain is created, signed, and managed by the central PTS

snapshot-based-subchain
→ local nodes extend a subchain
→ the complete subchain is serialized as one JWT
→ the JWT is signed with a supported chain signing algorithm
→ the signed chain JWT is submitted through the `chain` parameter
→ PTS validates and incorporates its verified state into the next PCA
→ snapshots must be produced within a configured maximum interval
→ shorter intervals are allowed
→ the maximum interval limits exposure to colluding compromised nodes
```

The `chain` parameter always carries one signed JWT. That JWT can contain one hop, multiple hops, a full centralized chain, or a snapshot-based subchain, depending on the selected chain mode.
