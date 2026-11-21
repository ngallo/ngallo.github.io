---
title: "The PIC Principle — Causal Continuity Is Not Possession"
entryType: "definition"
date: "2026-11-20"
weight: 8
author: "Nicola Gallo"
authorUrl: "https://www.ngallo.it/"
source: "PIC (Provenance Identity Continuity)"
sourceUrl: "https://pic-protocol.org"
originalDate: ""
tags:
  - PIC
  - authority continuity
  - proof of possession
  - proof of relationship
  - proof of continuity
  - capabilities
---

> Authority possession and authority continuity are distinct security properties.
>
> Proof of Possession (PoP) establishes control over an authority-bearing artifact.
>
> Proof of Relationship (PoR) establishes a receiver-verifiable causal relationship between execution occurrences. It is semantically distinct from PoP: possession alone does not imply causal continuity, and PoP is not a necessary premise of PIC’s abstract authorization rule. PoP can help provide evidence for PoR, but PoR is not derived from possession. Under explicit trust assumptions, causal continuity can be established without successor-side PoP.
>
> Proof of Continuity (PoC) composes these causal relationships across an execution, preserving non-expanding authority along ordinary continuations.
>
> PoP establishes control. PoR establishes causal relationship. PoC establishes authority continuity.
>
> The ontological shift: authority is no longer only a permission held by an actor, but something exercised within a specific causal execution.
>
> A capability with verifiable continuity remains a capability. An OAuth access token with causal bindings remains an access token. The artifact does not define the security property.
>
> Possession answers who can exercise authority. Continuity establishes whether that exercise belongs to the execution that caused it.
