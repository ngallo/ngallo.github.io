+++

author = "Nicola Gallo"

title = "Demystifying the Temporal Dimension of PIC: From Proof of Possession to Execution Lineage"

date = "2026-09-13T09:00:00+00:00"

description = "A permissioned entity expresses an intent by selecting authority. Proof of Possession can prove who holds that authority, but not which occurrence of it is being exercised. PIC adds execution lineage as the missing causal coordinate."

tags = ["pic", "proof of possession", "proof of relationship", "proof of continuity", "execution lineage", "temporal authority", "capabilities", "distributed systems", "security"]

+++

<figure class="post-banner">
  <img src="/images/2026-09-13/temporal-dimension-pic.png"
       alt="Demystifying the temporal dimension of PIC."
       loading="lazy">
</figure>

PIC here means **Provenance Identity Continuity**.

> **Scope note.** This article isolates one part of PIC: its temporal / execution-lineage dimension. PIC is broader than `L` and includes additional rules and mechanisms around authority, continuity and verification. The goal here is only to make the temporal axis explicit.

A simple way to understand the temporal dimension of PIC is to start with how authority is created.

A permissioned entity `p` expresses an intent by selecting a subset of the permissions it already holds:

```text
C0 ⊆ Priv(p)
```

In the minimal model, those permissions can be represented over `O × R`, where `O` is the set of operations and `R` the set of resources. The intent explains why a particular authority context was selected. The resulting set tells us what may be done. PoP proves who holds that authority; it is not the permission space itself.

That is enough when a receiver only needs to decide whether a known authority may be exercised at that point. The limitation appears as soon as the same authority can occur in more than one execution. Retries, concurrent requests, asynchronous work, service-to-service delegation, long-running workflows and future delegation can all produce the same permission while referring to different authority occurrences. The unknown future is therefore not the boundary of PIC; it is simply the case that makes the missing execution coordinate hardest to ignore.

## The same authority can exist in different executions

Suppose Alice delegates authority for a future step whose concrete outcome is not yet known. Later she creates another delegation for another future step, with the same intent and the same authority for Bob. The holder is the same, the permission set is the same, and PoP succeeds in both cases.

At the permission level, both occurrences may therefore project to exactly the same point:

```text
(o, r)
```

Nothing is wrong with that point. It accurately describes the permission. What it cannot tell us is which authorization occurrence this use belongs to. That distinction exists as soon as the same authority can occur in more than one execution. Delegation into an unknown future simply makes the limitation impossible to ignore: the next resource, outcome, or execution step may not yet exist, while the current step must still determine which future continuation is authorized.

PIC makes that distinction explicit by adding execution lineage:

```text
(o, r, ℓ1)
(o, r, ℓ2)
```

The operation is the same, the resource is the same, and the holder may be the same. The difference is the execution occurrence.

<figure>
  <img src="/images/2026-09-13/temporal-space-dark.png"
       alt="Operation-resource permission space compared with operation-resource-execution-lineage authority space."
       loading="lazy">
  <figcaption>
    2D: permission space, possession proven by PoP. Third axis: execution lineage, adjacency proven by PoR. The full point is an authority occurrence; PoC is the property of the path that reaches it.
  </figcaption>
</figure>

If we project away `L`:

```text
(o, r, ℓ1) -> (o, r)
(o, r, ℓ2) -> (o, r)
```

two different executions become indistinguishable. This is the central limitation of a lineage-invariant view: the permission survives the projection, but the occurrence identity does not.

The loss is not merely descriptive. The projection is many-to-one. Once `L` is omitted at creation time, or later discarded from the state presented to the receiver, the original occurrence cannot be recovered from `(o, r)` alone. The information needed to distinguish `ℓ1` from `ℓ2` is gone.

A system can still guess from timestamps, surrounding metadata, behavior, or context. That may produce a good heuristic, even a very high probability, but it is an approximation rather than a mathematical guarantee. The guarantee returns only if execution-sensitive evidence equivalent in role to `L` is preserved or introduced through another verifiable mechanism.

This is the conceptual step from permission to authority occurrence. `O × R` identifies what may be done; `O × R × L` identifies an occurrence of that authority in an execution. Once authority is modeled at that level, immediate calls, retries, parallel paths, delegated service calls and future steps are no longer separate problems. They are different ways in which the same permission can appear at different execution positions.

## A timestamp is still metadata

Tokens can carry `iat`, `nbf`, `exp`, validity windows and claims about future events. These fields are useful, but they are statements about time.

If a token says:

```text
not_before = 10:00
```

it can contain that value at 09:00. The token does not make 10:00 exist. A verifier needs a trusted clock to determine whether the condition is actually true:

```text
not_before <= now < expires_at
```

The token carries the claim; the clock supplies the external fact against which the claim is checked.

There is also a security-model boundary here. If a protocol relies on an executor to write truthful temporal or lineage metadata about itself, then correctness of that metadata is an assumption, not a security guarantee. An untrusted executor that is trying to attack the system can omit, rewrite or fabricate metadata just as easily as an honest executor can add it. Metadata becomes security-relevant only when the receiver can verify it against evidence the executor cannot unilaterally forge.

Execution lineage answers a different question. A clock tells us when a request is being evaluated. Lineage tells us what execution the request continues. Two independent executions can happen at the same wall-clock time, and one lineage can continue across minutes, days or months.

Chronological time is measured. Causal position is derived from execution.

## Causal order does not require a timestamp in the token

Consider three execution states:

```text
S1 -> S2 -> S3
```

A bare hash chain is not enough to establish real protocol chronology if one actor can fabricate the whole chain offline. The dependency becomes meaningful only when the predecessor is fixed independently of the successor.

In PIC, that role is played by authenticated predecessor evidence and fresh receiver challenge. The successor must continue something that already exists outside its own control. Under those assumptions, the relationship induces causal order:

```text
S1 happened-before S2
S2 happened-before S3
```

The hash does not encode time. It encodes dependency, and authenticated dependency induces order.

The order itself is classical Lamport happened-before. PIC does not claim to invent causal ordering. PIC uses authenticated causal position as part of authorization. Lamport tells us which event preceded which; PIC asks whether authority may continue from that event.

A cryptographic chain alone is still not PoR. It can bind a successor to a predecessor and establish authenticated adjacency, but adjacency is not yet authorization. The receiver must also evaluate that relationship under the applicable continuity profile: the rules that define whether this continuation is admissible, whether the executor satisfies the contract established by the predecessor, and whether the authority bounds still hold.

The chain tells the receiver what this step claims to continue. The continuity profile determines whether that continuation is admissible under the applicable execution requirements and authority constraints. PoR is the receiver-verifiable evidence that the predecessor relationship satisfies those rules for this hop.

## PoP, PoR and PoC

The picture becomes much easier to read if the spaces and the proofs are kept distinct.

`O × R` is the permission space. PoP proves that the presenter possesses the authority needed to exercise a point or set in that space.

`L` is the execution-lineage coordinate. PoR proves one local relationship in that coordinate: this successor is accepted as a continuation of this specific predecessor.

The combined state is execution-sensitive authority:

```text
O × R × L
```

but that state should not be renamed PoC. Proof of Continuity is the property obtained when valid PoR steps compose across the lineage and the authority context never expands.

So the conceptual mapping is:

```text
O × R       -> permission scope
PoP         -> proof of possession of that authority

L           -> execution-lineage coordinate
PoR         -> proof of one predecessor-successor relationship

O × R × L   -> execution-sensitive authority occurrence
PoC         -> continuity across the composed lineage
```

## Where continuity starts to matter: authority propagation

PIC is most distinctive when authority propagates beyond the first receiver. If we call the first server `S1`, the first hop establishes or presents authority to `S1`. If the flow ends there, there may be no predecessor-successor chain to preserve yet, so ordinary authorization plus PoP can be enough for that decision.

The continuity problem appears when `S1` uses that authority to obtain or derive authority for `S2`. At that second hop, the downstream authority must be related to the exact authority occurrence received by `S1`, not merely to an equivalent permission. The same requirement repeats as authority moves to `S3`, `S4` and beyond:

```text
Client -> S1          authority is presented
S1     -> S2          authority is propagated
S2     -> S3          continuity composes
```

The first hop can establish the root of a lineage. From the second hop onward, PoR gives each receiver a verifiable predecessor-successor relationship, while non-expansion constrains how authority may evolve. PoC is what emerges when those valid relationships compose across the path.

This does not make PIC a multi-hop-only mechanism. A receiver can use execution-sensitive authority at any point. The reason propagation exposes the model so clearly is that every new hop creates another place where two identical permissions could otherwise be mistaken for the same execution.

OAuth 2.0 Token Exchange is a natural integration point for this model because it already defines how authority can be exchanged for a downstream service. PIC adds the missing execution-continuity semantics: not just which authority is issued next, but which authority occurrence it continues. That integration deserves a separate treatment.

## The `n+1` problem: delegating into an unknown future

The unknown `n+1` case is not the only place where lineage matters, but it makes the temporal dimension especially visible.

At step `n`, the system may need to authorize step `n+1` before the concrete resource, outcome, or decision at `n+1` is known. Requiring every future object to be named in advance would defeat the purpose of delegation. The current step therefore constrains a future execution, not necessarily a future object.

The stable reference is the execution itself: its root, its current position, and the bounds that constrain what may be chosen later. The object selected at `n+1` may not exist yet; the authority under which that choice must occur can already be bounded.

Two future delegations can therefore have the same intent, the same holder and the same projected permission while still belonging to different lineages. Their validity windows may even overlap. In `O × R` they may look identical, but in execution space they are different authorization occurrences.

This is the `n+1` problem in its simplest form: the present must constrain an unknown future without pretending that all equivalent future uses are the same execution.

Temporal metadata can describe that future authorization. It cannot create the future execution occurrence or identify which causal path eventually reaches it.

## Revocation shows why the distinction matters

Revocation makes the projection problem concrete.

Suppose Bob holds the same projected permission in two different lineages:

```text
(o, r, ℓ1)
(o, r, ℓ2)
```

Project away lineage and both become:

```text
(o, r)
```

Now Alice wants to stop only the first execution.

If the revocation decision sees only `O × R`, the distinction needed to express that decision has already been discarded. At that level there is no longer an `ℓ1` and an `ℓ2` to choose between. A rule over the projected permission can revoke the permission represented by `(o, r)`, but it cannot mathematically say "stop this occurrence and preserve the other" without introducing some additional execution-sensitive identifier or evidence.

This is why revoking a credential by identifier is not the same thing as revoking an execution. A credential identifier can select an artifact; it does not automatically identify the causal descendants that belong to one execution occurrence.

With lineage preserved, the intended distinction remains expressible:

```text
revoke continuation from (o, r, ℓ1)
preserve              (o, r, ℓ2)
```

The two points have the same projection but different coordinates in execution space.

The core continuity theorem alone does not solve revocation. Execution-scoped revocation still requires trusted revocation state and a profile that defines how receivers enforce it. The narrower point is that once `L` has been projected away, selective revocation by execution can no longer be derived from `O × R` alone. The system can only add new distinguishing evidence or fall back to approximation.


> **Note.** How execution-scoped revocation is expressed and enforced in practice — revocation state, coordinates and receiver rules — is outside the scope of this article.

## The point

The model becomes easier to read when each concept keeps one role.

Intent explains **why** authority was selected. `O × R` describes **what** authority was selected. PoP proves **who can demonstrate possession of it**. `L` identifies **which execution occurrence** is being exercised. PoR proves each local continuation relationship that builds that lineage, and PoC is the continuity property of the composed path.

`L` matters whenever equivalent authority can belong to different executions, whether those executions are immediate, concurrent, retried, asynchronous, delegated across services or extended into an unknown future. The `n+1` case is only the clearest demonstration: the next resource or outcome may not yet exist, while the execution allowed to choose it must already remain distinguishable.

That distinction disappears under projection. Two authorizations can have the same intent, the same holder and the same permissions and still be different authority occurrences because they occupy different positions in execution history.

A timestamp can describe when an artifact should be accepted. A trusted clock can verify whether that moment has arrived. PoR establishes the predecessor relation for one hop. PoC preserves continuity across the composed path.

PIC makes the execution coordinate explicit.

## The claim, exactly

The claim is deliberately narrow:

> **If an authorization decision is invariant to execution lineage, it cannot distinguish authority occurrences that differ only by execution lineage.**

In the execution-sensitive space:

```text
(o, r, ℓ1) != (o, r, ℓ2)
```

Under a projection that forgets lineage:

```text
(o, r, ℓ1) -> (o, r)
(o, r, ℓ2) -> (o, r)
```

the distinction disappears.

That is the temporal dimension PIC adds to authority continuity.

## References

- Gallo, N. (2026). *Proof-of-Continuity: A Temporal Model for Authority Propagation in Distributed Systems and AI Agents*. arXiv:2607.08906 [cs.CR].
- Lamport, L. (1978). *Time, Clocks, and the Ordering of Events in a Distributed System*. Communications of the ACM, 21(7), 558–565.
- Hardy, N. (1988). *The Confused Deputy (or why capabilities might have been invented)*. ACM SIGOPS Operating Systems Review, 22(4), 36–38.
- Miller, M. S., Yee, K.-P., & Shapiro, J. (2003). *Capability Myths Demolished*. Johns Hopkins University technical report.
- IETF RFC 9449 (2023). *OAuth 2.0 Demonstrating Proof of Possession (DPoP)*.
- PIC Prover and Verifier Specification, Draft 0.2. https://www.pic-protocol.org/
- PIC Sandboxed Execution / Lineage Guardrail Specification, Draft 0.2. https://www.pic-protocol.org/

---

**`O × R` is used here as a minimal abstraction of operation-resource permission, not as a claim that every authorization or capability system contains only those two attributes. PIC security claims apply under the stated model assumptions and at conforming verification boundaries. The linear core model is mechanized in Lean; explicit multi-lineage composition remains a specification-level construction. Companion PIC specifications are drafts and may change.**

PIC Model: Nicola Gallo. PIC Specifications: Nitro Agility S.r.l.
