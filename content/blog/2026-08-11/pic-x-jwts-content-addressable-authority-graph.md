+++
author = "Nicola Gallo"
title = "Designing PIC-X: PCA JWT, PIC Continuity JWT, and the Content-Addressable Authority Graph"
date = "2026-08-11T09:00:00+02:00"
description = "This article introduces the two JWT artifacts defined by PIC, the Content-Addressable Authority Graph, and the canonical structures used to represent verifiable authority continuity."
tags = [
  "pic",
  "pic-x",
  "jwt",
  "authority graph",
  "content-addressable",
  "continuity",
  "oauth",
  "security",
  "design"
]
+++

<figure class="post-banner">
  <img src="/images/2026-08-11/pic-x-jwts-content-addressable-authority-graph.png"
       alt="Designing PIC-X: PCA JWT, PIC Continuity JWT, and the Content-Addressable Authority Graph."
       loading="lazy">
  <figcaption>Designing PIC-X. PCA JWT, PIC Continuity JWT, and the Content-Addressable Authority Graph.</figcaption>
</figure>

The previous articles introduced the exchange flow, discovery metadata, and the protocol concepts required to initialize and continue PIC executions.

For context, see [Designing PIC-X: From Specification to Architecture to Code](/blog/2026-08-01/pic-x-from-spec-to-arch/), [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/), and [Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration](/blog/2026-08-01/pic-x-well-known-config/).

The active PIC profile is:

```text
https://pic-protocol.org/profiles/0.2
```

This article defines the canonical JSON/JWT representation for that profile.

```text
OAuth Access Token
        │
        ▼
PCA JWT
        │
        ▼
Authority Graph
        │
        ▼
PIC Continuity JWT
```

The protocol intentionally separates the representation of authority from the representation of authority continuity.

A **PCA** is the logical Context of Authority.

A **PCA JWT** is the signed representation of one PCA.

A **PIC Continuity JWT** transports one Authority Graph.

An **Authority Graph** is a content-addressable graph linking PCA JWTs and representing verifiable authority continuity.

## Content-Addressable Authority Graph

The protocol defines the logical graph, not a single storage model.

```text
authority_graph
├── chain
└── content_store
```

```text
chain
→ ordered graph lineage

content_store
→ optional embedded objects
```

Different continuity modes may transport:

- embedded objects
- referenced objects
- a mixture of both

without changing protocol semantics.

## PIC Artifact Registry

PIC currently defines two JWT artifacts and two Continuity Proposal type identifiers used by the PIC Token Exchange Profile.

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

This registry maps the identifiers advertised by `.well-known/pic-x-configuration` to the protocol artifacts defined in this article.

| Artifact | Definition URI | Media Type | JOSE typ | Purpose |
| --- | --- | --- | --- | --- |
| PCA JWT | None | `application/pic-pca+jwt` | `pic-pca+jwt` | Signed representation of one PCA. |
| PIC Continuity JWT | `https://pic-protocol.org/definitions/token-types/continuity` | `application/pic-continuity+jwt` | `pic-continuity+jwt` | Transports one Authority Graph. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Supplies initialization material, including the execution contract. |
| Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity` | `application/json` | `N_A` | Supplies continuation material. |

The proposal JSON is transported through the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url.

## PCA JWT

Definition URI

```text
None
```

The current protocol does not define a Definition URI for PCA JWT. PCA JWT is currently identified by Media Type and JOSE typ.

Media Type

```text
application/pic-pca+jwt
```

JOSE typ

```text
pic-pca+jwt
```

Purpose

```text
signed representation of one PCA
```

JWT Header

```json
{
  "typ": "pic-pca+jwt",
  "alg": "ES256",
  "kid": "pic-x-es256-2026-08"
}
```

Conceptual payload

```text
iss
profile
sub
iat
jti

context_of_authority
proof_of_relationship
```

Complete JWT example, decoded for readability

```json
{
  "header": {
    "typ": "pic-pca+jwt",
    "alg": "ES256",
    "kid": "pic-x-es256-2026-08"
  },
  "payload": {
    "iss": "http://127.0.0.1:5556/pic-x",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "sub": "user-123",
    "iat": 1785589400,
    "jti": "urn:uuid:3a5e4d7e-52fb-4a32-8c2b-9fb5dca8d7a1",

    "context_of_authority": {
      "principal": {
        "id": "user-123",
        "roles": [
          "document-manager"
        ],
        "groups": [
          "document-management",
          "eu-employees"
        ]
      },

      "attributes": {
        "securityDomain": "tenant-a"
      },

      "execution": {
        "invariants": [
          {
            "scope": "documents:write",
            "operation": "write",
            "resourceType": "documents",
            "resourceId": "*"
          }
        ],

        "contract": {
          "corporation": "acme",
          "departments": [
            "engineering",
            "operations"
          ]
        }
      }
    },

    "proof_of_relationship": "profile-defined-proof"
  },
  "signature": "base64url-signature"
}
```

The PCA JWT is the signed representation of one PCA.

The proof_of_relationship belongs to the PCA JWT.

| Claim | Purpose |
| --- | --- |
| `iss` | Identifies the PIC-X issuer. |
| `profile` | Identifies the active PIC profile. |
| `sub` | Identifies the subject of the authority state when a subject is present. |
| `iat` | Records when the PCA JWT was issued. |
| `jti` | Identifies this PCA JWT for correlation, audit, lineage, and revocation. |
| `context_of_authority` | Contains the logical PCA: principal, attributes, execution invariants, and execution contract. |
| `proof_of_relationship` | Binds one execution step to its causal predecessor. |

## Proof of Relationship

Proof of Relationship binds one execution step to its causal predecessor.

## PIC Continuity JWT

Definition URI

```text
https://pic-protocol.org/definitions/token-types/continuity
```

Media Type

```text
application/pic-continuity+jwt
```

JOSE typ

```text
pic-continuity+jwt
```

Purpose

```text
transports one Authority Graph
```

JWT Header

```json
{
  "typ": "pic-continuity+jwt",
  "alg": "ES256",
  "kid": "pic-x-es256-2026-08"
}
```

Conceptual payload

```text
iss
profile
iat
jti

authority_graph
```

Complete JWT example, decoded for readability

```json
{
  "header": {
    "typ": "pic-continuity+jwt",
    "alg": "ES256",
    "kid": "pic-x-es256-2026-08"
  },
  "payload": {
    "iss": "http://127.0.0.1:5556/pic-x",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "iat": 1785589405,
    "jti": "urn:uuid:4f8d5a11-0b83-4497-8a5d-32d7db5e32c1",

    "authority_graph": {
      "chain": [
        "sha256:6e6b4c4d70f2f0d5b833b3b7f3cf1dd8d61f4a8e79f23d0b2c6d61f7bb67e71c"
      ],

      "content_store": {
        "sha256:6e6b4c4d70f2f0d5b833b3b7f3cf1dd8d61f4a8e79f23d0b2c6d61f7bb67e71c": "eyJ0eXAiOiJwaWMtcGNhK2p3dCIsImFsZyI6IkVTMjU2Iiwia2lkIjoicGljLXgtZXMyNTYtMjAyNi0wOCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU1NTYvcGljLXgiLCJzdWIiOiJ1c2VyLTEyMyJ9.base64url-signature"
      }
    }
  },
  "signature": "base64url-signature"
}
```

The PIC Continuity JWT transports one Authority Graph.

| Field | Purpose |
| --- | --- |
| `iss` | Identifies the PIC-X issuer. |
| `profile` | Identifies the active PIC profile. |
| `iat` | Records when the PIC Continuity JWT was issued. |
| `jti` | Identifies this PIC Continuity JWT for correlation, audit, lineage, and revocation. |
| `authority_graph` | Contains the Content-Addressable Authority Graph. |

## Authority Graph

The Authority Graph is the content-addressable graph linking PCA JWTs and representing verifiable authority continuity.

```text
authority_graph
├── chain
└── content_store
```

```text
chain
→ ordered graph lineage

content_store
→ optional embedded objects
```

The Authority Graph may include embedded objects, referenced objects, or both.

## Relationship between Artifacts

```text
PCA JWT
        │
        ▼
Authority Graph
        │
        ▼
PIC Continuity JWT
```

```text
PCA JWT
→ signed representation of one PCA

Authority Graph
→ represents verifiable authority continuity
→ links PCA JWTs

PIC Continuity JWT
→ transports one Authority Graph
```

## References

- [RFC 7519 — JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 9068 — JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [PIC Protocol](https://www.pic-protocol.org/)
- [PIC Prover and Verifier Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html)
- [Designing PIC-X: From Specification to Architecture to Code](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/)
- [Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration](/blog/2026-08-01/pic-x-well-known-config/)
