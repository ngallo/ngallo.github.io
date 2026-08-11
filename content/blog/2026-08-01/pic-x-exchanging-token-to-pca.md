+++
author = "Nicola Gallo"
title = "Designing PIC-X: Deriving an Initial PIC Context of Authority"
date = "2026-08-01T10:00:00+02:00"
description = "This article defines the initial continuity exchange flow of PIC-X. It explains how PIC-X validates an OAuth access token and the initial Continuity Proposal, derives the initial PIC Context of Authority (PCA), issues the initial PCA JWT, and returns the first PIC Continuity JWT. The article describes authority propagation, execution-contract enforcement, authority non-expansion, and the complete lifecycle of the initial exchange. The internal structure of the PIC Continuity JWT is intentionally deferred to a dedicated protocol article."
tags = ["pic", "pic-x", "authority continuity", "oauth", "token exchange", "exchange profile", "configuration", "security", "authorization", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-exchanging-token-to-pca.png" alt="Designing PIC-X: Deriving an Initial PIC Context of Authority." loading="lazy">
  <figcaption>Designing PIC-X. Deriving an Initial PIC Context of Authority.</figcaption>
</figure>

PIC-X receives an OAuth access token, validates it, and derives the initial PIC Context of Authority, or PCA. A PCA is the logical Context of Authority. Its signed representation is a PCA JWT. PIC-X then returns a PIC Continuity JWT that transports one Continuity Graph.

```text
OAuth access token
        |
        v
picX.exchange(accessToken, continuityProposal)
        |
        v
PCA JWT 0
signed PIC Context of Authority
        |
        v
Continuity Graph
→ starts from the root PCA JWT
→ carries numbered continuity transitions when continuity advances
        |
        v
PIC Continuity JWT 0
        |
        +-- application PDP evaluation over current PCA
        |
        v
picX.exchange(continuityJwtN, continuityProposal)
        |
        v
PIC Continuity JWT N+1
```


The application developer does not need to implement token validation, scope parsing, PCA construction, PCA JWT signing, invariant selection, or continuity verification.

> **Info:** The exchange can also be performed by an API gateway, service mesh, or another infrastructure component. In that model, PIC-X remains transparent to the application: the application receives the PIC Continuity JWT without implementing the exchange flow.

> **Warning:** The following example uses an application PDP through [AuthZEN](https://openid.net/wg/authzen/specifications/). AuthZEN is an OpenID Foundation authorization interoperability specification that defines a standard API between a Policy Enforcement Point (PEP) and a Policy Decision Point (PDP). It must not be confused with PIC Trusted Anchors such as Guardrail. Trusted Anchors are protocol-level trust policy engines: they evaluate granted scopes, verify PCA JWT and PIC Continuity JWT signatures, and enforce non-repudiation and other PIC trust rules. They are part of the PIC protocol flow, not the application authorization flow shown here.


The remaining sections explain how PIC-X performs the first exchange.

The `exchange` operation will be exposed through a PIC-specific OAuth Token Exchange Profile. The profile uses a `continuity_proposal` input for both initialization and continuation. The proposal type identifies which schema and validation rules apply; those schemas will be defined in a dedicated protocol article.

The value of `continuity_proposal` is produced by serializing the proposal as compact UTF-8 JSON and applying unpadded Base64url encoding. The exact proposal schemas and any future cryptographic protection applied to a proposal are outside the scope of this article.


## PCA and PIC Continuity JWT

A **PCA** is the logical **PIC Context of Authority**.

Its signed representation is a **PCA JWT**.

```text
PCA
→ logical PIC Context of Authority

PCA JWT
→ signed representation of one PCA
→ Content-Type: pic-pca+jwt
→ contains standard JWT claims
→ contains context_of_authority
→ carries the root challenge
```

A **PIC Continuity JWT** transports one Continuity Graph. Its internal structure is intentionally deferred to a dedicated protocol article.

```text
Continuity Graph
→ starts from root_authority_jwt
→ carries numbered continuity transitions when continuity advances
=
PIC Continuity JWT
→ Content-Type: pic-continuity+jwt
→ transports one Continuity Graph
```

For initialization, PIC-X issues the initial PCA JWT and returns the initial PIC Continuity JWT:

```text
PCA JWT 0
├── standard JWT claims
├── context_of_authority
└── challenge
    → initializes the first continuity transition

PIC Continuity JWT 0
├── transports one Continuity Graph
└── carries root_authority_jwt
```

The internal structure of the PIC Continuity JWT is intentionally deferred to a dedicated protocol article.

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

## 2. Exchange Profile

When PIC-X starts, it loads one or more Exchange Profiles. Each profile defines how tokens from a specific identity provider are validated and mapped into PIC authority. Multiple profiles may therefore coexist, allowing PIC-X to integrate with different IdPs while exposing a single PIC-X exchange interface.

An Exchange Profile defines how the scopes issued by its identity provider are converted into PIC privileges.

In this simple example, two scope formats are supported:

```text
<resource-type>:<operation>
<resource-type>:<operation>:<resource-id>
```

For example:

```text
documents:read
documents:write
documents:read:document-42
```

Below is an example Exchange Profile for a specific identity provider:

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
        priority: 10
        pattern: '^(?<resourceType>[a-z][a-z0-9_-]*):(?<operation>[a-z][a-z0-9_-]*):(?<resourceId>[a-zA-Z0-9_-]+)$'

        emit:
          scope: '${raw}'
          operation: '${operation}'
          resourceType: '${resourceType}'
          resourceId: '${resourceId}'

      - name: resource-collection
        priority: 1
        pattern: '^(?<resourceType>[a-z][a-z0-9_-]*):(?<operation>[a-z][a-z0-9_-]*)$'

        emit:
          scope: '${raw}'
          operation: '${operation}'
          resourceType: '${resourceType}'
          resourceId: '*'

  onUnmatchedScope: reject
```

`raw` is the original scope string matched by the rule.

Rules are evaluated from priority `10` to priority `1`.

```text
10 = highest priority
1  = lowest priority
```

A more specific rule must have a higher priority than a generic rule. Otherwise, the collection rule could consume a resource-specific scope before the instance rule evaluates it.

```text
documents:read:document-42
```

For this reason:

```text
resource-instance   → priority 10
resource-collection → priority 1
```

Rules with the same priority are evaluated in an unspecified order. Profiles should therefore avoid equal priorities when rules can match overlapping inputs.

```text
raw = documents:write
```

The Exchange Profile validates and maps the access token. The execution contract is supplied by the caller inside the initial Continuity Proposal, not by the Exchange Profile.

## 3. Mapped Exchange Result

For the sample token, the Exchange Profile produces the following mapped result:

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

## 4. Initial PCA (PIC Context of Authority)

Below is an example of the `context_of_authority` value for PCA 0. A PCA is the logical Context of Authority. Its signed representation is a PCA JWT:

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
      "corporation": "acme",
      "departments": [
        "engineering",
        "operations"
      ]
    }
  },

  "issuedAt": "2026-08-01T14:00:00Z"
}
```

The JSON shown above is the logical application-facing Context of Authority. When the PCA is serialized into a PCA JWT, the logical context is transformed into a Canonical Authority Map. PIC Profile 0.2 represents that canonical form as an Indexed Authority Map so that authority can be hashed deterministically, attenuated by key, and transported compactly.

> **Warning:** `principal` and `attributes` are optional. Either field may be omitted when the Exchange Profile does not produce it.

Protocol metadata such as `profile` and the standard JWT issuer claim `iss` belong to the signed PCA JWT and PIC Continuity JWT artifacts, not to the logical context alone.

After constructing PCA 0, PIC-X issues the initial PCA JWT:

```text
PCA JWT 0
├── standard JWT claims
├── context_of_authority: PCA 0
└── challenge
    → initializes the first continuity transition
```

The PCA JWT signs the root authority state and carries the root challenge used to initialize the first continuity transition.

PIC-X then returns the initial PIC Continuity JWT, which transports one Continuity Graph.

```text
JWT header
→ identifies the signing algorithm and key

JWT payload
→ transports one Continuity Graph

JWT signature
→ protects the PIC Continuity JWT
```

Conceptually:

```text
PCA 0
→ logical Context of Authority

PCA JWT 0
→ signed representation of PCA 0
→ carries the root challenge

PIC Continuity JWT 0
→ transports one Continuity Graph
→ carries root_authority_jwt
→ returned by PIC-X
```

The internal structure of the PIC Continuity JWT is intentionally deferred to a dedicated protocol article.

A **Continuity Proposal** is the structured input submitted to PIC-X when continuity is initialized or advanced. The initial proposal and continuation proposal use different type identifiers and may have different schemas:

```text
https://pic-protocol.org/definitions/proposal-types/continuity-initial
https://pic-protocol.org/definitions/proposal-types/continuity
```

In this article, the initial proposal contains the execution contract. Continuation proposal details are intentionally deferred to a dedicated protocol article.


`execution.invariants` carries the authority that must be preserved or attenuated across continuity.  
`execution.contract` carries execution-specific constraints.

## 5. Providing the Initial Continuity Proposal

The initialization exchange uses a `continuity_proposal` whose type is:

```text
https://pic-protocol.org/definitions/proposal-types/continuity-initial
```

The initial proposal contains the execution contract and may contain additional initialization material when defined by the selected PIC profile. Its complete schema is intentionally deferred to a dedicated protocol article.

```text
continuityJwt0 = picX.exchange(
    accessToken,
    continuityProposal
)
```

For the flow described here, the proposal contains only the execution contract. It is provided by the caller, not by the Exchange Profile.

Example proposal before Base64url encoding:

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

PIC-X extracts the validated `executionContract` from the initial continuity proposal and places it in the `context_of_authority` of the initial PCA JWT before returning the initial PIC Continuity JWT:

```json
{
  "execution": {
    "contract": {
      "corporation": "acme",
      "departments": [
        "engineering",
        "operations"
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
  "corporation": "acme"
}
```

```json
{
  "departments": [
    "engineering",
    "operations"
  ]
}
```

```json
{
  "corporation": "acme",
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
  "corporation": ""
}
```

```json
{
  "departments": []
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

A developer might use code as simple as the following:

```text
principal = selectPrincipal(currentPca)

privilege = selectInvariantByScope(
    currentPca,
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

The [AuthZEN](https://openid.net/wg/authzen/specifications/) request values are derived from the selected PCA values:

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

## 7. Mapping a PCA to [AuthZEN](https://openid.net/wg/authzen/specifications/)

[AuthZEN](https://openid.net/wg/authzen/specifications/) is an OpenID Foundation specification for authorization interoperability. It standardizes how a Policy Enforcement Point asks a Policy Decision Point for an authorization decision, without requiring either component to know the other's internal policy language or implementation.

In this article, PIC supplies the current authority context, while AuthZEN is used only as the application-facing request and response interface to the PDP.


Once the authority has selected the privilege, the application can invoke the PDP interface:

```text
principal = selectPrincipal(currentPca)

privilege = selectInvariantByScope(
    currentPca,
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
        securityDomain: currentPca.attributes.securityDomain
    }
)
```

Here is a sample [AuthZEN](https://openid.net/wg/authzen/specifications/) authorization request:

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

> **Info:** PIC does not depend on [AuthZEN](https://openid.net/wg/authzen/specifications/). AuthZEN is used here only as one possible standardized interface between the application Policy Enforcement Point and its Policy Decision Point.

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

## 8. Evaluating PCA-Derived Authorization with Cedar

The PDP receives a standard [AuthZEN](https://openid.net/wg/authzen/specifications/) authorization request.

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

The application may require access to a specific resource:

```text
requiredScope = "documents:read:document-42"
```

The corresponding execution invariant is selected:

```json
{
  "scope": "documents:read:document-42",
  "operation": "read",
  "resourceType": "documents",
  "resourceId": "document-42"
}
```

The application PDP can evaluate a policy for that specific resource:

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

Here a sample Cedar policy:

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

## PCA-Derived Authorization: End-to-End Flow

```text
OAuth JWT + initial continuity proposal
        |
        v
picX.exchange(accessToken, continuityProposal)
        |
        v
Exchange Profile
+-- validates the OAuth token
+-- parses each scope
`-- emits logical PIC authority
        |
        v
PCA 0
+-- logical PIC Context of Authority
+-- optional principal
+-- optional attributes
+-- execution invariants
`-- execution contract from the initial continuity proposal
        |
        v
PCA JWT 0
+-- context_of_authority: PCA 0
`-- root challenge
        |
        v
PIC Continuity JWT 0
+-- transports one Continuity Graph
`-- carries root_authority_jwt
        |
        v
Application
+-- uses the current PCA
+-- performs application authorization
`-- creates a continuity proposal when continuity advances
        |
        v
picX.exchange(continuityJwtN, continuityProposal)
        |
        v
PIC-X
+-- validates the current PIC Continuity JWT
+-- validates non-expansion of authority
+-- validates the continuity proposal
+-- validates the continuity transition
+-- issues Continuity Transition JWT N+1
`-- returns PIC Continuity JWT N+1
        |
        v
PIC Continuity JWT N+1
```

> **Note:** A PCA has no mandatory independent expiration. Any expiration policy is profile-defined. A PCA JWT is usable only as part of a valid PIC Continuity JWT and remains subject to revocation, continuity rules, execution-contract constraints, local policy, and any declared token or profile expiration.

## References

### External References

- [RFC 8693 — OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)
- [RFC 9068 — JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [OpenID Foundation AuthZEN specifications](https://openid.net/wg/authzen/specifications/)
- [PIC Protocol](https://www.pic-protocol.org/)
- [PIC Prover and Verifier Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html)

### PIC-X Series

- [Designing PIC-X: From Specification to Architecture to Code](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration](/blog/2026-08-01/pic-x-well-known-config/)
- [Designing PIC-X: PCA JWT, PIC Continuity JWT, and the Continuity Graph](/blog/2026-08-11/pic-x-jwts-authority-graph/)
