---
title: "Temporal Confused Deputy"
entryType: "quote"
date: "2026-11-20"
weight: 5
author: "Nicola Gallo"
authorUrl: "https://www.ngallo.it/"
source: "PIC paper, IEEE NCA 2026 (Theorems 3 and 4)"
sourceUrl: "https://doi.org/10.1109/NCA71379.2026.00052"
originalDate: "2026"
tags:
  - confused deputy
  - authorization
  - authority continuity
  - PIC
---

> Confused deputy does not come from expanding authority. Its root cause is using the deputy’s authority on a resource designated by someone else.
>
> Temporal confused deputy does not either. Its root cause is using the deputy’s authority on a resource designated in another continuation, even by the deputy itself, even if both continuations forked from the same origin.
>
> Same origin is not the same continuation.
>
> A capability lets the holder act. It does not let the receiver verify which continuation the holder is acting for.

<!--more-->

The authority is genuine, and you hold it legitimately. It just belongs to a different continuation.

Formally: take two events e = (o, r, ℓ) and e′ = (o, r, ℓ′) with ℓ ≠ ℓ′. Same operation, same resource, different lineage. Any policy that does not read the lineage gives both the same verdict, so it cannot accept one and reject the other.

Telling them apart requires evidence of the lineage. [Authority Continuity](/quotes/pic-authority-continuity/) is the property that demands it.

Proved in the PIC paper (IEEE NCA 2026, Theorems 3 and 4): <https://doi.org/10.1109/NCA71379.2026.00052>
