+++
author = "Nicola Gallo"
title = "Designing PIC-X: PCA JWT, PIC Continuity JWT, and Continuity Transition JWT"
date = "2026-08-11T09:00:00+02:00"
description = "This article defines the canonical JSON/JWT artifacts used by PIC Profile 0.2: PCA JWT, PIC Continuity JWT, and Continuity Transition JWT."
tags = [
  "pic",
  "pic-x",
  "jwt",
  "continuity",
  "oauth",
  "security",
  "design"
]
+++

<figure class="post-banner">
  <img src="/images/2026-08-11/pic-x-jwts-authority-graph.png"
       alt="Designing PIC-X: PCA JWT, PIC Continuity JWT, and Continuity Transition JWT."
       loading="lazy">
  <figcaption>Designing PIC-X. PCA JWT, PIC Continuity JWT, and Continuity Transition JWT.</figcaption>
</figure>

PIC Profile 0.2 defines centralized PIC-X-mediated continuity advancement.

The active PIC profile is:

```text
https://pic-protocol.org/profiles/0.2
```

This article defines the canonical JSON/JWT representation for that profile.

```text
trusted PIC Continuity JWT N
        |
        | workload proposes exactly one advancement
        v
workload-signed candidate PIC Continuity JWT
with one Continuity Transition JWT N+1
        |
        | OAuth Token Exchange / PIC-X exchange
        v
PIC-X validates the single proposed transition
        |
        v
PIC Continuity JWT N+1
issued by PIC-X
with no pending transition
```

A **PCA** is the logical Context of Authority.

A **PCA JWT** is the trusted signed root authority representation.

A **PIC Continuity JWT** is the signed continuity artifact. When issued by PIC-X, it is the trusted settled continuity artifact. When produced by a workload for advancement, it is a signed candidate containing exactly one proposed Continuity Transition JWT.

A **Continuity Transition JWT** is one signed proposed causal advancement from the currently trusted PIC Continuity JWT to the next state.

PIC Profile 0.2 defines only centralized PIC-X-mediated continuity advancement.

## PIC Artifact Registry

PIC currently defines three JWT artifacts and two Continuity Proposal type identifiers used by the PIC Token Exchange Profile.

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

This registry maps the identifiers advertised by `.well-known/pic-x-configuration` to the protocol artifacts defined in this article.

| Artifact | Definition URI | Media Type | JOSE typ | Purpose |
| --- | --- | --- | --- | --- |
| PCA JWT | None | `application/pic-pca+jwt` | `pic-pca+jwt` | Trusted signed root authority representation. |
| PIC Continuity JWT | `https://pic-protocol.org/definitions/token-types/continuity` | `application/pic-continuity+jwt` | `pic-continuity+jwt` | Trusted settled continuity artifact when issued by PIC-X; candidate exchange artifact when workload-signed. |
| Continuity Transition JWT | None | `application/pic-continuity-transition+jwt` | `pic-continuity-transition+jwt` | Signed artifact for one proposed continuity advancement. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Supplies initialization material, including the execution contract. |
| Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity` | `application/json` | `N_A` | Supplies centralized advancement support material when required by the selected profile/schema. |

When proposal JSON is transported to PIC-X, it uses the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url.

## JWT Serialization

PIC Profile 0.2 transports and embeds signed JWT artifacts using compact JWS serialization.

Unless a future profile explicitly defines another serialization, fields ending in `_jwt` carry the compact signed JWT string.

This applies to:

```text
root_pca_jwt
```

Artifact hashes over JWT values are computed over the UTF-8 bytes of the compact serialized JWT, not over the decoded JSON view.

For example:

```text
root_pca_jwt_hash = hash(compact root_pca_jwt)
```

When a transition artifact is hashed, the same rule applies:

```text
hash(compact continuity_transition_jwt)
```

The JSON examples in this article are decoded views shown for readability. They are not the normative wire representation.

The profile does not forbid other serializations in future versions. It only makes compact JWS the normative serialization for PIC Profile 0.2. A future profile may define a JSON-based serialization, but that profile must also define how signatures are verified, how hashes are computed, and how embedded artifacts are represented.

## Logical and Canonical Authority

The Logical Context of Authority is application-facing.

```json
{
  "principal": {
    "id": "user-123"
  },
  "attributes": {
    "department": "finance",
    "region": "EU"
  },
  "execution": {
    "invariants": [
      {
        "scope": "payments:read",
        "operation": "read",
        "resourceType": "payments",
        "resourceId": "*"
      },
      {
        "scope": "payments:approve",
        "operation": "approve",
        "resourceType": "payments",
        "resourceId": "*"
      }
    ],
    "contract": {
      "purpose": "payment-approval",
      "currency": "EUR"
    }
  }
}
```

For signing and hashing, the Logical Context of Authority is transformed into a canonical authority representation according to the selected profile.

```text
Logical Context of Authority
        |
        v
Canonical Authority Map
        |
        v
PCA JWT
```

Artifact identity and authority-state identity are different domains.

```text
hash(compact JWT artifact)
→ cryptographic identity of the signed artifact

hash(canonical/materialized authority state)
→ identity of the resulting authority state
```

They are not directly comparable.

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
trusted signed root authority representation
```

The PCA JWT is signed by a trusted authority.

The root PCA JWT carries the root challenge used to initialize the first future continuity transition.

Decoded PCA JWT example, shown for readability

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
    "iat": 1786484000,
    "jti": "urn:uuid:pca-root-0",
    "position": 0,

    "context_of_authority": {
      "principal": {
        "id": "user-123"
      },
      "attributes": {
        "department": "finance",
        "region": "EU"
      },
      "execution": {
        "invariants": [
          {
            "scope": "payments:read",
            "operation": "read",
            "resourceType": "payments",
            "resourceId": "*"
          },
          {
            "scope": "payments:approve",
            "operation": "approve",
            "resourceType": "payments",
            "resourceId": "*"
          }
        ],
        "contract": {
          "purpose": "payment-approval",
          "currency": "EUR"
        }
      }
    },

    "challenge": {
      "next_challenge": "base64url-random-root"
    }
  },
  "signature": "base64url-signature"
}
```

| Claim | Purpose |
| --- | --- |
| `iss` | Identifies the PIC-X issuer. |
| `profile` | Identifies the active PIC profile. |
| `sub` | Identifies the subject of the authority state when a subject is present. |
| `iat` | Records when the PCA JWT was issued. |
| `jti` | Identifies this PCA JWT instance for correlation and audit. |
| `position` | Identifies the root continuity position. |
| `context_of_authority` | Contains the authority representation for the PCA. |
| `challenge.next_challenge` | Initializes the first future continuity transition. |

`jti` identifies a JWT instance, while `position` identifies its place in continuity. Cryptographic artifact identity is established by the corresponding signed-artifact hash.

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
signed continuity artifact
```

PIC Profile 0.2 uses two operational forms:

```text
PIC-X-issued PIC Continuity JWT
→ trusted settled continuity artifact
→ signed by PIC-X
→ contains no pending Continuity Transition JWT

workload-produced candidate PIC Continuity JWT
→ proposes exactly one advancement
→ signed by the workload using the PoR-bound private key
→ carries exactly one proposed Continuity Transition JWT
```

The exact JSON encoding of an absent pending transition in a settled PIC Continuity JWT is profile/schema-defined. The exact wire placement of the proposed transition inside the workload-produced candidate is also profile/schema-defined. This article defines the semantic requirement without assigning a new field name.

Decoded settled PIC Continuity JWT example, shown for readability

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
    "sub": "user-123",
    "iat": 1786484040,
    "jti": "urn:uuid:pic-continuity-0",
    "position": 0,

    "context_of_authority": {
      "root_pca_jwt_hash": "sha256:root-pca-jwt-0",
      "root_pca_jwt": "<compact-signed-pic-pca-jwt-0>"
    }
  },
  "signature": "base64url-signature"
}
```

| Field | Purpose |
| --- | --- |
| `position` | Identifies the current continuity position certified by this PIC Continuity JWT. |
| `context_of_authority.root_pca_jwt_hash` | Identifies the hash of the compact root_pca_jwt. |
| `context_of_authority.root_pca_jwt` | Carries the signed PCA JWT issued by the trusted authority. |

After PIC-X validates a proposed transition and issues the next settled PIC Continuity JWT, the material required to authorize and validate the next transition must remain available according to the selected profile/schema. The exact settled-token location of that current challenge material is intentionally not assigned in this article.

## Continuity Transition JWT

Definition URI

```text
None
```

The current protocol does not define a Definition URI for Continuity Transition JWT. It is currently identified by Media Type and JOSE typ.

Media Type

```text
application/pic-continuity-transition+jwt
```

JOSE typ

```text
pic-continuity-transition+jwt
```

Purpose

```text
signed artifact for one proposed continuity advancement
```

A Continuity Transition JWT is not carried forward after PIC-X accepts the advancement. It is carried only in the workload-produced candidate for the current exchange.

The signing algorithms supported for Continuity Transition JWTs are advertised by PIC-X through `continuity.transition_signing_alg_values_supported` in the discovery document.

Decoded Continuity Transition JWT example, shown for readability

```json
{
  "header": {
    "typ": "pic-continuity-transition+jwt",
    "alg": "ES256",
    "kid": "workload-es256-2026-08"
  },
  "payload": {
    "iss": "https://workload.example.com",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "iat": 1786484100,
    "jti": "urn:uuid:continuity-transition-1",
    "position": 1,

    "predecessor_hash": "sha256:pic-continuity-jwt-0",

    "challenge": {
      "previous_challenge": "base64url-random-root",
      "next_challenge": "base64url-random-transition-1"
    },

    "attenuations": {
      "execution": {
        "invariants": {
          "remove_bitmap": "base64url-bitmap"
        }
      }
    },

    "proof_of_relationship": {
      "type": "profile-defined",
      "presentation": "<proof-bound-to-predecessor-and-challenge>"
    }
  },
  "signature": "base64url-signature"
}
```

PIC Profile 0.2 does not support execution-contract modification during continuity advancement. The execution contract established by the root PCA remains unchanged for the lifetime of that continuity.

## Predecessor and Challenge Semantics

For PIC Profile 0.2, a proposed transition is cryptographically bound to the previous trusted server-issued PIC Continuity JWT being advanced.

```text
trusted PIC Continuity JWT N
        |
        | predecessor_hash = hash(compact PIC Continuity JWT N)
        v
Continuity Transition JWT N+1
```

The first transition uses the root PCA JWT challenge:

```text
root_pca_jwt.payload.challenge.next_challenge
=
transition["1"].payload.challenge.previous_challenge
```

For later transitions, the previous settled continuity artifact must provide the current challenge material required by the selected profile/schema:

```text
trusted PIC Continuity JWT N
→ current continuity challenge material

Continuity Transition JWT N+1
→ challenge.previous_challenge matches that material
→ challenge.next_challenge supplies the next challenge
```

The exact settled-token location of current challenge material after advancement is intentionally deferred to the selected profile/schema definition.

## Workload Candidate Signing

The workload-produced candidate PIC Continuity JWT is signed by the workload.

The workload must use the private key whose corresponding public key or identity is bound or proven by `proof_of_relationship` in the proposed Continuity Transition JWT.

PIC-X verifies:

```text
candidate outer PIC Continuity JWT signature
+
Proof of Relationship / key binding
```

and verifies that the candidate signer is the key authorized or bound by the Proof of Relationship for that transition.

Candidate signer binding is part of `proof_of_relationship`. No additional binding object is defined here.

The candidate is not an independently trusted continuity artifact. It is a signed proposal sent to PIC-X for centralized validation.

## Attenuations

Attenuation removes authority from `execution.invariants` in the materialized authority state. It must never add authority.

```text
root authority
        |
        v
apply one proposed transition
        |
        v
next authority
```

For each attenuation, the verifier must ensure:

```text
new authority ⊆ previous authority
```

The exact attenuation representation is profile-defined.

## Proof of Relationship

Proof of Relationship binds one proposed execution transition to its causal predecessor.

In this model, `proof_of_relationship` is inside each Continuity Transition JWT.

It proves the relationship that led to the proposed authority state and binds the advancement to:

- `predecessor_hash`
- `challenge.previous_challenge`
- `challenge.next_challenge`
- `position`
- profile-defined holder/key proof

The verifier must be able to validate this proof independently. It must not trust previous verifiers.

## Verification

An ordinary verifier of a settled PIC-X-issued PIC Continuity JWT verifies the artifact presented to it:

1. Verify the PIC Continuity JWT signature using the PIC-X issuer keys.
2. Read `context_of_authority.root_pca_jwt`.
3. Verify the `root_pca_jwt` as a PCA JWT.
4. Verify that `hash(compact root_pca_jwt)` equals `context_of_authority.root_pca_jwt_hash`.
5. Verify that the token is settled according to the selected profile/schema and contains no pending Continuity Transition JWT.

PIC-X, when processing an advancement candidate, additionally verifies one proposed transition:

1. Verify the previous trusted PIC Continuity JWT N.
2. Verify the workload-produced candidate PIC Continuity JWT outer signature.
3. Verify that the candidate contains exactly one proposed Continuity Transition JWT.
4. Verify the Continuity Transition JWT signature.
5. Verify that the candidate signer is the key authorized or bound by `proof_of_relationship`.
6. Verify `predecessor_hash` equals `hash(compact PIC Continuity JWT N)`.
7. Verify `payload.position` equals the previous trusted continuity position + 1.
8. Verify challenge continuity:
   - for the first advancement, `challenge.previous_challenge` equals `root_pca_jwt.payload.challenge.next_challenge`;
   - for later advancements, `challenge.previous_challenge` equals the current challenge material made available by the previous settled continuity artifact according to the selected profile/schema.
9. Verify `proof_of_relationship` over `predecessor_hash`, `challenge.previous_challenge`, `challenge.next_challenge`, and `position`.
10. Apply attenuations to `execution.invariants` in the materialized authority state.
11. Verify non-expansion of authority.
12. Verify revocation and local policy.
13. If validation succeeds, issue PIC Continuity JWT N+1 signed by PIC-X with no pending transition.

Profile 0.2 does not transport multiple prior transitions for independent replay. PIC-X validates each single advancement centrally and issues the next trusted continuity artifact.

## Profile 0.2 Continuity Model

```text
ROOT

PCA
→ logical Context of Authority

PCA JWT
→ trusted signed root authority
→ root challenge
```

```text
SETTLED CONTINUITY

PIC Continuity JWT N
→ issued and signed by PIC-X
→ trusted current continuity artifact
→ binds to the trusted root as required by the profile
→ contains no pending continuity transition
```

```text
ADVANCEMENT CANDIDATE

workload creates exactly one Continuity Transition JWT N+1
→ predecessor = previous trusted PIC Continuity JWT N
→ challenge continuity
→ attenuation
→ Proof of Relationship

workload places that one Transition JWT in a candidate PIC Continuity JWT
→ candidate signed using the PoR-bound private key
```

```text
CENTRAL VALIDATION

candidate
→ PIC-X
→ validate previous trusted continuity
→ validate candidate signer / PoR key relationship
→ validate one transition
→ validate predecessor, challenge, attenuation, non-expansion, revocation/policy
→ issue PIC Continuity JWT N+1
→ no pending transition
```

```text
REPEAT

central N
→ one candidate transition
→ central N+1
→ one candidate transition
→ central N+2
```

## References

### External References

- [RFC 7519 - JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 9068 - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [PIC Protocol](https://www.pic-protocol.org/)
- [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)

### PIC-X Series

- [Designing PIC-X: From Specification to Architecture](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/)
- [Designing PIC-X: The .well-known Configuration](/blog/2026-08-01/pic-x-well-known-config/)
