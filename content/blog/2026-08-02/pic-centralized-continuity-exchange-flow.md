+++
author = "Nicola Gallo"
title = "Designing PIC-X: Centralized Continuity Exchange Flow"
date = "2026-08-02T23:15:00+02:00"
description = "This article describes how authority advances from one executor to the next in the centralized continuity exchange flow of PIC-X. Starting from the initial PIC Context of Authority (PCA), it shows how an executor proves it satisfies the execution contract by presenting an attestation, how SD-JWT allows it to disclose only the required contract attributes, and how PIC-X derives the next PCA, constructs the next Continuity Transition, and issues the next PIC Continuity Token."
tags = ["pic", "pic-x", "authority continuity", "oauth", "token exchange", "centralized continuity", "exchange profile", "configuration", "security", "authorization", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-02/pic-centralized-continuity-exchange-flow.png" alt="Designing PIC-X: Centralized Continuity Exchange Flow." loading="lazy">
  <figcaption>Designing PIC-X. Centralized Continuity Exchange Flow.</figcaption>
</figure>

PIC-X supports two types of continuity exchange: centralized and decentralized. In the centralized model, every continuity step passes through PIC-X. In the decentralized model, continuity travels between participants for a number of steps and only later returns to the central server.

This article describes the centralized continuity exchange flow. To do so, it builds on the example introduced in [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/).

We start from the initial PCA, or PCA 0, derived in that article. It is the input to the first continuity exchange described here.

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

Executor n receives PCA 0 from its caller, executor n-1, which in this example is the client. Executor n now needs the PCA for the next participant in the chain, executor n+1.

Executor n cannot simply forward its authority. It must first prove that it is a legitimate step in the execution, and it does so by presenting attributes that satisfy the execution contract carried by the PCA. In this example, executor n holds an attestation issued by a trusted attestation issuer, and that attestation carries exactly the attributes the contract requires.

```json
{
  "header": {
    "alg": "ES256",
    "kid": "attestation-key-1",
    "typ": "JWT"
  },
  "payload": {
    "iss": "https://attestation-issuer.example.com",
    "sub": "executor-n",
    "iat": 1785589400,
    "exp": 1785592000,

    "corporation": "acme",
    "departments": [
      "engineering",
      "operations",
      "eu-office"
    ]
  }
}
```

Note that executor n belongs to three departments, while the contract requires only `engineering` and `operations`. Presenting this attestation as it is would also reveal `eu-office`, which the contract never asked for.

The attestation above discloses every attribute to every verifier. That is more than a continuity step needs. The same attestation can instead be issued as an SD-JWT, where each contract attribute is selectively disclosable. SD-JWT supports this at two granularities, and this example uses both:

```text
object property   corporation, departments  -> digest listed in "_sd"
array element     engineering, operations,  -> digest replaces the element
                  eu-office                    inside the array
```

The two compose. `departments` is hidden as a whole, and the value it hides is itself an array of digests rather than an array of strings. Individual departments therefore remain disclosable one by one, which is what lets executor n reveal `engineering` and `operations` while keeping `eu-office` hidden.

The issuer-signed payload carries only digests, and nothing distinguishes the one that hides a string from the one that hides an array:

```json
{
  "header": {
    "alg": "ES256",
    "kid": "attestation-key-1",
    "typ": "dc+sd-jwt"
  },
  "payload": {
    "iss": "https://attestation-issuer.example.com",
    "sub": "executor-n",
    "iat": 1785589400,
    "exp": 1785592000,

    "_sd_alg": "sha-256",
    "_sd": [
      "4UUISYvSZEEDFven-eLHZe9H0L4Ek16zRJ5Xn85JDL0",
      "l5bQUYsXhFDHxlmAXd48a2mQwfu0gtAc1pqFGA3b5BU"
    ],

    "cnf": {
      "jwk": {
        "kty": "EC",
        "crv": "P-256",
        "kid": "executor-n-key-1",
        "x": "iSHUqB4Xk1cCzMx0aVQnkD_qGaz6EGnO2Kk3JZmVv_A",
        "y": "Yb3XCn7hZ1dQ9WMEkGdd4rBmSJlbA6IaOaJhqU7NKzQ"
      }
    }
  }
}
```

Every digest is the SHA-256 of a disclosure, and every disclosure is the Base64url encoding of a JSON array. The two granularities differ only in the shape of that array. An object property is disclosed as salt, claim name, and claim value:

```text
["_26bc4LT-ac6q2KI6cBW5es", "corporation", "acme"]
→ WyJfMjZiYzRMVC1hYzZxMktJNmNCVzVlcyIsICJjb3Jwb3JhdGlvbiIsICJhY21lIl0
→ 4UUISYvSZEEDFven-eLHZe9H0L4Ek16zRJ5Xn85JDL0
```

An array element has no claim name of its own, so it is disclosed as salt and value only:

```text
["lklxF5jMYlGTPUovMNIvCA", "engineering"]
→ WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImVuZ2luZWVyaW5nIl0
→ YFPZ85iZVleyLWdouj42qikYwzFCzYeCnKEYImQMbyE

["nPuoQnkRFq3BIeAm7AnXFA", "operations"]
→ WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIm9wZXJhdGlvbnMiXQ
→ hrHX176ilHXN5JyrTjDIJ0s8hy3ydRhGmZIPdMVh3Ts

["5bPs1IquZNa0hkaFzzzZNw", "eu-office"]
→ WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImV1LW9mZmljZSJd
→ H4B2YsC2vlyZeX147PXMrASmfsszekvU45i_QZ-a9Rs
```

The disclosure for `departments` is an object property like `corporation`, but its value is the array of element digests computed above. It is what makes the two granularities nest:

```text
["2GLC42sKQveCfGfryNRN9w", "departments", [
  { "...": "YFPZ85iZVleyLWdouj42qikYwzFCzYeCnKEYImQMbyE" },
  { "...": "hrHX176ilHXN5JyrTjDIJ0s8hy3ydRhGmZIPdMVh3Ts" },
  { "...": "H4B2YsC2vlyZeX147PXMrASmfsszekvU45i_QZ-a9Rs" }
]]
→ l5bQUYsXhFDHxlmAXd48a2mQwfu0gtAc1pqFGA3b5BU
```

Disclosure is therefore ordered. A verifier that receives the `engineering` disclosure but not the `departments` one has nothing to attach it to, and must ignore it.

Executor n presents the issuer-signed JWT followed by only the disclosures it chooses to reveal, and a key binding JWT signed with the key confirmed in `cnf`. The compact serialization is a single line, wrapped here for readability:

```text
<issuer-signed-jwt>
  ~<disclosure corporation>
  ~<disclosure departments>
  ~WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImVuZ2luZWVyaW5nIl0
  ~WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIm9wZXJhdGlvbnMiXQ
  ~<key-binding-jwt>
```

The disclosure for `eu-office` is simply not sent. Its digest is still there, inside the disclosed value of `departments`, so the verifier learns that a third department exists but never learns which one. No digest was removed anywhere, so the issuer signature over the payload remains valid. The reconstructed claim set is therefore:

```json
{
  "corporation": "acme",
  "departments": [
    "engineering",
    "operations"
  ]
}
```

which matches `execution.contract` in PCA 0 exactly.

> **Note:** In-place array digests hide values, not cardinality. A verifier can see that `departments` holds three entries even when only two are disclosed. When the number of undisclosed entries is itself sensitive, the array must be made selectively disclosable as a whole, so that `departments` appears in `_sd` instead of in the payload.
