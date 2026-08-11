+++
author = "Nicola Gallo"
title = "Designing PIC-X: PCA JWT, PIC Continuity JWT, and the Continuity Graph"
date = "2026-08-11T09:00:00+02:00"
description = "This article defines the canonical JSON/JWT artifacts used by PIC Profile 0.2: PCA JWT, PIC Continuity JWT, Continuity Transition JWT, and the Continuity Graph."
tags = ["pic", "pic-x", "jwt", "continuity graph", "continuity transition", "oauth", "security", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-11/pic-x-jwts-authority-graph.png"
       alt="Designing PIC-X: PCA JWT, PIC Continuity JWT, and the Continuity Graph."
       loading="lazy">
  <figcaption>Designing PIC-X. PCA JWT, PIC Continuity JWT, and the Continuity Graph.</figcaption>
</figure>

The previous articles introduced the exchange flow, discovery metadata, and the protocol concepts required to initialize and continue PIC executions.

For context, see [Designing PIC-X: From Specification to Architecture to Code](/blog/2026-08-01/pic-x-from-spec-to-arch/), [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/), and [Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration](/blog/2026-08-01/pic-x-well-known-config/).

The active PIC profile is:

```text
https://pic-protocol.org/profiles/0.2
```

This article defines the canonical JSON/JWT representation for that profile.

```text
Logical Context of Authority
        │
        ▼
Canonical Authority Map
        │
        ▼
PCA JWT
        │
        ▼
PIC Continuity JWT
        │
        ▼
Continuity Graph
```

The protocol intentionally separates root authority from authority continuity.

A **PCA** is the logical Context of Authority.

A **PCA JWT** is the signed root authority representation.

A **PIC Continuity JWT** transports one Continuity Graph and its root_authority_jwt.

A **Continuity Graph** starts from a trusted root_authority_jwt and carries a numbered sequence of signed Continuity Transition JWTs.

## PIC Artifact Registry

PIC currently defines three JWT artifacts and two Continuity Proposal type identifiers used by the PIC Token Exchange Profile.

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

This registry maps the identifiers advertised by `.well-known/pic-x-configuration` to the protocol artifacts defined in this article.

| Artifact | Definition URI | Media Type | JOSE typ | Purpose |
| --- | --- | --- | --- | --- |
| PCA JWT | None | `application/pic-pca+jwt` | `pic-pca+jwt` | Signed root authority representation. |
| PIC Continuity JWT | `https://pic-protocol.org/definitions/token-types/continuity` | `application/pic-continuity+jwt` | `pic-continuity+jwt` | Transports one Continuity Graph and its root_authority_jwt. |
| Continuity Transition JWT | None | `application/pic-continuity-transition+jwt` | `pic-continuity-transition+jwt` | Signed continuity transition embedded in the Continuity Graph. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Supplies initialization material, including the execution contract. |
| Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity` | `application/json` | `N_A` | Supplies continuation material. |

The proposal JSON is transported through the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url.

## Logical and Canonical Authority

The first article shows the Logical Context of Authority as readable application-facing JSON.

When the logical context is serialized for signing, hashing, attenuation, or compact transport, it is transformed into a Canonical Authority Map.

PIC Profile 0.2 represents that canonical form as an Indexed Authority Map.

```text
Logical Context of Authority
→ application-facing readable JSON

Canonical Authority Map
→ canonical serialized authority representation

Indexed Authority Map
→ concrete numbered key/value representation used by this profile
```

Example Indexed Authority Map:

```json
{
  "principal": {
    "1": {
      "key": "principal:id",
      "value": "user-123"
    },
    "2": {
      "key": "principal:roles:document-manager",
      "value": true
    },
    "3": {
      "key": "principal:groups:document-management",
      "value": true
    },
    "4": {
      "key": "principal:groups:eu-employees",
      "value": true
    }
  },

  "attributes": {
    "1": {
      "key": "attributes:securityDomain",
      "value": "tenant-a"
    }
  },

  "invariants": {
    "1": {
      "key": "documents:read",
      "value": {
        "operation": "read",
        "resourceType": "documents",
        "resourceId": "*"
      }
    },
    "2": {
      "key": "documents:write",
      "value": {
        "operation": "write",
        "resourceType": "documents",
        "resourceId": "*"
      }
    },
    "3": {
      "key": "documents:read:document-42",
      "value": {
        "operation": "read",
        "resourceType": "documents",
        "resourceId": "document-42"
      }
    }
  },

  "contract": {
    "1": {
      "key": "contract:corporation",
      "value": "acme"
    },
    "2": {
      "key": "contract:departments:engineering",
      "value": true
    },
    "3": {
      "key": "contract:departments:operations",
      "value": true
    }
  }
}
```

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
signed root authority representation
```

The PCA JWT is signed by a trusted authority.

In the continuity model, the root PCA JWT appears as `root_authority_jwt` inside the PIC Continuity JWT.

The initial root has no causal predecessor. It carries the root challenge used by the first Continuity Transition JWT.

The example uses a reduced Indexed Authority Map for readability; production PCA JWTs carry the complete canonical map derived from the Logical Context of Authority.

Decoded PCA JWT example:

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
    "jti": "urn:uuid:pca-root-4",

    "position": 4,

    "context_of_authority": {
      "format": "indexed-authority-map",
      "value": {
        "principal": {
          "1": {
            "key": "principal:id",
            "value": "user-123"
          },
          "2": {
            "key": "principal:roles:document-manager",
            "value": true
          }
        },
        "attributes": {
          "1": {
            "key": "attributes:securityDomain",
            "value": "tenant-a"
          }
        },
        "invariants": {
          "1": {
            "key": "documents:write",
            "value": {
              "operation": "write",
              "resourceType": "documents",
              "resourceId": "*"
            }
          }
        },
        "contract": {
          "1": {
            "key": "contract:corporation",
            "value": "acme"
          }
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
| `jti` | Identifies this PCA JWT for correlation, audit, lineage, and revocation. |
| `position` | Identifies the root authority position. |
| `context_of_authority` | Contains the Indexed Authority Map for the PCA. |
| `challenge.next_challenge` | Initializes the first continuity transition. |

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
transports one Continuity Graph and its root_authority_jwt
```

The PIC Continuity JWT remains the artifact returned by the exchange endpoint and transported across execution boundaries.

In a PIC Continuity JWT, `context_of_authority` does not contain the full current authority state. It identifies the trusted root authority artifact from which the current authority is materialized.

Decoded PIC Continuity JWT example:

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
    "jti": "urn:uuid:pic-continuity-current-7",

    "context_of_authority": {
      "position": 4,
      "root_authority_hash": "sha256:root-authority-jwt-4",
      "root_authority_jwt": "<signed-pic-pca-jwt>"
    },

    "continuity_graph": {
      "current_position": 7,
      "current_authority_hash": "sha256:current-authority-7",

      "transitions": {
        "5": {
          "current_continuity_transition_hash": "sha256:transition-5",
          "current_continuity_transition_jwt": "<signed-continuity-transition-jwt-5>"
        },
        "6": {
          "current_continuity_transition_hash": "sha256:transition-6",
          "current_continuity_transition_jwt": "<signed-continuity-transition-jwt-6>"
        },
        "7": {
          "current_continuity_transition_hash": "sha256:transition-7",
          "current_continuity_transition_jwt": "<signed-continuity-transition-jwt-7>"
        }
      }
    }
  },
  "signature": "base64url-signature"
}
```

| Field | Purpose |
| --- | --- |
| `context_of_authority.position` | Identifies the root authority position. |
| `context_of_authority.root_authority_hash` | Identifies the hash of the compact root_authority_jwt. |
| `context_of_authority.root_authority_jwt` | Carries the signed PCA JWT issued by the trusted authority. |
| `continuity_graph.current_position` | Identifies the current transition position. |
| `continuity_graph.current_authority_hash` | Identifies the current authority hash. |
| `continuity_graph.transitions` | Carries the numbered transitions map. |

`current_authority_hash` is not stored inside each Continuity Transition JWT. It is the final authority hash declared by the PIC Continuity JWT and verified after materializing the authority from root_authority_jwt plus all valid transitions.

For PIC Profile 0.2, current_authority_hash equals the hash of the materialized Canonical Authority Map after all valid attenuations have been applied.

## Continuity Graph

The Continuity Graph starts from a trusted root_authority_jwt and carries a numbered sequence of signed Continuity Transition JWTs. Each transition proves causal continuity from its predecessor and may attenuate the authority represented by the root authority.

```text
PIC Continuity JWT
├── context_of_authority
│   ├── position
│   ├── root_authority_hash
│   └── root_authority_jwt
└── continuity_graph
    ├── current_position
    ├── current_authority_hash
    └── transitions
        └── numbered Continuity Transition JWT wrappers
```

```text
continuity_graph
├── current_position
├── current_authority_hash
└── transitions
    ├── "5"
    │   ├── current_continuity_transition_hash
    │   └── current_continuity_transition_jwt
    ├── "6"
    │   ├── current_continuity_transition_hash
    │   └── current_continuity_transition_jwt
    └── "7"
        ├── current_continuity_transition_hash
        └── current_continuity_transition_jwt
```

Transition keys are decimal strings. Verification order is numeric ascending order, not lexical order.

The root position is `context_of_authority.position`. The first transition position must be root position + 1. `current_position` must equal the last transition position.

### Initial Continuity Graph

The initial PIC Continuity JWT may contain no transitions.

In that case:

- `context_of_authority.position` is the root position;
- `continuity_graph.current_position` equals `context_of_authority.position`;
- `continuity_graph.transitions` is empty;
- `continuity_graph.current_authority_hash` equals the hash of the root PCA JWT's Canonical Authority Map;
- no Continuity Transition JWT is required yet;
- the root PCA JWT challenge initializes the first future transition.

```json
{
  "context_of_authority": {
    "position": 0,
    "root_authority_hash": "sha256:root-authority-jwt-0",
    "root_authority_jwt": "<signed-pic-pca-jwt-0>"
  },
  "continuity_graph": {
    "current_position": 0,
    "current_authority_hash": "sha256:authority-map-0",
    "transitions": {}
  }
}
```

## Continuity Transition JWT

Definition URI

```text
None
```

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
signed continuity transition embedded in the Continuity Graph
```

A Continuity Transition JWT is a signed transition artifact embedded inside the PIC Continuity JWT. It is not the same as the PIC Continuity JWT.

Decoded Continuity Transition JWT example:

```json
{
  "header": {
    "typ": "pic-continuity-transition+jwt",
    "alg": "ES256",
    "kid": "pic-x-es256-2026-08"
  },
  "payload": {
    "iss": "http://127.0.0.1:5556/pic-x",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "iat": 1786484100,
    "jti": "urn:uuid:continuity-transition-5",

    "position": 5,

    "predecessor_hash": "sha256:root-authority-jwt-4",

    "challenge": {
      "previous_challenge": "base64url-random-root",
      "next_challenge": "base64url-random-transition-5"
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
      "contract": {
        "remove_bitmap": "base64url-bitmap"
      }
    },

    "proof_of_relationship": {
      "type": "profile-defined",
      "presentation": "<proof-bound-to-previous-and-next-challenge>"
    }
  },
  "signature": "base64url-signature"
}
```

## Predecessor Hash Rules

For the first transition after the root authority, `predecessor_hash` equals `context_of_authority.root_authority_hash`. For every later transition, `predecessor_hash` equals the previous transition's `current_continuity_transition_hash`.

```text
transition["5"].payload.predecessor_hash
=
context_of_authority.root_authority_hash
```

For later transitions:

```text
transition["6"].payload.predecessor_hash
=
transition["5"].current_continuity_transition_hash
```

The transition hash is always the hash of the compact current_continuity_transition_jwt:

```text
hash(current_continuity_transition_jwt)
=
current_continuity_transition_hash
```

## Attenuations

Attenuations are represented compactly.

```text
attenuations
├── principal
├── attributes
├── invariants
└── contract
```

Each section may use `remove_bitmap`.

```json
{
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
    "contract": {
      "remove_bitmap": "base64url-bitmap"
    }
  }
}
```

Each attenuation bitmap is interpreted against the corresponding Indexed Authority Map section.

The selected profile defines bitmap ordering, base64url encoding, canonicalization, and hashing.

## Proof of Relationship

Proof of Relationship binds one execution transition to its causal predecessor.

In this model, `proof_of_relationship` is inside each Continuity Transition JWT.

It binds:

- `predecessor_hash`
- `challenge.previous_challenge`
- `challenge.next_challenge`
- `position`
- profile-defined holder/key proof

The verifier must be able to validate this proof independently. It must not trust previous verifiers.

Key binding is part of `proof_of_relationship`.

## Verification

1. Verify the PIC Continuity JWT signature.
2. Read `context_of_authority.root_authority_jwt`.
3. Verify the `root_authority_jwt` as a PCA JWT.
4. Verify that `hash(root_authority_jwt)` equals `context_of_authority.root_authority_hash`.
5. Extract root position and root challenge from the PCA JWT.
6. Sort `continuity_graph.transitions` by numeric key.
7. Verify that the first transition position is root position + 1.
8. For each transition:
   - verify the Continuity Transition JWT signature;
   - verify `hash(compact transition JWT)` equals `current_continuity_transition_hash`;
   - verify `payload.position` equals the numeric transition key;
   - verify `predecessor_hash` equals `root_authority_hash` for the first transition or the previous transition hash for later transitions;
   - verify the first transition's `challenge.previous_challenge` equals `root_authority_jwt.payload.challenge.next_challenge`;
   - verify every later transition's `challenge.previous_challenge` equals the previous transition's `challenge.next_challenge`;
   - verify `proof_of_relationship` over `predecessor_hash`, `challenge.previous_challenge`, `challenge.next_challenge`, and `position`;
   - apply attenuations to the materialized Canonical Authority Map;
   - verify non-expansion of authority.
9. Verify `current_position` equals the last transition position.
10. Verify that `continuity_graph.current_authority_hash` equals the hash of the materialized Canonical Authority Map after all valid attenuations have been applied.

## Continuity Modes

The central PIC-X authority issues the initial PCA JWT. That PCA JWT becomes the root_authority_jwt.

After that, continuity may be advanced through the selected continuity mode.

In centralized continuity, PIC-X validates and issues the next PIC Continuity JWT.

In decentralized continuity, other nodes may be allowed to produce Continuity Transition JWTs and update the Continuity Graph according to profile rules.

This is why PCA JWT cannot replace PIC Continuity JWT as the only artifact. PCA JWT is the signed root authority artifact. PIC Continuity JWT is the transport artifact that carries the root and the Continuity Graph.

## References

### External References

- [RFC 7519 — JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 9068 — JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [PIC Protocol](https://www.pic-protocol.org/)
- [PIC Prover and Verifier Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html)

### PIC-X Series

- [Designing PIC-X: From Specification to Architecture to Code](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/)
- [Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration](/blog/2026-08-01/pic-x-well-known-config/)
