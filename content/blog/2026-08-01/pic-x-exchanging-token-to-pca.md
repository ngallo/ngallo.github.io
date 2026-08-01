+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exchanging an OAuth Access Token for an Initial PCA"
date = "2026-08-01T10:00:00+02:00"
description = "This article defines the first PIC-X exchange flow: converting an OAuth access token into an initial PIC Context of Authority (PCA). It explains how to configure an OAuth provider connector and map token claims, scopes, audiences, and resources into the authority context and execution constraints carried by the resulting PCA."
tags = ["pic", "pic-x", "token exchange", "configuration", "security", "authorization", "ai", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-exchanging-token-to-pca.png" alt="Designing PIC-X: Exchanging an OAuth Access Token for an Initial PCA." loading="lazy">
  <figcaption>Designing PIC-X. Exchanging an OAuth Access Token for an Initial PCA.</figcaption>
</figure>

PIC-X can use a validated OAuth access token as the origin of a new PIC lineage.

The OAuth token is not copied directly into the PCA. It is first validated, then its claims are interpreted through a provider-specific mapping configuration.

## 1. Incoming OAuth Access Token

A JWT is transmitted using the compact form:

```text
<header>.<payload>.<signature>
```

Example:

```text
eyJhbGciOiJFUzI1NiIsImtpZCI6ImlkcC1rZXktMSIsInR5cCI6ImF0K2p3dCJ9.
eyJpc3MiOiJodHRwczovL2lkcC5leGFtcGxlLmNvbSIsInN1YiI6InVzZXItMTIzIiwiYXVkIjoicGljLXgiLCJleHAiOjE3ODU1OTAwMDAsImlhdCI6MTc4NTU4OTQwMCwibmFtZSI6Ik1hcmlvIFJvc3NpIiwiZW1haWwiOiJtYXJpb0BleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtYSIsImVtcGxveW1lbnRfdHlwZSI6ImVtcGxveWVlIiwiZ3JvdXBzIjpbImVuZ2luZWVyaW5nIiwic2FsYXJpZWQiXSwicm9sZXMiOlsib3JkZXItY3JlYXRvciIsImludm9pY2UtcmVhZGVyIl0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgb3JkZXJzLnJlYWQgb3JkZXJzLmNyZWF0ZSBpbnZvaWNlcy5yZWFkIiwib3JnYW5pemF0aW9uIjoiRXhhbXBsZSBDb3JwIiwiZGVwYXJ0bWVudCI6IkVuZ2luZWVyaW5nIn0.
<SIGNATURE>
```

Decoded representation:

```json
{
  "header": {
    "alg": "ES256",
    "kid": "idp-key-1",
    "typ": "at+jwt"
  },
  "payload": {
    "iss": "https://idp.example.com",
    "sub": "user-123",
    "aud": "pic-x",
    "iat": 1785589400,
    "exp": 1785590000,
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "email_verified": true,
    "tenant_id": "tenant-a",
    "employment_type": "employee",
    "groups": ["engineering", "salaried"],
    "roles": ["order-creator", "invoice-reader"],
    "scope": "openid profile orders.read orders.create invoices.read",
    "organization": "Example Corp",
    "department": "Engineering"
  }
}
```

Before using any claim, PIC-X validates at least:

```text
signature
issuer
audience
expiration
allowed signing algorithm
key selected through kid
```

Decoding a JWT is not the same as validating it.

## 2. Provider Connector

Different identity providers can use different claim names and encodings:

```text
tenant_id or tenant
roles as an array or a space-delimited string
scope as a space-delimited string
groups in a provider-specific claim
```

PIC-X therefore uses a provider-specific connector.

The connector has two responsibilities:

```text
1. Validate the provider token.
2. Normalize the relevant claims.
```

Example normalized principal context:

```json
{
  "type": "human",
  "id": "user-123",
  "issuer": "https://idp.example.com",
  "displayName": "Mario Rossi",
  "attributes": {
    "email": "mario@example.com",
    "emailVerified": true,
    "tenant": "tenant-a",
    "employmentType": "employee",
    "organization": "Example Corp",
    "department": "Engineering"
  },
  "groups": ["engineering", "salaried"],
  "roles": ["order-creator", "invoice-reader"],
  "scopes": [
    "openid",
    "profile",
    "orders.read",
    "orders.create",
    "invoices.read"
  ],
  "trustSource": "corporate-idp",
  "attestationFormat": "oidc-jwt"
}
```

This object describes the authenticated principal.

It is not yet a PCA and it is not yet the PIC authority carried by the lineage.

## 3. Provider Mapping Configuration

Claims must not be copied blindly into a PCA.

The mapping configuration explicitly defines which PIC operations may be produced from validated claims.

```yaml
provider:
  id: corporate-idp
  issuer: https://idp.example.com
  audience: pic-x

claims:
  subject: sub
  tenant: tenant_id
  scopes:
    claim: scope
    encoding: space-delimited
  roles:
    claim: roles
    type: set
  groups:
    claim: groups
    type: set

mapping:
  securityDomain:
    from: tenant
  operations:
    - emit: orders.read
      when:
        scope: orders.read
    - emit: orders.create
      when:
        all:
          - scope: orders.create
          - role: order-creator
    - emit: invoices.read
      when:
        all:
          - scope: invoices.read
          - role: invoice-reader
```

The mapping means:

```text
orders.read
→ requires scope orders.read

orders.create
→ requires scope orders.create
  and role order-creator

invoices.read
→ requires scope invoices.read
  and role invoice-reader
```

Roles and groups are evidence used by the mapping policy. They do not automatically become PIC operations.

The audience identifies the authority context in which the token is valid. The tenant restricts the resulting authority to a specific security domain.

## 4. Mapping Rule

Let:

$$
\begin{aligned}
S &= \text{validated scopes} \\
R &= \text{validated roles} \\
G &= \text{validated groups} \\
M &= \text{configured mapping}
\end{aligned}
$$

The initial operation set is:

$$
O_0 = M(S, R, G)
$$

For example:

$$
\texttt{orders.create} \in O_0
$$

only when:

$$
\texttt{orders.create} \in S
\quad \text{and} \quad
\texttt{order-creator} \in R
$$

The mapping must not create authority that is unsupported by the validated OAuth input. Its semantic correctness is a deployment responsibility.

PIC then enforces continuity and non-expansion relative to the resulting initial authority state.

## 5. Initial PCA

For the example token, all configured conditions succeed.

PIC-X can derive the following PCA0:

```json
{
  "profile": "https://pic-protocol.org/0.1",
  "issuer": "pic-x:corporate-idp",
  "executor": {
    "type": "human",
    "id": "user-123"
  },
  "invariants": {
    "authority": {
      "audience": "pic-x",
      "securityDomain": "tenant-a",
      "operations": [
        "orders.read",
        "orders.create",
        "invoices.read"
      ]
    },
    "executionContract": {}
  },
  "continuation": {
    "challenge": "base64url-random-256-bit-value",
    "mode": "single-use",
    "expiresAt": "2026-08-01T14:15:00Z"
  },
  "issuedAt": "2026-08-01T14:00:00Z",
  "expiresAt": "2026-08-01T14:15:00Z"
}
```

The PCA contains the result of the mapping, not a copy of the OAuth token.

```text
Validated OAuth token
        │
        ├── scopes
        ├── roles
        ├── groups
        ├── audience
        └── tenant
                │
                ▼
        Provider connector
                │
                ▼
        Declared mapping
                │
                ▼
              PCA0
```

From PCA0 onward, each continuation may preserve or reduce authority, but it must not expand it:

$$
\texttt{operations}[n+1] \subseteq \texttt{operations}[n]
$$

Operation labels such as `orders.create` have meaning only inside their declared authority domain, audience, resource model, and application profile.

## 6. Policy Decision Point

The application receives:

```text
validated principal context
verified PCA authority
requested action
target resource
```

An adapter can construct the following Cedar authorization context:

```json
{
  "principal": {
    "type": "Pic::Human",
    "id": "user-123",
    "attributes": {
      "tenant": "tenant-a",
      "roles": ["order-creator", "invoice-reader"],
      "groups": ["engineering", "salaried"]
    },
    "pcaAuthority": {
      "operations": [
        "orders.read",
        "orders.create",
        "invoices.read"
      ],
      "securityDomain": "tenant-a"
    }
  },
  "action": {
    "type": "Pic::Action",
    "id": "CreateOrder"
  },
  "resource": {
    "type": "Pic::OrderAccount",
    "id": "account-42",
    "tenant": "tenant-a"
  }
}
```

Minimal Cedar policy:

```cedar
permit (
    principal is Pic::Human,
    action == Pic::Action::"CreateOrder",
    resource is Pic::OrderAccount
)
when {
    principal.pcaAuthority.operations.contains("orders.create") &&
    principal.pcaAuthority.securityDomain == resource.tenant
};
```

The decision requires both:

```text
the PCA authorizes orders.create
and
the PCA security domain matches the resource tenant
```

The PDP should not reinterpret the original JWT directly. It should evaluate the authority already validated and translated by PIC-X.

## End-to-End Flow

```text
OAuth JWT
│
├── identity
├── scopes
├── roles
├── groups
└── tenant
        │
        ▼
Provider connector
├── validates the token
└── normalizes claims
        │
        ▼
Provider mapping
├── scopes → candidate operations
├── roles/groups → mapping conditions
└── tenant → security domain
        │
        ▼
PCA0
├── initial authority
├── invariants
└── continuation challenge
        │
        ▼
Application PDP
└── authorizes the concrete request
```

## Core Rule

> The OAuth JWT provides external origin authority.  
> The provider connector validates it.  
> The mapping translates it.  
> PCA0 fixes the initial authority of the PIC lineage.  
> The application PDP decides whether that authority permits the concrete request.
