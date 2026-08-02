+++
author = "Nicola Gallo"
title = "Designing PIC-X: Deriving an Initial PIC Context of Authority"
date = "2026-08-01T10:00:00+02:00"
description = "This article defines the first PIC-X exchange flow: deriving an initial PIC Context of Authority (PCA) as plain JSON from a validated OAuth access token, then binding it into the first signed Continuity Transition."
tags = ["pic", "pic-x", "oauth", "token exchange", "exchange profile", "configuration", "security", "authorization", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/pic-x-exchanging-token-to-pca.png" alt="Designing PIC-X: Deriving an Initial PIC Context of Authority." loading="lazy">
  <figcaption>Designing PIC-X. Deriving an Initial PIC Context of Authority.</figcaption>
</figure>

PIC-X receives an OAuth access token, validates it, and derives the initial PIC Context of Authority, or PCA. The PCA is a plain JSON authority context. It is not signed independently. PIC-X then places it in the first signed Continuity Transition, from which authority continuity begins.

```text
OAuth access token
        |
        v
picX.exchange(accessToken, executionContract)
        |
        v
PCA 0
plain JSON PIC Context of Authority
        |
        v
signed Continuity Transition 0
        |
        v
PIC Continuity Token 0
        |
        +-- application PDP evaluation over current PCA
        |
        v
picX.exchange(continuityTokenN, proposedPcaNPlus1)
        |
        v
PIC Continuity Token N+1
```


The application developer does not need to implement token validation, scope parsing, PCA construction, Continuity Transition signing, invariant selection, or continuity verification.

> **Info:** The exchange can also be performed by an API gateway, service mesh, or another infrastructure component. In that model, PIC-X remains transparent to the application: the application receives the PIC Continuity Token and can read its current PCA without implementing the exchange flow.

> **Warning:** The following example uses an application PDP through [AuthZEN](https://openid.net/wg/authzen/specifications/). AuthZEN is an OpenID Foundation authorization interoperability specification that defines a standard API between a Policy Enforcement Point (PEP) and a Policy Decision Point (PDP). It must not be confused with PIC Trusted Anchors such as Guardrail. Trusted Anchors are protocol-level trust policy engines: they evaluate granted scopes, verify Continuity Transition signatures, and enforce non-repudiation and other PIC trust rules. They are part of the PIC protocol flow, not the application authorization flow shown here.


The remaining sections explain how PIC-X performs the first exchange.

The `exchange` operation will be exposed through a PIC-specific OAuth Token Exchange Profile. The profile will define how an OAuth access token is exchanged for the first PIC Continuity Token and will be developed in the next articles.

## PCA and Continuity Transition

A **PCA** is the **PIC Context of Authority**.

It is represented as a plain JSON object containing the authority and execution context derived for one continuity position.

```text
PCA
→ PIC Context of Authority
→ plain JSON
→ not signed independently
```

A **Continuity Transition** is the object that binds two continuity positions and is then serialized as the payload of a signed JWT:

```text
chained transition
+
previous PCA
+
current PCA
+
cryptographic continuity evidence
=
Continuity Transition payload
→ signed JWT
```

For initialization there is no previous transition and no previous PCA:

```text
Continuity Transition 0
├── chainedTransition: null
├── previousPca: null
├── currentPca: PCA 0
└── continuity: initial cryptographic continuity evidence
```

The cryptographic signature is applied to the Continuity Transition, not to the individual PCA.

A **PIC Continuity Token** carries one or more signed Continuity Transitions.

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

Below is the Exchange Profile configuration for a specific identity provider:

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

The Exchange Profile validates and maps the access token. The execution contract is supplied separately as an input to `picX.exchange`.

## 3. Normalized Exchange Result

For the sample token, the Exchange Profile produces the following normalized result:

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

Below is an example of PCA 0, the initial PIC Context of Authority. This object is plain JSON and has no independent signature:

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

> **Warning:** `principal` and `attributes` are optional. Either field may be omitted when the Exchange Profile does not produce it.

The PCA is not a JWT and is not signed by itself. Protocol metadata such as `profile` and signer identity such as `issuer` belong to the signed Continuity Transition, not to the PCA.

After constructing PCA 0, PIC-X creates the initial Continuity Transition:

```json
{
  "profile": "https://pic-protocol.org/0.2",
  "issuer": "https://pic-x.example.com",
  "chainedTransition": null,
  "previousPca": null,
  "currentPca": {
    "...": "PCA 0"
  },
  "continuity": {
    "...": "cryptographic continuity proofs"
  }
}
```

PIC-X serializes this Continuity Transition as the payload of a signed JWT.

```text
JWT header
→ identifies the signing algorithm and key

JWT payload
→ contains the Continuity Transition

JWT signature
→ protects the complete Continuity Transition
```

Conceptually:

```text
PCA 0
→ plain JSON authority context

Continuity Transition 0
→ contains chainedTransition, previousPca, currentPca, and continuity

signed JWT
→ cryptographically protects the complete Continuity Transition

PIC Continuity Token 0
→ the signed JWT returned by PIC-X
```

`chainedTransition` links the current transition to its predecessor. It is `null` for the initial transition.

`continuity` contains the cryptographic evidence used to establish authority continuity. The exact proof structure, validation algorithm, supported proof types, and decentralized continuity model are intentionally not defined in this article and will be covered in a dedicated protocol article.


`execution.invariants` carries the authority that must be preserved or attenuated across continuity.  
`execution.contract` carries execution-specific constraints.

## 5. Providing an Execution Contract

The execution contract is a mandatory input to the initialization exchange:

```text
continuityToken0 = picX.exchange(
    accessToken,
    executionContract
)
```

It is provided by the caller, not by the Exchange Profile.

Example input:

```json
{
  "corporation": "acme",
  "departments": [
    "engineering",
    "operations"
  ]
}
```

PIC-X places the supplied value in PCA 0 before constructing and signing Continuity Transition 0:

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
OAuth JWT + executionContract
        |
        v
picX.exchange(accessToken, executionContract)
        |
        v
Exchange Profile
+-- validates the OAuth token
+-- parses each scope
`-- emits normalized PIC authority
        |
        v
PCA 0
+-- plain JSON PIC Context of Authority
+-- optional principal
+-- optional attributes
+-- execution invariants
`-- mandatory execution contract
        |
        v
Continuity Transition 0
+-- previous PCA: null
+-- current PCA: PCA 0
`-- signed by PIC-X
        |
        v
PIC Continuity Token 0
        |
        v
Application
+-- reads the current PCA
+-- performs application authorization
`-- proposes PCA N+1 when continuity advances
        |
        v
picX.exchange(continuityTokenN, proposedPcaNPlus1)
        |
        v
PIC-X
+-- validates current continuity
+-- validates non-expansion of authority
+-- validates proposed PCA N+1
`-- signs Continuity Transition N+1
        |
        v
PIC Continuity Token N+1
```

## References

- [OpenID Foundation AuthZEN specifications](https://openid.net/wg/authzen/specifications/) — authorization interoperability specifications for communication between Policy Enforcement Points and Policy Decision Points.
