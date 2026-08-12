+++
author = "Nicola Gallo"
title = "Designing PIC-X: Token Types and JWTs"
date = "2026-08-11T09:00:00+02:00"
description = "This article defines the token types and canonical JSON/JWT artifacts used by PIC Profile 0.2: PIC PCA JWT, PIC Continuity JWT, and PIC Continuity Transition JWT."
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
  <img src="/images/2026-08-11/pic-x-token-types-jwts.png"
       alt="Designing PIC-X: Token Types and JWTs."
       loading="lazy">
  <figcaption>Designing PIC-X. Token Types and JWTs.</figcaption>
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
with one PIC Continuity Transition JWT N+1
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

A **PIC PCA JWT** is the trusted signed root authority representation.

A **PIC Continuity JWT** is the signed continuity artifact. When issued by PIC-X, it is the trusted settled continuity artifact. When produced by a workload for advancement, it is a signed candidate containing exactly one proposed PIC Continuity Transition JWT.

A **PIC Continuity Transition JWT** is one signed proposed causal advancement from the currently trusted PIC Continuity JWT to the next state.

PIC Profile 0.2 defines only centralized PIC-X-mediated continuity advancement.

## PIC Artifact Registry

PIC currently defines three JWT artifacts and two Continuity Proposal type identifiers used by the PIC Token Exchange Profile.

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

This registry maps the identifiers advertised by `.well-known/pic-x-configuration` to the protocol artifacts defined in this article.

| Artifact | Definition URI | Media Type | JOSE typ | Purpose |
| --- | --- | --- | --- | --- |
| PIC PCA JWT | None | `application/pic-pca+jwt` | `pic-pca+jwt` | Trusted signed root authority representation. |
| PIC Continuity JWT | `https://pic-protocol.org/definitions/token-types/continuity` | `application/pic-continuity+jwt` | `pic-continuity+jwt` | Trusted settled continuity artifact when issued by PIC-X; candidate exchange artifact when workload-signed. |
| PIC Continuity Transition JWT | None | `application/pic-continuity-transition+jwt` | `pic-continuity-transition+jwt` | Signed artifact for one proposed continuity advancement. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Supplies initialization material, including the execution contract. |
| Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity` | `application/json` | `N_A` | Supplies centralized advancement support material when required by the selected profile/schema. |

When proposal JSON is transported to PIC-X, it uses the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url.

## JWT Serialization

PIC Profile 0.2 transports and embeds signed JWT artifacts using compact JWS serialization.

Unless a future profile explicitly defines another serialization, fields ending in `_jwt` carry the compact signed JWT string.

This applies to:

```text
context_of_authority.root.pca_jwt
continuity_transition_jwt
```

Artifact hashes over JWT values are computed over the UTF-8 bytes of the compact serialized JWT, not over the decoded JSON view.

For example:

```text
context_of_authority.root.pca_jwt_hash = hash(compact context_of_authority.root.pca_jwt)
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
    "id": "user-123",
    "roles": [
      "payment-approver"
    ],
    "groups": [
      "finance"
    ]
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
      "currency": "EUR",
      "departments": [
        "finance"
      ]
    }
  }
}
```

For signing and hashing, the Logical Context of Authority is transformed into a canonical authority representation according to the selected profile. In PIC Profile 0.2, the PIC PCA JWT `context_of_authority` contains an Indexed Authority Map, not the normalized Logical Context of Authority directly.

```text
Logical Context of Authority
        |
        v
canonicalization / denormalization
        |
        v
Indexed Authority Map
        |
        v
PIC PCA JWT
```

Profile 0.2 uses section-local numeric indexes starting at `0`. Initial index assignment is deterministic and is separate from canonical serialization of an already indexed map. Implementations first denormalize the Logical Context of Authority into canonical tuple candidates, sort those candidates within each section, then assign section-local indexes `0`, `1`, `2`, and so on.

For `principal`, `attributes`, and `execution_contract`, each indexed entry is `[key, value]`. For `invariants`, each indexed entry is `[scope, operation, resourceType, resourceId]`.

For initial index assignment, `principal`, `attributes`, and `execution_contract` candidates are sorted lexicographically by canonical `key`, using Unicode code point order. Collection memberships are denormalized before sorting; each member becomes its own `[key, true]` tuple, and the final canonical membership key determines its position. Presence with `true` represents membership; Profile 0.2 defines no false-valued membership semantics.

For `invariants`, candidates are sorted lexicographically by tuple elements in this order: `scope`, `operation`, `resourceType`, `resourceId`, using Unicode code point order for each element.

The identity addressed by removal bitmaps is `(section, numeric index)`, for example `principal/0` or `invariants/1`; JSON object member order has no protocol meaning.

```json
{
  "format": "indexed-authority-map",
  "value": {
    "principal": {
      "0": ["groups:finance", true],
      "1": ["id", "user-123"],
      "2": ["roles:payment-approver", true]
    },
    "attributes": {
      "0": ["department", "finance"],
      "1": ["region", "EU"]
    },
    "invariants": {
      "0": ["payments:approve", "approve", "payments", "*"],
      "1": ["payments:read", "read", "payments", "*"]
    },
    "execution_contract": {
      "0": ["currency", "EUR"],
      "1": ["departments:finance", true],
      "2": ["purpose", "payment-approval"]
    }
  }
}
```

Logical `execution.contract` maps to the flattened canonical `execution_contract` section.

`principal`, `attributes`, `invariants`, and `execution_contract` are all indexed and canonicalized. Indexing does not mean all sections use removal attenuation.

Scalar logical values become one indexed entry. Set or list membership is denormalized so that each member becomes its own indexed boolean entry.

Artifact identity and authority-state identity are different domains.

```text
hash(compact JWT artifact)
→ cryptographic identity of the signed artifact

hash(canonical/materialized authority state)
→ identity of the resulting authority state
```

They are not directly comparable.

When hashing a canonical/materialized authority state, Profile 0.2 uses deterministic canonical serialization of the Indexed Authority Map: sections are serialized as `principal`, `attributes`, `invariants`, then `execution_contract`, and entries within each section are serialized by ascending numeric index. Hashing never relies on arbitrary JSON object member order.

## PIC PCA JWT

Definition URI

```text
None
```

The current protocol does not define a Definition URI for PIC PCA JWT. PIC PCA JWT is currently identified by Media Type and JOSE typ.

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

The PIC PCA JWT is signed by a trusted authority.

The root PIC PCA JWT carries the root challenge used to initialize the first future continuity transition.

Decoded PIC PCA JWT example, shown for readability

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
      "format": "indexed-authority-map",
      "value": {
        "principal": {
          "0": ["groups:finance", true],
          "1": ["id", "user-123"],
          "2": ["roles:payment-approver", true]
        },
        "attributes": {
          "0": ["department", "finance"],
          "1": ["region", "EU"]
        },
        "invariants": {
          "0": ["payments:approve", "approve", "payments", "*"],
          "1": ["payments:read", "read", "payments", "*"]
        },
        "execution_contract": {
          "0": ["currency", "EUR"],
          "1": ["departments:finance", true],
          "2": ["purpose", "payment-approval"]
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
| `iat` | Records when the PIC PCA JWT was issued. |
| `jti` | Identifies this PIC PCA JWT instance for correlation and audit. |
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
→ contains no pending PIC Continuity Transition JWT

workload-produced candidate PIC Continuity JWT
→ proposes exactly one advancement
→ signed by the workload using the PoR-bound private key
→ carries exactly one proposed PIC Continuity Transition JWT in `continuity_transition_jwt`
```

PIC-X-issued settled PIC Continuity JWTs contain no `continuity_transition_jwt`. A workload-produced candidate PIC Continuity JWT contains exactly one `continuity_transition_jwt`.

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
      "root": {
        "pca_jwt_hash": "sha256:root-pca-jwt-0",
        "pca_jwt": "<compact-signed-pic-pca-jwt-0>"
      }
    }
  },
  "signature": "base64url-signature"
}
```

| Field | Purpose |
| --- | --- |
| `position` | Identifies the current continuity position certified by this PIC Continuity JWT. |
| `context_of_authority.root.pca_jwt_hash` | Identifies the hash of the compact root PIC PCA JWT. |
| `context_of_authority.root.pca_jwt` | Carries the signed PIC PCA JWT issued by the trusted authority. |

Decoded workload-produced candidate PIC Continuity JWT example, shown for readability

```json
{
  "header": {
    "typ": "pic-continuity+jwt",
    "alg": "ES256",
    "kid": "workload-es256-2026-08"
  },
  "payload": {
    "iss": "https://workload.example.com",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "sub": "user-123",
    "iat": 1786484100,
    "jti": "urn:uuid:pic-continuity-candidate-1",
    "position": 1,

    "context_of_authority": {
      "root": {
        "pca_jwt_hash": "sha256:root-pca-jwt-0",
        "pca_jwt": "<compact-signed-pic-pca-jwt-0>"
      }
    },

    "continuity_transition_jwt": "<compact-signed-continuity-transition-jwt-1>"
  },
  "signature": "base64url-signature"
}
```

After PIC-X validates a proposed transition and issues the next settled PIC Continuity JWT, the material required to authorize and validate the next transition must remain available according to the selected profile/schema. The exact settled-token location of that current challenge material is intentionally not assigned in this article.

## PIC Continuity Transition JWT

Definition URI

```text
None
```

The current protocol does not define a Definition URI for PIC Continuity Transition JWT. It is currently identified by Media Type and JOSE typ.

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

A PIC Continuity Transition JWT is not carried forward after PIC-X accepts the advancement. It is carried only in the workload-produced candidate for the current exchange.

The signing algorithms accepted for workload-signed PIC Continuity Transition JWTs are advertised by PIC-X through `continuity.transition_signing_alg_values_supported` in the discovery document.

Decoded PIC Continuity Transition JWT example, shown for readability

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
      "principal": {
        "remove_bitmap": "base64url-bitmap"
      },
      "attributes": {
        "remove_bitmap": "base64url-bitmap"
      },
      "invariants": {
        "remove_bitmap": "base64url-bitmap"
      },
      "execution_contract": {
        "additions": [
          ["region", "EU"]
        ]
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

Existing execution-contract constraints must not be removed, replaced, or weakened during continuity advancement. Execution-contract restriction is additive: accepted transitions may introduce additional constraints through `attenuations.execution_contract.additions`, and all existing and newly added constraints are combined with logical AND.

New execution-contract constraints introduced by an accepted transition become additional entries in the materialized/effective `execution_contract` Indexed Authority Map section after PIC-X validates the transition and issues the next settled continuity state. The signed root PIC PCA JWT is not mutated, and no new PIC PCA JWT is created for the new continuity position.

The workload proposes execution-contract additions as canonical Indexed Authority Map `[key, value]` tuple entries in `attenuations.execution_contract.additions`. Each addition contains only the two tuple elements `key` and `value`. The workload does not assign a numeric index. PIC-X centrally validates each proposed addition and assigns the next section-local numeric index in `execution_contract` only after accepting the transition. Collection additions use the existing denormalized canonical form: for example, logical `departments` values become separate entries such as `["departments:engineering", true]` and `["departments:operations", true]`.

## Predecessor and Challenge Semantics

For PIC Profile 0.2, a proposed transition is cryptographically bound to the previous trusted server-issued PIC Continuity JWT being advanced.

```text
trusted PIC Continuity JWT N
        |
        | predecessor_hash = hash(compact PIC Continuity JWT N)
        v
PIC Continuity Transition JWT N+1
```

The first transition uses the root PIC PCA JWT challenge:

```text
context_of_authority.root.pca_jwt.payload.challenge.next_challenge
=
transition["1"].payload.challenge.previous_challenge
```

For later transitions, the previous settled continuity artifact must provide the current challenge material required by the selected profile/schema:

```text
trusted PIC Continuity JWT N
→ current continuity challenge material

PIC Continuity Transition JWT N+1
→ challenge.previous_challenge matches that material
→ challenge.next_challenge supplies the next challenge
```

The exact settled-token location of current challenge material after advancement is intentionally deferred to the selected profile/schema definition.

## Workload Candidate Signing

The workload-produced candidate PIC Continuity JWT is signed by the workload.

The workload must use the private key whose corresponding public key or identity is bound or proven by `proof_of_relationship` in the proposed PIC Continuity Transition JWT.

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

Profile 0.2 uses two restriction mechanisms inside `attenuations`:

```text
attenuations.principal.remove_bitmap
→ removal attenuation
→ remove_bitmap against principal section indexes

attenuations.attributes.remove_bitmap
→ removal attenuation
→ remove_bitmap against attributes section indexes

attenuations.invariants.remove_bitmap
→ removal attenuation
→ remove_bitmap against invariants section indexes

attenuations.execution_contract.additions
→ additive restriction
→ additions array of `[key, value]` tuple constraints
→ PIC-X assigns indexes after validation
→ all constraints combined with logical AND
```

Removal attenuation removes entries from the indexed `principal`, `attributes`, and `invariants` sections in the materialized authority state. It must never add authority.

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

In Profile 0.2, `attenuations.principal.remove_bitmap`, `attenuations.attributes.remove_bitmap`, and `attenuations.invariants.remove_bitmap` are interpreted against their own section-local numeric indexes. Removed entries must never reappear later in the same continuity. `execution_contract` does not use removal bitmaps. Execution-contract restrictions are monotonic additions through `attenuations.execution_contract.additions`: they add constraints that are combined with logical AND and therefore can only reduce the set of allowed executions.

## Proof of Relationship

Proof of Relationship binds one proposed execution transition to its causal predecessor.

In this model, `proof_of_relationship` is inside each PIC Continuity Transition JWT.

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
2. Read `context_of_authority.root.pca_jwt`.
3. Verify `context_of_authority.root.pca_jwt` as a PIC PCA JWT.
4. Verify that `hash(compact context_of_authority.root.pca_jwt)` equals `context_of_authority.root.pca_jwt_hash`.
5. Verify that the token is settled and contains no `continuity_transition_jwt`.

PIC-X, when processing an advancement candidate, additionally verifies one proposed transition:

1. Verify the previous trusted PIC Continuity JWT N.
2. Verify the workload-produced candidate PIC Continuity JWT outer signature.
3. Verify that the candidate contains exactly one `continuity_transition_jwt`.
4. Verify the PIC Continuity Transition JWT carried in `continuity_transition_jwt`.
5. Verify that the candidate signer is the key authorized or bound by `proof_of_relationship`.
6. Verify `predecessor_hash` equals `hash(compact PIC Continuity JWT N)`.
7. Verify `payload.position` equals the previous trusted continuity position + 1.
8. Verify challenge continuity:
   - for the first advancement, `challenge.previous_challenge` equals `context_of_authority.root.pca_jwt.payload.challenge.next_challenge`;
   - for later advancements, `challenge.previous_challenge` equals the current challenge material made available by the previous settled continuity artifact according to the selected profile/schema.
9. Verify `proof_of_relationship` over `predecessor_hash`, `challenge.previous_challenge`, `challenge.next_challenge`, and `position`.
10. Apply `attenuations.principal.remove_bitmap` when present.
11. Apply `attenuations.attributes.remove_bitmap` when present.
12. Apply `attenuations.invariants.remove_bitmap` when present.
13. Read `attenuations.execution_contract.additions` when present.
14. Validate each proposed execution-contract `[key, value]` tuple.
15. Verify that accepted additions only further restrict execution.
16. Assign accepted additions their next section-local numeric indexes.
17. Add accepted additions to the materialized/effective `execution_contract` section.
18. Combine all execution-contract constraints using logical AND.
19. Verify overall authority and non-expansion semantics.
20. Verify revocation and local policy.
21. If validation succeeds, issue PIC Continuity JWT N+1 signed by PIC-X with no `continuity_transition_jwt`.

Profile 0.2 does not transport multiple prior transitions for independent replay. PIC-X validates each single advancement centrally and issues the next trusted continuity artifact.

## Profile 0.2 Continuity Model

```text
ROOT

PCA
→ logical Context of Authority

PIC PCA JWT
→ trusted signed root authority
→ root challenge
```

```text
SETTLED CONTINUITY

PIC Continuity JWT N
→ issued and signed by PIC-X
→ trusted current continuity artifact
→ binds to the trusted root through `context_of_authority.root`
→ contains no `continuity_transition_jwt`
```

```text
ADVANCEMENT CANDIDATE

workload creates exactly one PIC Continuity Transition JWT N+1
→ predecessor = previous trusted PIC Continuity JWT N
→ challenge continuity
→ attenuation
→ Proof of Relationship

workload places that one PIC Continuity Transition JWT in a candidate PIC Continuity JWT
→ transition carried in `continuity_transition_jwt`
→ candidate signed using the PoR-bound private key
```

```text
CENTRAL VALIDATION

candidate
→ PIC-X
→ validate previous trusted continuity
→ validate candidate signer / PoR key relationship
→ validate one transition
→ validate predecessor, challenge, attenuation, execution-contract additions, non-expansion, revocation/policy
→ issue PIC Continuity JWT N+1
→ no `continuity_transition_jwt`
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
