+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration"
date = "2026-08-01T11:00:00+02:00"
description = "This article defines the PIC-X discovery document exposed through .well-known/pic-x-configuration. It explains how clients discover public PIC-X endpoints, supported grant and token types, PCA capabilities, signing algorithms, executor attestation services, Trusted Anchors, and the protocol metadata required to integrate with a PIC-X deployment."
tags = ["pic", "pic-x", "well-known", "discovery", "configuration", "metadata", "oauth", "token exchange", "pca", "security", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-well-known-config.png" alt="Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration." loading="lazy">
  <figcaption>Designing PIC-X. Exposing Configuration through .well-known/pic-x-configuration.</figcaption>
</figure>

When PIC-X starts, it exposes its public configuration at:

```text
http://127.0.0.1:5556/pic-x/.well-known/pic-x-configuration
```

The document exposes public endpoints and supported protocol capabilities. Internal Exchange Profiles are not exposed.

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
    "urn:ietf:params:oauth:token-type:jwt",
    "https://pic-protocol.org/0.1/token-types/pca-envelope"
  ],

  "issued_token_types_supported": [
    "https://pic-protocol.org/0.1/token-types/pca-envelope"
  ],

  "token_endpoint_auth_methods_supported": [
    "none"
  ],

  "pca": {
    "signing_alg_values_supported": [
      "ES256"
    ],
    "lineage_modes_supported": [
      "centralized",
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

## 2. Token, Revocation, and Keys

```json
{
  "token_endpoint": "http://127.0.0.1:5556/pic-x/token",
  "revocation_endpoint": "http://127.0.0.1:5556/pic-x/revoke",
  "jwks_uri": "http://127.0.0.1:5556/pic-x/keys"
}
```

```text
token_endpoint
→ exchanges a supported subject token for a PCA envelope

revocation_endpoint
→ requests revocation

jwks_uri
→ publishes PIC-X verification keys
```

## 3. Attestation and Trust Anchors

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
  "issuers": [
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
      "formats_supported": [
        "jws"
      ],
      "signing_alg_values_supported": [
        "ES256"
      ]
    },
    {
      "type": "guardrail",
      "issuer": "https://guardrail-backup.example.net",
      "jwks_uri": "https://guardrail-backup.example.net/keys",
      "formats_supported": [
        "jws"
      ],
      "signing_alg_values_supported": [
        "RS256"
      ]
    }
  ]
}
```

## 4. Grant and Token Types

```json
{
  "grant_types_supported": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "subject_token_types_supported": [
    "urn:ietf:params:oauth:token-type:jwt",
    "https://pic-protocol.org/0.1/token-types/pca-envelope"
  ],
  "issued_token_types_supported": [
    "https://pic-protocol.org/0.1/token-types/pca-envelope"
  ],
  "token_endpoint_auth_methods_supported": [
    "none"
  ]
}
```

PIC-X accepts either a JWT or an existing PCA envelope.

PIC-X issues a PCA envelope.

## 5. PCA Signing and Lineage Modes

```json
{
  "pca": {
    "signing_alg_values_supported": [
      "ES256"
    ],
    "lineage_modes_supported": [
      "centralized",
      "snapshot-based-subchain"
    ]
  }
}
```

```text
centralized
→ the lineage is managed by the PIC-X server

snapshot-based-subchain
→ local nodes extend the subchain
→ snapshots must be produced within a configured maximum interval
→ shorter intervals are allowed
→ the maximum interval limits the exposure to colluding compromised nodes
```
