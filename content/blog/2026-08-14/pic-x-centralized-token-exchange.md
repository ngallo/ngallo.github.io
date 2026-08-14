+++
author = "Nicola Gallo"
title = "Designing PIC-X: Centralized Token Exchange End to End"
date = "2026-08-14T09:48:00+02:00"
description = "This article shows a complete centralized PIC Token Exchange flow, from an OAuth access token to PIC Token JWT 0 and then through continuity advancement to the final attenuated PIC authority state."
tags = ["pic", "pic-x", "jwt", "cose", "continuity", "oauth", "security", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-14/pic-x-centralized-token-exchange.png"
       alt="Designing PIC-X: Centralized Token Exchange End to End."
       loading="lazy">
  <figcaption>Designing PIC-X. Centralized Token Exchange End to End.</figcaption>
</figure>

PIC Profile 0.2 defines centralized PIC-X-mediated authority continuity.

This walkthrough follows one sensitive-document execution from OAuth authority into PIC Token JWT 0, then through two workload-produced candidate transitions.

```text
OAuth authority
        |
        v
PCA 0
{ read document-42, save }
        |
        | Worker 1 reads document-42
        | remove read authority
        v
PCA 1
{ save }
        |
        | Worker 2 stores the result
        | remove save authority
        v
PCA 2
{ no execution invariants }
```

Cryptographic byte values, compact tokens, signatures, hashes, and COSE byte strings below are illustrative. The structure and field semantics follow Profile 0.2.

## 1. Starting Authority

Incoming OAuth access token, decoded:

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
    "iat": 1786700400,
    "exp": 1786704000,
    "scope": "documents:read:document-42 storage:save"
  }
}
```

Only two OAuth scopes matter here:

```text
documents:read:document-42
storage:save
```

The Initial Continuity Proposal supplies execution constraints:

```json
{
  "executionContract": {
    "corporation": "ACME",
    "department": "sensitive-documents"
  }
}
```

The execution contract constrains execution. It does not grant authority.

Initialization uses RFC 8693 Token Exchange:

```http
POST /realms/acme/token HTTP/1.1
Host: pic-x.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<oauth-access-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=https://pic-protocol.org/definitions/token-types/pic
&continuity_proposal_type=https://pic-protocol.org/definitions/proposal-types/continuity-initial
&continuity_proposal=eyJleGVjdXRpb25Db250cmFjdCI6eyJjb3Jwb3JhdGlvbiI6IkFDTUUiLCJkZXBhcnRtZW50Ijoic2Vuc2l0aXZlLWRvY3VtZW50cyJ9fQ
```

## 2. OAuth -> PCA 0

PIC-X validates the OAuth token and maps the scopes into the logical PCA.

The JSON below is the readable logical PCA. The signed checkpoint is encoded as the canonical Indexed Authority Map inside a CBOR/COSE COSE_Sign1 object.

```json
{
  "execution": {
    "invariants": [
      {
        "scope": "documents:read:document-42",
        "operation": "read",
        "resourceType": "documents",
        "resourceId": "document-42"
      },
      {
        "scope": "storage:save",
        "operation": "save",
        "resourceType": "storage",
        "resourceId": "*"
      }
    ],
    "contract": {
      "corporation": "ACME",
      "department": "sensitive-documents"
    }
  }
}
```

Canonicalization:

```text
logical execution.invariants
        |
        | sort by scope, operation, resourceType, resourceId
        v
section-local invariant indexes

logical execution.contract
        |
        | sort by canonical key using Unicode code point order
        v
section-local execution_contract indexes
```

`identity_context` is omitted in this example.

PCA 0 Indexed Authority Map:

```text
{
  "invariants": {
    0: ["documents:read:document-42", "read", "documents", "document-42"],
    1: ["storage:save", "save", "storage", "*"]
  },

  "execution_contract": {
    0: ["corporation", "ACME"],
    1: ["department", "sensitive-documents"]
  }
}
```

`corporation` sorts before `department`, so the execution-contract indexes are `0` and `1` in that order.

PCA 0 payload:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 0,
  "context_of_authority": {
    "invariants": {
      0: ["documents:read:document-42", "read", "documents", "document-42"],
      1: ["storage:save", "save", "storage", "*"]
    },
    "execution_contract": {
      0: ["corporation", "ACME"],
      1: ["department", "sensitive-documents"]
    }
  },
  "challenge": {
    "next_challenge": h'7b6f6d3c9f2a8d11c4e3b87a60d51792'
  }
}
```

PIC PCA COSE 0, structural view:

```text
18([
  / protected / h'a10126',
  / unprotected / {},
  / payload / <encoded PIC PCA 0 payload bytes, truncated>,
  / signature / h'c4e7f9e3a6a714610a9b8d13fc95fb17f2e8cc9f9a7c78c81fd6165aaeddbb570b25e39c8e7b2dd3c4f443289b8fdf58ce2bb76df29b3cb8d736210e8a44f8d1'
])
```

Exact CBOR integer labels and RFC 9596 `typ` values remain profile/spec-defined where the source article defers them; diagnostic views use textual field names.

## 3. Settled PIC Token JWT 0

PIC-X signs a settled Continuity whose root is the exact signed PIC PCA COSE 0 bytes:

```text
PIC PCA COSE 0 bytes
        |
        | SHA-256 over exact signed bytes
        v
pca_hash = h'9c0a8f3f4f9a05e6a6c0d93b3132e9b2f28a7bbd0b50b9d98f58f10a5d9d2e61'
```

Do not hash the decoded payload or diagnostic notation.

Settled PIC Continuity COSE 0 payload, structural view:

```text
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "root": {
    "pca_hash": h'9c0a8f3f4f9a05e6a6c0d93b3132e9b2f28a7bbd0b50b9d98f58f10a5d9d2e61',
    "pca": <exact signed PIC PCA COSE 0 bytes, truncated>
  },
  "transitions": null
}
```

`root.pca` is the exact signed PIC PCA COSE 0 bytes. `transitions = null` means settled, with no pending advancement.

Settled PIC Continuity COSE 0 COSE_Sign1 structural view:

```text
18([
  / protected / h'a10126',
  / unprotected / {},
  / payload / <encoded settled PIC Continuity COSE 0 payload bytes, truncated>,
  / signature / h'e7c5d82fcd59e7d2c68bd1ab8fd8fb8312690f8bb389f78eaef5c55358b4ad0c5dbefbf3212b0129d2b5386304e9090f33f6fffd9a7839b8b561c6e66ebef028'
])
```

PIC Token JWT 0 payload:

```json
{
  "iss": "https://pic-x.example.com/realms/acme",
  "sub": "pic-execution-123",
  "aud": "document-pipeline",
  "iat": 1786700400,
  "exp": 1786704000,
  "jti": "pic-token-01J8K0PCA0",
  "profile": "https://pic-protocol.org/profiles/0.2",
  "pic": {
    "root": "<base64url exact settled PIC Continuity COSE 0 bytes, truncated>"
  }
}
```

`pic.root` is Base64url of the exact binary settled PIC Continuity COSE 0 bytes.

```text
PIC PCA COSE 0
        |
        v
settled PIC Continuity COSE 0
        |
        v
realm-signed PIC Token JWT 0
```

## 4. Two Workloads

Hard format boundary:

```text
OAuth Access Token
= JWT/JWS

Initial Continuity Proposal
= JSON

SD-JWT Proof of Relationship
= RFC 9901 SD-JWT
= Issuer-signed JWT/JWS + selected Disclosures
= textual JOSE serialization

PIC Token
= JWT/JWS

PIC PCA
= CBOR/COSE

PIC Continuity
= CBOR/COSE

PIC Continuity Transition
= CBOR/COSE
```

The Transition is CBOR/COSE. Its `proof_of_relationship` field is a CBOR `bstr` containing the exact UTF-8 bytes of the textual SD-JWT presentation string.

Signer roles stay separate:

```text
SD-JWT Issuer / attestation issuer
→ signs workload Proof of Relationship as JWT/JWS

Holder / workload runtime
→ selects Disclosures and signs candidate PIC artifacts

Verifier / PIC-X
→ validates SD-JWT issuer signature, Disclosures and candidate PIC signatures

PIC realm signer
→ signs accepted PCA, settled Continuity and settled PIC Token JWT
```

These are distinct protocol roles.

The disclosed workload attributes below belong to the illustrative deployment schema. Profile 0.2 does not define these claim names, and their presence in the PoR does not by itself establish execution-contract conformance.

```text
PoR
→ issuer-authenticated workload relationship and accepted workload key material

Transition signature
→ proves control of the workload private key

executor_evidence / conformance validation
→ separate when required
```

The SD-JWT credential alone does not establish Proof of Continuity. In Profile 0.2, concrete relationship acceptance combines the validated PoR credential and PoR-bound workload key with predecessor binding, workload signature verification, position progression, challenge continuity, and any required evidence, revocation, policy, and conformance checks. The configured PoR issuer/schema and those concrete relationship checks are assumed to soundly witness the abstract single-hop PoR relation; the PIC mathematical model and Lean refinement do not prove the cryptographic soundness of that deployment-specific construction.

This walkthrough uses RFC 9901's `cnf.jwk` form to carry the workload public verification key. PIC Profile 0.2 requires the selected PoR schema to bind or identify that key; it does not make this exact claim path normative here.

```text
Issuer issues many attributes
        |
        v
Holder receives all relevant Disclosures
        |
        | selects only what is required for this hop
        v
PIC-X receives a minimized SD-JWT presentation
```

The Holder presents only the Disclosures required by the selected trust/conformance policy for that operation. All other selectively disclosable attributes remain undisclosed.

### Worker 1

The Issuer starts from workload attributes such as:

```json
{
  "corporation": "ACME",
  "department": "sensitive-documents",
  "workload_role": "document-reader",
  "service": "document-processing",
  "clearance": "sensitive",
  "reader_region": "eu-west",
  "deployment_environment": "production",
  "build_id": "reader-2026.08.14",
  "host_class": "confidential-compute",
  "internal_cluster": "docs-cluster-17"
}
```

For this walkthrough, those ten attributes are selectively disclosable. Validity claims and `cnf.jwk` are permanently disclosed. No decoy digests are used.

Each selectively disclosable claim uses a different Base64url salt with at least 128 bits of entropy. The displayed salts are illustrative.

Disclosure contents for an object-property claim are a JSON array:

```json
["f0UUCvMSycSUXaVfuiDWAA","corporation","ACME"]
```

The Disclosure is the Base64url encoding of that UTF-8 JSON array, without padding:

```text
D_corporation =
WyJmMFVVQ3ZNU3ljU1VYYVZmdWlEV0FBIiwiY29ycG9yYXRpb24iLCJBQ01FIl0
```

Digest calculation:

```text
Disclosure contents
        |
        | UTF-8 JSON serialization
        v
Base64url Disclosure string
        |
        | US-ASCII bytes
        | SHA-256
        v
digest bytes
        |
        | Base64url without padding
        v
_sd digest string
```

Example second Disclosure:

```text
Disclosure contents =
["E54m03bpDTSeWfZOQ-1wVw","department","sensitive-documents"]

D_department =
WyJFNTRtMDNicERUU2VXZlpPUS0xd1Z3IiwiZGVwYXJ0bWVudCIsInNlbnNpdGl2ZS1kb2N1bWVudHMiXQ
```

The Issuer-signed JWT is a JWS. The compact serialization is omitted here; the decoded payload contains digest strings, not cleartext names or values for selectively disclosable claims:

```json
{
  "iss": "https://attestation.example.com",
  "iat": 1786700500,
  "exp": 1786704100,
  "_sd_alg": "sha-256",
  "_sd": [
    "3CNTPr87PwmN0oW4tNoyswYdsgSUCc6R2B1JSC7I6pI",
    "62rjCYviAli2R9bOU8etQ2DWjOGJETL4L2_Vewqzl8I",
    "6g3ffib_cNuBmTs4R3AyvyGK8dcZIteeRtw8yPAmDCU",
    "POtp4eFO4TReywR0yahpwryzSO_dLgiK6Y8lbmdb7SA",
    "P_9_ewlbKJ-ddpy7LivbSPPCYO219Si_0pAj-iElZJQ",
    "Xn7kw6_wekrrpvjPLcrMOQWwVzvVgSsMla6892-qlx8",
    "cmQs8BFsB9ejZrCaaXNbiq0iZW19oG0bTx-N5wLGm24",
    "mzeyOGQIao4tTM8WvLC-qG2hQa1oxmCYl-wjz7GS0yo",
    "vh7enFAhHilhjEs409goqcE44UWGuIgzcMNhDih_Cgc",
    "yjForVdxBM3AP4GqLrN715bZbnrJ9XqzanJ4WeW5Ru4"
  ],
  "cnf": {
    "jwk": {
      "kty": "EC",
      "crv": "P-256",
      "kid": "worker-1-key",
      "x": "AbZzIerBJYtaxamji_Z4jT3oAuhAw_p-IPnIHFQ_YsM",
      "y": "LxUSbSzHe7-a3WbnZqMTfpRo_2VdTY_ugsn5xW9OWtU"
    }
  }
}
```

The `_sd` values above are ten real digest commitments for the ten issued Disclosures. They are sorted alphanumerically so their order does not reveal the original claim order.

Issuance to Worker 1:

```text
Issuer
        |
        v
Issuer-signed JWT + all issued Disclosure strings
        |
        v
Holder / Worker 1
```

The Holder receives the issued Disclosure strings, but presents only the two required by the selected trust/conformance policy for this hop.

Worker 1 presents only selected Disclosures:

```text
issued selectively disclosable attributes: 10

presented to PIC-X: 2
├── corporation
└── department

not presented: 8
├── workload_role
├── service
├── clearance
├── reader_region
├── deployment_environment
├── build_id
├── host_class
└── internal_cluster
```

The `not presented` list is explanatory documentation, not wire data visible to PIC-X.

The omitted Disclosures, including their salts, are not transmitted to PIC-X. For omitted object-property claims, the cleartext claim names and values are not transmitted either. PIC-X learns only the selected Disclosures plus permanently disclosed claims such as issuer, validity information and `cnf.jwk`; the number of digest commitments may still reveal some metadata when no decoys are used.

SD-JWT presentation sent to PIC-X:

```text
<Issuer-signed JWT>
~WyJmMFVVQ3ZNU3ljU1VYYVZmdWlEV0FBIiwiY29ycG9yYXRpb24iLCJBQ01FIl0
~WyJFNTRtMDNicERUU2VXZlpPUS0xd1Z3IiwiZGVwYXJ0bWVudCIsInNlbnNpdGl2ZS1kb2N1bWVudHMiXQ
~
```

The bare SD-JWT presentation ends with `~`. No KB-JWT is appended in this Profile 0.2 walkthrough.

Processed SD-JWT Payload after RFC 9901 verification and Disclosure processing:

```json
{
  "iss": "https://attestation.example.com",
  "iat": 1786700500,
  "exp": 1786704100,
  "cnf": {
    "jwk": {
      "kty": "EC",
      "crv": "P-256",
      "kid": "worker-1-key",
      "x": "AbZzIerBJYtaxamji_Z4jT3oAuhAw_p-IPnIHFQ_YsM",
      "y": "LxUSbSzHe7-a3WbnZqMTfpRo_2VdTY_ugsn5xW9OWtU"
    }
  },
  "corporation": "ACME",
  "department": "sensitive-documents"
}
```

Undisclosed claims are absent from the Processed SD-JWT Payload.

```text
Issuer private key
        |
        v
Issuer-signed SD-JWT/JWS
├── _sd digest commitments
├── validity claims
└── cnf.jwk -> Worker 1 public key
        |
        | Holder selects Disclosures
        v
RFC 9901 SD-JWT presentation
        |
        | exact UTF-8 bytes become Transition.proof_of_relationship
        v
Worker 1 runtime
        |
        └── holds the private key matching cnf.jwk
```

### Worker 2

Worker 2 uses the same RFC 9901 mechanism with its own SD-JWT and key pair.

The Issuer starts from storage workload attributes such as:

```json
{
  "corporation": "ACME",
  "department": "sensitive-documents",
  "workload_role": "storage-writer",
  "service": "secure-storage",
  "storage_class": "sensitive",
  "storage_region": "eu-central",
  "storage_namespace": "acme-sensitive-documents",
  "retention_profile": "protected-30d",
  "replication_mode": "dual-region",
  "internal_cluster": "storage-cluster-09"
}
```

```text
issued selectively disclosable attributes: 10
selected disclosures: 2
undisclosed disclosures: 8

presented to PIC-X
├── corporation
└── department

not presented
├── workload_role
├── service
├── storage_class
├── storage_region
├── storage_namespace
├── retention_profile
├── replication_mode
└── internal_cluster
```

The `not presented` list is explanatory documentation, not wire data visible to PIC-X.

Issuer-signed JWT payload:

```json
{
  "iss": "https://attestation.example.com",
  "iat": 1786700600,
  "exp": 1786704200,
  "_sd_alg": "sha-256",
  "_sd": [
    "3n0NhmZG6-aCGQ4rmfAzwDSHjdVXK93gl23p0DrE2NE",
    "5jS4X8__1_bsn9BIGOHMFaaSAcrFC4QapluetUD3q9Y",
    "7LZcdUaO9sx9SPw6HOLKucCgsLzgU1lXRUH-cyPMgZA",
    "HLCCyUiFz4hWQc9UEs3CxJ0jJs3aWQsEKCDyu1WDSHk",
    "Q0uqe1mYb0FWc8HHwxrXTAhvDF9r8yHiU68uB5ZhfvI",
    "Qe7z-9SG7SSc4V4XQFsYtAVbBKKma-DkGf2VpVrXf9w",
    "WZL2Zh1LPIk4_CKq8XS8cifzcn9Acflj2kbA-j56R8E",
    "YdzFXlL-LbeoTudnQMtMmjI8jHe6GNQbLDqkXI1SoxA",
    "xjMzpQA6cwywHrkPgKYcSEZ0wiP0WgvPRmElTrAXQfE",
    "yOK0mbTnJYzeTizNrQU683ZcK6C5GtjsHnw_3hwop5E"
  ],
  "cnf": {
    "jwk": {
      "kty": "EC",
      "crv": "P-256",
      "kid": "worker-2-key",
      "x": "qVrnRMgFK2zqdeguigyDOcX9p3PzUXTzey5VRIdSKgw",
      "y": "BHCfKNUuGjvLYow1uxoz43CpyKKeM1_fXxrnNC3GMqE"
    }
  }
}
```

The `_sd` values above are ten real digest commitments for the ten issued Disclosures, sorted independently of the source claim order.

Selected Disclosure contents and strings:

```text
Disclosure contents =
["LfYWIczToLIsjWrGf3BSWw","corporation","ACME"]

D_corporation =
WyJMZllXSWN6VG9MSXNqV3JHZjNCU1d3IiwiY29ycG9yYXRpb24iLCJBQ01FIl0

Disclosure contents =
["PjCyltFjXbt5b7sr_OHlHA","department","sensitive-documents"]

D_department =
WyJQakN5bHRGalhidDViN3NyX09IbEhBIiwiZGVwYXJ0bWVudCIsInNlbnNpdGl2ZS1kb2N1bWVudHMiXQ
```

Presentation sent to PIC-X:

```text
<Issuer-signed JWT>
~WyJMZllXSWN6VG9MSXNqV3JHZjNCU1d3IiwiY29ycG9yYXRpb24iLCJBQ01FIl0
~WyJQakN5bHRGalhidDViN3NyX09IbEhBIiwiZGVwYXJ0bWVudCIsInNlbnNpdGl2ZS1kb2N1bWVudHMiXQ
~
```

The other eight Disclosure strings and salts are not sent to PIC-X.

Selected Worker 2 Processed SD-JWT Payload:

```json
{
  "iss": "https://attestation.example.com",
  "iat": 1786700600,
  "exp": 1786704200,
  "cnf": {
    "jwk": {
      "kty": "EC",
      "crv": "P-256",
      "kid": "worker-2-key",
      "x": "qVrnRMgFK2zqdeguigyDOcX9p3PzUXTzey5VRIdSKgw",
      "y": "BHCfKNUuGjvLYow1uxoz43CpyKKeM1_fXxrnNC3GMqE"
    }
  },
  "corporation": "ACME",
  "department": "sensitive-documents"
}
```

```text
Worker 2 runtime
        |
        └── holds the private key matching worker-2-key
```

PIC Transition signatures are not RFC 9901 KB-JWTs. Current Profile 0.2 uses workload signatures on PIC candidate artifacts instead of requiring a separate SD-JWT KB-JWT.

## 5. Worker 1: Read And Attenuate

Worker 1 receives PIC Token JWT 0.

Flow at a glance:

```text
PCA 0
{ read document-42, save }

        |
        | Worker 1
        | reads document-42
        | removes read authority
        v

PCA 1
{ save }
```

Current PCA 0 invariant indexes:

```text
index 0 -> documents:read:document-42
index 1 -> storage:save
```

Worker 1 reads `document-42` and proposes removing invariant index `0`.

```text
byte_index = floor(0 / 8) = 0
bit_index  = 0 mod 8      = 0
mask       = 1 << 0       = 0x01

remove_bitmap = h'01'
```

```text
before
0 -> documents:read:document-42
1 -> storage:save

remove_bitmap h'01'
          |
          v

after
storage:save
```

Bits are numbered least-significant-bit first. Trailing zero bytes are omitted. A set bit for a non-existent predecessor index is invalid.

Transition 1 payload:

```text
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 1,

  "predecessor": {
    "type": "pca",
    "hash": h'9c0a8f3f4f9a05e6a6c0d93b3132e9b2f28a7bbd0b50b9d98f58f10a5d9d2e61'
  },

  "challenge": {
    "previous_challenge": h'7b6f6d3c9f2a8d11c4e3b87a60d51792',
    "next_challenge": h'91bbdf14277fc1d41a3e42ea0f764d8a'
  },

  "attenuations": {
    "invariants": {
      "remove_bitmap": h'01'
    }
  },

  "proof_of_relationship": <exact UTF-8 bytes of Worker 1 SD-JWT presentation string>
}
```

The value inside `proof_of_relationship` is not a COSE-encoded SD-JWT. It is the byte-string representation of the exact textual RFC 9901 SD-JWT presentation.

Transition 1 COSE:

```text
18([
  / protected / h'a10126',
  / unprotected / {},
  / payload / <encoded Transition 1 payload bytes, truncated>,
  / signature / h'f876cbf04e71e0fd6976dd6f9bfec88d28372493b0446c39463becfb06980a4c24477b0df21eb7f84d95c8533b56939dba77c95b5b2c091ee67afbaf04394e11'
])
```

Candidate Continuity payload:

```text
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "root": {
    "pca_hash": h'9c0a8f3f4f9a05e6a6c0d93b3132e9b2f28a7bbd0b50b9d98f58f10a5d9d2e61',
    "pca": <exact signed PIC PCA COSE 0 bytes, truncated>
  },
  "transitions": [
    <exact signed Transition 1 COSE bytes, truncated>
  ]
}
```

Candidate PIC Token JWT payload:

```json
{
  "aud": "pic-x",
  "iat": 1786700700,
  "profile": "https://pic-protocol.org/profiles/0.2",
  "pic": {
    "root": "<base64url exact workload-signed candidate Continuity COSE bytes, truncated>"
  }
}
```

Candidate `iss` is optional in centralized Profile 0.2. If present, it is identity metadata, not the source of cryptographic trust.

```text
Worker 1 private key
   |
   +--> Transition 1 COSE signature
   +--> candidate Continuity COSE signature
   `--> candidate PIC Token JWT JWS signature
```

These are three distinct signed objects using the same workload private key.

PIC-to-PIC advancement uses Token Exchange with the candidate as `subject_token`:

```http
POST /realms/acme/token HTTP/1.1
Host: pic-x.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<workload-signed-candidate-pic-token-jwt>
&subject_token_type=https://pic-protocol.org/definitions/token-types/pic
&requested_token_type=https://pic-protocol.org/definitions/token-types/pic
```

Current Profile 0.2 PIC-to-PIC advancement omits `continuity_proposal` and `continuity_proposal_type`.

PIC-X receives the candidate as untrusted input:

```text
parse PIC JWT / Continuity / Transition
        |
        +-- parse Issuer-signed SD-JWT + selected Disclosures
        +-- verify issuer JWS signature and issuer trust
        +-- validate _sd_alg
        +-- Base64url decode each selected Disclosure
        +-- validate Disclosure structure and digest matches
        +-- reject unreferenced Disclosures and duplicate digest use
        +-- reconstruct Processed SD-JWT Payload
        +-- validate required validity claims
        +-- obtain Worker 1 public key from cnf.jwk
        +-- verify three workload signatures
        +-- verify trusted PCA 0 hash, position and challenge
        +-- apply remove_bitmap h'01'
        +-- enforce execution-contract constraints
        +-- validate executor evidence / conformance when required
        +-- validate revocation and local policy
        +-- verify non-expansion
        |
        v
materialize PCA 1
```

The Transition signature proves control of the PoR-bound workload private key. It is not Proof of Continuity by itself.

### PCA 1 Materialized

Apply attenuation:

```text
"invariants": {
  0: ["documents:read:document-42", "read", "documents", "document-42"],
  1: ["storage:save", "save", "storage", "*"]
}
```

```text
remove_bitmap = h'01'
```

Resulting logical PCA:

```json
{
  "execution": {
    "invariants": [
      {
        "scope": "storage:save",
        "operation": "save",
        "resourceType": "storage",
        "resourceId": "*"
      }
    ],
    "contract": {
      "corporation": "ACME",
      "department": "sensitive-documents"
    }
  }
}
```

PCA 1 is a new checkpoint with a new section-local Indexed Authority Map:

```text
{
  "invariants": {
    0: ["storage:save", "save", "storage", "*"]
  },
  "execution_contract": {
    0: ["corporation", "ACME"],
    1: ["department", "sensitive-documents"]
  }
}
```

```text
PCA 1 position = 1
PCA 1 challenge.next_challenge = h'91bbdf14277fc1d41a3e42ea0f764d8a'
```

Realm-signed PIC PCA COSE 1 payload:

```text
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 1,
  "context_of_authority": {
    "invariants": {
      0: ["storage:save", "save", "storage", "*"]
    },
    "execution_contract": {
      0: ["corporation", "ACME"],
      1: ["department", "sensitive-documents"]
    }
  },
  "challenge": {
    "next_challenge": h'91bbdf14277fc1d41a3e42ea0f764d8a'
  }
}
```

Settled result:

```text
realm-signed PIC PCA COSE 1
        |
        v
realm-signed settled PIC Continuity COSE 1
transitions = null
        |
        v
realm-signed PIC Token JWT 1
```

The read privilege is gone and cannot reappear later in the same lineage.

## 6. Worker 2: Save And Attenuate

Worker 2 receives PIC Token JWT 1 and stores the result.

Flow at a glance:

```text
PCA 1
{ save }

        |
        | Worker 2
        | saves the document
        | removes save authority
        v

PCA 2
{ }
```

PCA 1 invariant indexes:

```text
index 0 -> storage:save
```

Remove index `0` from the new checkpoint:

```text
byte_index = floor(0 / 8) = 0
bit_index  = 0 mod 8      = 0
mask       = 1 << 0       = 0x01

remove_bitmap = h'01'
```

The bitmap is again `h'01'` because PCA 1 was re-materialized and `storage:save` is now section-local index `0`.

PCA 1 hash and challenge:

```text
pca_1_hash = h'4b7f3d61ae8ef7c2f001d8b545d0cfbd019e8dbbc678f3c4f0edcdf1f812c683'
pca_1_next_challenge = h'91bbdf14277fc1d41a3e42ea0f764d8a'
```

Transition 2 payload:

```text
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 2,

  "predecessor": {
    "type": "pca",
    "hash": h'4b7f3d61ae8ef7c2f001d8b545d0cfbd019e8dbbc678f3c4f0edcdf1f812c683'
  },

  "challenge": {
    "previous_challenge": h'91bbdf14277fc1d41a3e42ea0f764d8a',
    "next_challenge": h'37c5915d42ef8d0bbd3ac513798f2c20'
  },

  "attenuations": {
    "invariants": {
      "remove_bitmap": h'01'
    }
  },

  "proof_of_relationship": <exact UTF-8 bytes of Worker 2 SD-JWT presentation string>
}
```

Worker 2 signs the same three object types with its own private key:

```text
Worker 2 private key
   |
   +--> Transition 2 COSE signature
   +--> candidate Continuity COSE signature
   `--> candidate PIC Token JWT JWS signature
```

PIC-X applies the same Profile 0.2 validation pattern: RFC 9901 SD-JWT verification, accepted Worker 2 public key, three workload signatures, trusted PCA 1, predecessor hash, position, challenge continuity, attenuation, execution-contract constraints, executor evidence/conformance when required, revocation, policy, and non-expansion.

### PCA 2 Materialized

Before:

```text
"invariants": {
  0: ["storage:save", "save", "storage", "*"]
}
```

Apply:

```text
remove_bitmap = h'01'
```

Resulting logical PCA:

```json
{
  "execution": {
    "invariants": [],
    "contract": {
      "corporation": "ACME",
      "department": "sensitive-documents"
    }
  }
}
```

The existing Profile 0.2 source article does not define a separate empty-section encoding rule here. The diagnostic view below shows the semantic materialized authority map with no invariant entries:

```cbor-diag
{
  "invariants": {},
  "execution_contract": {
    0: ["corporation", "ACME"],
    1: ["department", "sensitive-documents"]
  }
}
```

An empty invariant map means no remaining executable authority. The PCA checkpoint still exists, and the execution contract remains.

Realm-signed PIC PCA COSE 2 payload, shown with the same readable empty-map convention:

```cbor-diag
{
  "profile": "https://pic-protocol.org/profiles/0.2",
  "position": 2,
  "context_of_authority": {
    "invariants": {},
    "execution_contract": {
      0: ["corporation", "ACME"],
      1: ["department", "sensitive-documents"]
    }
  },
  "challenge": {
    "next_challenge": h'37c5915d42ef8d0bbd3ac513798f2c20'
  }
}
```

Final settled result:

```text
realm-signed PIC Token JWT 2
└── settled PIC Continuity COSE 2
    ├── root.pca = exact signed PIC PCA COSE 2 bytes
    └── transitions = null
```

## Signer Roles

```text
SD-JWT / attestation Issuer
(private signing key)
        |
        v
Issuer-signed SD-JWT/JWS
├── validity claims
├── _sd digest commitments
└── cnf.jwk -> Worker public key
        |
        | Holder selects minimum required Disclosures
        v
privacy-minimized RFC 9901 SD-JWT presentation
        |
        | exact UTF-8 bytes become Transition.proof_of_relationship
        v
Worker runtime
(private key matching cnf.jwk)
        |
        ├── signs PIC Transition COSE
        ├── signs candidate PIC Continuity COSE
        └── signs candidate PIC Token JWT
        |
        v
PIC-X
        |
        ├── validates issuer JWS
        ├── validates selected Disclosures
        ├── obtains Worker public key
        ├── verifies candidate signatures
        ├── validates PCA / hash / position / challenge
        ├── applies remove_bitmap
        ├── checks policy / revocation / conformance
        └── materializes next PCA
        |
        v
PIC realm
        |
        ├── signs new PIC PCA COSE
        ├── signs settled PIC Continuity COSE
        └── signs settled PIC Token JWT
```

## End-To-End View

```text
OAuth Access Token
├── documents:read:document-42
└── storage:save
        +
Initial Continuity Proposal
├── corporation = ACME
└── department = sensitive-documents
        |
        v
PCA 0
├── position = 0
└── invariants
    ├── 0 -> documents:read:document-42
    └── 1 -> storage:save
        |
        | Worker 1 READ
        | remove_bitmap h'01'
        v
PCA 1
├── position = 1
└── invariants
    └── 0 -> storage:save
        |
        | Worker 2 SAVE
        | remove_bitmap h'01'
        v
PCA 2
├── position = 2
└── invariants = {}
```

In this OAuth-based initialization flow, PIC authority is derived from the validated OAuth access token, Exchange Profile, execution contract, and local policy, then checkpointed into PCA 0. Each validated continuation can only preserve or reduce that authority. Different workloads may continue the lineage, but none may replenish authority from privileges they independently hold.

## Related

- [Designing PIC-X: From Specification to Architecture](/blog/2026-08-01/pic-x-from-spec-to-arch/)
- [Designing PIC-X: Deriving an Initial PIC Context of Authority](/blog/2026-08-01/pic-x-exchanging-token-to-pca/)
- [Designing PIC-X: Exposing Configuration through .well-known/pic-x-configuration](/blog/2026-08-01/pic-x-well-known-config/)
- [Designing PIC-X: PIC Token JWT and COSE Artifacts](/blog/2026-08-11/pic-x-token-types-jwts/)
