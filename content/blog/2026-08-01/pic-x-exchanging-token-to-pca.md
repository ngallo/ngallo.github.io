+++
author = "Nicola Gallo"
title = "Designing PIC-X: Exchanging an OAuth Access Token for an Initial PCA"
date = "2026-08-01T10:00:00+02:00"
description = "This article defines the first PIC-X exchange flow: deriving an initial PIC Context of Authority (PCA) from a validated OAuth access token through an Exchange Profile."
tags = ["pic", "pic-x", "oauth", "token exchange", "exchange profile", "configuration", "security", "authorization", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-exchanging-token-to-pca.png" alt="Designing PIC-X: Exchanging an OAuth Access Token for an Initial PCA." loading="lazy">
  <figcaption>Designing PIC-X. Exchanging an OAuth Access Token for an Initial PCA.</figcaption>
</figure>

PIC-X can use a validated OAuth access token as the authority source for a new PIC lineage.

```text
OAuth access token
        │
        ▼
Exchange Profile
├── token validation
├── claim normalization
├── scope parsing
└── PCA0 construction
        │
        ▼
Initial PIC lineage
```

## Developer Experience

Using PIC-X requires only two exchange operations.

Create the initial PCA from an OAuth access token:

```text
pcaInitial = picX.exchange(
    accessToken,
    executionContract
)
```

Use the PCA during application authorization:

```text
decision = applicationPdp.evaluate(...)

pcaNext = picX.exchange(
    pcaInitial,
    proofOfRequest
)
```

At a glance:

```text
OAuth access token
        │
        ▼
picX.exchange(accessToken, executionContract)
        │
        ▼
PCA initial
        │
        ├── application PDP evaluation
        │
        ▼
picX.exchange(pca, proofOfRequest)
        │
        ▼
PCA next
```


The application developer does not need to implement token validation, scope parsing, PCA construction, invariant selection, or lineage verification.

> **Warning:** The following example uses an application PDP through AuthZEN. It must not be confused with PIC Trusted Anchors such as Guardrail. Trusted Anchors are protocol-level trust policy engines: they evaluate granted scopes, verify signatures, and enforce non-repudiation and other PIC trust rules. They are part of the PIC protocol flow, not the application authorization flow shown here. Trusted Anchors and Guardrail will be described in a separate article.


The remaining sections explain how PIC-X performs the first exchange.

## 1. Incoming OAuth Access Token

This example uses a signed JWT access token.

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

    "name": "Oliver Bennett",
    "email": "oliver.bennett@example.com",
    "tenant_id": "tenant-a",

    "roles": [
      "document-manager"
    ],

    "groups": [
      "document-management",
      "eu-employees"
    ],

    "scope": "documents:read documents:write documents:read:document-42"
  }
}
```

PIC-X validates the token before using any claim.

```text
signature
issuer
audience
expiration
allowed algorithm
trusted verification key
```

## 2. Exchange Profile

The Exchange Profile defines how scopes are converted into PIC privileges.

Two scope forms are accepted:

```text
<resource-type>:<operation>
<resource-type>:<operation>:<resource-id>
```

Examples:

```text
documents:read
documents:write
documents:read:document-42
```

Configuration:

```yaml
exchangeProfile:
  id: corporate-oauth-to-pic

  source:
    tokenType: oauth-access-token
    format: jwt
    issuer: https://idp.example.com
    audience: pic-x

    validation:
      allowedAlgorithms:
        - ES256
      requireExpiration: true
      requireTokenType: at+jwt

  claims:
    principal:
      id:
        from: sub

      roles:
        from: roles
        type: set

      groups:
        from: groups
        type: set

    attributes:
      securityDomain:
        from: tenant_id

    scopes:
      from: scope
      encoding: space-delimited
      type: set

  privileges:
    source: scopes

    rules:
      - name: resource-instance
        pattern: '^(?<resourceType>[a-z][a-z0-9_-]*):(?<operation>[a-z][a-z0-9_-]*):(?<resourceId>[a-zA-Z0-9_-]+)$'

        emit:
          scope: '${rawScope}'
          operation: '${operation}'
          resourceType: '${resourceType}'
          resourceId: '${resourceId}'

      - name: resource-collection
        pattern: '^(?<resourceType>[a-z][a-z0-9_-]*):(?<operation>[a-z][a-z0-9_-]*)$'

        emit:
          scope: '${rawScope}'
          operation: '${operation}'
          resourceType: '${resourceType}'
          resourceId: '*'
  output:
    tokenType: pic-pca
    generation: initial

  onUnmatchedScope: reject
```

`rawScope` is the original scope string matched by the rule.

```text
rawScope = documents:write
```

The Exchange Profile validates and maps the access token. The execution contract is supplied separately as an input to `picX.exchange`.

## 3. Normalized Exchange Result

The Exchange Profile returns:

```json
{
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

  "privileges": [
    {
      "scope": "documents:read",
      "operation": "read",
      "resourceType": "documents",
      "resourceId": "*"
    },
    {
      "scope": "documents:write",
      "operation": "write",
      "resourceType": "documents",
      "resourceId": "*"
    },
    {
      "scope": "documents:read:document-42",
      "operation": "read",
      "resourceType": "documents",
      "resourceId": "document-42"
    }
  ]
}
```

> **Note:** `principal` is optional. A valid exchange result must contain `principal`, `privileges`, or both.

Each privilege is one atomic authority item:

```text
privilege = (scope, operation, resourceType, resourceId)
```

## 4. Initial PCA

```json
{
  "profile": "https://pic-protocol.org/0.1",
  "issuer": "pic-x:corporate-oauth",

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
        "scope": "documents:read",
        "operation": "read",
        "resourceType": "documents",
        "resourceId": "*"
      },
      {
        "scope": "documents:write",
        "operation": "write",
        "resourceType": "documents",
        "resourceId": "*"
      },
      {
        "scope": "documents:read:document-42",
        "operation": "read",
        "resourceType": "documents",
        "resourceId": "document-42"
      }
    ],

    "contract": {
      "executor": "document-service",
      "environments": [
        "production",
        "staging"
      ]
    }
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

> **Warning:** `principal` and `attributes` are optional. Either field may be omitted when the Exchange Profile does not produce it.

`execution.invariants` carries the authority that must be preserved or attenuated across the lineage.  
`execution.contract` carries execution-specific constraints.

## 5. Providing an Execution Contract

The execution contract is a mandatory input to the initial exchange:

```text
pcaInitial = picX.exchange(
    accessToken,
    executionContract
)
```

It is provided by the caller, not by the Exchange Profile.

Example input:

```json
{
  "executor": "document-service",
  "environments": [
    "production",
    "staging"
  ]
}
```

PIC-X places the supplied value in the initial PCA:

```json
{
  "execution": {
    "contract": {
      "executor": "document-service",
      "environments": [
        "production",
        "staging"
      ]
    }
  }
}
```

The contract must contain at least one attribute with a non-empty value.

Each attribute supports only one of these value types:

```text
non-empty string
non-empty array of non-empty strings
```

Valid examples:

```json
{
  "executor": "document-service"
}
```

```json
{
  "environments": [
    "production",
    "staging"
  ]
}
```

```json
{
  "executor": "document-service",
  "regions": [
    "eu-west-1",
    "eu-central-1"
  ]
}
```

Invalid examples:

```json
{}
```

```json
{
  "executor": ""
}
```

```json
{
  "environments": []
}
```

```json
{
  "retryCount": 3,
  "enabled": true,
  "limits": {
    "cpu": "2"
  }
}
```

Numbers, booleans, objects, null values, empty strings, empty arrays, and arrays containing empty or non-string values are not supported.

> **Warning:** `execution.contract` does not replace `principal`, `attributes`, or `execution.invariants`. It adds execution constraints to the authority already carried by the PCA.

## 6. Selecting Authority by Scope

The application declares the scope required for the operation:

```text
requiredScope = "documents:write"
```

PIC treats principal and privilege selection as black boxes:

```text
principal = selectPrincipal(pca)

privilege = selectInvariantByScope(
    pca,
    "documents:write"
)
```

Selected principal:

```json
{
  "id": "user-123",
  "roles": [
    "document-manager"
  ],
  "groups": [
    "document-management",
    "eu-employees"
  ]
}
```

Selected privilege:

```json
{
  "scope": "documents:write",
  "operation": "write",
  "resourceType": "documents",
  "resourceId": "*"
}
```

The AuthZEN values are derived from the selected values:

```text
subject  = toAuthZenSubject(principal)
action   = selectOperation(privilege)
resource = selectResource(privilege)
```

Derived action:

```json
{
  "name": "write"
}
```

Derived resource:

```json
{
  "type": "documents",
  "id": "*"
}
```

## 7. Mapping to AuthZEN

Pseudocode:

```text
principal = selectPrincipal(pca)

privilege = selectInvariantByScope(
    pca,
    "documents:write"
)

subject = toAuthZenSubject(principal)
action = selectOperation(privilege)
resource = selectResource(privilege)

decision = pdp.authzen.evaluate(
    subject,
    action,
    resource,
    {
        scope: privilege.scope,
        securityDomain: pca.attributes.securityDomain
    }
)
```

AuthZEN request:

```http
POST /access/v1/evaluation HTTP/1.1
Host: pdp.example.com
Authorization: Bearer <pdp-client-token>
Content-Type: application/json
X-Request-ID: bfe9eb29-ab87-4ca3-be83-a1d5d8305716
```

```json
{
  "subject": {
    "type": "user",
    "id": "user-123",
    "properties": {
      "roles": [
        "document-manager"
      ],
      "groups": [
        "document-management",
        "eu-employees"
      ]
    }
  },

  "resource": {
    "type": "documents",
    "id": "*",
    "properties": {
      "securityDomain": "tenant-a"
    }
  },

  "action": {
    "name": "write"
  },

  "context": {
    "scope": "documents:write",
    "securityDomain": "tenant-a"
  }
}
```

The mapping is direct:

```text
principal.id           → subject.id
principal.roles        → subject.properties.roles
principal.groups       → subject.properties.groups
privilege.operation    → action.name
privilege.resourceType → resource.type
privilege.resourceId   → resource.id
privilege.scope        → context.scope
securityDomain         → context.securityDomain
```

## 8. Cedar Policy

The PDP receives a normal AuthZEN request.

Cedar evaluates the policy that matches the selected action and resource:

```cedar
permit (
    principal is User,
    action == Action::"write",
    resource is Document
)
when {
    context.scope == "documents:write" &&
    context.securityDomain == resource.securityDomain
};
```

A policy may also use principal attributes:

```cedar
permit (
    principal is User,
    action == Action::"write",
    resource is Document
)
when {
    context.scope == "documents:write" &&
    context.securityDomain == resource.securityDomain &&
    principal.roles.contains("document-manager")
};
```

For a resource-specific scope:

```text
requiredScope = "documents:read:document-42"
```

Selected privilege:

```json
{
  "scope": "documents:read:document-42",
  "operation": "read",
  "resourceType": "documents",
  "resourceId": "document-42"
}
```

AuthZEN values:

```json
{
  "action": {
    "name": "read"
  },
  "resource": {
    "type": "documents",
    "id": "document-42"
  },
  "context": {
    "scope": "documents:read:document-42",
    "securityDomain": "tenant-a"
  }
}
```

Cedar policy:

```cedar
permit (
    principal is User,
    action == Action::"read",
    resource == Document::"document-42"
)
when {
    context.scope == "documents:read:document-42"
};
```


## End-to-End Flow

```text
OAuth JWT + executionContract
│
        ▼
picX.exchange(accessToken, executionContract)
│
        ▼
Exchange Profile
├── parses each scope
└── emits:
    ├── scope
    ├── operation
    ├── resourceType
    └── resourceId
        │
        ▼
PCA0
├── optional principal
├── optional attributes
├── execution invariants
└── mandatory execution contract
        │
        ▼
Application
│
└── application authorization and picX.exchange(pca, proofOfRequest)
        │
        ▼
PIC-X
├── selectPrincipal(pca)
└── selectInvariantByScope(pca, requiredScope)
        │
        ▼
Selected invariant
├── operation
├── resourceType
└── resourceId
        │
        ▼
AuthZEN adapter
├── principal → subject
├── operation → action
├── resourceType → resource.type
├── resourceId → resource.id
└── scope → context.scope
        │
        ▼
Application PDP
└── evaluates application policy
```

## Core Rule

> The developer creates `PCA0` with `picX.exchange(accessToken, executionContract)`. The execution contract is a mandatory caller-supplied input, while the Exchange Profile validates and maps the access token. The lineage continues with `picX.exchange(pca, proofOfRequest)`.
