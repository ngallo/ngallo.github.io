+++
author = "Nicola Gallo"
title = "From Hardy’s Compiler to Hardy’s AI Agent: When the Threat Model Changes, the Confused Deputy Returns"
date = "2026-07-25"
description = "Capabilities formally solve the classical Confused Deputy Problem within execution models that preserve the relevant request-to-authority binding. This article asks whether that guarantee composes under a threat model involving long-running, concurrent, and untrusted executions. It presents PIC as a temporal refinement in which valid authority propagation requires receiver-verifiable execution continuity in addition to possession. Under its explicit assumptions, PIC formalises that property; the claim remains conditional on the stated model and on the correctness of its definitions and proof."
tags = ["confused deputy problem", "ai agents", "threat-model", "security", "agentic", "authz", "authority continuity", "untrusted executions" , "pic", "capabilities"]
+++

<figure class="post-banner">
  <img src="/images/2026-07-25/banner.png" alt="From Hardy’s Compiler to Hardy’s AI Agent." loading="lazy">
  <figcaption>From Hardy’s Compiler to Hardy’s AI Agent.</figcaption>
</figure>

<div class="post-hero">

**The question.** This article examines one narrowly defined security property: whether authority propagated across time and multiple execution boundaries remains verifiably attributable to the concrete execution and request for which it was granted.

### The change of question in authority propagation: from actor selection to execution continuity

One scope condition should be kept in mind throughout this article: the following discussion of *who* concerns only the propagation of authority after initial authentication and authority origination. It addresses what happens when already-established authority is handed off, exchanged, resumed, attenuated, or otherwise continued across a later execution boundary. It does not claim that identity is unnecessary for authentication, initial authorization, eligibility, accountability, revocation, or other security properties.

When authority is being propagated, many constructions naturally express security through questions about an actor or holder:

> *Who is calling me? Who may use this propagated authority at the next step? Who delegated to that actor? Whom may that actor call? To whom may authority be delegated next?*

These are meaningful security questions. Their answers may establish authentication, identity, holder binding, eligibility, delegation history, accountability, organisational authority, or possession of a designated key. The word *who* may be represented by an identity, identifier, subject, actor, holder, workload, key, role, or another security principal. None of those properties is dismissed by this article.

The additional authority-continuity problem begins when progression to the next execution step depends on the current actor selecting the successor, request, transaction, stored artefact, or authority context. Unless the receiving boundary independently verifies that selection, its correctness remains part of the security argument. A valid identity or delegation chain can show who acted or delegated; it does not, by itself, prove that the actor selected the correct execution occurrence.

Under the untrusted-execution threat model adopted here, the current actor's discretionary choice cannot itself serve as the proof that the correct execution is being continued. The actor may behave correctly, make an error, confuse concurrent or retained contexts, use stale state, be compromised, or act maliciously. The receiving rule must preserve the defined authority-continuity property without assuming which of those internal cases occurred.

At the authority-propagation boundary, Provenance Identity Continuity (PIC) changes the object of the receiving question. It does not ask the receiver to infer:

> *Whom did the predecessor intend to select or delegate to?*

It asks:

> **May this represented execution validly continue through this successor under the applicable execution contract?**

A conforming receiver answers that question by verifying the represented predecessor, the concrete request, execution-contract conformance, Proof of Relationship, integrity, applicable freshness and revocation conditions, and authority non-expansion. Identity, authentication, attestation, and successor eligibility may remain necessary inputs. What is not accepted as proof is the predecessor's unverified assertion, subjective intention, or discretionary selection of the execution context.

This is the conceptual shift examined here: within authority propagation, from relying on an actor to choose the correct continuation, to requiring the receiving boundary to verify whether the presented continuation is valid. Security mechanisms are intended to reject prohibited transitions whether they arise from error, confusion, compromise, or malicious conduct. For the property defined in this article, **Authority Continuity makes the represented execution itself a coordinate of authorization.** This reframing is limited to the propagation property examined here; it does not replace identity-based questions outside that stage.

> **When authority is being propagated, the question changes from “Who chose the next actor?” to “Can this execution validly continue through this actor?”**

Authentication and the creation of initial authority are presupposed. A principal may authenticate through OpenID Connect (OIDC), and initial authority may be established through OAuth Framework or another authorization mechanism. One possible PIC integration path is an OAuth 2.0 Token Exchange profile that exchanges an OAuth access token for `PCA₀`, the origin PIC Context of Authority. This is a proposed integration direction, not a capability defined by the current PIC specification set or an existing interoperability guarantee. The analysis begins when that authority must continue through later, potentially long-running, concurrent, or untrusted execution.

Capabilities already solve the classical designation–authority mismatch at invocation by combining designation with permission. This article accepts that result. It asks a different question: whether the local request-to-authority binding remains receiver-verifiable when authority is propagated through several execution steps and when one executor may retain authority associated with more than one execution.

PIC is presented as a temporal refinement of that local binding. For the authority-continuity property defined here, PIC places the decision-relevant evidence and checks in the represented protocol state, successor construction, and receiving acceptance predicate. A conforming receiver evaluates predecessor binding, request binding, execution-contract conformance, Proof of Relationship, integrity, freshness where applicable, and authority non-expansion before accepting propagated authority.

> **The article's central distinction:** capabilities bind designation and authority at invocation; PIC makes the continued authority-to-execution relationship represented and receiver-verifiable across an execution lineage.

OAuth access-token propagation is evaluated under the same rule. A valid subject, holder, or token history may establish who acted or delegated, but it establishes execution continuity only when the receiving semantics independently bind that authority use to the exact predecessor execution and request. Where each hop depends instead on a fresh discretionary choice by an untrusted intermediary, continuity remains conditional on that intermediary's cooperation.

<blockquote class="callout-tip">

<p style="color: var(--text-primary);"><span style="color: var(--green); font-weight: 600;">Reading path — the mathematics is optional.</span> This article is designed to be read completely in prose. Every purple box marked <em>Formal notation</em> or <em>Formal derivation</em> sharpens a claim stated in ordinary language immediately before or after it. A reader may skip every mathematical box without losing the threat model, counterexamples, source comparison, impossibility conclusion, Post Office example, or stated boundaries of PIC.</p>

<p style="color: var(--text-primary);">For formal review, the companion paper is the primary source for PIC's definitions, theorem statements, assumptions, and machine-checked formalisation. The mathematical material in this article does not replace or reproduce that complete development. It introduces self-contained notation where needed and applies, specialises, or illustrates the companion paper's formal results for the lineage-invariance and comparative questions examined here. Where this article invokes a numbered theorem or formal definition, the exact statement and assumptions in the companion paper govern.</p>

<p style="color: var(--text-primary);"><strong>Primary formal reference.</strong> Gallo, N. (2026). <em style="color: var(--text-primary);">Proof-of-Continuity: A Temporal Model for Authority Propagation in Distributed Systems and AI Agents</em>. arXiv:2607.08906 [cs.CR] — <a href="https://arxiv.org/abs/2607.08906" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2607.08906</a></p>

<p style="color: var(--text-primary);">Readers seeking the formal route may begin with the companion paper and then inspect the purple boxes in article order. Readers interested in the narrative and comparative argument may omit those boxes entirely.</p>

</blockquote>

### Standing scope and interpretation

The following conditions govern the whole article and are not repeated unless a later section introduces a narrower technical assumption.

This article does not dispute capability-based security, claim that prior work is incorrect, or attribute error, fault, motive, competence, conduct, or opinion to any cited author. The results established by Spiessens and the other cited works are treated as valid within their stated definitions, assumptions, and formal models. The comparison concerns only which security property follows under the threat model adopted here.

This article examines the cited capability material closely rather than attempting a systematic survey of the full capability-security literature. The comparison is anchored primarily in Spiessens's thesis because it provides explicit definitions, a developed capability model, a direct treatment of the Confused Deputy Problem, and formal safety results that can be compared point by point. The thesis is treated as a serious and internally coherent capability contribution within its stated scope, not as the sole, canonical, or exhaustive account of capability security, and not as proof that every capability construction has the same receiving semantics.

The capability comparison does not assume in advance that portable authority lacks continuity. It tests the cited model and passages against the receiver-verifiable multi-hop property defined here. If another work represents, verifies, and proves an execution-sensitive continuation property under comparable definitions, assumptions, threat model, and acceptance predicates, it should be assessed directly and may narrow, qualify, or require revision of the comparison made here. The author expressly welcomes such counterexamples, alternative constructions, and formal results.

The OAuth access-token comparison is similarly bounded. It examines only the base OAuth access-token and bearer-token usage model for the property defined here; it is not a systematic survey of every OAuth profile, security-token format, trust framework, implementation, or deployment. This article does not claim that OAuth access tokens fail, are insecure, or are unsuitable for their intended purposes. It asks only whether the base receiving semantics establish the additional predecessor-specific, receiver-verifiable execution-continuity property under the threat model adopted here. A profile, implementation, or deployment may supply that property through additional execution-sensitive state or controls; when it does, the complete construction must be assessed on its own terms. (The same mechanism-neutral reasoning may apply in general to transaction-oriented token constructions when the stated hypotheses hold, but no specific such construction is evaluated here.)

No statement in this article is a finding that a named product, project, organisation, implementation, or deployment is defective, insecure, or vulnerable. The examples are abstract or hypothetical. Applying the analysis to a concrete system would require a separate system-specific assessment of its complete architecture, acceptance rules, implementation, and operational controls.

PIC is not claimed to replace capabilities, to be the only possible construction, or to establish every property relevant to secure execution. A capability-based, runtime, mediated, isolation-based, or deployment-specific construction may establish an equivalent property if its receiving decision represents and verifies an equivalent execution-sensitive relationship. Equivalence requires comparable definitions, assumptions, threat model, acceptance predicate, and proof obligations; it is not inferred from terminology or implementation category alone.

The PIC claim is conditional on the model's definitions and assumptions, the sound correspondence between concrete verification and the abstract relation, and correct implementation of the selected profile. It does not establish subjective intention, physical or counterfactual causation, semantic correctness, scheduler correctness, internal memory isolation, bug-free local execution, certification, regulatory conformity, or suitability for a particular deployment.

<blockquote class="callout-tip">

<p style="color: var(--text-primary);"><span style="color: var(--green); font-weight: 600;">What “native to the protocol” means here.</span> For the authority-continuity acceptance property, the required discriminator, transition evidence, non-expansion rule, and receiving checks are part of PIC's protocol model and conformance rules. The proof is not delegated to an executor's goodwill, request routing, scheduler, shared-memory discipline, request-scoped isolation, or a separate global mediator.</p>

<p style="color: var(--text-primary);">This does not mean that PIC operates without implementation. Correct cryptography, canonicalisation, verification, enforcement, attestation handling, authority-domain semantics, origination policy, and profile-specific trust assumptions remain necessary. They implement the protocol; they are not substitute mechanisms from which the authority-continuity property is inferred.</p>

<p style="color: var(--text-primary);">Additional isolation, sequencing, mediation, or runtime controls may still be valuable as defence in depth. Under this article's method, however, a security-relevant dependency outside the represented protocol state and receiving acceptance rules is classified as an external assumption and part of the remaining attack surface. It is not counted as a property proved by the protocol.</p>

</blockquote>

PIC is published for critical inspection. Its definitions, assumptions, model correspondence, proof, and implementation requirements remain open to counterexample, reproduction, and correction. Within the stated model and assumptions, this article treats the authority-continuity property as established; that conclusion does not extend beyond them.

</div>

> **A note on terminology.** Throughout this article, *protocol* means **application security protocol**, and more precisely **authorization protocol**. Authentication, transport, wire formats, runtime isolation, and deployment controls are named separately where relevant.

## Evaluation method

The analysis follows five premises.

**1. Authority already exists; the subject is propagation.** The user has authenticated and an initial authority state has been created. How that initial authority is issued or mapped into PIC's origin state is outside the present construction. The question begins when authority crosses a later execution boundary.

<figure class="post-banner">
  <img src="/images/2026-07-25/authority-propagation.png" alt="Authority Propagation." loading="lazy">
  <figcaption>Authority Propagation.</figcaption>
</figure>

**2. A protocol is evaluated by its internal consistency under its declared model.** A claimed guarantee must follow from represented state, transition rules, acceptance predicates, and explicit assumptions. A property is not established merely because a conforming or well-behaved executor is expected to preserve it.

**3. External security dependencies remain assumptions.** If correct attribution depends on scheduler behaviour, request routing, memory separation, executor cooperation, a global mediator, or another mechanism outside the protocol acceptance construction, that dependency must be stated. Under an untrusted-execution threat model, it remains an attack surface unless the external mechanism is separately modelled and verified.

**4. Protocol closure is property-specific.** For the property examined here, a protocol is closed when a receiving boundary can decide whether authority is a valid continuation from the evidence and rules required by that protocol, without treating the predecessor's discretionary assertion of correct purpose or context selection as proof. Closure for authority continuity does not imply control over every local action or every other security property.

**5. Local conduct and propagated acceptance are different questions.** No authorization protocol executes application code or proves the semantic and physical correctness of everything an executor does inside its own boundary. The protocol question is whether one executor can cause a later conforming boundary to accept and propagate authority that is invalid for the represented continuation.

> A protocol guarantee consists of what its model represents and what a conforming receiver verifies. Everything else is either an explicit assumption, a separate control, or outside the guarantee.

## Threat model

The threat model is defined for this article. It is not presented as the only valid model for every distributed system.

An executor is treated as untrusted when the security argument is not permitted to assume that its internal behaviour will preserve correct request-to-authority attribution. This may include defects, compromise, non-deterministic authority selection, retained state, or execution across boundaries that do not themselves prove which request an authority state belongs to. This classification concerns what the proof may assume; it is not an allegation about any particular executor or implementation.

The minimum model contains five elements:

| Element | Meaning in this article |
| --- | --- |
| **Transport is untrusted** | Channel location, routing, or possession of an artefact is not proof that the authority belongs to the execution being continued. |
| **Execution is untrusted and has no required global mediator** | The executor's internal choice is not accepted as proof of correct attribution, and the model does not require a separate globally trusted component to separate every execution step. A conforming receiving boundary still performs trusted protocol verification and enforcement. |
| **Execution may overlap or retain state** | Independent requests and authority contexts may coexist, interleave, or remain available after an earlier step. Concurrency is the principal operational case, but retained state can create the same attribution question sequentially. |
| **The N+1 Unidentified Successor Problem** | A concrete successor occurrence may not exist or be identifiable when authority is originated. Eligibility may be defined in advance; the concrete successor is evaluated when it materialises. |
| **The N+1 Invalid Authority-State Problem** | A receiver must reject a successor state that expands the authenticated predecessor context or presents authority from one execution as a valid continuation of another. The executor's own selection is not the proof of that attribution. |

These elements define the perimeter against which a protocol is evaluated. A protocol may legitimately address a different perimeter. The present comparison asks whether the required property is internal to the examined acceptance construction or is delegated to assumptions outside it.

## Application to long-running AI agents

The same model becomes especially visible for a long-running agent that can serve overlapping requests, retain authority across time, and select later tools, workloads, services, or agents at runtime.

The agent may correctly preserve request-local separation. The threat model simply refuses to use that internal correctness as the proof presented to the next execution boundary. The receiving boundary must independently evaluate the authority state it is asked to accept.

> The relevant question is not whether the agent is expected to choose correctly. It is whether the receiver can verify that the presented authority belongs to the execution being continued.

### Execution-context non-mixing

One executor may host several distinct execution occurrences. They may have the same principal, the same executor identity, and overlapping or identical privilege sets while continuing different requests.

Let `Execution A` and `Execution B` be two such occurrences. Authority valid for `Execution B` does not become valid for `Execution A` merely because:

- the same executor possesses it;
- both executions belong to the same principal;
- both executions concern the same resource;
- both executions carry the same privileges;
- the artefact is authentic;
- the authority was validly delegated in another context.

The required receiving property is **execution-context non-mixing**:

> Authority presented as the continuation of one execution may be accepted only when its relationship to that concrete execution occurrence is valid under the applicable receiving predicate.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the substantive requirement.</p>

<p style="color: var(--text-primary);">Let \(X_A\) be one concrete execution occurrence and let \(S\) be the authority state presented as its continuation:</p>

\[
\operatorname{Accept}(X_A,S)
\Longrightarrow
\operatorname{ValidContinuationOf}(S,X_A).
\]

<p style="color: var(--text-primary);">A state \(S_B\) may be a valid continuation of a different execution \(X_B\):</p>

\[
\operatorname{ValidContinuationOf}(S_B,X_B).
\]

<p style="color: var(--text-primary);">That does not imply:</p>

\[
\operatorname{ValidContinuationOf}(S_B,X_A).
\]

<p style="color: var(--text-primary);">The distinction remains necessary when \(X_A\) and \(X_B\) project to the same principal, resource, operation, or privilege set.</p>

</blockquote>

Execution-context non-mixing is not an additional threat-model element. It is the receiving requirement derived from untrusted execution, overlapping or retained authority state, and the N+1 Invalid Authority-State Problem.

The requirement is occurrence-sensitive rather than merely privilege-set-sensitive. Two executions may carry exactly the same authority context without becoming the same execution. In ordinary language, equality of privilege sets does not establish identity of execution occurrences. Let \(C_A\) and \(C_B\) denote the operation-and-resource authority contexts carried by execution occurrences \(X_A\) and \(X_B\), respectively.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive point.</p>

\[
C_A=C_B
\not\Longrightarrow
X_A=X_B.
\]

</blockquote>

Their principal, executor, operation, resource, and privilege set may all coincide while their predecessor relationships and requests remain different. Non-expansion alone therefore cannot distinguish every cross-execution substitution; the complete receiving predicate must also verify the applicable predecessor, request, lineage, relationship, integrity, and freshness conditions.

For the authority-continuity property, PIC internalises this requirement in the protocol construction: the receiver checks the represented predecessor, the concrete request binding, the execution contract, the relationship evidence, integrity and freshness conditions, and authority non-expansion. It does not require the receiver to infer subjective intent or trust an unverified claim that the executor selected the correct internal context.

In this limited sense, PIC makes execution lineage a causal or temporal coordinate of authorization. “Temporal” refers to the represented succession of execution steps and their predecessor relationships, not merely to wall-clock time.

This property remains narrower than correct execution. Selecting authority from the wrong execution and performing an operation incorrectly are different failures. PIC governs whether propagated authority is accepted as a valid continuation; it does not prove semantic intent, physical effects, or correct local application behaviour.

## Defining the model-relative failure condition

**The classical case.** Norm Hardy described it in 1988, and the deputy was a compiler. It ran on behalf of whoever invoked it, writing output to a path the caller supplied, and it also held authority of its own over files it maintained for its own purposes. Name one of those files as the output path and the compiler writes there.

The root of that failure is not authority expansion. It arises when a requester designates a resource, but the deputy acts on that resource using authority belonging to the deputy rather than authority supplied by the requester.

Capabilities close exactly that gap. They require the client to supply, as part of the request, the capability that both designates the target resource and conveys the authority the deputy is expected to exercise. Designation, permission, and the authority to be exercised for that request stop being three separable things.

```
One invocation

Compiler
 ├── User authority
 └── Homefiles authority
```

> Which authority should this operation use?

**Hardy's AI Agent.** Now take the same shape and change only the deputy: suppose it is not a compiler but an AI agent authorised to act for Hardy today. Call it **Hardy's AI Agent**.

This is a hypothetical, and nothing more. No such system is being described and no existing product is meant. No claim about this AI-agent analogy, its threat model, or its terminology is attributed to Hardy. The analogy is constructed by this article for one purpose: to make the problem visible by changing a single variable.

<blockquote class="callout-warning">

<p style="color: var(--text-primary);"><span style="color: var(--orange); font-weight: 600;">Terminology and attribution.</span> <strong>Hardy's AI Agent</strong> is a hypothetical name introduced by this article for the transformed example. It is not a system described, proposed, reviewed, or endorsed by Norm Hardy. The classical <em>Confused Deputy Problem</em> refers here to the authority mismatch exemplified by Hardy's 1988 compiler case. For the purposes of this article, <strong>Temporal Confused Deputy</strong> is an author-defined descriptive label for the related cross-execution authority/causality mismatch defined below. The expression is not attributed to Hardy and is not represented as established terminology, a standard classification, or a name accepted by the wider research community. The title's phrase <em>the Confused Deputy Returns</em> expresses the article's analogy and does not reattribute the temporal model to Hardy.</p>

</blockquote>

Hardy's AI Agent is not one short call. It is long-running, concurrent, and autonomous. It receives several delegations at once, holds authority across time, and may start further executors that were not known when the first request was made.

```
Long-running invocation

AI Agent
 ├── User authority (Request A)
 ├── User authority (Request B)
 ├── Tool authority
 ├── Memory authority
 └── Cached authority
```

> Which execution does this authority belong to?

**One person, one identity.** Hardy is the only user of the agent, so every authority it holds was granted by Hardy himself. Nothing in what follows depends on a second user, on a hostile principal, or on authority crossing an organisational boundary — those would be different problems.

Yet the agent holds authority for Request A, for Request B, for internal tools, for memory, and for cached operations at the same time. Coming from the same person does not make them belong to the same execution.

### One untrusted executor, several execution occurrences

In the diagram, \(X_A\) and \(X_B\) denote the two execution occurrences, while \(S_A\) and \(S_B\) denote their respective authority states.

```text
SAME PRINCIPAL: HARDY

                  SAME UNTRUSTED EXECUTOR E
        +---------------------------------------------+
        |                                             |
Request A
    |
    v
Execution X_A  ---- authority state S_A               |
        |                                             |
        |       overlapping or concurrent             |
        |       scheduling, retained state,           |
        |       memory and authority selection        |
        |                                             |
Request B
    |
    v
Execution X_B  ---- authority state S_B               |
        |                                             |
        +---------------------------------------------+


Locally attributable states:

X_A  ---->  S_A
X_B  ---->  S_B


States that must not be accepted without
a verified execution relationship:

X_A  ---->  S_B
X_B  ---->  S_A

X_A  ---->  S_A union S_B
X_B  ---->  S_A union S_B
```

The crossed cases are not predictions that the agent will inevitably perform those transitions. They identify transitions whose invalidity cannot be established merely by assuming that the untrusted executor correctly separates its internal execution contexts.

The executor may correctly maintain request-local state. It may also contain a bug, be compromised, retain authority after one execution, select authority from shared state, or route one request through state populated by another. The receiving boundary cannot determine which internal case occurred merely from the executor's assertion that it selected the correct state.

The required condition is:

> Authority presented as the continuation of \(X_A\) must be accepted because its relationship to \(X_A\) is independently verifiable, not merely because executor E possesses that authority.

This condition remains relevant where:

- Hardy is the only principal;
- both executions run inside the same process or agent;
- both states are authentic;
- both states contain overlapping or identical privileges;
- the executor acts without malicious intent.

A system may preserve this separation through PIC or through another construction that represents and verifies an equivalent per-execution relationship. Under the evaluation method stated above, the question is whether the relationship is part of the receiving acceptance predicate or remains an external implementation assumption.

**The article-defined Temporal Confused Deputy condition.** For the purposes of this article, *Temporal Confused Deputy* names the cross-execution authority/causality mismatch defined here. It describes a temporal and multi-step instance of the general mismatch exemplified by the classical Confused Deputy Problem.

It is not primarily an authority-expansion failure. In the classical case the deputy uses its own authority on a resource designated by the requester. In the temporal case one executor hosts more than one execution occurrence and presents authority associated with one occurrence while continuing another.

The violation is cross-execution authority misattribution, not the mere coexistence of several authority states. The same executor may legitimately possess every authority involved. The question is whether the state presented for the current continuation remains attributable to the represented predecessor execution.

Every authority involved may be genuine, correctly signed, really delegated, and valid in some context. Two occurrences may even project to the same principal, resource, and privilege set while remaining distinct executions.

> Validity of the authority is not the same as validity of its attribution to the current execution.

The label applies only to an accepted transition satisfying the stated model and acceptance conditions. Within that model, the security failure is cross-execution authority misattribution: authority associated with one occurrence is accepted as part of another occurrence's continuation without the required verified relationship. Forgery, malicious intent, or an increase in the underlying privilege set is not required.

**Execution as a third coordinate.** In the classical Confused Deputy, the capability makes resource designation and authority inseparable at invocation. The problem examined here adds one coordinate: the concrete execution lineage in which that authority may be exercised. The execution does not replace the resource — operation and resource remain relevant. It is the additional coordinate that determines where otherwise valid authority may continue.

> Capability security makes the resource and the authority inseparable at invocation. Authority continuity additionally makes the authority and its execution lineage inseparable across time.

**Operations over the execution.** Once the execution is an explicit object of authorization, operations traditionally defined over capabilities or resources have to be defined over the execution context as well. An execution is originated. It may be continued. Its authority may be attenuated. Several independent executions may participate jointly without merging their authorities into one lineage. An execution may be revoked or interrupted by coordinates of its own. And a continuation must prove which execution it belongs to.

**A `run` command can have this shape.** A user may authorise `run this task`, or `start this execution under authority C`. At the moment the command is given the process may not exist yet, the next executor may not be known, one or many executors may appear later, and no identity is necessarily available in advance to bind the authority to.

> A `run` command does not necessarily identify the process that will eventually perform every step. It originates an execution whose future executors may materialise later. The security question is therefore whether each later use of authority remains a valid continuation of that execution.

**The two questions.**

> Hardy's compiler asked: which authority should this operation use?
>
> Hardy's AI agent asks: which execution does this authority belong to?

The classical capability answer binds designation and authority at invocation. The additional requirement examined here is to preserve that binding as authority continues across time, concurrency, and not-yet-known successors. Possession or invocation alone does not establish the authority-continuity property defined by this article, unless the system additionally represents and verifies the relevant execution binding.

## A runtime countermodel

Capabilities address the classical Confused Deputy Problem by having the client supply, with the request, the capability that both designates the target resource and conveys the authority to be exercised. The additional question examined here is whether the deputy's selection among all authority it holds remains attributable to the execution being continued.

The following deliberately minimal countermodel tests the defined acceptance property. Alice is the only user of the agent, every authority involved comes from Alice, and a shared possession-based accumulator composes capabilities as they arrive. The countermodel intentionally contains no represented execution-lineage binding and no separately modelled mechanism that prevents the illustrated interleaving. Its purpose is to determine what follows from that acceptance rule, not to characterise an implementation category.

For this countermodel, `capA` and `capB` denote the two input capabilities. `C_A` and `C_B` are the authority contexts they carry. Each context is a set of operation-and-resource privilege pairs.

Neither context contains all the authority of the other. Context A therefore contains at least one privilege that Context B lacks, and Context B contains at least one privilege that Context A lacks.

The shared accumulator begins empty. The deliberately minimal composition operation adds authority by taking the set union of the current accumulator and the newly received context.

The pseudocode value `none` denotes the empty authority set. These definitions belong only to this deliberately minimal countermodel; they are not claims about every capability implementation.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">The two authority contexts are subsets of the operation-and-resource privilege universe:</p>

\[
C_A, C_B \subseteq O \times R.
\]

<p style="color: var(--text-primary);">Neither context subsumes the other, so there are privileges:</p>

\[
a \in C_A \setminus C_B
\qquad\text{and}\qquad
b \in C_B \setminus C_A.
\]

<p style="color: var(--text-primary);">The empty accumulator is:</p>

\[
C_{\varnothing}=\varnothing.
\]

<p style="color: var(--text-primary);">Composition in this countermodel is set union. For authority-context sets \(U\) and \(V\):</p>

\[
\operatorname{compose}(U,V)=U\cup V.
\]

</blockquote>

With non-overlapping execution, the shared accumulator is cleared when each call completes:

```text
client_authority = none

call1 receives capA
    client_authority = compose(client_authority, capA)
    execute(client_authority)              # carries only C_A
    client_authority = none

call2 receives capB
    client_authority = compose(client_authority, capB)
    execute(client_authority)              # carries only C_B
    client_authority = none
```

The sequential baseline therefore preserves the request-local contexts in this countermodel. `call1` executes only with Context A, and `call2` executes only with Context B.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

\[
C_{\text{call1}}=C_A,
\qquad
C_{\text{call2}}=C_B.
\]

</blockquote>

With overlapping execution, both updates may occur before either call executes or clears the shared accumulator:

```text
client_authority = none

call1  client_authority = compose(client_authority, capA)
call2  client_authority = compose(client_authority, capB)

call2  execute(client_authority)      # carries C_A union C_B
call1  execute(client_authority)      # carries C_A union C_B

call2  client_authority = none
call1  client_authority = none
```

This interleaving is one reachable execution of the deliberately minimal countermodel under its stated shared-state and scheduling assumptions. It is not a claim about every capability implementation.

Within this minimal accumulator model, every update is individually valid according to the accumulator's possession-based rule. Because both updates occur before either execution clears the accumulator, the shared state contains the authority from both independent request contexts.

`call1` can consequently receive the privilege found only in Context B, while `call2` can receive the privilege found only in Context A.

Each capability is genuine, the union is well formed, and every included privilege was granted by Alice. The failure is that the accumulator's acceptance rule does not preserve which execution each privilege belongs to.

This establishes cross-execution authority misattribution only within the countermodel and assumptions defined above.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">After the two updates, the shared authority state is:</p>

\[
C_{\mathrm{shared}}=C_A\cup C_B.
\]

<p style="color: var(--text-primary);">When `call1` executes with \(C_{\mathrm{shared}}\), it may exercise \(b\), although \(b\notin C_A\). When `call2` executes with the same state, it may exercise \(a\), although \(a\notin C_B\).</p>

</blockquote>

**Interpretation.** A construction that represents and verifies an equivalent per-execution binding may prevent this transition. Under the article's method, that property must be demonstrated by the construction's acceptance rules or identified as an external assumption.

This result follows from the structure of the minimal model under the stated concurrency assumptions and does not require malicious conduct. Whether the stated shared-state construction would constitute an implementation defect depends on the requirements of the concrete system. A buggy or compromised executor creates additional risks, but the example isolates a narrower issue: valid authority from independent executions is composed without a protocol-verifiable representation of execution lineage. Three consequences follow within that model:

| Consequence | Why |
| --- | --- |
| **The model has no request-scoped separator** | In this minimal shared-state model, no request-scoped mechanism separates the two authority contexts. |
| **Execution attribution is absent** | Nothing in the accumulated authority records which execution each authority item belongs to. |
| **Deputy cooperation is not the proof** | The deputy's cooperation cannot be used as the premise that proves correct execution attribution under this threat model. |

> Under this threat model, continuity cannot be established solely through the deputy's cooperation. It must be represented and independently verified at the receiving boundary, whether through PIC or through another construction shown to establish an equivalent property.

## OAuth access-token assumptions

“Bearer” describes presentation and use semantics, not an encoding and not the complete security properties of every OAuth access-token profile. A bearer access token is usable by a party that possesses and presents it, subject to the receiving system's validation rules.

Copyability or presentability alone does not determine whether an artefact will be accepted. The relevant comparison is the complete receiving acceptance predicate: token validity, issuer, audience, holder binding where applicable, profile-specific conditions, request binding, predecessor binding, execution-contract conformance, non-expansion, and any lineage or continuity evidence required by the mechanism.

**What is in question, and what is not.** This article concerns authority propagation across execution boundaries. Authentication, OIDC, and the initial issuance of an OAuth access token are outside its scope. It does not claim that OAuth access tokens are defective, insecure, or generally unsuitable. The question begins only after authority has reached a workload, system, or agent and must be propagated or resumed under the threat model defined here. Implementations may preserve the required relationship through additional mechanisms; those mechanisms are respected as part of the complete construction but are not attributed to the base access-token semantics.

<blockquote class="callout-tip">

<p style="color: var(--text-primary);">This article does not evaluate OIDC or the initial creation of an OAuth access token. <span style="color: var(--green); font-weight: 600;">It examines whether the authority artefact and the receiving acceptance predicate preserve the required authority-to-execution binding when authority is propagated further.</span> No claim is made here about which initial integration mechanism should create a <code>PCA₀</code>, and no existing interoperability guarantee is asserted.</p>

</blockquote>

**This is not a defect claim.** OAuth access tokens may correctly and securely address the purposes and threat models for which their applicable specifications, profiles, and deployments are designed. The comparison here uses a narrower criterion: what the receiving execution boundary is required to verify before propagated authority may be exercised.

### Transport protection and execution attribution are different properties

The threat-model statement *transport is untrusted* does not mean that a conforming deployment omits transport protection. RFC 6750 requires Transport Layer Security (TLS) for bearer-token use and identifies disclosure, redirect, and replay as security threats. A bearer token intentionally sent over an unprotected channel would therefore fall outside the protected usage model described by that specification.

The threat model makes a different point: channel security, routing, or successful delivery is not accepted as proof that the token belongs to the execution being continued. TLS can protect confidentiality and integrity in transit and can substantially reduce on-path capture and replay. It cannot, by itself, determine whether an authentic token delivered over that channel came from the correct concurrent, retried, recovered, or predecessor execution. A secure channel can transport the wrong valid token just as reliably as the right one.

### Secure storage protects an artefact; it does not create its execution relationship

Durable or protected storage of an authority artefact can be necessary for recovery and can materially reduce disclosure, tampering, or accidental loss. Those are substantive benefits. Storage security alone, however, does not establish which execution occurrence a stored artefact is authorised to resume.

If a vault, database, workflow engine, scheduler, or recovery service stores an authority artefact under an execution-specific record and the receiving boundary independently verifies that record and its transition, that component may supply part of an equivalent continuity construction. Its correctness, availability, access control, rollback resistance, freshness, and artefact-to-execution association then become explicit trust and proof obligations.

If the deployment merely retrieves an authentic artefact and treats possession of the retrieved bytes as sufficient, the missing relationship has not been created. A compromised selector, stale index, rollback, substitution, or cross-context lookup may return a genuine artefact belonging to another execution. Encrypting or integrity-protecting each stored artefact does not prevent a valid artefact from being associated with or selected for the wrong execution.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive point.</p>

<p style="color: var(--text-primary);">Let \(A\) denote a stored authority artefact and \(X\) a concrete execution occurrence. Protecting the confidentiality and integrity of \(A\) does not, by itself, establish its continuation relationship to \(X\):</p>

\[
\operatorname{SecureStorage}(A)
\not\Longrightarrow
\operatorname{ValidContinuationOf}(A,X).
\]

<p style="color: var(--text-primary);">Here, \(A\) may be an OAuth access token, capability, workflow credential, or PIC Context of Authority (PCA). The implication expresses insufficiency, not incompatibility: any of these artefacts may be stored and later presented. Under PIC, a stored PCA may participate in a valid continuation when the receiving boundary also verifies the complete applicable PIC continuation predicate, including predecessor and request binding, relationship evidence, execution-contract conformance, integrity and freshness conditions, revocation state, and authority non-expansion. The acceptance property comes from those checks, not from storage alone.</p>

</blockquote>

The security-relevant object is therefore not only the stored artefact. It is the complete relation among that artefact, the represented predecessor, the concrete request, the recovery event, the eligible successor, and the receiving decision. When that relation is outside the artefact's or protocol's receiving semantics, it remains an additional mechanism and part of the deployment's attack and failure surface. That does not make the mechanism invalid; it means the continuity property must be attributed to and assessed against the complete construction rather than to storage alone. This statement applies equally to PIC: storage can preserve a PCA across restart or hand-off, but storage neither invalidates the PCA nor proves the successor transition.

## OAuth access-token evaluation: the lineage-sensitive receiving criterion

The criterion used in this article is independent of implementation labels. A capability, OAuth access token, runtime object, durable workflow record, or mediated credential may contribute to authority continuity. The relevant question is whether the final receiving decision represents and verifies the relationship between the presented authority and the concrete execution being continued.

The same logical test is applied to every mechanism family:

> If two authority-use occurrences are decision-equivalent under every represented and verified input read by the receiver, but execution-context non-mixing requires one occurrence to be accepted and the other rejected, that receiving rule cannot establish the required property.

This is a test of receiving semantics, not a ranking based on names. A mechanism avoids the lineage-invariant impossibility boundary only when its complete acceptance construction reads and verifies an adequately discriminating execution-sensitive relationship.

### Token-visible identity and delegation are not automatically execution lineages

An OAuth access token or related token-visible history can establish which subject, holder, key, issuer, audience, scope, or delegation information is represented. Those are substantive security properties. They do not, by themselves, answer the occurrence-sensitive question required here: *which concrete predecessor execution and request does this authority use validly continue?*

Several executions may involve the same principal, holder keys, issuer, audience, scope, token-visible labels, and resources while requiring different continuation decisions. A valid token or delegation record therefore does not automatically establish that the presented authority continues one particular execution occurrence rather than another authentic occurrence with the same visible attributes.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive point.</p>

<p style="color: var(--text-primary);">Let \(h_i\) and \(h_{i+1}\) denote successive token holders or represented actors, and let \(X_i\) and \(X_{i+1}\) denote the corresponding execution occurrences. Where token validity or delegation is verified without the execution-continuation relation:</p>

\[
\operatorname{ValidTokenStep}(h_i,h_{i+1})
\not\Longrightarrow
\operatorname{ValidContinuation}(X_{i+1},X_i).
\]

</blockquote>

### Fresh token issuance is a cooperation dependency

When every hop requires the current actor or service to select a successor and request and to obtain or issue fresh access-token authority for that successor, that participant becomes necessary to both safety and liveness. Progress depends on it remaining available and authorised. Correct attribution depends on it selecting the intended request, authority context, and successor.

Under the untrusted-execution threat model adopted here, that cooperation cannot itself be the proof that those choices were correct. A compromised or confused participant may obtain or issue a cryptographically valid token for the wrong execution context. An unavailable, crashed, or revoked participant may be unable to advance a still-authorised execution. The resulting token sequence can therefore be valid under its applicable issuance and validation rules while still failing to prove the execution-continuation property defined here.

This is not a universal impossibility result for OAuth access-token protocols. An authorization service, durable workflow authority, receiver, or other construction may independently validate a represented predecessor and request relation. When it does, the continuity property is supplied by that complete verified construction. It is not supplied merely by the validity of each token step.

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);"><strong>Token materials examined.</strong> The source-specific comparison in this section is limited to <a href="https://www.rfc-editor.org/rfc/rfc6749.html" target="_blank" rel="noopener noreferrer">OAuth 2.0 (RFC 6749)</a> and <a href="https://www.rfc-editor.org/rfc/rfc6750.html" target="_blank" rel="noopener noreferrer">Bearer Token Usage (RFC 6750)</a>.</p>

</blockquote>

### OAuth access tokens

This section does not claim that OAuth access tokens “do not work.” It evaluates one additional property under one stated threat model. OAuth access tokens may be valid, secure, and suitable within their intended specifications, profiles, and deployments; implementations may also provide execution binding through controls outside the base token semantics.

The base OAuth access-token specification defines an access token as representing an authorization, while RFC 6750 defines bearer presentation and the transport and handling protections required for that usage. The exact token syntax, claims, validation data, sender constraint, and deployment trust model depend on the applicable profile. Those base specifications do not require the receiver-verifiable predecessor-specific execution-continuity predicate used in this article.

The property-specific conclusion is therefore affirmative but limited: **the base access-token and bearer-token construction, without an additional execution-sensitive profile, does not establish receiver-verifiable multi-hop execution continuity under the adopted threat model.** A receiving rule that verifies token validity, issuer or authorization server, audience, scope, expiry, holder where applicable, and other profile conditions but does not verify an execution-sensitive continuation relation cannot distinguish two occurrences that are identical under those token-visible conditions but belong to lineages requiring different decisions.

Sender constraint can prove possession of a designated key and can materially reduce token theft and replay. Secure transport and protected storage can preserve confidentiality and integrity. None of those properties, by itself, proves which concurrent, retried, recovered, or retained execution occurrence the use continues. A profile that also verifies the required execution relationship may establish the property; the guarantee then comes from that additional profile and its complete receiving predicate.

### Scope of the OAuth access-token conclusion

The conclusion above is limited to the base access-token and bearer-token semantics examined here. It does not classify every OAuth profile, workflow system, or deployment. A complete construction may establish an equivalent property if its receiving decision independently represents and verifies the exact predecessor execution and request. In that case, the guarantee belongs to that complete construction, and the receiving rule is no longer lineage-invariant for the relevant occurrences.

### Application of the impossibility boundary

The impossibility result applies to OAuth access-token constructions when its hypotheses actually hold. An OAuth access-token receiving rule falls within the lineage-invariant class when, for the occurrences being compared, all represented and verified token, storage, recovery, profile, and policy inputs are equal or decision-equivalent while the rule does not read a discriminator capable of distinguishing their execution lineages. If the required security property nevertheless demands different decisions, that rule cannot establish execution-context non-mixing.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim.</p>

<p style="color: var(--text-primary);">Let \(T\) denote all access-token, storage, recovery, profile, and policy inputs read and verified by a receiving rule; let \(\ell\) denote the execution lineage; and let \(\bar A_{\mathrm{OAuth}}\) denote a decision function that is independent of lineage. If the OAuth receiving rule is lineage-invariant:</p>

\[
A_{\mathrm{OAuth}}(T,\ell)=\bar A_{\mathrm{OAuth}}(T),
\]

<p style="color: var(--text-primary);">then two occurrences with the same decision-relevant \(T\) receive the same result. The rule cannot satisfy a property that requires one to be accepted and the other rejected solely because their execution lineages differ.</p>

</blockquote>

This is not a theorem that all OAuth access-token profiles are lineage-invariant. It is an application rule: **token validity, audience restriction, holder binding, token labelling, secure storage, or replacement processing establishes this property only when the complete receiving semantics turn the represented data into an authenticated and adequately discriminating continuation relation.**

### Transport, replay, storage, and recovery

Authority continuity does not force a system to use bearer tokens. A deployment may use sender-constrained tokens, capabilities, durable workflow state, mediated credentials, attestations, or another construction. The narrower concern is that recovery and long-running propagation are sometimes implemented by retaining, copying, or replaying an authority artefact because the original executor is gone.

Where that artefact is bearer-usable, possession can become the operational bridge across restart or hand-off. RFC 6750 requires transport confidentiality for bearer-token use; a deployment that omits it exposes the token to disclosure and replay risks already recognised by that specification. With conforming transport protection, those on-path risks are materially reduced, but the execution-attribution question remains: the receiver must still determine whether the presented token belongs to the exact execution occurrence being resumed.

Protected storage has the same separation of concerns. Encryption, integrity protection, hardware-backed keys, access control, and auditing may make storage robust. They do not prove that the retrieval key, workflow record, or selected token corresponds to the correct predecessor execution. If a trusted storage or workflow component verifies that association, it becomes part of the complete continuity construction. If the association is supplied only by an untrusted executor, possession of a securely stored token remains insufficient under the adopted threat model.

Replay controls also introduce explicit state assumptions. Short expiry, sender constraint, audience restriction, unique token or request identifiers, and single-use records can reduce or detect replay. A replay cache or shared replay store may be a valid control, but its consistency, availability, rollback resistance, and cross-instance coordination are part of the assurance argument. They should not be treated as properties supplied by token validity alone.

In the post-office example, a token naming Alice or Carol, a delivery scope, an audience, or another token-visible label may be valuable. The decisive point is not the presence or secure storage of those labels alone. It is whether the receiving post-office boundary can verify that Carol's presented state is a valid continuation of the exact parcel execution and predecessor state at issue, rather than another authentic execution involving the same subject, holder, audience, scope, stored artefacts, or permissions.

## Capability assumptions

This section compares specific passages from the cited work with the additional property defined above. Spiessens is used as the principal comparison corpus because the thesis states its capability assumptions and Confused Deputy analysis in sufficient detail for a point-by-point examination; it is not treated as exhaustive of the capability literature. Each entry gives the reference, the passage verbatim and uncut, the result established by that passage, and the narrower comparison made under this article's threat model. Absence of an entry implies nothing about the work or about capability constructions not examined here.

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);">Spiessens, A. (2007). <em style="color: var(--text-primary);">Patterns of Safe Collaboration</em>. PhD thesis, Université catholique de Louvain, Louvain-la-Neuve — <a href="https://www.evoluware.eu/fsp_thesis.pdf" target="_blank" rel="noopener noreferrer">fsp_thesis.pdf</a></p>

</blockquote>

<blockquote class="callout-tip">

<p style="color: var(--text-primary);"><span style="color: var(--green); font-weight: 600;">One element is conceded up front: on <em style="color: var(--green);">transport is untrusted</em> there is nothing to distinguish.</span> Cryptographically protected capability systems and PIC both operate over untrusted transport. The four entries below concern the remaining elements.</p>

</blockquote>

### What the cited capability model already establishes

The cited work establishes substantive security properties that this article accepts within their stated model. Capabilities combine designation and access permission, allowing the client to provide the authority the deputy is expected to exercise. This closes the classical designation–authority gap addressed by the Confused Deputy example.

The model also supports dynamic creation, parenthood, endowment, and authority propagation through interaction. Its Knowledge Behavior Model (KBM) safety analysis uses a fixed finite set of abstract subjects for tractability, while potentially unbounded concrete runtime entities may be represented through aggregation. The resulting analysis is conditional on the safety and representativeness of that abstraction.

Stack walking and capability delegation are separate approaches. The parallel and distributed limitation quoted below applies to the stack-based approach, not automatically to the capability construction.

A capability invocation, as characterised by the cited work and the companion paper, provides a local request-to-authority discriminator by binding designation and access permission at that invocation. The narrower question examined here is whether the cited result establishes that local binding as a receiver-verifiable invariant across a long-running, multi-hop execution lineage.

### From local discrimination to composable continuity

A capability invocation, as characterised by the companion paper, is not equivalent to the lineage-invariant possession policy of Definition 7: designation and access permission are bound at one causal step, so a local discriminator is already present. A capability later treated as a freely held artefact and applied outside the occurrence that carried it may nevertheless fall within the possession-based case analysed by the companion paper. The paper treats the invocation-level binding as a one-hop instance of the continuity primitive.

The discriminator theorem therefore does not show that capabilities lack discrimination. It establishes, under its stated definitions, that a policy distinguishing an authorised occurrence from a confused occurrence must read some lineage-sensitive discriminator.

The trade-off theorem further establishes, under its stated definitions, that lineage-invariant authorization, authority-mixing-capable delegation, and confused-deputy safety cannot all be retained simultaneously. The comparison below therefore concerns where the discriminator is represented, who verifies it, and whether the local one-hop binding composes as a receiver-verifiable invariant across multiple execution steps.

The formal comparison below applies only where the stated hypotheses hold, particularly where the receiving decision is invariant under execution lineage.

### Point 1 — the two proposed solution categories

<table class="source-entry">
<tbody>
<tr>
<th scope="row">Author</th>
<td>Spiessens, A. — <em>Patterns of Safe Collaboration</em> (2007)</td>
</tr>
<tr>
<th scope="row">Page</th>
<td>189, §8.1.2 <em>Proposed Solutions</em></td>
</tr>
<tr>
<th scope="row">Original</th>
<td><div class="verbatim">
<p>The approaches that have been proposed in the literature to solve this problem, can be divided in two categories.</p>
<ol>
<li>Identify the client or his permissions at runtime and make sure that he has permissions that provide him with the authority (1). If necessary, switch off the deputy’s permissions that provide him with authority (3) and (4).</li>
<li>Make the client’s authority (1) portable, so that the deputy can use (1) in the same way the client would, and make passing-portable-authority the only way to delegate. The client then has to explicitly pass the portable authority (1), for the deputy to use. The client will not be able do that unless he has (portable) authority himself. Then rely upon the deputy not to use (3) or (4) instead of (1).</li>
</ol>
<p>We will now have a brief look into the practical feasibility of both approaches.</p>
</div></td>
</tr>
<tr>
<th scope="row">Discussion</th>
<td><strong>Establishes.</strong> Category 2 makes the client's authority portable and makes passing portable authority the stated delegation mechanism. The passage then explicitly says to <em>rely upon the deputy not to use (3) or (4) instead of (1)</em>.<br><br><strong>Comparison here.</strong> This is an explicit behavioural dependency on the deputy's authority selection. Under a threat model that does not treat the deputy's conduct as the protocol proof of execution attribution, the passage does not itself establish a receiver-verifiable binding between the authority used and the execution being continued.</td>
</tr>
<tr class="not-satisfied">
<th scope="row">Comparison under this article's threat model</th>
<td>The cited result is conditional on the deputy not substituting its own authority for the authority delegated by the client. The passage does not itself establish the additional receiver-verifiable execution-attribution property defined here.</td>
</tr>
<tr>
<th scope="row">Under PIC</th>
<td><strong>Mechanism.</strong> Validity is decided by the receiving hop under the checks required by the selected PIC validation profile. Every conforming receiving check validates the presented transition. A successor carrying a privilege absent from its represented predecessor fails non-expansion; one that does not satisfy the applicable predecessor relationship fails predecessor binding. Under the stated verification and enforcement assumptions, an invalid presented transition is rejected before the receiving boundary permits the propagated authority to be exercised.<br><br><strong>Boundary.</strong> Local physical or semantic conduct is not covered. Correct verification and enforcement remain trusted. In the incremental profile, earlier validity is accepted inductively through prior Verifiers rather than independently revalidated as a complete prefix; stronger full-prefix assurance requires an applicable stronger profile.</td>
</tr>
</tbody>
</table>

### Point 2 — checking who is asking

<table class="source-entry">
<tbody>
<tr>
<th scope="row">Author</th>
<td>Spiessens, A. — <em>Patterns of Safe Collaboration</em> (2007)</td>
</tr>
<tr>
<th scope="row">Page</th>
<td>189–190, §8.1.2, <em>Approach 1: Check Who's Asking</em></td>
</tr>
<tr>
<th scope="row">Original</th>
<td><div class="verbatim">
<p>If we can check and manipulate the permissions of all subjects at runtime, we can safely proceed as follows: provide the necessary permissions for (1) and (3) to the deputy, only if we can detect that he does not want to use (3) for its client’s purposes, as a replacement for (1).</p>
<p>There are theoretical and practical problems with this approach. The most important theoretical problems are:</p>
<ul>
<li>What do we mean ... “Who is asking?” ?<br>If I delegate a task to you and you delegate it further to the eventual deputy, which one of us is the deputy working for then?</li>
<li>We cannot infer the deputy’s intentions for using (3) from the fact that someone invoked him with or without (1).</li>
</ul>
<p>Instead of solving these problems exactly, the practical implementations of these approaches settle for the following approximations:</p>
<ul>
<li>Assume that the deputy is working for a subset of all potential clients in the call stack and demand that all of the subjects in that subset have permissions that prove their authority (1). For instance, if I call you and you call the deputy, we are both his clients.</li>
<li>Approximately infer the deputy’s intentions for using (3) in some way from the information that you do have. Such approximations are usually crude.</li>
</ul>
</div></td>
</tr>
<tr>
<th scope="row">Discussion</th>
<td><strong>Establishes.</strong> The passage identifies two theoretical problems for the <em>Check Who's Asking</em> approach: a delegation chain does not uniquely identify which client the deputy is working for, and invocation does not reveal the deputy's intention. The practical alternatives are described as approximations, some of them crude.<br><br><strong>Comparison here.</strong> This supports the execution-attribution part of the problem defined by this article for Approach 1. It does not establish a failure of authority non-expansion or a limitation of capability systems generally.</td>
</tr>
<tr class="not-satisfied">
<th scope="row">Comparison under this article's threat model</th>
<td>For the <em>Check Who's Asking</em> approach, exact client or intention attribution is not established by the cited passage. The additional receiver-verifiable execution-attribution property therefore does not follow from this approach as described.</td>
</tr>
<tr>
<th scope="row">Under PIC</th>
<td><strong>Mechanism.</strong> Intent is not inferred. The receiving decision evaluates whether the presented state is a contract-conforming, non-expansive continuation of one represented predecessor and concrete request under the applicable PIC profile. The decision does not depend on selecting which member of a delegation chain the deputy subjectively serves. It validates one represented predecessor relationship through the applicable ordered checks.<br><br><strong>Boundary.</strong> Proof of Relationship does not establish physical, counterfactual, subjective, or prior-designation causation. Together with the complete receiving checks, it establishes only the model-relative PIC execution-causality and continuation property defined by the specification.</td>
</tr>
</tbody>
</table>

### From "Who is asking?" to execution continuity

PIC is closer to the attribution question raised by *Who is asking?* than to an attempt to infer the deputy's psychology. It preserves the need for attribution but changes its object: from identifying a caller or client in a delegation chain to verifying the concrete predecessor execution that the presented authority state continues.

PIC does not adopt the mechanism described under Spiessens's *Approach 1: Check Who's Asking*. It does not restore stack walking, identify a human caller, inspect a delegation chain to decide whom the deputy serves, or infer subjective intention. The theoretical and practical difficulties identified for that approach are therefore not treated here as defects to be corrected in the cited work.

PIC instead takes the underlying attribution question in a different direction. It replaces *who is asking, and what does the deputy intend?* with a receiver-verifiable predicate: whether the presented state is a contract-conforming, non-expansive continuation of one authenticated predecessor execution and concrete request.

The question changes from *which client is the deputy working for?* to *which authenticated execution is this authority state validly continuing?* In that sense, PIC formalises execution continuity as the object of attribution rather than attempting to recover client identity or intention.

This does not establish subjective intention or physical causation; it establishes only the continuation predicate defined by the PIC model.

### Point 3 — intention, cooperation, and the stack-based scope

<table class="source-entry">
<tbody>
<tr>
<th scope="row">Author</th>
<td>Spiessens, A. — <em>Patterns of Safe Collaboration</em> (2007)</td>
</tr>
<tr>
<th scope="row">Page</th>
<td>190, §8.1.2, <em>Approach 1: Check Who's Asking</em> (on stack walking)</td>
</tr>
<tr>
<th scope="row">Original</th>
<td><div class="verbatim">
<p>The fact that the subjects themselves are given the choice to delegate is an important step towards recognizing that the problem is one of intention and can only be solved with the cooperation of the deputy himself, as only he can know his intentions.</p>
<p>But the approach is only applicable for stack-based implementations. It excludes for instance inter-process and inter-thread calls in a parallel or distributed context. The fact that subjects are allowed to influence information on the call stack opens another can of worms, as the stack itself can now become an extra overt channel for data communication, which conflicts with concerns for data confinement.</p>
</div></td>
</tr>
<tr>
<th scope="row">Discussion</th>
<td><strong>Establishes.</strong> The cited stack-walking approach is expressly limited to stack-based implementations and excludes the stated inter-process and inter-thread cases in parallel or distributed contexts. The passage also states that the intention problem can be solved only with the deputy's cooperation.<br><br><strong>Comparison here.</strong> The execution-scope limitation applies to Approach 1 as described. It must not be attributed to Approach 2 or to capability systems generally. The cooperation statement identifies a behavioural dependency that PIC addresses through a different acceptance construction.</td>
</tr>
<tr class="not-satisfied">
<th scope="row">Comparison under this article's threat model</th>
<td>The cited stack-walking approach is outside the parallel and distributed execution scope adopted here. Separately, deputy cooperation is not accepted as the proof of execution attribution under this article's threat model.</td>
</tr>
<tr>
<th scope="row">Under PIC</th>
<td><strong>Mechanism.</strong> Acceptance does not depend on trusting the predecessor's discretionary assertion that it selected the correct authority. The receiving boundary validates the continuation evidence required by the applicable PIC profile. The chain representation is not limited to a local call stack and may cross process, thread, host, and network boundaries.<br><br><strong>Boundary.</strong> Correct verification and enforcement remain trusted at every receiving execution boundary. The foundational formal chain is linear; separation of independent concurrent lineages through single-predecessor binding and non-expansion is not itself a proof over every arbitrary fork, join, directed acyclic graph (DAG), or general concurrency semantics. The assurance and collusion assumptions also differ among incremental, full-chain, snapshot, and other deployment profiles.</td>
</tr>
</tbody>
</table>

### Point 4 — capabilities and the deputy's responsibility

<table class="source-entry">
<tbody>
<tr>
<th scope="row">Author</th>
<td>Spiessens, A. — <em>Patterns of Safe Collaboration</em> (2007)</td>
</tr>
<tr>
<th scope="row">Page</th>
<td>190, §8.1.2, <em>Approach 2: Capabilities</em></td>
</tr>
<tr>
<th scope="row">Original</th>
<td><div class="verbatim">
<p>It is the deputy’s responsibility to make sure that its clients delegate their authority (1) to it and to use all authorities (1),(3), and (4) for their proper purpose. All we have to do is : make sure that the deputy has the necessary information to take that responsibility.</p>
<p>Capabilities (Chapter 4) combine designation with access-permission: you can never have one without the other. Access permission to a subject is the permission to use that subject. That means that, like designations, permissions have to be portable.</p>
</div></td>
</tr>
<tr>
<th scope="row">Discussion</th>
<td><strong>Establishes.</strong> Capabilities combine designation and access permission, and the client can provide the authority the deputy is expected to use. The passage assigns to the deputy the responsibility to ensure that clients delegate their authority and to use all available authority for its proper purpose.<br><br><strong>Comparison here.</strong> The cited construction gives the deputy the information needed to discharge that responsibility. Under this article's threat model, however, that behavioural responsibility is not itself the receiver-verifiable proof that the authority presented downstream belongs to the execution being continued.</td>
</tr>
<tr class="not-satisfied">
<th scope="row">Comparison under this article's threat model</th>
<td>The cited passage assigns correct-purpose authority use to the deputy. It does not itself establish the additional receiver-verifiable multi-hop execution-attribution property defined here. The passage does not establish or refute whether another mediator, capability construction, or additional mechanism could provide that property.</td>
</tr>
<tr>
<th scope="row">Under PIC</th>
<td><strong>Mechanism.</strong> The question moves from whether the deputy is sufficiently informed to whether the receiving hop can validate what it was handed. A globally trusted mediator is not structurally required by the decentralised PIC profile. Each receiving boundary nevertheless performs trusted verification and enforcement under the applicable profile. Arbitrary bytes can always be assembled locally; they cannot be accepted as a conforming continuation unless the required predecessor, request, relationship, contract, integrity, freshness, and non-expansion checks succeed.<br><br><strong>Boundary.</strong> Correct verification and enforcement remain trusted at every receiving execution boundary. Central validators, Trust Plane components, and snapshots remain optional deployment constructions with their own trust assumptions. Entitlement to originate a lineage is a separate question the continuity invariant does not settle.</td>
</tr>
</tbody>
</table>


### Point 5 — local invocation binding and multi-hop composition

The capability result accepted by this article is substantive. At an invocation, designation and access permission are bound together. The client can therefore provide the authority the deputy is expected to use, closing the classical single-hop designation–authority mismatch.

The delegation-chain question quoted in Point 2 belongs to Spiessens's <em>Approach 1: Check Who's Asking</em>. It identifies a multi-hop attribution problem for that approach. It must not be represented as a direct statement about Approach 2 or about capability systems generally.

The passage quoted in Point 4 belongs to <em>Approach 2: Capabilities</em>. It assigns proper-purpose use of the available authorities to the deputy and requires that the deputy receive the information needed to discharge that responsibility. Spiessens's subsequent analysis examines the behaviour restrictions required of the relied-upon subject.

The companion paper supplies the narrower distinction used here. It characterises a capability invocation as a one-hop instance of the continuity primitive. The invocation-level binding is genuine and locally valid. What does not follow from that local property alone is that successive invocations compose into one receiver-verifiable relationship connecting the authority presented at the final hop to the execution in which it originated.

This observation does not require concurrency. It also applies to sequential execution when an intermediate executor still holds authority associated with an earlier or independent request. Concurrency increases the opportunity for interleaving or cross-context selection, but it is an aggravating condition rather than a logical premise.

An implementation may preserve attribution across hops through request-scoped state, explicit lineage identifiers, isolation, sequencing, non-transferable references, trusted mediation, or another mechanism. The comparison made here is whether the multi-hop property follows from the protocol property examined or from those additional mechanisms.

Under the threat model adopted by this article, an intermediate executor's internal association between a request and the authority it holds cannot itself serve as the receiving boundary's proof of execution attribution. If that association is neither represented nor independently verified, correct attribution remains an assumption of the implementation rather than a property established by the examined protocol rule.

After the point-by-point comparison above, no proof was identified in the specific capability material examined that portable authority alone composes into the receiver-verifiable multi-hop execution-continuity property defined here. This is a limited result about the analysed sources, not a claim that no capability-based construction or proof exists elsewhere.

The narrower formal consequence below applies only to authorization decisions that remain invariant under execution lineage.

### Formal consequence — lineage-invariant propagation cannot establish execution-context non-mixing

This section applies the companion paper's occurrence-individuation and trade-off results to the execution-context non-mixing requirement defined by this article. It does not introduce a separate universal theorem about capability systems.

In the terminology defined above, a **Temporal Confused Deputy** execution is an accepted authority-use occurrence that is valid with respect to the projected operation and resource but is not validly attributable to the execution lineage under which it is accepted. The formal argument below concerns that article-defined condition. It does not rename Hardy's historical problem or attribute the temporal formulation to him.

### The argument in ordinary language

#### Why portable delegation creates the trade-off

Portable authority is intended to be held, transferred, delegated, attenuated, and, where the applicable construction permits it, composed. None of those operations is itself a security failure, and this article does not claim that every capability construction permits arbitrary union or ignores execution context.

The impossibility arises only when three conditions are required together:

1. the receiving authorization decision remains invariant under execution lineage;
2. independent authority contexts may coexist, and the construction permits their selection, application, or composition without verifying the execution lineage to which each authority use belongs;
3. the system requires receiver-verifiable execution-context non-mixing.

Under those conditions, the receiver sees the operation and resource but not the execution occurrence that makes one use valid and the other invalid. Preventing the crossed use then requires at least one of three changes:

- restrict the relevant coexistence, transfer, selection, or composition operation;
- rely on a separator such as isolation, sequencing, non-transferable references, trusted mediation, or request-scoped state;
- make the receiving decision sensitive to a verified execution- or lineage-specific relationship.

#### Fresh delegation is a cooperation dependency

When a construction requires each successor to receive a fresh discretionary delegation from the current authority holder, that holder becomes a necessary participant in both the safety and liveness of the continuation. The next hop can proceed only if the holder remains available, remains authorised, selects the correct successor, and delegates authority belonging to the correct execution. Under the untrusted-execution threat model adopted here, those conditions cannot themselves serve as the receiving proof that the continuation is valid.

If the current holder is unavailable or has been revoked, the chain stops unless another mechanism can reissue, escrow, mediate, or otherwise preserve the still-authorised execution. If the holder is compromised or confuses concurrent contexts, and the receiver does not verify an equivalent execution-sensitive binding, the holder may transfer authentic authority associated with the wrong execution. Portable delegation alone therefore does not establish authority continuity in this construction: the required property is supplied either by the holder's continuing cooperation or by an additional mechanism and its assumptions.

The same dependency may appear when the hand-off is expressed through fresh OAuth access-token issuance or replacement. A valid next-hop token can prove that authority was issued or obtained under the applicable rules. Unless its receiving semantics independently bind that step to the exact predecessor execution and request, it does not prove that the correct execution occurrence was selected. The mechanism may mitigate this dependency through an independently validating issuer, durable workflow authority, trusted mediator, or equivalent construction; the continuity guarantee then rests on that construction and its stated assumptions.

This is a limitation of fresh holder- or actor-mediated delegation under the stated threat model, not an impossibility result for capability or OAuth access-token constructions generally. A construction may remove the dependency through an equivalent represented and verified continuation mechanism. Once its receiving decision verifies that execution-sensitive relationship, the decision is no longer lineage-invariant in the sense used by the theorem.

The first option narrows the delegation or composition semantics available at that boundary. The second can be a valid security construction, but when it is outside the analysed protocol acceptance rule its correctness remains an external assumption rather than a property established by that rule. The third changes the represented basis of acceptance: authority is no longer evaluated only as a privilege set in \(O\times R\), but as authority presented within a specific represented execution continuation.

In ordinary terms, the receiver must decide not only whether the authority permits the operation, but also whether that authority belongs to the execution now being continued.

PIC takes the third path for ordinary continuation. The authority context \(C_i\subseteq O\times R\) is carried inside a represented execution lineage, and each ordinary successor continues exactly one predecessor under request binding, relationship evidence, contract conformance, and non-expansion. Independent lineages may participate through an explicitly defined multi-lineage construction, but their remaining authority is not thereby merged into one ordinary successor lineage.

This is the precise sense in which PIC codifies a temporal dimension: it makes causal succession between execution steps part of the represented state and receiving decision. It does not claim that capability portability is incorrect, and it does not prohibit capability-based constructions from adding and verifying an equivalent execution-sensitive relationship.

Applied to a capability-based construction, the boundary is direct. If its receiving rule remains lineage-invariant while independent authority contexts may coexist, the construction falls within the impossibility result and cannot establish execution-context non-mixing as defined here. If it adds and verifies an execution-sensitive relationship, it may satisfy the requirement; its receiving rule has then left the lineage-invariant class considered by the theorem. This is a classification of acceptance semantics, not a statement that the construction ceases to be capability-based.

An authority-use occurrence has three relevant coordinates:

- the operation;
- the resource;
- the execution lineage in which the use occurs.

A lineage-invariant authorization policy ignores the third coordinate. It therefore gives the same decision whenever two occurrences use the same operation and resource, even when the occurrences belong to different lineages.

The adopted threat model can require the opposite. One occurrence of a privilege may be a valid continuation of the authorising execution and must be accepted. Another occurrence of the same privilege may belong to a different execution and must be rejected.

A policy that ignores lineage must give those occurrences the same decision. Execution-context non-mixing requires different decisions. The requirements are therefore inconsistent.

The conclusion is limited:

> A lineage-invariant authorization policy cannot establish execution-context non-mixing where two authority-use occurrences have the same operation and resource but their execution lineages require different authorization decisions.

Any policy that distinguishes the two occurrences must read and verify some execution- or lineage-sensitive discriminator. The argument does not prescribe where that discriminator is stored or which implementation family supplies it.

A construction is not excluded by this impossibility result when its receiving decision introduces and verifies an execution- or lineage-sensitive discriminator. Establishing authority continuity additionally requires the complete authenticated binding and validation predicate described below, irrespective of the construction's implementation family.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal derivation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

Let:

\[
E=O\times R\times L
\]

be the set of authority-use occurrences, where:

- \(O\) is the set of operations;
- \(R\) is the set of resources;
- \(L\) is the set of execution lineages.

An authority-use occurrence:

\[
e=(o,r,\ell)\in E
\]

is an occurrence of privilege \((o,r)\) within lineage \(\ell\).

Define the projection:

\[
p:E\rightarrow O\times R,
\qquad
p(o,r,\ell)=(o,r).
\]

The projection records the operation and resource but forgets the execution lineage.

Let:

\[
A:E\rightarrow\{0,1\}
\]

be an authorization policy.

The policy is lineage-invariant when there exists:

\[
\bar A:O\times R\rightarrow\{0,1\}
\]

such that:

\[
A=\bar A\circ p.
\]

Equivalently:

\[
p(e)=p(e')
\Longrightarrow
A(e)=A(e').
\]

Now consider two distinct execution occurrences:

\[
e_A=(o,r,\ell_A),
\qquad
e_B=(o,r,\ell_B),
\qquad
\ell_A\neq\ell_B.
\]

They have the same operation-and-resource projection:

\[
p(e_A)=p(e_B)=(o,r).
\]

Suppose \(e_A\) is a valid continuation of the execution authorised to exercise \((o,r)\), while \(e_B\) presents the same privilege as part of a different execution that is not a valid continuation of that authority context.

Execution-context non-mixing then requires:

\[
A(e_A)=1
\]

and:

\[
A(e_B)=0.
\]

Therefore:

\[
A(e_A)\neq A(e_B).
\]

Lineage invariance instead implies:

\[
p(e_A)=p(e_B)
\Longrightarrow
A(e_A)=A(e_B).
\]

The two requirements are inconsistent.

It follows that a lineage-invariant authorization policy cannot establish execution-context non-mixing for occurrences that have the same operation and resource but belong to execution lineages requiring different authorization decisions.

This conclusion is an application of the companion paper's Theorems 3 and 4. Theorem 3 establishes that a lineage-invariant policy cannot individuate occurrences whose projections are equal. Theorem 4 establishes that a policy distinguishing those occurrences must read some lineage-sensitive discriminator.

Formally, the receiving decision must depend on a discriminator function from the lineage set \(L\) to a set \(D\) of discriminator values:

\[
g:L\rightarrow D
\]

such that:

\[
g(\ell_A)\neq g(\ell_B).
\]

The representation of \(g\) is not fixed by this argument. It may be carried alongside a request, embedded in an artefact, represented through a predecessor relationship, implemented through a non-transferable reference, or supplied by another verified construction.

The relevant question is whether the receiving authorization decision reads and verifies the discriminator. Its storage location or implementation category does not alter the formal requirement.

The condition \(g(\ell_A)\neq g(\ell_B)\) is necessary for occurrence individuation, but it is not sufficient by itself to establish authority continuity. The receiver must also authenticate and verify the relationship among the discriminator, the exact predecessor, the concrete request, the presented authority state, the applicable execution contract, the required integrity and freshness conditions, and the non-expansion relation. PIC supplies one model-relative construction for those combined checks; another construction may establish an equivalent predicate under comparable assumptions.

</blockquote>

### Relation to authority coexistence and delegation

The result does not prohibit capability composition, attenuation, delegation, or the legitimate coexistence of several authority sources.

An executor may legitimately hold:

- request-derived authority;
- its own service authority;
- authority associated with another execution;
- several independently delegated capabilities.

The impossibility concerns the simultaneous retention of these three properties:

1. the authorization decision remains lineage-invariant;
2. independent authority contexts may coexist and may be selected or applied without a verified lineage-sensitive receiving rule;
3. the system requires confused-deputy safety and execution-context non-mixing.

This is the trade-off formalised by Theorem 5 of the companion paper.

Composition and attenuation may still be performed. The impossibility result does not remove, prohibit, or invalidate either operation.

The restriction concerns the receiving authorization decision. A decision that considers only the operation and resource cannot distinguish two occurrences whose operation and resource are identical but whose execution lineages require different outcomes.

A construction that adds and verifies a lineage-sensitive discriminator may still be capability-based. Once its receiving decision depends on that discriminator, however, it is no longer lineage-invariant. In the terminology of the companion paper, it has become continuity-aware.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">Receiving acceptance semantics cannot remain functions only of:</p>

\[
O\times R
\]

<p style="color: var(--text-primary);">when the required decision distinguishes occurrences that differ in:</p>

\[
L.
\]

</blockquote>

The formal conclusion is therefore limited:

> Under the adopted threat model, a lineage-invariant authority-propagation construction cannot simultaneously permit independent authority coexistence and establish receiver-verifiable execution-context non-mixing. Any construction satisfying all of those requirements must make the receiving decision sensitive to an execution- or lineage-specific discriminator.

In the terminology introduced by this article, lineage sensitivity is required to distinguish an authorised continuation from a Temporal Confused Deputy occurrence where the projected operation and resource are identical but the execution lineages require different decisions.

This is an impossibility result for lineage-invariant authorization under the stated assumptions. It is not an impossibility result for capability systems generally, and the name Temporal Confused Deputy does not enlarge the scope of that result.

An equivalent capability-based construction remains possible if it represents and verifies an equivalent per-execution, multi-hop relationship.

## Independence of the problem statement and the proposed construction

The runtime example, the definition of authority continuity, and the PIC construction are distinct parts of the argument.

A defect in the PIC construction or formal proof would not, by itself, determine whether the runtime example is valid under its stated assumptions or whether authority continuity is a useful security property. Those questions would need to be evaluated independently.

Conversely, demonstrating the illustrated runtime failure under the stated assumptions would not by itself establish that PIC is correct, necessary, or the only possible construction. PIC must be assessed separately through its definitions, assumptions, formal proof, and correspondence with the systems to which it is applied.

If the PIC construction or proof contains an error, the appropriate conclusion may be that the construction requires correction, that a different construction is needed, or that the model itself must be revised. No part of the argument should be treated as insulated from independent criticism.

## PIC assumptions and the formal model

The five threat-model elements describe the environment rather than defects attributed to an executor. For the authority-continuity acceptance property, PIC does not require those environmental conditions to be absent. It represents the required relationship and makes it part of the receiving protocol decision. Each element is addressed below together with the applicable implementation and trust boundary.

<div class="table-tip">

| Element | Under PIC |
| --- | --- |
| **Transport is untrusted** | Guarantees come from the verified continuation evidence, not from the channel. An observer can read, copy, alter, or present arbitrary bytes, but under the stated cryptographic and verification assumptions it cannot cause a forged, altered, or expanded PCA state to be accepted as a valid continuation.<br><br>*Boundary.* Continuation is open in the core: an executor that observes the PCA and holds a conforming attestation may produce a successor. The accepted successor remains bound to the exact predecessor, signed request, execution contract, and non-expansion rules. |
| **Execution is untrusted and has no global mediator** | No separate trusted mediator arbitrates between steps. Each lineage carries its own signed context, and each receiving hop verifies predecessor binding, Proof of Relationship, Proof of Continuity, and non-expansion before authority is exercised. PIC can be enforced through a decentralised deployment profile.<br><br>*Boundary.* Trusted verification and enforcement are still required at every execution boundary. Central validators, Trust Plane components, and snapshots are deployment options, not structural requirements. |
| **Execution is concurrent** | Each accepted lineage is attenuated along its own predecessor chain. Authority from independent lineages cannot be presented as one valid continuation when doing so violates predecessor binding or non-expansion.<br><br>*Boundary.* The foundational formal chain is linear. Independent concurrent lineages are separated through single-predecessor binding and non-expansion; this is not itself a proof over every arbitrary concurrent, fork/join, DAG, or multi-party execution semantics. |
| **The N+1 Unidentified Successor Problem** | A continuation need not name a concrete successor occurrence. It states an execution contract describing the authority that may continue, the constraints that remain applicable, and the execution characteristics required of a successor. A concrete successor proves conformance when it materialises; its identity need not be known when authority is originated. |
| **The N+1 Invalid Authority-State Problem** | Validity is decided at reception under the applicable PIC acceptance rules. An executor may construct arbitrary bytes, but an accepted successor must satisfy predecessor binding, request binding, execution-contract conformance, and non-expansion. Authority from an independent execution cannot be accepted as the same continuation merely because its individual artefact is authentic.<br><br>*Boundary.* This claim assumes conforming verification, enforcement, attestation handling, canonicalisation, hashing, and the cryptographic and profile-specific assumptions of the model. It does not establish correct local physical or semantic execution. |

</div>

The accumulator countermodel above and the illustration in the next section describe the same limited structural case from two perspectives. Individually valid authority associated with independent executions is presented as one authority state, while the receiving acceptance rule has no represented relationship showing that the state belongs to one continuation.

The point is not that authentic authority becomes invalid or that an executor cannot assemble arbitrary local data. The question is whether the resulting state can be accepted as the continuation of one authenticated predecessor execution.

**Where the formal model lives.** Proof of Relationship, Proof of Continuity, and the resulting safety properties are defined in the companion paper and formalised in Lean. The repository identifies the Lean version, dependencies, build instructions, definitions, theorem statements, and proof terms used by the formalisation. Successful type-checking establishes that the proof terms are accepted by the specified Lean environment. It does not independently establish that the definitions adequately model every real system, that the stated assumptions apply to a particular deployment, or that an implementation conforms to the formal model:

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);">Gallo, N. (2026). <em style="color: var(--text-primary);">Proof-of-Continuity: A Temporal Model for Authority Propagation in Distributed Systems and AI Agents</em>. arXiv:2607.08906 [cs.CR] — <a href="https://arxiv.org/abs/2607.08906" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2607.08906</a></p>

</blockquote>

**Verification status.** The formalisation is published for independent inspection and reproduction. Unless expressly documented otherwise, acceptance by the Lean environment must not be described as independent expert review, peer review, certification, or validation of the model's real-world applicability. Any later review should be described factually, identifying its scope and distinguishing code inspection, theorem review, model review, and implementation assessment.

**And its boundaries, stated rather than assumed.** Premises 3 and 4 apply to PIC as much as to anything else, so the assumptions the guarantee rests on are named here:

- **Cryptographic unforgeability is assumed.** The relationship evidence is taken as unforgeable, and a break of the underlying cryptography falls outside the model — as it does for capability and OAuth access-token systems alike.
- **Executor behaviour stays outside the guarantee.** No authorization model can establish that an application is free of bugs. What this one bounds is whether a local fault can propagate as valid authority.
- **Deployment profiles are not equivalent.** The invariants are identical whether a chain is validated fully decentralised or with the help of a trusted snapshot component, but the concrete assurance and trust assumptions differ by profile. Incremental validation does not provide the same full-prefix assurance as full-chain validation against consecutive colluding hops; any such claim must remain profile-specific.
- **The guarantee does not come from transport.** A compromised channel may read, copy, delay, reorder, or drop messages. Under the stated cryptographic, freshness, verification, and enforcement assumptions, channel control alone does not allow a forged, altered, or expanded PCA to be accepted as a valid continuation. Confidentiality and availability are separate properties and are not claimed here.
- **Verifier and enforcement correctness are assumed.** The ordered checks, canonicalisation, hashing, signature validation, attestation validation, and enforcement decision must be implemented correctly.
- **Concrete-to-abstract correspondence remains an assumption.** The formal refinement relies on the stated correspondence between concrete verifier acceptance and the abstract Proof-of-Relationship relation. The model does not prove that correspondence for every implementation.
- **Origination remains a trust boundary.** The continuity invariant does not establish that a `PCA₀` was semantically correct or that its originator was entitled to originate the requested authority.
- **Attestation assumptions remain profile-specific.** The trust placed in attestation issuers, evidence, and execution characteristics depends on the applicable deployment profile.
- **Heterogeneous propagation requires translation soundness.** Where authority is translated across domains, the result is bounded by the soundness and monotonicity of the translation rather than by a literal identity between the initial and final authority representations.
- **The foundational lineage model is linear.** Fan-out is addressed by the branch-capable revocation profiles, and joint participation of independent lineages by the Sandboxed Execution profile. General fork, join, fan-in, and DAG-shaped composition is identified as future work in the companion paper and must not be represented as proved by the linear-chain theorem.


## Consequences: from possession to continuity

**Time is treated here as a distinct dimension of authority propagation.** In the systems and work examined by this article, temporal continuity may otherwise be represented indirectly through possession, request scope, sequencing, state isolation, or related mechanisms. Under the definitions and assumptions of the PIC model, possession alone does not establish the authority-continuity property defined here.

### Continuity as a resilience requirement

Long-running distributed and asynchronous executions may outlive one process, survive a crash, retry after interruption, migrate to another worker, or continue after an executor is removed from service. For the system class considered here, resilience therefore includes an authorization question: when the execution's authority and accepted predecessor state remain valid, can an eligible successor resume the same execution without requiring a fresh discretionary act from the failed, unavailable, compromised, or revoked executor?

This article does not claim that an authorization protocol guarantees availability or task completion. Durable storage, replication, scheduling, recovery, consensus, and operational failover remain separate system properties. The narrower continuity requirement is a closure property: executor replacement must not, by itself, destroy an otherwise valid authorization lineage or force the security argument to trust the unavailable predecessor's new decision.

A system may satisfy this requirement through durable workflow state, a trusted orchestration service, a workflow authority, a verified OAuth access-token profile, a capability construction, PIC, or another mechanism. Under this article's method, the mechanism must be represented in the acceptance construction and its failure and trust assumptions must be stated. If recovery instead depends only on retaining a bearer artefact or asking the previous executor to delegate again, the deployment has coupled resilience to possession or cooperation rather than established receiver-verifiable execution continuity.

Secure storage can preserve an artefact across a crash, but the recovery system must still prove which execution the artefact resumes and whether the new executor is an eligible successor. The token-to-workflow index, checkpoint, replay state, and recovery transition are therefore security-relevant state rather than neutral plumbing. A trusted and verified durable workflow service may legitimately provide that state; if so, it is part of the protocol-level assurance construction being evaluated. If the association is selected only by the recovering untrusted executor, protected storage has preserved the token without proving its correct execution attribution.

### A continuity example: the post-office hand-off

A valid ordinary authority lineage can be pictured as a river. At every accepted continuation, the authority carried downstream is bounded by the authority immediately upstream. The flow may stay equal or be attenuated, but it cannot increase during an ordinary continuation.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive point.</p>

\[
C_{i+1}\subseteq C_i.
\]

</blockquote>

The flow may be attenuated, but an ordinary successor cannot introduce authority from outside its represented predecessor. A new origin, a sound cross-domain translation, or an explicitly defined multi-lineage construction is a separate operation; it is not ordinary downstream continuation. Authority from another lineage cannot simply be poured into the first and accepted as the same ordinary flow.

The metaphor concerns continuity, not automatic execution. Every receiving hop still requires conforming verification and enforcement, and the applicable revocation state must be checked. The stronger and narrower property is that, for any finite sequence of conforming successors, continuation need not depend on a specific earlier executor remaining available and issuing a fresh discretionary delegation at every hand-off.

Consider a hypothetical post office. Alice authorises one execution: send a parcel. Bob is the employee handling the first step. In a holder-to-holder portable-delegation construction, the next courier may receive authority because Bob transfers or delegates the relevant capability. That can work correctly while Bob remains authorised and available.

The important dependency is not merely that Bob possesses a capability. If continuation requires Bob to perform the next discretionary delegation, then Bob's continuing availability, authorization, correct successor selection, and correct association between authority and execution become premises of the next hand-off. Bob is not only a prior executor; his cooperation is part of the mechanism by which the chain advances. Under the threat model used here, that cooperation cannot itself be treated as receiver-verifiable proof of continuity.

Before pickup, Bob's employer determines that his future access must be terminated and revokes the local employment authority that would permit him to act further. Carol replaces him. Assume that this does not revoke Alice's parcel lineage or invalidate the already accepted predecessor state, and that Alice is temporarily unavailable. If Carol can continue only after Bob performs a fresh delegation, the hand-off is blocked for a sound reason: Bob is no longer permitted to act. Portability alone does not determine whether Carol is a valid replacement for the still-authorised execution.

This is the precise continuity limit illustrated by the example. Alice's parcel authorization may remain valid, yet the execution cannot advance because that construction requires a new act by an intermediate holder who is no longer an admissible participant. If Bob were compromised rather than revoked, the corresponding safety dependency would remain: he could select a successor incorrectly or transfer authentic authority associated with another execution. Fresh holder-to-holder delegation therefore makes both continued progress and correct execution attribution depend on the intermediate holder, unless another verified mechanism removes that dependency.

Changing the hand-off from a capability transfer to an OAuth access-token hand-off does not, by itself, remove the dependency. The conclusions differ by mechanism, but the receiving question remains the same.

With a base OAuth access token, Carol may present an authentic, unexpired token representing Alice's authority and a `delivery:parcel` scope. That can establish a valid authorization under the applicable resource-server policy. The base token does not, without an additional profile or mechanism, identify the exact parcel execution or prove that Carol is continuing the accepted predecessor state rather than another authentic parcel execution covered by the same authority.

Placing either a capability or an OAuth access token in secure storage does not change that distinction. The store may preserve confidentiality, integrity, and availability, but the record that associates one stored token with this parcel execution becomes security-critical. If a verified workflow or storage authority maintains and proves the association, it is part of the solution. If an untrusted executor merely retrieves and presents a genuine token, the receiver still needs proof that it is the right token for the right predecessor execution.

This does not establish a defect in capability systems or OAuth access-token deployments. A design may solve the hand-off through revocable indirection, escrow, role authority, a trusted organisational mediator, independently validated workflow state, reissuance, non-transferable references, a verified OAuth access-token profile, or another construction. The point is classificatory: the continuity guarantee then depends on that complete construction and its assumptions, not on holder-to-holder portability, token validity, secure storage, or stepwise issuance alone.

PIC frames the same case differently. Alice originates an execution under authority \(C_0\). Bob may perform one valid step, but he is not the continuing source of Alice's authority. Carol need not have been identified when Alice originated the execution. If Bob is no longer eligible to execute future steps while the parcel lineage and its accepted predecessor remain valid, Carol may continue only by presenting evidence that she is a conforming successor of the represented execution under its request, execution contract, her applicable attestation, revocation state, relationship evidence, and non-expansion rules. Bob need not remain available to confer a new discretionary delegation. If the lineage or relevant grant has itself been revoked, Carol cannot continue, which is the required result.

The receiving question is therefore not merely:

> Who handed Carol a portable authority artefact?

It is:

> Can Carol prove that this still-authorised execution may validly continue through her?

This is the practical significance of modelling execution as a coordinate of authority. It allows protocol operations to be defined over continuation itself: originate, continue, attenuate, revoke, branch where the applicable profile permits it, or participate in an explicitly guarded multi-lineage operation. PIC Sandboxed Execution extends this idea by representing the guardrail as an outer enforcement lineage that validates participating lineages and enforces permit or deny. Correct guardrail implementation and enforcement remain necessary; the guardrail is not converted into an assumption-free mechanism.

### Why local validity does not automatically compose

This subsection is an authority-state projection of the AI-agent threat-model scenario described above. The relevant environment contains:

- one executor treated as untrusted;
- at least two distinct execution occurrences;
- overlapping or retained authority state;
- concurrent or interleaved processing;
- no assumption that internal request-to-authority separation is itself the receiver's proof.

A capability invocation may establish a correct local relationship between one request, one designation, and the authority supplied at that invocation. The additional question is whether the authority presented several hops later remains attributable to the same originating execution through a relationship that the final receiving boundary can verify.

The execution-level situation is:

```text
                  UNTRUSTED EXECUTOR E
        +--------------------------------------+
        |                                      |
        |  X_A holds or receives S_A           |
        |                                      |
        |  X_B holds or receives S_B           |
        |                                      |
        |  X_A and X_B overlap or interleave   |
        |                                      |
        +--------------------------------------+
                         |
                         |
                         v
             state presented at n+1
```

The threat model does not assert that E necessarily combines the states. It states that the security argument cannot rely solely on E correctly avoiding that combination. The receiving acceptance predicate, or an equivalent trusted mechanism, must establish which execution the presented state continues.

The set construction below represents the authority-state consequence when the deliberately minimal acceptance rule admits a cross-execution composition.

Consider two independent linear authority contexts.

Lineage A begins with `READ-ALL` and `BACKUP` and is locally attenuated to `READ-ALL`.

Lineage B begins with `READ-FOO` and `SHARE` and is locally attenuated to `SHARE`.

Each lineage is individually non-expansive: its successor contains no authority absent from its own predecessor.

The attempted cross-lineage composition combines the remaining `READ-ALL` authority from Lineage A with the remaining `SHARE` authority from Lineage B and presents the result as one continuation.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">Lineage A carries:</p>

\[
C_A^0=\{\texttt{READ-ALL},\texttt{BACKUP}\},
\qquad
C_A^1=\{\texttt{READ-ALL}\}.
\]

<p style="color: var(--text-primary);">Lineage B carries:</p>

\[
C_B^0=\{\texttt{READ-FOO},\texttt{SHARE}\},
\qquad
C_B^1=\{\texttt{SHARE}\}.
\]

<p style="color: var(--text-primary);">Both local transitions are non-expansive:</p>

\[
C_A^1\subseteq C_A^0,
\qquad
C_B^1\subseteq C_B^0.
\]

<p style="color: var(--text-primary);">The attempted cross-lineage composition is:</p>

\[
C^{*}=C_A^1\cup C_B^1
     =\{\texttt{READ-ALL},\texttt{SHARE}\}.
\]

</blockquote>

```text
LINEAGE A

{ READ-ALL, BACKUP }
          |
          | valid local attenuation
          v
     { READ-ALL }
            \
             \
              \ attempted cross-lineage composition
               \
                v
             { READ-ALL, SHARE }
                  presented as one
                  continuation at executor n+1
                ^
               /
              /
             /
     { SHARE }
          ^
          | valid local attenuation
          |
{ READ-FOO, SHARE }

LINEAGE B
```

Every constituent authority item in \(C^{*}\) may be genuine, correctly delegated, and correctly integrity-protected. The failure condition illustrated here is not invalid input. It is missing execution attribution.

If \(C^{*}\) is accepted as one continuation under the conditions defined here, the resulting transition is an instance of what this article calls the **Temporal Confused Deputy** condition: spatially valid authority is accepted under the wrong or unrepresented execution continuation.

Under the deliberately minimal possession-based accumulator defined in this article, an acceptance rule that records authenticity and possession but not execution origin may continue to treat \(C^{*}\) as usable authority. The rule cannot determine from possession alone whether `READ-ALL` belongs to the execution continuing lineage A, lineage B, or neither represented continuation.

This is not a universal claim about capability implementations. An implementation using request-scoped state, isolation, sequencing, lineage identifiers, non-transferable references, or an equivalent binding may reject or prevent the composition.

Parallel or overlapping execution is the operational AI-agent scenario illustrated above and is an explicit element of the adopted threat model. It creates simultaneous availability of independently attributable authority states and increases the opportunity for interleaving, retained-state reuse, or cross-context selection.

The logical requirement is not limited to parallel scheduling. The same attribution problem can arise sequentially where an intermediate executor retains authority from an earlier or independent execution and the receiving acceptance predicate does not represent which execution supplied it. Concurrency is therefore part of the motivating threat model and an aggravating condition, but not a necessary premise of the receiver-verifiable continuity property.

The security statement is therefore conditional:

> If a receiving boundary relies only on an untrusted executor to preserve the internal separation of several execution occurrences and their authority states, and no equivalent per-execution relationship is represented and independently verified, execution-context non-mixing is assumed rather than established. If the stated acceptance rule admits \(C^{*}\) as the continuation of one execution, a cross-execution authority-misattribution execution is reachable within that model.

This is not a claim that compromise is inevitable in every deployment. It identifies the property that must be supplied by the protocol, trusted runtime, isolation mechanism, capability construction, or another enforcement design.

Under an ordinary PIC continuation, the same proposed state cannot be accepted as one successor:

- if \(C_A^1\) is the represented predecessor, `SHARE` is absent from that predecessor context, so \(C^{*}\nsubseteq C_A^1\);
- if \(C_B^1\) is the represented predecessor, `READ-ALL` is absent from that predecessor context, so \(C^{*}\nsubseteq C_B^1\);
- an ordinary successor cannot identify both independent lineages as its predecessors, because it continues exactly one predecessor;
- the applicable request and predecessor bindings must describe the same transition rather than unrelated locally valid inputs.

Where two independent lineages carry identical privilege sets, non-expansion alone does not distinguish their occurrences. The distinction then depends on the applicable predecessor, request, lineage, freshness, and relationship checks. Rejection follows from the complete continuation predicate, not from non-expansion alone.

PIC does not prevent a non-conforming executor from assembling \(C^{*}\) locally or attempting an unauthorised physical action. Under its stated verification and enforcement assumptions, it prevents a receiving boundary from accepting that composition as one valid ordinary continuation.

PIC assurance remains profile-specific. In the incremental profile, the receiving Verifier validates the current transition and accepts earlier validity inductively through prior Verifiers. A single invalid transition is rejected by the next conforming hop, but two or more consecutive colluding hops are not resisted without authenticated evidence of the earlier lineage prefix. Stronger prefix assurance requires the applicable full-chain, trusted snapshot or Trust Plane, or approved succinct-proof profile.

PIC Sandboxed Execution addresses a different construction. It permits independently validated lineages to participate jointly in one guarded operation while preserving each lineage's independent authority, predecessor relation, request binding, and revocation state.

The outer lineage carries only its own enforcement authority. Joint participation does not merge the authority remaining in Lineage A and Lineage B into the authority of one ordinary successor lineage.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">Sandboxed Execution does not transform the union:</p>

\[
C_A^1\cup C_B^1
\]

<p style="color: var(--text-primary);">into the authority of one ordinary successor lineage.</p>

</blockquote>

PIC therefore introduces **two additional security primitives**, alongside **Proof of Possession** rather than in place of it:

- **Proof of Relationship (PoR)** — the evidence binding an execution step to its causal predecessor. The companion paper treats it as an abstract, unforgeable primitive.
- **Proof of Continuity (PoC)** — the proof that the invariants hold along the whole received lineage: causal linkage witnessed by Proof of Relationship at every hop, and a non-expansive authority context.

Together they represent and verify authority continuity across an execution lineage. Proof of Relationship supplies the represented predecessor relation for one transition. Proof of Continuity composes the accepted relationships and non-expansion conditions across the validated lineage.

The resulting claim is not that each executor behaved correctly internally. It is that a receiving boundary accepts propagated authority only when the state presented to it satisfies the continuation predicate required by the selected PIC profile.

**PIC adds the represented execution lineage as a coordinate of authorization, alongside the operation and resource.** Two authority uses with the same operation and resource may therefore remain distinguishable when they belong to different predecessor executions or requests.

Composition, attenuation, and related operations must be evaluated over the execution context as well as over the privilege set. At the level of primitives, this is a temporal refinement of the local binding already present at capability invocation. At the level of system construction, the receiving boundary verifies whether the current use continues one represented predecessor rather than relying only on the executor's internal association between authority and request.

**Conformance runs through both primitives.** A PIC-conforming implementation must represent the invariants that Proof of Relationship and Proof of Continuity require, and by the specification's own conformance language whatever violates those invariants is not PIC-compliant regardless of naming. A capability-based construction may satisfy an equivalent authority-continuity property if it represents and verifies an equivalent per-execution binding. Establishing equivalence requires comparable definitions, assumptions, acceptance predicates, and proof. In such a construction, request-local state, isolation, synchronisation, sequencing, or another mechanism may contribute to the property, but their equivalence to PIC continuity must be demonstrated rather than assumed. This concerns the formal authority-continuity property defined by PIC, not a claim that all existing capability implementations share the same architecture or security characteristics.

**The specification set is deliberately minimal**, and it is where the normative expression of the model and its conformance language live. The [PIC Specification](https://github.com/pic-protocol/pic-spec/blob/main/draft/0.2/pic-spec.md) is the entry point, defining the normative semantics of the model and indexing four subordinate documents:

- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html" target="_blank" rel="noopener noreferrer">PIC Prover and Verifier Specification</a> — per-hop Proof of Relationship and successor-PCA construction, the ordered Verifier checks, and the chain representations
- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-revocation-spec.html" target="_blank" rel="noopener noreferrer">PIC Revocation Specification</a> — revocation coordinates, their hop-by-hop continuity, and revocation-authorization and revocation-state requirements
- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-lineage-guardrail-spec.html" target="_blank" rel="noopener noreferrer">PIC Sandboxed Execution</a> — Lineage and Multi-Lineage Executions, and the guardrails that validate participating PCAs and enforce permit or deny
- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-architecture-deployment-spec.html" target="_blank" rel="noopener noreferrer">PIC Architecture and Deployment Specification</a> — centralised and decentralised architectures, hybrid topologies, and interoperability with existing token infrastructures

All are Draft 0.2 and, as their own status notes state, public drafts rather than standards. This article evaluates the Draft 0.2 materials supplied for review and retrieved on 27 July 2026. The repository links above are discovery links to the maintained project and may change; no conclusion in this article should be projected automatically onto later revisions. A scientific or conformance citation should identify the exact release, tag, or commit actually evaluated when an immutable reference is available. The project's own attribution separates two roles, and this article follows it: the **PIC Model** — its definitions, invariants, and foundational proofs — is the work of **Nicola Gallo**, while the **PIC specifications** are published and maintained by **Nitro Agility S.r.l.** as Specification Steward.

The comparison yields one property-specific result. Local capability invocation provides a valid designation–authority binding at that invocation. Under the adopted threat model, multi-hop authority continuity additionally requires the final receiving decision to verify an execution- or lineage-sensitive relationship connecting the presented state to the represented predecessor execution and request.

A receiving rule that remains invariant under lineage cannot distinguish occurrences that share the same operation and resource but require different decisions because they belong to different executions. PIC addresses that requirement within its protocol state, transition construction, and receiving checks. Another construction may do so through an equivalent verified discriminator. The comparison is therefore between acceptance properties, not between labels or implementation families.

## Conditional result of the comparison

For the system class defined here, execution-context non-mixing is part of the required receiver-verifiable property. A single executor may legitimately host several authentic authority contexts; the receiving boundary must not accept authority associated with one execution as the continuation of another merely because the executor possesses both or internally associates one with the current request.

An accepted transition violating that condition is what this article calls a **Temporal Confused Deputy** execution. The classification is model-relative: it applies when the defined threat model and acceptance predicate admit cross-execution authority misattribution.

The cited capability work establishes the local designation–authority binding and the delegation and safety properties stated in its model. The additional question considered here is multi-hop execution attribution when correct internal context selection is not admitted as the proof. PIC answers that question by requiring the receiver to validate a contract-conforming, non-expansive continuation of one represented predecessor and concrete request.

A holder-to-holder propagation rule that requires a fresh delegation at every hand-off also inherits the current holder's availability, continued authorization, correct successor selection, and correct execution-context selection as prerequisites. Under the adopted threat model, those prerequisites remain external dependencies unless the receiving construction represents and verifies an equivalent continuation relationship. The limitation is therefore not portability itself, but reliance on fresh discretionary delegation as the mechanism that proves and advances continuity.

The same criterion applies to OAuth access tokens. The base OAuth access-token and bearer-token specifications do not, without an additional execution-sensitive profile or mechanism, establish the predecessor-specific multi-hop continuity property defined here. This is not a conclusion that OAuth access tokens are defective, insecure, or unsuitable for their intended purposes. A complete profile, workflow, storage, runtime, or mediated construction may establish an equivalent property when its receiver independently verifies the required relationship.

Secure transport, sender constraint, short lifetime, protected storage, replay caches, and token or request identifiers remain valuable controls. They address disclosure, possession, replay, availability, and request separation. They establish authority continuity only when the complete receiving construction also verifies that the presented state belongs to the exact execution occurrence and predecessor transition being continued. If the receiving rule remains decision-equivalent across lineages that require different outcomes, the construction falls within the impossibility result regardless of whether its artefact is called a capability, OAuth access token, or workflow credential.

Under PIC's definitions, assumptions, and applicable verification profile, authority continuity is a protocol acceptance property rather than a conclusion delegated to the predecessor's discretionary context selection. An equivalent construction remains possible whenever it represents and verifies the same property under comparable assumptions and proof obligations.

The relationship is property-specific. In prose, under PIC's stated definitions and assumptions, PIC establishes the receiver-verifiable authority-continuity property defined in this article, including execution-context non-mixing under the adopted threat model. For the class covered by the impossibility result and under its hypotheses, a propagation rule whose decision remains invariant under execution lineage does not establish that property.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive conclusion.</p>

<p style="color: var(--text-primary);">All satisfaction claims in this box are relative to the formal definitions, assumptions, abstract-to-concrete correspondence, and applicable validation profile stated in the companion paper and this article. Correct implementation, verification, and enforcement remain assumptions.</p>

<p style="color: var(--text-primary);">Let \(P_{\mathrm{continuity}}\) denote the receiver-verifiable authority-continuity property defined in this article.</p>

\[
\mathrm{PIC}
\models
P_{\mathrm{continuity}}.
\]

<p style="color: var(--text-primary);">For the class covered by the impossibility result, under the adopted threat-model hypotheses:</p>

\[
\mathrm{LineageInvariantPropagation}
\not\models
P_{\mathrm{continuity}}.
\]

</blockquote>

PIC therefore establishes a strictly stronger receiving-acceptance guarantee on the authority-continuity axis than a propagation rule whose decision remains invariant under execution lineage. This is not a universal ranking of security systems and does not exclude an equivalent capability-based, runtime, mediated, isolation-based, or deployment-specific construction.

Before drawing any conclusion from the above, please read the [Research and use disclaimer](#research-and-use-disclaimer) below.

<blockquote class="callout-warning">

<p style="color: var(--text-primary);"><span style="color: var(--orange); font-weight: 600;">Acknowledgements.</span> The author gratefully acknowledges <strong>Alan H. Karp</strong> for his thoughtful questions, critical observations, and requests for clarification. These exchanges contributed significantly to refining the analysis, sharpening the threat model, and improving the precision with which the Provenance Identity Continuity (PIC) model is presented. This acknowledgement does not imply his review, validation, agreement with, or endorsement of the concepts, analysis, formal results, or conclusions presented in this work.</p>

</blockquote>

## PIC protocol reference

The specifications, the formal model, and the current status of the project are published at <a href="https://www.pic-protocol.org" target="_blank" rel="noopener noreferrer">www.pic-protocol.org</a>.

PIC adds execution lineage as a coordinate of propagated authority. **Possession remains relevant, but possession alone does not establish that an authority use validly continues the execution for which the authority was propagated.** In the PIC model, the spatial operation-resource component is therefore evaluated together with the causal or temporal continuity component.

Readers and automated systems may otherwise map PIC onto familiar OAuth, object-capability, role-based access control (RBAC), or attribute-based access control (ABAC) concepts and omit the lineage-sensitive acceptance requirement. The project context pack is intended to reduce that form of unsupported reinterpretation.

For that reason the project publishes a context pack at <a href="https://www.pic-protocol.org/ask-your-llm" target="_blank" rel="noopener noreferrer">www.pic-protocol.org/ask-your-llm</a>. It assembles into a single copyable text the specifications, formal model, machine-checked proof summary, and interpretation rules intended to reduce unsupported assumptions. The live page may reflect the current repository state. For scientific reproducibility, the claims in this article must be tied to the exact specification revision reviewed for publication, identified through an immutable release, tag, or commit reference together with the retrieval date. Nothing in this article automatically applies to later changes on `main`.

## Research and use disclaimer

This article presents theoretical and exploratory security research. It is intended to support technical discussion, independent review, and further investigation. It does not constitute an industrial validation, security certification, conformity assessment, professional advice, or a representation that PIC—or any implementation derived from it—is complete, error-free, suitable for production, or appropriate for any particular operational, regulated, safety-critical, or high-risk environment. Its publication is an invitation to research scrutiny and does not represent endorsement, approval, or validation by the authors of any cited work, by their institutions, or by any standards, certification, or regulatory body.

The formal claims made here apply only within the definitions, assumptions, and threat model expressly stated in this article. They do not establish the correctness of any implementation, integration, deployment, surrounding system, or operational procedure. Implementers and operators remain responsible for conducting their own threat modelling, verification, testing, security review, regulatory assessment, and risk evaluation before relying on these ideas.

**Relationship to existing systems.** This article does not claim that every existing capability system, token system, agent framework, or implementation exhibits the runtime failure described here. Concrete systems may include mechanisms that prevent particular interleavings or preserve request separation. The article examines the narrower question of which properties follow from the analysed protocol model under its stated assumptions, and which properties depend on additional implementation, deployment, or operational mechanisms. No conclusion about the security of a specific product, project, organisation, or deployment should be drawn without a separate system-specific assessment.

The expression **Temporal Confused Deputy** is descriptive terminology introduced by this article for its defined model-relative condition. Its use does not report a vulnerability in any named product, implementation, organisation, or deployment and does not represent an accepted external classification.

Any implementation, experimentation, or operational use is undertaken at the user's own risk. To the fullest extent permitted by applicable law, the author makes no warranties, express or implied, regarding accuracy, completeness, fitness for a particular purpose, security, non-infringement, or freedom from defects, and accepts no responsibility for decisions, losses, damage, or security incidents arising from reliance on this article or from implementations based upon it.

References to prior work are provided for scholarly analysis and comparison. Quotations and descriptions should be read in the context of the cited original sources. Any error of attribution, interpretation, or citation is unintentional and should be reported for correction.

The site-wide [disclaimer](/disclaimer/) applies in addition to this notice.
