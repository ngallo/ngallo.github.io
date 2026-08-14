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

PIC Profile 0.2 defines centralized PIC-X-mediated continuity advancement.

The active PIC profile is:

```text
https://pic-protocol.org/profiles/0.2
```

This article defines the external PIC Token JWT envelope and the native COSE artifacts for that profile.

Initialization is separate from non-initial continuity advancement:

```text
OAuth access token
+
Initial Continuity Proposal
→ PIC-X
→ PIC PCA COSE 0
→ PIC Continuity COSE 0
→ PIC Token JWT 0
```

Non-initial continuity advancement uses the current trusted continuity artifact:

```text
trusted PIC Token JWT N
with `pic.root` = PIC Continuity COSE N
        |
        | workload proposes exactly one advancement
        v
workload-signed PIC Continuity Transition COSE N+1
        |
        | PIC-X continuity advancement exchange
        | using the PIC OAuth Token Exchange profile
        v
PIC-X validates the previous token, continuity, and single proposed transition
        |
        v
PIC-X-issued PIC Token JWT N+1
with `pic.root` = settled PIC Continuity COSE N+1
```

A **PCA** is the logical Context of Authority.

A **PIC Token JWT** is the external OAuth-compatible transport envelope. Its `pic.root` member carries the current root PIC Continuity COSE. Its optional `pic.compositions[]` member may carry additional current PIC Continuity COSE artifacts for future composition.

A **PIC PCA COSE** is the trusted signed root authority representation.

A **PIC Continuity COSE** is the signed continuity artifact. When issued by PIC-X, it is the trusted settled continuity artifact carried by a PIC Token JWT.

A **PIC Continuity Transition COSE** is one workload-signed proposed causal advancement from the currently trusted PIC Continuity COSE to the next state.

PIC Profile 0.2 defines only centralized PIC-X-mediated continuity advancement.

## PIC Artifact Registry

PIC currently defines one external PIC Token JWT, three internal COSE artifacts, and two Continuity Proposal type identifiers used by the PIC Token Exchange Profile.

Definition URIs are stable semantic protocol identifiers. They identify protocol concepts and are not required to resolve to a retrievable web resource.

This registry maps the identifiers advertised by `.well-known/pic-x-configuration` to the protocol artifacts defined in this article.

| Artifact | Definition URI | Format | Type | Purpose |
| --- | --- | --- | --- | --- |
| PIC Token JWT | `https://pic-protocol.org/definitions/token-types/pic` | `pic+jwt` | JOSE `pic+jwt` | External OAuth-compatible transport envelope. |
| PIC PCA COSE | None | `pic-pca+cose` | COSE_Sign1; `typ` deferred | Trusted signed root authority representation. |
| PIC Continuity COSE | None | `pic-continuity+cose` | COSE_Sign1; `typ` deferred | Trusted settled continuity artifact when issued by PIC-X. |
| PIC Continuity Transition COSE | None | `pic-continuity-transition+cose` | COSE_Sign1; `typ` deferred | Workload-signed artifact for one proposed continuity advancement. |
| Initial Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity-initial` | `application/json` | `N_A` | Supplies initialization material, including the execution contract. |
| Continuity Proposal | `https://pic-protocol.org/definitions/proposal-types/continuity` | `application/json` | `N_A` | Supplies centralized advancement support material when required by the selected profile/schema. |

The `pic-pca+cose`, `pic-continuity+cose`, and `pic-continuity-transition+cose` values are PIC discovery format identifiers. They are not finalized RFC 9596 COSE `typ` values.

When proposal JSON is transported to PIC-X, it uses the `continuity_proposal` parameter as compact UTF-8 JSON encoded with unpadded Base64url.

An Initial Continuity Proposal is used before PIC continuity exists. It supplies initialization material, including `executionContract` in the flow described here. A Continuity Proposal is optional profile-defined support material for centralized advancement when required by the selected Profile 0.2 schema; it is not the PIC Token JWT, the PIC Continuity Transition COSE, or the settled PIC Continuity COSE.

## JWT and COSE Serialization

PIC Profile 0.2 uses a JWT/JWS envelope for the external PIC Token JWT and native CBOR/COSE for the internal PIC artifacts.

PIC PCA, Continuity, and Continuity Transition artifacts are binary CBOR/COSE objects. CDDL is used below to describe their CBOR data model, while CBOR Diagnostic Notation is used for readable examples. Diagnostic notation is documentation/debugging syntax only and is not the wire representation.

The PIC Token JWT is the compatibility and transport envelope. It must not duplicate PIC authority, attenuation, challenge, or executor-evidence fields at the JWT envelope level.

Decoded/decomposed PIC Token JWT/JWS view, shown for readability:

```json
{
  "header": {
    "typ": "pic+jwt",
    "alg": "ES256",
    "kid": "pic-x-es256-2026-08"
  },
  "payload": {
    "iss": "http://127.0.0.1:5556/pic-x",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "iat": 1786484040,
    "jti": "urn:uuid:pic-token-0",
    "pic": {
      "root": "base64url-pic-continuity-cose",
      "compositions": [
        "base64url-pic-continuity-cose-a",
        "base64url-pic-continuity-cose-b"
      ]
    }
  },
  "signature": "base64url-signature"
}
```

`pic.root` is the unpadded Base64url encoding of the exact current main/root PIC Continuity COSE bytes. `pic.compositions` is optional; when present, each value is the unpadded Base64url encoding of the exact corresponding PIC Continuity COSE bytes. Profile 0.2 does not define a separate signed composition artifact, and composed authorities are not represented by bare PCA artifacts.

The internal artifacts are native CBOR/COSE:

```text
PIC PCA COSE
PIC Continuity COSE
PIC Continuity Transition COSE
```

Each internal signed PIC artifact is a COSE_Sign1 object. RFC 9052 models COSE_Sign1 as a CBOR array containing protected headers, unprotected headers, payload, and signature. Protected headers are encoded into a byte string, unprotected headers are a CBOR map, payload is a byte string or nil, and signature is a byte string.

COSE header parameters such as `alg`, `kid`, and optional `typ` are distinct from PIC payload map keys. Exact RFC 9596 COSE `typ` values are deferred until PIC defines valid media-type or registered Content-Format identifiers. The concrete examples below therefore describe payloads and omit finalized COSE `typ` values.

Inside native CBOR/COSE, hashes, challenges, bitmaps, signatures, and nested COSE artifacts are byte strings. Base64url encoding is used only when binary COSE bytes cross the JSON/JWT boundary.

Artifact hashes over the PIC Token JWT are computed over the UTF-8 bytes of the compact serialized JWT. Artifact hashes over COSE values are computed over the native signed COSE artifact bytes, not over the decoded readable view.

The examples in this article do not define integer CBOR labels, byte-level CBOR encoding, COSE content-type values, or exact serialized sizes.

Future profiles may define additional serialization details only when their signature, canonicalization, hashing, and transport rules are explicitly defined.

## Logical and Canonical Authority

The Logical Context of Authority is application-facing.

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

`identity_context` is optional. A valid PCA may contain only `execution`.

`identity_context.type` identifies the kind of identity or context, such as `user`, `workload`, `service`, `agent`, or `device`. It is descriptive and does not grant authority. Authority remains exclusively in `execution.invariants`; execution restrictions remain in `execution.contract`.

For signing and hashing, the Logical Context of Authority is transformed into a canonical PCA representation according to the selected profile. In PIC Profile 0.2, the PIC PCA COSE `context_of_authority` contains an Indexed Authority Map, not the normalized Logical Context of Authority directly.

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
PIC PCA COSE
```

Profile 0.2 uses section-local numeric indexes starting at `0`. Initial index assignment is deterministic and is separate from canonical serialization of an already indexed map. Implementations first denormalize the Logical Context of Authority into canonical tuple candidates, sort those candidates within each section, then assign section-local indexes `0`, `1`, `2`, and so on.

For `identity_context` and `execution_contract`, each indexed entry is `[key, value]`. For `invariants`, each indexed entry is `[scope, operation, resourceType, resourceId]`.

For initial index assignment, `identity_context` and `execution_contract` candidates are sorted lexicographically by canonical `key`, using Unicode code point order. Collection memberships are denormalized before sorting; each member becomes its own `[key, true]` tuple, and the final canonical membership key determines its position. `true` is used only to represent presence in a denormalized collection-membership entry. Scalar string entries retain their string value. Profile 0.2 defines no false-valued membership semantics.

For `invariants`, candidates are sorted lexicographically by tuple elements in this order: `scope`, `operation`, `resourceType`, `resourceId`, using Unicode code point order for each element.

The entry addressed by removal bitmaps is `(section, numeric index)`, for example `identity_context/0` or `invariants/1`; JSON object member order has no protocol meaning.

The following CBOR Diagnostic Notation example shows the native Indexed Authority Map with numeric map keys for section indexes:

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
    0: ["payments:approve", "approve", "payments", "*"],
    1: ["payments:read", "read", "payments", "*"]
  },

  "execution_contract": {
    0: ["currency", "EUR"],
    1: ["departments:finance", true],
    2: ["purpose", "payment-approval"]
  }
}
```

Logical `execution.contract` maps to the flattened canonical `execution_contract` section.

`identity_context`, `invariants`, and `execution_contract` are all indexed and canonicalized. Indexing does not mean all sections use removal attenuation.

Scalar logical values become one indexed entry. Set or list membership is denormalized so that each member becomes its own indexed boolean entry.

Artifact identity and authority-state identity are different domains.

```text
hash(signed artifact bytes)
→ cryptographic identity of the signed artifact

hash(canonical/materialized authority state)
→ conceptual, profile-dependent identity of the resulting authority state
```

They are not directly comparable.

> **Design note:** The cryptographic hash algorithm used for signed-artifact references is selected by the active PIC profile and MUST be unambiguous for that profile. These articles define the exact byte input for signed-artifact references, but Profile 0.2 does not yet assign the hash algorithm here. Interoperable implementations require the selected Profile 0.2 schema/specification to assign one unambiguous algorithm before these references are used on the wire.

Profile 0.2 defines the deterministic canonical structure and ordering of the materialized Indexed Authority Map: sections are ordered as `identity_context`, `invariants`, then `execution_contract`, and entries within each section are ordered by ascending numeric index. JSON object member order has no semantic meaning.

An interoperable cryptographic hash over the materialized authority state requires the selected profile/schema to define the exact byte serialization used as hash input. This article does not define that byte-level encoding.

## PIC Token JWT

Definition URI

```text
https://pic-protocol.org/definitions/token-types/pic
```

Format

```text
pic+jwt
```

JOSE typ

```text
pic+jwt
```

Purpose

```text
external OAuth-compatible PIC transport envelope
```

The PIC Token JWT is signed by PIC-X. It carries the current main/root PIC Continuity COSE in `pic.root`.

`pic.compositions` is optional. When present, each element is an additional independent current PIC Continuity COSE. Profile 0.2 does not define a separate signed composition artifact.

In the JWT payload, `pic.root` and each `pic.compositions[]` value are unpadded Base64url encodings of exact PIC Continuity COSE bytes.

Decoded/decomposed PIC Token JWT/JWS view, shown for readability

```json
{
  "header": {
    "typ": "pic+jwt",
    "alg": "ES256",
    "kid": "pic-x-es256-2026-08"
  },
  "payload": {
    "iss": "http://127.0.0.1:5556/pic-x",
    "profile": "https://pic-protocol.org/profiles/0.2",
    "iat": 1786484040,
    "jti": "urn:uuid:pic-token-0",

    "pic": {
      "root": "base64url-pic-continuity-cose-0",
      "compositions": [
        "base64url-pic-continuity-cose-a",
        "base64url-pic-continuity-cose-b"
      ]
    }
  },
  "signature": "base64url-signature"
}
```

| Claim | Purpose |
| --- | --- |
| `iss` | Identifies the PIC-X issuer. |
| `profile` | Identifies the active PIC profile. |
| `iat` | Records when the PIC Token JWT was issued. |
| `jti` | Identifies this PIC Token JWT instance for correlation and audit. |
| `pic.root` | Carries the current main/root PIC Continuity COSE. |
| `pic.compositions` | Optionally carries additional current PIC Continuity COSE artifacts. |

The PIC Token JWT signature protects the exact carried root and composition collection at the envelope level. It does not duplicate authority, attenuation, challenge, or executor-evidence fields from the COSE artifacts.

## PIC PCA COSE

Definition URI

```text
None
```

The current protocol does not define a Definition URI for PIC PCA COSE. PIC PCA COSE is currently identified by its advertised format. The exact COSE `typ` value is deferred.

Format

```text
pic-pca+cose
```

COSE structure

```text
COSE_Sign1; exact RFC 9596 typ value deferred
```

Purpose

```text
trusted signed root authority representation
```

The PIC PCA COSE is a COSE_Sign1 signed by a trusted authority.

The root PIC PCA COSE carries `position: 0` and the root challenge used to initialize the first future continuity transition.

The payload is carried as the payload byte string of the COSE_Sign1 object.

```cddl
canonical-value = tstr / true

indexed-authority-map = {
  ? identity_context: {
    * uint => [tstr, canonical-value]
  },

  invariants: { * uint => [tstr, tstr, tstr, tstr] },

  execution_contract: {
    * uint => [tstr, canonical-value]
  }
}

pic-pca-payload = {
  profile: tstr,
  position: 0,
  context_of_authority: indexed-authority-map,
  challenge: {
    next_challenge: bstr
  }
}
```

Readable PIC PCA payload instance in CBOR Diagnostic Notation:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 0,

  "context_of_authority": {
    "identity_context": {
      0: ["groups:finance", true],
      1: ["id", "user-123"],
      2: ["roles:payment-approver", true],
      3: ["securityDomain", "tenant-a"],
      4: ["type", "user"]
    },

    "invariants": {
      0: ["payments:approve", "approve", "payments", "*"],
      1: ["payments:read", "read", "payments", "*"]
    },

    "execution_contract": {
      0: ["currency", "EUR"],
      1: ["departments:finance", true],
      2: ["purpose", "payment-approval"]
    }
  },

  "challenge": {
    "next_challenge": h'0123456789abcdef'
  }
}
```

| Field | Purpose |
| --- | --- |
| `profile` | Identifies the active PIC profile. |
| `position` | Identifies the root continuity position and is always `0` for the PCA. |
| `context_of_authority` | Contains the canonical authority representation for the PCA. |
| `challenge.next_challenge` | Initializes the first future continuity transition. |

`position` identifies the PCA's place in continuity. Cryptographic artifact identity is established by the corresponding signed-artifact hash over the exact signed PIC PCA COSE bytes.

## PIC Continuity COSE

Definition URI

```text
None
```

The current protocol does not define a Definition URI for PIC Continuity COSE. It is currently identified by its advertised format. The exact COSE `typ` value is deferred.

Format

```text
pic-continuity+cose
```

COSE structure

```text
COSE_Sign1; exact RFC 9596 typ value deferred
```

Purpose

```text
signed settled continuity artifact
```

PIC-X-issued PIC Continuity COSE artifacts are trusted settled continuity artifacts. They are carried by the PIC Token JWT in `pic.root` or, for future composition, inside `pic.compositions[]`.

The payload is carried as the payload byte string of the COSE_Sign1 object.

```cddl
pic-continuity-payload = {
  profile: tstr,
  position: uint,

  root: {
    pca_hash: bstr,
    pca: bstr
  },

  ? challenge: {
    next_challenge: bstr
  }
}
```

If `position == 0`, `challenge` MUST be absent. If `position > 0`, `challenge` MUST be present and contain `next_challenge`.

Readable PIC Continuity 0 payload instance in CBOR Diagnostic Notation:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 0,

  "root": {
    "pca_hash": h'0123456789abcdef',
    "pca": h'd28443a10126a0'
  }
}
```

At continuity position 0, the challenge used to bootstrap Transition 1 is carried by the root PIC PCA COSE, not duplicated in PIC Continuity COSE 0.

Readable PIC Continuity N payload instance in CBOR Diagnostic Notation, for N > 0:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 1,

  "root": {
    "pca_hash": h'0123456789abcdef',
    "pca": h'd28443a10126a0'
  },

  "challenge": {
    "next_challenge": h'89abcdef01234567'
  }
}
```

| Field | Purpose |
| --- | --- |
| `position` | Identifies the current continuity position certified by this PIC Continuity COSE. |
| `root.pca_hash` | Identifies the hash of the exact signed root PIC PCA COSE bytes. |
| `root.pca` | Carries the exact signed PIC PCA COSE bytes issued by the trusted authority. |
| `challenge.next_challenge` | Absent at position 0; required for position > 0; carries authenticated challenge material for the next advancement. |

Settled PIC Continuity COSE artifacts do not carry attenuation deltas, Proof of Relationship, executor evidence, or accepted transition artifacts. Profile 0.2 does not define an accumulated `state` wire object.

> **Design note:** A settled PIC Continuity COSE does not carry prior Transition artifacts or a materialized authority-state snapshot. Profile 0.2 therefore requires separate state persistence/reconstruction semantics for effective attenuated authority. The exact representation or retrieval mechanism is intentionally not assigned in this article.

> **Design note:** Because the exact signed `root.pca` bytes are embedded in the Continuity artifact, `root.pca_hash` is derivable. Its retention as a separate field should be justified by an explicit identifier, revocation, lookup, or interoperability requirement before Profile 0.2 is finalized.

After PIC-X validates a proposed transition and issues the next settled PIC Continuity COSE at position > 0, the authenticated challenge material required for the next transition is carried in `challenge.next_challenge`.

When COSE protected headers include `kid`, that value is illustrative and profile-dependent unless the selected Profile 0.2 schema explicitly requires it. A `kid` value by itself does not authorize a transition; workload signing-key authorization and resolution follow the selected Proof of Relationship and profile rules.

## PIC Continuity Transition COSE

Definition URI

```text
None
```

The current protocol does not define a Definition URI for PIC Continuity Transition COSE. It is currently identified by its advertised format. The exact COSE `typ` value is deferred.

Format

```text
pic-continuity-transition+cose
```

COSE structure

```text
COSE_Sign1; exact RFC 9596 typ value deferred
```

Purpose

```text
signed artifact for one proposed continuity advancement
```

A PIC Continuity Transition COSE is not carried forward after PIC-X accepts the advancement. It is submitted only for the current exchange.

The signing algorithms accepted for workload-signed PIC Continuity Transition COSE artifacts are advertised by PIC-X through `continuity_transition.signing_alg_values_supported` in the discovery document.

The transition remains workload-signed, not PIC-X-signed.

The payload is carried as the payload byte string of the COSE_Sign1 object.

```cddl
canonical-value = tstr / true

execution-contract-addition = [
  tstr,
  canonical-value
]

pic-continuity-transition-payload = {
  profile: tstr,
  position: uint,

  predecessor: {
    type: "continuity",
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

  proof_of_relationship: any,
  ? request_digest: bstr,
  ? executor_evidence: any
}
```

Readable PIC Continuity Transition payload instance in CBOR Diagnostic Notation:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 1,

  "predecessor": {
    "type": "continuity",
    "hash": h'0123456789abcdef'
  },

  "challenge": {
    "previous_challenge": h'1111222233334444',
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
    "type": "profile-defined",
    "presentation": h'01020304'
  }
}
```

The `proof_of_relationship` object shown above is illustrative and profile-defined. `proof_of_relationship` is present in every PIC Continuity Transition COSE. `request_digest` and `executor_evidence` are present only when required by the selected profile/schema. Their internal schemas remain profile-defined here.

Existing execution-contract constraints must not be removed, replaced, or weakened during continuity advancement. Execution-contract restriction is additive: accepted transitions may introduce additional constraints through `attenuations.execution_contract.additions`, and all existing and newly added constraints are combined with logical AND.

New execution-contract constraints introduced by an accepted transition become additional entries in the materialized/effective `execution_contract` Indexed Authority Map section after PIC-X validates the transition and issues the next settled continuity state. The signed root PIC PCA COSE is not mutated, and no new PIC PCA COSE is created for the new continuity position.

The workload proposes execution-contract additions as canonical Indexed Authority Map `[key, value]` tuple entries in `attenuations.execution_contract.additions`. Each addition contains only the two tuple elements `key` and `value`. The workload does not assign a numeric index. Collection additions use the existing denormalized canonical form: for example, logical `departments` values become separate entries such as `["departments:engineering", true]` and `["departments:operations", true]`.

When one PIC Continuity Transition COSE proposes multiple execution-contract additions, PIC-X validates the proposed additions, denormalizes any collection-valued logical proposal material into individual canonical tuple additions when applicable, sorts accepted additions lexicographically by canonical key using the same Unicode code point ordering defined for initial `execution_contract` assignment, assigns the next section-local numeric indexes in that sorted order, and then materializes the additions. Input array order is not normative; the same accepted additions materialize to the same canonical ordering for the same predecessor state. The workload is not required to pre-sort additions.

## Predecessor and Challenge Semantics

For PIC Profile 0.2, a proposed transition is cryptographically bound to the previous trusted server-issued PIC Continuity COSE being advanced.

```text
trusted PIC-X-issued PIC Continuity COSE N
        |
        | predecessor.type = continuity
        | predecessor.hash = hash(exact signed PIC Continuity COSE N bytes)
        v
PIC Continuity Transition COSE N+1
```

The first transition predecessor is Continuity 0. The first transition uses the root PIC PCA COSE challenge only as the bootstrap source for `challenge.previous_challenge`:

```text
Transition 1.challenge.previous_challenge
=
PCA.challenge.next_challenge
```

After Transition 1 is accepted:

```text
Continuity 1.challenge.next_challenge
=
accepted Transition 1.challenge.next_challenge
```

Then:

```text
Transition 2.challenge.previous_challenge
=
Continuity 1.challenge.next_challenge
```

Generally, for N >= 1:

```text
Transition N+1.challenge.previous_challenge
=
Continuity N.challenge.next_challenge
```

Challenge continuity uses two fields. `challenge.previous_challenge` must match authenticated challenge material from the predecessor state. `challenge.next_challenge` supplies fresh challenge material for the following advancement.

```text
PIC Continuity COSE 0
→ trusted settled initial continuity state
→ no challenge field

PIC Continuity Transition COSE 1
→ previous_challenge consumes the root bootstrap challenge
→ next_challenge supplies fresh challenge material for advancement 2

PIC-X validates transition 1
→ issues settled PIC Continuity COSE 1

PIC Continuity COSE 1
→ challenge.next_challenge = accepted Transition 1.challenge.next_challenge

PIC Continuity Transition COSE 2
→ previous_challenge = PIC Continuity COSE 1.challenge.next_challenge
→ next_challenge supplies fresh material for advancement 3
```

## Workload Transition Signing for Continuity Advancement

For a non-initial continuity advancement, the workload produces and signs the PIC Continuity Transition COSE.

The workload must use the private key whose corresponding public key or identity is bound or proven by `proof_of_relationship` in the proposed PIC Continuity Transition COSE.

PIC-X verifies:

```text
PIC Continuity Transition COSE signature
+
PoR-authorized/bound workload key
→ proves that the workload proposing the transition controls the key accepted
  for this advancement under the selected profile
```

Settled PIC Continuity COSE artifacts are PIC-X-signed.

Transition signer binding is part of `proof_of_relationship`. No additional binding object is defined here.

The transition is not an independently trusted continuity artifact. It is a signed proposal sent to PIC-X for centralized validation. PIC-X accepts it only after validating the previous PIC Token/Continuity, transition, PoR/key binding, challenge continuity, executor evidence and execution-contract conformance when required, attenuation/non-expansion, and applicable revocation/policy.

## Attenuations

Profile 0.2 uses two restriction mechanisms inside `attenuations`:

```text
attenuations.identity_context.remove_bitmap
→ removal attenuation
→ remove_bitmap against identity_context section indexes

attenuations.invariants.remove_bitmap
→ removal attenuation
→ remove_bitmap against invariants section indexes

attenuations.execution_contract.additions
→ additive restriction
→ additions array of `[key, value]` tuple constraints
→ PIC-X sorts and assigns indexes after validation
→ all constraints combined with logical AND
```

Removal attenuation removes entries from the indexed `identity_context` and `invariants` sections in the materialized PCA state. It must never add identity context or authority.

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

In Profile 0.2, `attenuations.identity_context.remove_bitmap` and `attenuations.invariants.remove_bitmap` are interpreted against their own section-local numeric indexes. Removed entries must never reappear later in the same continuity. `execution_contract` does not use removal bitmaps. Execution-contract restrictions are monotonic additions through `attenuations.execution_contract.additions`: they add constraints that are combined with logical AND and therefore can only reduce the set of allowed executions.

## Proof of Relationship

Challenge continuity establishes the selected profile's freshness and predecessor-continuation condition. It does not prove executor properties.

In this model, `proof_of_relationship` is inside each PIC Continuity Transition COSE.

Proof of Relationship establishes that the proposed execution advancement is a valid causal continuation of exactly one predecessor under the selected profile. It binds that advancement to the predecessor, the required freshness/challenge state, the continuity position, and the profile-defined executor/holder/key relationship.

- `predecessor.hash`
- `challenge.previous_challenge`
- `challenge.next_challenge`
- `position`
- profile-defined holder/key proof

Where required by the selected profile, request/execution binding and executor-conformance evidence are validated as part of the advancement.

Authenticated executor evidence or attestation proves or asserts the executor properties accepted under the selected profile. Execution-contract conformance compares that authenticated executor evidence against the predecessor execution contract. PoR alone is not physical proof that an executor behaved correctly.

The verifier must be able to validate the required proof and evidence independently. It must not trust previous verifiers.

## Verification

An ordinary verifier of a settled PIC-X-issued PIC Token JWT verifies the artifact presented to it:

1. Verify the PIC Token JWT signature using the PIC-X issuer keys.
2. Base64url-decode `pic.root` to the exact PIC Continuity COSE bytes.
3. Verify the PIC Continuity COSE as COSE_Sign1.
4. Decode and read its payload.
5. Read `root.pca` as the exact signed PIC PCA COSE bytes.
6. Verify `root.pca` as PIC PCA COSE / COSE_Sign1.
7. Verify that `hash(exact root.pca COSE bytes)` equals `root.pca_hash`.
8. Verify the position-dependent challenge rule: if `position == 0`, `challenge` is absent and the root PIC PCA COSE carries `challenge.next_challenge`; if `position > 0`, `challenge.next_challenge` is present.
9. Verify that the settled PIC Continuity COSE contains no attenuation deltas, Proof of Relationship, executor evidence, or accepted transition artifact.
10. Apply profile-defined state, revocation, and policy validation.

PIC-X, when processing an advancement, additionally verifies one proposed transition:

1. Verify the previous trusted PIC Token JWT N.
2. Base64url-decode and verify its `pic.root` PIC Continuity COSE N.
3. Verify the workload-produced PIC Continuity Transition COSE N+1 as COSE_Sign1.
4. Verify that the transition signer is the key authorized or bound by `proof_of_relationship`.
5. Verify `predecessor.type` equals `continuity`.
6. Verify `predecessor.hash` equals `hash(exact signed PIC Continuity COSE N bytes)`.
7. Verify `payload.position` equals PIC Continuity COSE N `position` + 1.
8. Determine the expected previous challenge: if predecessor Continuity position is 0, use predecessor `root.pca` payload `challenge.next_challenge`; otherwise use predecessor Continuity `challenge.next_challenge`.
9. Verify `transition.challenge.previous_challenge` equals the expected previous challenge.
10. Verify `proof_of_relationship` over `predecessor.hash`, `challenge.previous_challenge`, `challenge.next_challenge`, `position`, and the profile-defined holder/key relationship.
11. Validate request/execution binding when required by the selected profile.
12. Validate authenticated executor evidence and execution-contract conformance when required by the selected profile.
13. Apply `attenuations.identity_context.remove_bitmap` when present.
14. Apply `attenuations.invariants.remove_bitmap` when present.
15. Read `attenuations.execution_contract.additions` when present.
16. Validate each proposed execution-contract `[key, value]` tuple.
17. Verify that accepted additions only further restrict execution.
18. Sort accepted additions lexicographically by canonical key.
19. Assign accepted additions their next section-local numeric indexes in that sorted order.
20. Add accepted additions to the materialized/effective `execution_contract` section.
21. Combine all execution-contract constraints using logical AND.
22. Verify overall authority and non-expansion semantics.
23. Verify revocation and local policy.
24. Persist/materialize effective state according to profile-defined semantics.
25. Issue settled PIC Continuity COSE N+1.
26. Base64url-encode that exact Continuity COSE into `pic.root`.
27. Sign and return PIC Token JWT N+1.

Profile 0.2 does not transport multiple prior transitions for independent replay. PIC-X validates each single advancement centrally and issues the next trusted PIC Token JWT carrying the next trusted continuity artifact.

## Profile 0.2 Continuity Model

```text
ROOT

PCA
→ logical Context of Authority

PIC PCA COSE
→ trusted signed root authority
→ root challenge
```

```text
SETTLED CONTINUITY

PIC Token JWT N
→ issued and signed by PIC-X
→ carries PIC Continuity COSE N in `pic.root`
→ trusted current continuity artifact
→ binds to the trusted root through `root`
→ contains no transition artifact
```

```text
ADVANCEMENT CANDIDATE

workload creates exactly one PIC Continuity Transition COSE N+1
→ predecessor.type = continuity
→ predecessor.hash = hash(exact signed previous trusted PIC Continuity COSE N bytes)
→ challenge continuity
→ attenuation
→ Proof of Relationship
→ transition signed using the PoR-bound private key
```

```text
CENTRAL VALIDATION

transition
→ PIC-X
→ validate previous trusted PIC Token and Continuity
→ validate transition signer / PoR key relationship
→ validate one transition
→ validate predecessor, challenge, executor evidence/conformance when required, attenuation, execution-contract additions, non-expansion, revocation/policy
→ issue PIC Token JWT N+1
→ `pic.root` carries settled PIC Continuity COSE N+1
```

```text
REPEAT

central N
→ one transition
→ central N+1
→ one transition
→ central N+2
```

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
