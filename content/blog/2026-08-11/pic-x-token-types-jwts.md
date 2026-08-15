+++
author = "Nicola Gallo"
title = "Designing PIC-X: PIC Token JWT and COSE Artifacts"
date = "2026-08-11T09:00:00+02:00"
description = "This article defines the PIC Token JWT and native COSE artifacts used by PIC Profile 0.2: PIC PCA COSE, PIC Continuity COSE, and PIC Continuity Transition COSE."
tags = [
  "pic",
  "pic-x",
  "jwt",
  "cose",
  "continuity",
  "oauth",
  "security",
  "design"
]
+++

<figure class="post-banner">
  <img src="/images/2026-08-11/pic-x-token-types-jwts.png"
       alt="Designing PIC-X: PIC Token JWT and COSE Artifacts."
       loading="lazy">
  <figcaption>Designing PIC-X. PIC Token JWT and COSE Artifacts.</figcaption>
</figure>

PIC Profile 0.2 defines centralized PIC-X-mediated authority continuity.

The active profile is:

```text
https://pic-protocol.org/profiles/0.2
```

This article defines the external PIC Token JWT envelope and the native COSE artifacts used by that profile.

```text
OAuth access token + Initial Continuity Proposal
        |
        v
PIC-X
        |
        v
realm-signed PIC PCA COSE 0
        |
        v
realm-signed settled PIC Continuity COSE 0
        |
        v
realm-signed PIC Token JWT 0
```

Non-initial advancement is candidate-based:

```text
realm-signed PIC Token JWT N
└── realm-signed settled PIC Continuity COSE N
    ├── root.pca = exact signed PIC PCA COSE N bytes
    └── transitions = null

workload-signed candidate PIC Token JWT
└── workload-signed candidate PIC Continuity COSE
    ├── root.pca = exact signed PIC PCA COSE N bytes
    └── transitions = [
          workload-signed PIC Continuity Transition COSE N+1
        ]

PIC-X validates the candidate
        |
        v
realm-signed PIC Token JWT N+1
└── realm-signed settled PIC Continuity COSE N+1
    ├── root.pca = exact signed PIC PCA COSE N+1 bytes
    └── transitions = null
```

The accepted transition is materialized into the new PCA checkpoint. The settled Continuity does not carry accepted transitions forward.

## Protocol Definitions

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

| Protocol Object | Definition URI | Format | Type | Purpose |
| --- | --- | --- | --- | --- |
| PIC Token JWT | `https://pic-protocol.org/definitions/token-types/pic` | `pic+jwt` | JOSE `pic+jwt` | External OAuth-compatible envelope carrying `pic.root` and optional future `pic.compositions[]`. |
| PIC PCA COSE | None | `pic-pca+cose` | COSE_Sign1; `typ` deferred | Signed trusted authority checkpoint representation. |
| PIC Continuity COSE | None | `pic-continuity+cose` | COSE_Sign1; `typ` deferred | Signed continuity container carrying a trusted PCA checkpoint and either no proposed transitions (`null`) or a proposed transition chain. |
| PIC Continuity Transition COSE | None | `pic-continuity-transition+cose` | COSE_Sign1; `typ` deferred | Workload-signed causal authority transition. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Self-describing JSON proposal whose `type` is `https://pic-protocol.org/definitions/proposal-types/continuity-initial`; supplies initialization material, including `executionContract` in the flow described here. |

The COSE format values are PIC discovery format identifiers. Exact RFC 9596 COSE `typ` values, CBOR integer labels, byte-level canonical encodings, and exact serialized sizes are deferred.

## Terms

```text
PCA
→ logical authority context

PIC PCA COSE
→ signed trusted authority checkpoint representation

PIC Continuity COSE
→ signed continuity container carrying a trusted PCA checkpoint
  and either no proposed transitions (`null`) or a proposed transition chain

PIC Continuity Transition COSE
→ workload-signed causal authority transition

candidate
→ workload-produced proposal awaiting PIC-X validation

settled
→ PIC-X/trusted-authority accepted checkpoint state
```

`root.pca` means the exact signed PIC PCA COSE bytes for the current trusted checkpoint carried by that Continuity. It is not permanently the initial genesis checkpoint: after advancement, `root.pca` changes from PIC PCA COSE N to PIC PCA COSE N+1.

## Signer Roles

| Artifact | Candidate / workload-produced | Settled / trusted |
| --- | --- | --- |
| PIC Token JWT | workload-signed | realm-signed |
| PIC PCA COSE | normally not workload-produced in Profile 0.2 centralized flow | realm-signed checkpoint |
| PIC Continuity COSE | workload-signed candidate | realm-signed settled |
| PIC Continuity Transition COSE | workload-signed | not carried as a settled transition after checkpointing |

The workload uses the private key corresponding to the verification key or key identity accepted from its issuer-signed SD-JWT Proof of Relationship evidence. The same workload key intentionally signs the candidate PIC Token JWT, the candidate PIC Continuity COSE, and the PIC Continuity Transition COSE. These are distinct protocol objects with distinct verification boundaries, not duplicate signatures over the same object.

PIC-X, acting for the selected realm, uses the realm signing authority for the new PIC PCA COSE checkpoint, settled PIC Continuity COSE, and settled PIC Token JWT after successful centralized validation.

## Serialization

PIC Profile 0.2 uses:

```text
PIC Token JWT
→ JWT/JWS envelope

PIC PCA COSE
PIC Continuity COSE
PIC Continuity Transition COSE
→ native CBOR/COSE COSE_Sign1
```

CDDL below describes the CBOR data model. CBOR Diagnostic Notation examples are readable documentation views only.

Inside native CBOR/COSE, hashes, challenges, bitmaps, signatures, and nested COSE artifacts are byte strings. Base64url encoding is used only when binary COSE bytes cross the JSON/JWT boundary.

Profile 0.2 signed-artifact references use SHA-256 over the exact signed artifact bytes. Do not hash decoded payloads, CBOR Diagnostic Notation, JSON, YAML, Base64url text, or re-serialized structures.

## PIC Token JWT

Purpose:

```text
external envelope carrying PIC Continuity COSE bytes
```

Settled PIC Token JWT payload shape:

```json
{
  "iss": "http://127.0.0.1:5556/realms/acme",
  "sub": "pic-execution-123",
  "aud": "payment-service",
  "iat": 1786422000,
  "exp": 1786425600,
  "jti": "pic-token-01J1...",
  "profile": "https://pic-protocol.org/profiles/0.2",
  "pic": {
    "root": "base64url-exact-pic-continuity-cose-bytes",
    "compositions": [
      "base64url-exact-additional-pic-continuity-cose-bytes"
    ]
  }
}
```

`pic.root` is the unpadded Base64url encoding of exact PIC Continuity COSE bytes. `pic.compositions[]` is reserved for future composition and is not defined by Profile 0.2 processing here.

Signer semantics are role-sensitive:

```text
candidate PIC Token JWT
→ workload-signed
→ carries candidate PIC Continuity COSE
→ `iss` optional in centralized Profile 0.2
→ not trusted settled continuity

settled PIC Token JWT
→ realm-signed
→ `iss` identifies the realm issuer
→ carries settled PIC Continuity COSE
→ trusted after normal signature, revocation, and policy validation
```

The same `pic+jwt` format can carry either role. The role is determined by the exchange context, signer, and validation rules; no additional token type is introduced here.

For a workload-signed candidate PIC Token JWT, `iss` is identity metadata, not the source of cryptographic trust. If the accepted SD-JWT PoR evidence provides a suitable producer identifier, that identifier may be used as `iss`; otherwise the claim is omitted. Do not encode an empty string. The workload verification key accepted through PoR validation is what verifies the candidate signatures.

## Logical and Canonical Authority

A PCA is the logical authority context. In Profile 0.2, a PIC PCA COSE carries a canonical Indexed Authority Map.

Logical form:

```json
{
  "identity_context": {
    "type": "user",
    "id": "user-123",
    "roles": [
      "payment-approver"
    ],
    "groups": [
      "finance"
    ],
    "securityDomain": "tenant-a"
  },
  "execution": {
    "invariants": [
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

`identity_context` is optional and descriptive. Authority remains in `execution.invariants`; execution restrictions remain in `execution.contract`.

Canonical sections:

```text
identity_context
invariants
execution_contract
```

Profile 0.2 uses section-local numeric indexes starting at `0`. Initial index assignment is deterministic:

```text
identity_context and execution_contract
→ denormalize collection membership
→ sort by canonical key using Unicode code point order
→ assign indexes

invariants
→ sort by scope, operation, resourceType, resourceId
→ assign indexes
```

Example Indexed Authority Map:

```cbor-diag
{
  "identity_context": {
    0: ["groups:finance", true],
    1: ["id", "user-123"],
    2: ["roles:payment-approver", true],
    3: ["securityDomain", "tenant-a"],
    4: ["type", "user"]
  },

  "invariants": {
    0: ["payments:approve", "approve", "payments", "*"]
  },

  "execution_contract": {
    0: ["currency", "EUR"],
    1: ["purpose", "payment-approval"]
  }
}
```

## PIC PCA COSE

Purpose:

```text
signed trusted authority checkpoint representation
```

Payload model:

```cddl
pic-pca-payload = {
  profile: tstr,
  position: uint,
  context_of_authority: indexed-authority-map,
  challenge: {
    next_challenge: bstr
  }
}
```

Rules:

```text
initial PCA
→ position = 0

later checkpoint PCA
→ position > 0 allowed
→ position is the trusted materialized checkpoint position
→ challenge.next_challenge is the challenge state for the next transition
```

Initial PCA 0:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 0,
  "context_of_authority": {
    "identity_context": {
      0: ["id", "user-123"],
      1: ["type", "user"]
    },
    "invariants": {
      0: ["payments:approve", "approve", "payments", "*"]
    },
    "execution_contract": {
      0: ["purpose", "payment-approval"]
    }
  },
  "challenge": {
    "next_challenge": h'0123456789abcdef'
  }
}
```

New PCA 1 after checkpointing:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 1,
  "context_of_authority": {
    "...": "...materialized authority after accepted transition..."
  },
  "challenge": {
    "next_challenge": h'5555666677778888'
  }
}
```

PIC-X creates logical PCA N+1 in the selected realm context by validating the candidate chain, applying accepted attenuation and restrictions to PCA N authority, preserving non-expansion, then serializes and signs that resulting checkpoint as PIC PCA COSE N+1 with the realm signing authority.

## PIC Continuity COSE

Purpose:

```text
signed continuity container carrying a trusted PCA checkpoint
and either no proposed transitions or a proposed transition chain
```

Payload model:

```cddl
pic-continuity-payload = {
  profile: tstr,

  root: {
    pca_hash: bstr,
    pca: bstr
  },

  transitions: null / [+ bstr]
}
```

`root.pca` contains the exact signed PIC PCA COSE bytes. `root.pca_hash` is:

```text
SHA-256(exact signed root.pca PIC PCA COSE bytes)
```

The digest is a compact cryptographic identifier of the current PCA checkpoint, useful for comparison, lookup, indexing, cache correlation, and revocation correlation. It remains derivable from `root.pca`, but verifiers MUST recompute it and MUST still verify `root.pca` as a signed PIC PCA COSE.

`transitions` is always semantically present:

```text
transitions = null
→ settled continuity / no pending advancement

transitions = [ ... ]
→ candidate continuity with an ordered proposed transition chain
```

Profile 0.2 centralized rules:

```text
settled Continuity
→ transitions MUST be null

candidate Continuity
→ transitions MUST be an array of exactly one PIC Continuity Transition COSE
```

Future profiles may define support for more than one ordered transition in the array. Profile 0.2 does not. Transitions are not an Indexed Authority Map section: no Profile 0.2 bitmap or protocol operation addresses transitions by section-local map index, and each Transition already carries its own `position` and predecessor relationship.

Settled Continuity 0:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "root": {
    "pca_hash": h'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    "pca": h'd28443a10126a0'
  },
  "transitions": null
}
```

Candidate Continuity:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "root": {
    "pca_hash": h'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    "pca": h'd28443a10126a0'
  },
  "transitions": [
    h'd2845901a10126a0'
  ]
}
```

The short `pca` and transition byte strings above are illustrative placeholders, not complete COSE encodings.

Settled Continuity 1 after checkpointing:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "root": {
    "pca_hash": h'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    "pca": h'd28443a10126b1'
  },
  "transitions": null
}
```

PIC Continuity COSE has no `position` field and no `challenge` field. Position and challenge state belong to PCA checkpoints and transitions.

## PIC Continuity Transition COSE

Purpose:

```text
workload-signed causal authority transition
```

Payload model:

```cddl
canonical-value = tstr / true

execution-contract-addition = [
  tstr,
  canonical-value
]

proof-of-relationship = {
  type: tstr,
  evidence: bstr
}

pic-continuity-transition-payload = {
  profile: tstr,
  position: uint,

  predecessor: {
    type: tstr,
    hash: bstr
  },

  challenge: {
    previous_challenge: bstr,
    next_challenge: bstr
  },

  ? attenuations: {
    ? identity_context: {
      remove_bitmap: bstr
    },

    ? invariants: {
      remove_bitmap: bstr
    },

    ? execution_contract: {
      additions: [+ execution-contract-addition]
    }
  },

  proof_of_relationship: proof-of-relationship,
  ? request_digest: bstr,
  ? executor_evidence: any
}
```

Profile 0.2 centralized predecessor rules:

```text
predecessor.type MUST be "pca"

predecessor.hash
MUST equal SHA-256(exact signed current `root.pca` PIC PCA COSE bytes)
```

Future decentralized profiles may allow:

```text
predecessor.type = "transition"
predecessor.hash = SHA-256(exact signed predecessor PIC Continuity Transition COSE bytes)
```

Transition 1:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 1,

  "predecessor": {
    "type": "pca",
    "hash": h'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  },

  "challenge": {
    "previous_challenge": h'0123456789abcdef',
    "next_challenge": h'5555666677778888'
  },

  "attenuations": {
    "identity_context": {
      "remove_bitmap": h'04'
    },
    "invariants": {
      "remove_bitmap": h'02'
    },
    "execution_contract": {
      "additions": [
        ["region", "EU"]
      ]
    }
  },

  "proof_of_relationship": {
    "type": "sd-jwt",
    "evidence": h'73642d6a77742d70726573656e746174696f6e'
  }
}
```

The `proof_of_relationship.evidence` byte string shown above is an illustrative placeholder for the exact UTF-8 bytes of a real issuer-signed Profile 0.2 SD-JWT presentation. The `proof_of_relationship.type` value `"sd-jwt"` identifies how those bytes are parsed and validated. It is not a complete valid SD-JWT example.

## Challenge And Position

Position belongs to PCA checkpoints and transitions, not to Continuity.

```text
PCA N
├── position = N
└── challenge.next_challenge = Cn

Transition N+1
├── position = N+1
├── predecessor.type = "pca" in Profile 0.2
├── predecessor.hash = SHA-256(exact signed PIC PCA COSE N bytes)
├── challenge.previous_challenge = Cn
└── challenge.next_challenge = Cn+1

PCA N+1
├── position = N+1
├── authority = apply(authority(PCA N), accepted Transition N+1)
└── challenge.next_challenge = Cn+1
```

Validation:

```text
Transition.position
MUST equal current PCA.position + 1

Transition.challenge.previous_challenge
MUST equal current PCA.challenge.next_challenge

new PCA.position
MUST equal accepted Transition.position

new PCA.challenge.next_challenge
MUST equal accepted Transition.challenge.next_challenge
```

Position monotonicity is per lineage, not globally unique. Two sibling branches from the same PCA checkpoint may both propose position N+1 with the same `challenge.previous_challenge`; the challenge binds the Transition to the stated predecessor's challenge state, not to a global single-use counter.

Sibling branches are an intentional property of the centralized profile, not a validation gap. They support fan-out and worker-pool patterns in which the successor is unknown when the settled token is emitted: each branch continues the predecessor individually, subject to the full Profile 0.2 advancement validation, and no branch imports or recovers authority from another branch. The residual risk — an unintended eligible workload advancing a disclosed token — is bounded by the realm trust policy, execution-contract conformance, applicable temporal and freshness bounds, revocation, and deployment-level confidentiality of token delivery.

## Attenuation And Contract Additions

Authority continuity must not expand authority:

```text
new authority ⊆ previous authority
```

Removal attenuation uses section-local bitmaps:

```text
attenuations.identity_context.remove_bitmap
attenuations.invariants.remove_bitmap
```

For section-local index `i`:

```text
byte_index = floor(i / 8)
bit_index  = i mod 8
mask       = 1 << bit_index
```

Bits are least-significant-bit first:

```text
index 0 → h'01'
index 1 → h'02'
index 2 → h'04'
index 7 → h'80'
index 8 → h'0001'
```

A set bit for a non-existent predecessor index is invalid. Trailing zero bytes MUST be omitted. A no-op bitmap SHOULD be omitted together with its optional attenuation member.

Execution-contract restrictions are monotonic additions:

```text
attenuations.execution_contract.additions
→ canonical [key, value] tuple constraints
→ duplicate canonical keys in one transition are invalid
→ accepted additions are sorted by canonical key
→ PIC-X assigns section-local indexes after validation
→ all constraints are combined with logical AND
```

Existing execution-contract constraints MUST NOT be removed, replaced, or weakened.

When PIC-X creates PCA N+1, the new PCA contains the materialized resulting authority after accepted attenuation and restrictions. The current authority is represented by the latest trusted PCA checkpoint, not by a hidden cumulative state object.

## Proof Of Relationship

Profile 0.2 uses an issuer-signed SD-JWT presentation as the Proof of Relationship evidence carried inside `proof_of_relationship`.

```text
proof_of_relationship
→ typed container

proof_of_relationship.type
→ "sd-jwt"
→ identifies how proof_of_relationship.evidence is parsed and validated

proof_of_relationship.evidence
→ bstr
→ exact UTF-8 bytes of issuer-signed Profile 0.2 SD-JWT presentation
```

Future profiles may define additional Proof of Relationship types, but this article defines only `"sd-jwt"`.

Profile 0.2 `proof_of_relationship` carries relationship evidence; it does not designate the successor. It provides profile-selected evidence from which the verifier validates the accepted issuer/schema relationship and obtains or identifies the PoR-bound workload verification key. The advancing workload then proves control of that key through the required workload signatures. The PoR relation does not prove that the predecessor selected this specific workload as its successor, and it does not by itself establish execution-contract conformance: conformance, non-expansion, request binding, revocation, and policy remain separate validation steps, which may consume attributes disclosed in the PoR evidence. Successor-designating advancement — for example, a profile-defined mechanism that selectively transfers freshness material to a chosen successor — may be defined by a future profile for point-to-point handoffs.

No separate SD-JWT Key Binding JWT (KB-JWT) is required for continuity advancement.

The selected Profile 0.2 SD-JWT schema MUST bind or identify the workload verification key. The exact claim or disclosure used to carry or identify that key is schema-defined here; this article does not invent a claim name.

Signature roles:

```text
SD-JWT issuer signature
→ authenticates the PoR credential and disclosed/bound workload key material

PIC Continuity Transition COSE workload signature
→ proves possession/control of the PoR-bound workload private key
→ authenticates the workload that produced the proposed Transition

candidate PIC Continuity COSE and candidate PIC Token JWT workload signatures
→ authenticate the workload-produced candidate containers

realm signatures
→ certify successful centralized validation and checkpointing
```

The signed Transition payload binds the workload key to predecessor, challenge values, position, attenuation, optional request binding, and optional executor evidence. Do not duplicate predecessor hash, challenge values, or position inside the SD-JWT unless a selected schema explicitly requires it.

The Transition signature is proof of key control, not continuity by itself. Continuity validation is the complete causal validation relationship: trusted predecessor, predecessor hash, per-lineage position progression, challenge continuity, validated SD-JWT PoR, workload signature, attenuation/non-expansion, request/evidence checks when required, revocation, and local policy.

`proof_of_relationship.evidence` is evidence for the relationship and workload-key binding selected by `proof_of_relationship.type`. `executor_evidence` remains separate runtime, execution, or conformance evidence when required. PoR alone does not prove runtime behavior or execution-contract conformance.

The configured PoR issuer/schema and concrete relationship checks are assumed to soundly witness the abstract single-hop PoR relation. The PIC model and Lean refinement prove safety under that bridge assumption; they do not prove the cryptographic soundness of a deployment-specific SD-JWT, issuer, runtime, or attestation construction.

## Centralized Advancement

Profile 0.2 centralized advancement accepts one transition per candidate.

Validation and checkpointing:

```text
1. receive candidate PIC Token JWT as untrusted input
2. parse JWT structure without accepting authenticity
3. obtain `pic.root` as untrusted candidate PIC Continuity COSE bytes
4. parse candidate Continuity without accepting authenticity
5. check untrusted Continuity shape: `root.pca`, `root.pca_hash`, and `transitions`
6. require `transitions` to contain exactly one transition
7. decode that PIC Continuity Transition COSE as untrusted input
8. extract `proof_of_relationship`, validate `proof_of_relationship.type`, and require `"sd-jwt"` for current Profile 0.2
9. parse `proof_of_relationship.evidence` as issuer-signed Profile 0.2 SD-JWT presentation bytes
10. validate the SD-JWT issuer signature and issuer trust
11. validate required PoR disclosures and claims
12. obtain or resolve the workload verification key or key identity accepted from PoR
13. verify the Transition COSE signature using that workload key
14. verify the candidate Continuity COSE signature using the same workload key
15. verify the candidate PIC Token JWT signature using the same workload key
16. verify signer consistency across candidate JWT, candidate Continuity, and Transition
17. verify `root.pca` as the exact signed PIC PCA COSE bytes for the currently trusted checkpoint
18. verify SHA-256(exact signed root.pca PIC PCA COSE bytes) == root.pca_hash
19. verify Transition.position = PCA.position + 1
20. verify predecessor.type = "pca"
21. verify predecessor.hash = SHA-256(exact signed predecessor PIC PCA COSE bytes)
22. verify Transition.challenge.previous_challenge = PCA.challenge.next_challenge
23. validate Transition.challenge.next_challenge
24. validate attenuation bitmaps
25. validate execution-contract additions
26. validate request/execution binding when required
27. validate executor evidence/conformance when required
28. validate authority non-expansion
29. validate revocation and local policy
30. materialize the new authority
31. create new PCA with position = Transition.position
32. set new PCA.challenge.next_challenge = Transition.challenge.next_challenge
33. serialize and sign the new PCA as a PIC PCA COSE with the selected realm signing authority
34. create the new settled Continuity with root.pca = exact signed new PIC PCA COSE bytes, root.pca_hash = SHA-256(exact signed new PIC PCA COSE bytes), and transitions = null
35. sign settled Continuity with the selected realm signing authority
36. create and sign new settled PIC Token JWT with the selected realm signing authority
```

This is checkpointing/compaction:

```text
validate candidate chain
→ materialize resulting authority
→ checkpoint into new PCA
→ clear transitions to null
→ issue new settled token
```

PIC-X validates the specific lineage it checkpoints in the selected realm context. In Profile 0.2 that lineage is the current trusted PIC PCA COSE checkpoint artifact plus exactly one Transition. The realm signature on the new PIC PCA COSE certifies validation of that selected lineage, and the settled Continuity contains only the new root PIC PCA COSE checkpoint artifact with `transitions = null`; previous PCA and Transition artifacts do not remain embedded. A sibling branch from the same predecessor does not automatically invalidate the selected branch.

PIC-to-PIC advancement uses RFC 8693 Token Exchange with the workload-signed candidate PIC Token JWT as the standard `subject_token`:

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<workload-signed-candidate-pic-token-jwt>
&subject_token_type=https://pic-protocol.org/definitions/token-types/pic
&requested_token_type=https://pic-protocol.org/definitions/token-types/pic
```

Current Profile 0.2 omits `continuity_proposal` for PIC-to-PIC advancement. Future profiles may define additional self-describing Continuity Proposal types with their own definition URIs and schemas without making them the Transition or the candidate token.

## Future Decentralized Chains

Profile 0.2 centralized:

```text
candidate Continuity.transitions
→ exactly one transition

Transition.predecessor.type
→ "pca"

candidate PIC Token JWT `iss`
→ optional
```

Future decentralized profiles may allow:

```text
PCA checkpoint K
   ↓
Transition K+1
   ↓
Transition K+2
   ↓
Transition K+3
   ↓
checkpoint / compaction
   ↓
new PCA checkpoint M
```

In that model, `transitions` may contain multiple transitions as an ordered array, and `predecessor.type = "transition"` may point to the exact signed predecessor Transition COSE bytes. Periodic trusted checkpointing can compact a validated subchain into a new PCA whose `position` is the highest accepted transition position. This article does not define decentralized Profile 0.2 behavior.

Future decentralized profiles are expected to require explicit producer identification for independently attributable chained artifacts. The exact identifier claim or schema remains future-profile-defined.

Conflict-resolution, fork-selection, merge, and replay-defense policies are future-profile-defined.

## References

### External References

- [RFC 7519 - JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 9068 - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [RFC 8949 - Concise Binary Object Representation (CBOR)](https://www.rfc-editor.org/rfc/rfc8949)
- [RFC 8610 - Concise Data Definition Language (CDDL)](https://www.rfc-editor.org/rfc/rfc8610)
- [RFC 9052 - CBOR Object Signing and Encryption (COSE): Structures and Process](https://www.rfc-editor.org/rfc/rfc9052)
- [RFC 9596 - COSE "typ" (type) Header Parameter](https://www.rfc-editor.org/rfc/rfc9596)
- [PIC Protocol](https://www.pic-protocol.org/)
- [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)

### PIC-X Series

- [Designing PIC-X: From Specification to Architecture](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/)
- [Designing PIC-X: The .well-known Configuration](/blog/2026-08-01/pic-x-well-known-config/)
