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

A **PIC Continuity JWT** transports one Continuity Graph and its root_pca_jwt.

A **Continuity Graph** starts from a trusted root_pca_jwt and carries a numbered sequence of signed Continuity Transition JWTs when continuity advances.

## PIC Artifact Registry

PIC currently defines three JWT artifacts and two Continuity Proposal type identifiers used by the PIC Token Exchange Profile.

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

This registry maps the identifiers advertised by `.well-known/pic-x-configuration` to the protocol artifacts defined in this article.

| Artifact | Definition URI | Media Type | JOSE typ | Purpose |
| --- | --- | --- | --- | --- |
| PCA JWT | None | `application/pic-pca+jwt` | `pic-pca+jwt` | Signed root authority representation. |
| PIC Continuity JWT | `https://pic-protocol.org/definitions/token-types/continuity` | `application/pic-continuity+jwt` | `pic-continuity+jwt` | Transports one Continuity Graph and its root_pca_jwt. |
| Continuity Transition JWT | None | `application/pic-continuity-transition+jwt` | `pic-continuity-transition+jwt` | Signed continuity transition embedded in the Continuity Graph. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Supplies initialization material, including the execution contract. |
| Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity` | `application/json` | `N_A` | Supplies continuation material. |

When proposal JSON is transported to PIC-X, it uses the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url.

## JWT Serialization

PIC Profile 0.2 transports and embeds signed JWT artifacts using compact JWS serialization.

Unless a future profile explicitly defines another serialization, fields ending in `_jwt` carry the compact signed JWT string.

This applies to:

```text
root_pca_jwt
current_continuity_transition_jwt
```

The JSON examples in this article are decoded views shown for readability. They are not the normative wire representation.

Artifact hashes over JWT values are computed over the UTF-8 bytes of the compact serialized JWT, not over the decoded JSON view.

For example:

```text
root_pca_jwt_hash = hash(compact root_pca_jwt)
```

and:

```text
hash(compact current_continuity_transition_jwt)
```

Future profiles may define additional serializations, including JSON-based serializations, but a verifier must not accept an alternative serialization unless the selected profile explicitly defines it and advertises it.

The profile does not forbid other serializations in future versions. It only makes compact JWS the normative serialization for PIC Profile 0.2. A future profile may define a JSON-based serialization, but that profile must also define how signatures are verified, how hashes are computed, and how embedded artifacts are represented.

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

In the continuity model, the root PCA JWT appears as `root_pca_jwt` inside the PIC Continuity JWT.

The initial root has no causal predecessor. It carries the root challenge used by the first Continuity Transition JWT.

The example uses a reduced Indexed Authority Map for readability; production PCA JWTs carry the complete canonical map derived from the Logical Context of Authority.

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
| `jti` | Identifies this PCA JWT instance for correlation and audit. |
| `position` | Identifies the root continuity position. |
| `context_of_authority` | Contains the Indexed Authority Map for the PCA. |
| `challenge.next_challenge` | Initializes the first continuity transition. |

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
transports one Continuity Graph and its root_pca_jwt
```

The PIC Continuity JWT remains the artifact returned by the exchange endpoint and transported across execution boundaries.

In centralized exchange, the PIC Continuity JWT is returned by the exchange endpoint. Across continuity modes, it is the signed transport artifact for Proof of Continuity.

The signer of the outer PIC Continuity JWT is not necessarily the authority issuer in every continuity mode. The authority root remains root_pca_jwt, signed by the trusted authority issuer.

In a PIC Continuity JWT, `context_of_authority` does not contain the full current authority state. It identifies the trusted root authority artifact from which the current authority is materialized.

Decoded PIC Continuity JWT example, shown for readability

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
      "root_pca_jwt_hash": "sha256:root-pca-jwt-4",
      "root_pca_jwt": "<compact-signed-pic-pca-jwt>"
    },

    "continuity_graph": {
      "current_position": 7,
      "current_authority_hash": "sha256:current-authority-7",

      "transitions": {
        "5": {
          "current_continuity_transition_hash": "sha256:transition-5",
          "current_continuity_transition_jwt": "<compact-signed-continuity-transition-jwt-5>"
        },
        "6": {
          "current_continuity_transition_hash": "sha256:transition-6",
          "current_continuity_transition_jwt": "<compact-signed-continuity-transition-jwt-6>"
        },
        "7": {
          "current_continuity_transition_hash": "sha256:transition-7",
          "current_continuity_transition_jwt": "<compact-signed-continuity-transition-jwt-7>"
        }
      }
    }
  },
  "signature": "base64url-signature"
}
```

| Field | Purpose |
| --- | --- |
| `context_of_authority.position` | Identifies the root continuity position. |
| `context_of_authority.root_pca_jwt_hash` | Identifies the hash of the compact root_pca_jwt. |
| `context_of_authority.root_pca_jwt` | Carries the signed PCA JWT issued by the trusted authority. |
| `continuity_graph.current_position` | Identifies the current continuity position. |
| `continuity_graph.current_authority_hash` | Identifies the current authority hash. |
| `continuity_graph.transitions` | Carries the numbered transitions map. |

`current_authority_hash` is not stored inside each Continuity Transition JWT. It is the final authority hash declared by the PIC Continuity JWT and verified after materializing the authority from root_pca_jwt plus all valid transitions.

`root_pca_jwt_hash` and `current_authority_hash` belong to different hash domains.

`root_pca_jwt_hash` is an artifact hash: it is the hash of the compact root_pca_jwt.

`current_authority_hash` is an authority-state hash: it is the hash of the materialized Canonical Authority Map after applying all valid transitions.

They are not directly comparable. The verifier uses `root_pca_jwt_hash` to authenticate the root artifact and `current_authority_hash` to verify the final materialized authority state.

For PIC Profile 0.2, current_authority_hash equals the hash of the materialized Canonical Authority Map after all valid attenuations have been applied.

## Continuity Graph

The Continuity Graph starts from a trusted root_pca_jwt and carries a numbered sequence of signed Continuity Transition JWTs when continuity advances. Each transition proves causal continuity from its predecessor and may attenuate the authority represented by the root authority.

```text
PIC Continuity JWT
├── context_of_authority
│   ├── position
│   ├── root_pca_jwt_hash
│   └── root_pca_jwt
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

The rule is simple: transition positions must be contiguous.

For a graph with transitions, the first transition position must equal `context_of_authority.position + 1`.

For every later transition, its position must equal the previous transition position + 1.

No gaps are allowed.

For example, if the root continuity position is 4, then the valid transition positions are 5, 6, 7, and so on. A transitions map containing "5" and "7" without "6" is invalid.

The root continuity position is `context_of_authority.position`. `current_position` must equal the last transition position.

### Initial Continuity Graph

The initial PIC Continuity JWT may contain no transitions.

In this case, transitions is empty.

In that case:

- `context_of_authority.position` is the root continuity position;
- `continuity_graph.current_position` equals `context_of_authority.position`;
- `continuity_graph.transitions` is empty;
- `continuity_graph.current_authority_hash` equals the hash of the root PCA JWT's Canonical Authority Map;
- no Continuity Transition JWT is required yet;
- the root PCA JWT challenge initializes the first future transition.

```json
{
  "context_of_authority": {
    "position": 0,
    "root_pca_jwt_hash": "sha256:root-pca-jwt-0",
    "root_pca_jwt": "<compact-signed-pic-pca-jwt-0>"
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

Its `position` identifies this transition's position in the continuity sequence.

The signing algorithms supported for Continuity Transition JWTs are advertised by PIC-X through `continuity.transition_signing_alg_values_supported` in the discovery document.

Decoded Continuity Transition JWT example, shown for readability

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

    "predecessor_hash": "sha256:root-pca-jwt-4",

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

For the first transition after the root authority, predecessor_hash equals context_of_authority.root_pca_jwt_hash. For every later transition, predecessor_hash equals the previous transition's current_continuity_transition_hash.

```text
transition["5"].payload.predecessor_hash
=
context_of_authority.root_pca_jwt_hash
```

For later transitions:

```text
transition["6"].payload.predecessor_hash
=
transition["5"].current_continuity_transition_hash
```

The transition hash is always:

```text
hash(compact current_continuity_transition_jwt) = current_continuity_transition_hash
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

When the selected decentralized continuity profile allows holder-signed PIC Continuity JWTs, the relationship between the outer PIC Continuity JWT signing key and `proof_of_relationship` is defined by that continuity profile. PIC Profile 0.2 does not define delegated holder-signing keys in this article.

## Verification

1. Verify the PIC Continuity JWT signature according to the signer acceptance rules of the selected continuity mode.
2. Read `context_of_authority.root_pca_jwt`.
3. Verify the `root_pca_jwt` as a PCA JWT.
4. Verify that `hash(compact root_pca_jwt)` equals `context_of_authority.root_pca_jwt_hash`.
5. Extract the root continuity position, root challenge, and root Canonical Authority Map from the PCA JWT.
6. Materialize the root Canonical Authority Map.
7. If `continuity_graph.transitions` is empty:
   - verify `continuity_graph.current_position` equals `context_of_authority.position`;
   - verify `continuity_graph.current_authority_hash` equals the hash of the root Canonical Authority Map;
   - stop transition verification successfully.
8. If `continuity_graph.transitions` is not empty:
   - sort `continuity_graph.transitions` by numeric key;
   - verify that transition positions are contiguous;
   - verify that the first transition position equals `context_of_authority.position + 1`.
9. For each transition:
   - verify the Continuity Transition JWT signature;
   - verify `hash(compact transition JWT)` equals `current_continuity_transition_hash`;
   - verify `payload.position` equals the numeric transition key;
   - verify `predecessor_hash` equals `context_of_authority.root_pca_jwt_hash` for the first transition;
   - verify `predecessor_hash` equals the previous transition's `current_continuity_transition_hash` for later transitions;
   - verify the first transition's `challenge.previous_challenge` equals `root_pca_jwt.payload.challenge.next_challenge`;
   - verify every later transition's `challenge.previous_challenge` equals the previous transition's `challenge.next_challenge`;
   - verify `proof_of_relationship` over `predecessor_hash`, `challenge.previous_challenge`, `challenge.next_challenge`, and `position`;
   - apply attenuations to the materialized Canonical Authority Map;
   - verify non-expansion of authority.
10. Verify `continuity_graph.current_position` equals the last transition position.
11. Verify that `continuity_graph.current_authority_hash` equals the hash of the materialized Canonical Authority Map after all valid attenuations have been applied.

## Continuity Modes

The central PIC-X authority issues the initial PCA JWT. That PCA JWT becomes the root_pca_jwt.

After that, continuity may be advanced through the selected continuity mode.

In centralized continuity, PIC-X validates and issues the next PIC Continuity JWT.

In decentralized continuity, other nodes may be allowed to produce Continuity Transition JWTs and update the Continuity Graph according to profile rules.

For decentralized continuity, PIC-X discovery advertises the configured `max_subchain_length` that limits consecutive holder-signed Continuity Transition JWTs at the tail of the current Continuity Graph. The count starts after the most recent trusted-central Transition JWT, or after the root PCA JWT when no such central transition exists. This does not change the common JWT structures defined here.

This is why PCA JWT cannot replace PIC Continuity JWT as the only artifact. PCA JWT is the signed root authority artifact. PIC Continuity JWT is the transport artifact that carries the root and the Continuity Graph.

This article defines the common artifacts only. The detailed rules for central-issued continuity, holder-signed subchains, proof_of_relationship-bound outer signatures, consecutive holder-key reuse, compaction, snapshot / re-root behavior, and advanced central re-issuance policy beyond basic same-state re-signing are deferred to a dedicated continuity-mode article.

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
