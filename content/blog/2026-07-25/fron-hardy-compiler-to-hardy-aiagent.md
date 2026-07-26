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

**What is claimed.** This article isolates one problem: preserving the binding between delegated authority and the execution for which it was granted, across time and concurrent execution — essentially, **authority propagation**.

The *creation* of authority is presupposed here, not re-examined. A principal may authenticate through OIDC, for example, and initial authority may be established through an OAuth-based system or another authorisation mechanism. This article begins when that authority must be propagated across later execution boundaries.

Under the threat model adopted here, possession and presentation of a conventional OAuth access token do not by themselves establish the required authority-to-execution relationship. One proposed future integration direction is an **OAuth 2.0 Token Exchange (RFC 8693) profile** that would derive a PCA₀ from a validated OAuth authority artefact. That integration profile is not defined by the current PIC specification set. Authentication and initial authorisation remain complementary to the continuity property examined here.

PIC continues capability research through a temporal refinement of the local designation–authority binding already present at capability invocation. Capabilities make authority portable and bind designation to permission at the point of invocation. PIC takes that local binding as its starting point and defines a different propagation construction: a receiving boundary accepts authority only with evidence that the current step validly continues one predecessor execution. The distinction is therefore not that capabilities lack a discriminator, but that PIC makes execution continuity part of the receiver's acceptance decision across multiple hops.

Under its explicit assumptions, PIC's formal model establishes the authority-continuity property defined in this article. The result remains conditional on those assumptions and on the correctness of the definitions and proof.

**What is not claimed.** This article does not claim that capabilities are incorrect, that the cited prior results fail within their stated models, that PIC replaces capability-based security, or that PIC resolves every question of authority across untrusted execution.

**Why this article exists.** Capability-based security remains one of the strongest and most elegant approaches developed for controlling delegated authority. Nothing in this article argues otherwise.

The results established by Spiessens are treated here as correct within their stated definitions, assumptions, and formal model.

The question examined here is different.

This article asks whether the transition from short-lived execution to long-running, concurrent, and autonomous execution introduces an additional security property that should be modelled explicitly.

<blockquote class="callout-tip">

If that question is answered positively, <span style="color: var(--green); font-weight: 600;">the consequence is not that capability-based security was incorrect.</span> It suggests a temporal refinement in which valid propagation requires execution continuity in addition to possession and delegation. Delegated authority remains relevant; the additional question is whether its relationship to the execution being continued is represented and verified across multiple hops.

</blockquote>

PIC is presented as one possible formalisation of that additional property. Whether that formalisation is correct is the subject of the accompanying proof, independent inspection and reproduction, and the technical discussion invited by this article.

If the argument presented here is correct, the conclusion is not that capability-based security should be replaced, but that it may be extended under a broader execution model.

**On equivalence.** No equivalent formal result has been identified in the material examined for this article for mechanisms whose acceptance semantics rest on bearer possession and presentation alone, or for capabilities propagated as transferable authority artefacts across untrusted execution. This is not a claim that no such result exists elsewhere. In the context of this article, establishing equivalence would require comparable definitions, assumptions, threat model, acceptance predicates, and proof of the same property. Until such a result is identified in the examined material, this article does not treat those mechanisms alone as establishing authority continuity.

**This is published for critical review.** Test the assumptions, identify counterexamples or defects in the definitions or proof, and determine whether PIC establishes the stated property or whether a stronger construction is required. Within the formal model and assumptions stated here, I presently consider the authority-continuity property established.

</div>

**A note on prior work.** This article revisits ***Patterns of Safe Collaboration*** (Alfred Spiessens, 2007) because, in the author's view, it is among the most influential, technically rigorous, and valuable contributions to capability-based security and safe composition. Its results are treated here as correct within their stated definitions, assumptions, and formal model. The scope is deliberately narrow: one work, examined closely, rather than a survey. No conclusion about the wider capability literature should be drawn from its selection, and nothing here is asserted about works not examined.

**The purpose of this article is not to contradict or replace those results.** It asks whether extending the threat model to long-running, concurrent, and untrusted executions introduces an additional dimension — time and execution continuity — that falls outside the scope of the properties formally established in that work.

**And it continues that line of research through a temporal refinement.** At the level of primitives, capability invocation already binds designation and permission at one hop. The companion paper treats that local binding as an instance of the continuity primitive. At the level of system construction, however, the design road differs: capability delegation makes authority portable, while PIC makes continued acceptance depend on receiver-verifiable evidence that one execution step validly continues another.

> The distinction in one line: capabilities bind designation and authority at invocation; PIC makes that binding composable and verifiable across an execution lineage.

The comparison is therefore not between a mechanism with no discriminator and one with a discriminator. It concerns where the discriminator is represented, who verifies it, and whether the local binding composes across time, independent executions, and multiple hops. Under the threat model set out below, the specific capability results examined here do not themselves establish that additional property; PIC is one construction that establishes it under its own stated assumptions.

<blockquote class="callout-tip">

<p style="color: var(--text-primary);"><span style="color: var(--green); font-weight: 600;">What “native to PIC” means.</span> Under the threat model defined here, a receiving boundary must verify that propagated authority validly continues one concrete predecessor execution and request. PIC makes that requirement part of its represented state, successor construction, and receiving acceptance rules through predecessor binding, request binding, execution-contract conformance, Proof of Relationship, and authority non-expansion.</p>

<p style="color: var(--text-primary);">“Native” does not mean assumption-free, implementation-free, or uniquely achievable by PIC. Concrete deployments still depend on correct cryptography, canonicalisation, verification, enforcement, attestation handling, origination policy, authority-domain semantics, and profile-specific trust assumptions.</p>

<p style="color: var(--text-primary);">Capability-based, transaction-context, runtime, mediated, or deployment-specific constructions may establish an equivalent property when their receiving decisions represent and verify an equivalent execution-sensitive binding. The comparison concerns acceptance semantics under a stated threat model. It is not a claim that other security models are incorrect or that equivalent constructions are impossible.</p>

</blockquote>

The analysis and conclusions that follow are the author's interpretation of the cited material. They are not statements about the original author's intentions, competence, conduct, or views, and should not be understood as asserting that those results are incorrect within their stated model. Readers are encouraged to consult the original work, consider the cited passages in their full context, and independently assess whether the interpretation presented here is justified. Nothing in this article should be understood as diminishing the scientific value of the cited work.

For clarity, any comparison made in this article concerns the scope of formally established security properties under different threat models, not the quality, importance, or correctness of the cited work within its original scope.

> **A note on terminology.** Throughout this article, *protocol* means **application security protocol**, and more precisely **authorisation protocol**. Where authentication is meant it is named explicitly, and so are transport and wire protocols.

Before going further, consider the scope, four methodological premises, and the threat model that frame the discussion.

## Scope

**Authority already exists; the subject is propagating it.** The user has authenticated and authority has been created. Whether the IdP issues a propagatable token directly, or issues an OAuth access token that is then exchanged for a PCA, is not examined here. What matters is that authority exists and must be propagated. The article asks which properties remain verifiable when that propagation crosses long-running, concurrent, or untrusted execution boundaries.

## Premises

<figure class="post-banner">
  <img src="/images/2026-07-25/authority-propagation.png" alt="Authority Propagation." loading="lazy">
  <figcaption>Authority Propagation.</figcaption>
</figure>


**1. No authorisation protocol controls every action inside an executor.** A protocol defines conditions for valid authority use and propagation; it does not itself execute application code. A faulty or non-conforming implementation may accept `READ` authority and still perform a `WRITE` inside its own security boundary. This limitation must be distinguished from the separate question of whether invalid authority can be accepted and propagated by another execution boundary.

**2. An authorisation protocol must prevent one executor from causing another execution boundary to accept authority that is not valid for the request being continued.** A receiving boundary can verify what an executor presents, but it cannot guarantee what that executor did inside its own boundary. Correct executor behaviour therefore cannot itself be counted as the protocol proof of correct authority-to-execution attribution.

For the acceptance property examined here, the cause does not change the classification. A call accepted with authority outside the applicable context is a violation of the stated model whether it results from malice, compromise, or an ordinary defect.

> Protocols would be unnecessary if every call were legitimate. They exist for the calls that are not.

**3. A protocol is only as sound as what it represents.** Three things are not the same: what it enforces and can prove, what it assumes and states openly, and what it silently depends on. The first is a stated guarantee. The second is an explicit dependency that can be evaluated against the threat model. The third is an undocumented dependency and must not be represented as a proved property.

**4. Protocol scope and system requirements must be distinguished.** Every protocol has legitimate boundaries. When a security property required by the surrounding system falls outside those boundaries, the property becomes an external assumption or system-level responsibility. That dependency should be stated explicitly and evaluated against the adopted threat model.

> A protocol guarantee should be evaluated together with its declared scope, external assumptions, and the requirements of the system in which it is used.

**Reality still applies.** No protocol is perfect and every design has an implementation limit, and that is worth stating rather than arguing away. But the comparison holds in a narrower form: the more of the adopted threat model a protocol demonstrably covers, the fewer security-relevant properties remain dependent on external assumptions. And since the subject is security, that assessment has to be formal and methodological, not rhetorical.

Protocols are also not neatly nested: one is rarely a superset of another, covering the same perimeter plus more. Coverage overlaps unevenly, each protocol stronger somewhere and thinner elsewhere. So the comparison needs an anchor — the **threat model**. Application type and requirements define it, and it becomes the reference perimeter.

## Threat model for distributed systems

**Security classification follows the accepted effect, not an attribution of motive.** Within this article's model, an authority use outside the applicable context is a violation regardless of whether it results from malice, compromise, non-deterministic selection, or an ordinary defect. These conditions are threat-model assumptions, not accusations about a particular executor or implementation.

For the purposes of this article, an executor is treated as untrusted when the adopted threat model includes one or more of the following conditions:

- implementation defects or exploitable behaviour are in scope;
- internal action or authority selection may be non-deterministic and is not accepted as proof of execution attribution;
- executor compromise is in scope;
- execution crosses process, host, workload, service, or network boundaries that are not assumed to preserve request-to-authority attribution.

These conditions do not assert that every executor is compromised, defective, or incapable of preserving internal separation. They state which behaviours the receiving security argument is not permitted to assume away.

Under those conditions, a security argument that relies on correct executor behaviour must identify that reliance as an assumption or show how another mechanism establishes the required property.

PIC, capability, and token constructions may depend on trust anchors whose scope, compromise consequences, and operational role must be stated explicitly. This article does not compare security mechanisms solely by counting their trust anchors.

Two further problems belong to this threat model. Both concern the executor at position `n+1`, the step that comes next, and they are distinct enough to be worth naming separately.

**The N+1 Unidentified Successor Problem.** When authority is originated, the concrete successor occurrence need not be known or individually enumerable. There may be no successor, one successor, or several, possibly in parallel. A concrete successor may not yet exist and therefore need not yet have an identity, key, channel, or runtime instance to which authority can be pre-bound. Eligibility conditions may be defined in advance; the concrete successor can be evaluated when it materialises.

**The N+1 Invalid Authority-State Problem.** An executor may hold authority associated with several independent executions and may also attempt to alter the authority it received. A receiving boundary must not accept a successor state that either carries authority outside its authenticated predecessor context or presents authority from one execution as a valid continuation of another. Subjective intent need not be inferred; the question is whether the successor state satisfies the required acceptance predicate.

For the purposes of this article, the following is the **minimum threat model adopted for the class of networked distributed systems being analysed**:

| Element | Why it holds |
|---|---|
| **Transport is untrusted** | Channel location, routing, or possession of an authority artefact does not by itself establish which execution the authority belongs to. |
| **Execution is untrusted and has no global mediator** | The executor's internal behaviour is not accepted as the proof of correct attribution, and no separate globally trusted component is assumed to separate every execution step. Correct local verification and enforcement may still be required. |
| **Execution is concurrent** | Independent requests and authority contexts may coexist and progress at the same time. |
| **The N+1 Unidentified Successor Problem** | A concrete successor occurrence may not exist or be identifiable when authority is originated. Eligibility conditions may be defined in advance, while the concrete successor is evaluated when it materialises. |
| **The N+1 Invalid Authority-State Problem** | A receiving boundary must reject a successor state that expands the authenticated predecessor authority context or presents authority associated with one execution as the continuation of another. The executor's own authority selection is not the proof of that attribution. |

The individual assumptions above are commonly considered in security and distributed-systems analysis, but their particular combination, definitions, and application to authority continuity are specific to this article. This article does not claim that there is one universally accepted threat model for every distributed system, nor that every system must adopt all of these assumptions. Their relevance must be evaluated against the architecture and operational environment under examination.

## Threat model for an AI agent

For conventional software, assumptions about reviewed code, controlled deployment, network boundaries, and deterministic execution may sometimes support a narrower trust model. They cannot automatically be transferred to the class considered here: long-running autonomous agents that may serve overlapping requests, retain authority across time, and select later calls at runtime. For that class, the agent's own internal authority selection cannot itself serve as the protocol proof of correct authority-to-execution attribution.

> The relevant question is not whether the agent is expected to behave correctly, but whether a receiving execution boundary can verify the presented authority state independently.

The general model above still holds in full. Same elements, only sharper:

| Element | With the class of AI agent examined here |
| --- | --- |
| **Transport is untrusted** | If the agent can copy, persist, forward, or place an authority artefact on another channel, channel location alone cannot establish which execution the authority belongs to. |
| **Execution is untrusted and has no global mediator** | Non-deterministic action selection, possible compromise, and the absence of a globally trusted separator mean that the agent's internal authority choice cannot itself serve as proof of correct attribution. Local trusted verification and enforcement may still be required. |
| **Execution is concurrent** | The class examined here may serve overlapping requests and retain authority associated with more than one execution at the same time. The threat model does not assume that one executor correctly preserves the internal request-to-authority separation among those execution occurrences. Such separation may be supplied by the implementation, but it is not itself the receiver-verifiable proof of execution attribution. |
| **The N+1 Unidentified Successor Problem** | Later tools, workloads, services, or agents may be selected at runtime. A concrete successor occurrence may not exist or be identifiable when authority is originated. |
| **The N+1 Invalid Authority-State Problem** | The agent may present authentic authority associated with one execution as part of another, substitute one execution's authority state for another, or attempt to expand the authority received. The receiving boundary must evaluate the resulting authority state independently rather than relying on the agent's internal request routing, retained state, or authority selection. |

### Execution-context non-mixing

The five threat-model elements above imply a narrower operational requirement for the AI-agent class examined here. One executor may host several independent execution occurrences at the same time. Those occurrences may have the same principal, the same executor identity, and overlapping or identical privileges while still continuing different requests.

The threat model does not assume that the executor's internal scheduler, memory, request routing, retained state, or authority-selection logic correctly preserves that distinction. A concrete implementation may preserve it through request-scoped state, isolation, sequencing, non-transferable references, explicit lineage identifiers, trusted mediation, or another mechanism. The executor's correct use of those mechanisms, however, is not by itself a receiver-verifiable protocol property.

The required property is therefore execution-context non-mixing at the receiving boundary.

When an authority state is presented as the continuation of Execution A, the receiving boundary may accept it only when the state is validly attributable to that concrete execution occurrence.

A state that is valid for Execution B does not become valid for Execution A merely because:

- the same executor possesses it;
- both executions belong to the same principal;
- both executions concern the same resource;
- both executions carry the same privileges;
- the authority artefact is authentic;
- the authority was validly delegated in some other context.

Authenticity and possession remain relevant where required by the applicable mechanism. They do not, by themselves, establish which execution the authority state validly continues.

In ordinary language:

> Authority valid for one execution must not be accepted as the continuation of another execution unless its relationship to that second execution is independently verifiable.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">Let \(X_A\) be one concrete execution occurrence and let \(S\) be the authority state presented as its continuation. Execution-context non-mixing requires:</p>

\[
\operatorname{Accept}(X_A,S)
\Longrightarrow
\operatorname{ValidContinuationOf}(S,X_A).
\]

<p style="color: var(--text-primary);">A state \(S_B\) may be a valid continuation of a different execution \(X_B\):</p>

\[
\operatorname{ValidContinuationOf}(S_B,X_B).
\]

<p style="color: var(--text-primary);">That fact does not imply:</p>

\[
\operatorname{ValidContinuationOf}(S_B,X_A).
\]

<p style="color: var(--text-primary);">The distinction remains necessary when \(X_A\) and \(X_B\) belong to the same principal or project to the same resource and privilege set.</p>

</blockquote>

Execution-context non-mixing is not a sixth threat-model element. It is a derived acceptance requirement arising from untrusted execution, concurrent or retained execution state, and the N+1 Invalid Authority-State Problem.

A second failure sits next to that one and must not be confused with it. Selecting authority from the wrong execution is one problem; executing something other than the authorised operation is another. An authorisation protocol may bind operation, target, tenant, parameters, or digests where its specification requires them, but it cannot by itself prove the semantic or physical correctness of what an executor ultimately does inside its own boundary.

On transport, one design consequence: assume varied and less secure transports from the outset, accepting that some physical limits cannot be engineered away.

**For an authority-bearing AI-agent decision, two questions must be separated.** One is what the protocol can verify; the other is what remains dependent on local interpretation.

- **The protocol-verifiable part is explicit.** A receiving execution boundary must reject a propagated authority state that exceeds, or is misattributed relative to, the authenticated predecessor execution.
- **The interpretive part is not converted into proof.** Semantic intent remains outside the authority-continuity guarantee and must not be represented as protocol-verified.

This also creates a usability constraint: systems should minimise the decisions that require fresh human confirmation without treating unattended agent interpretation as proof of correct authority attribution.

> The goal for an AI agent is to operate under an untrusted-execution threat model, with a human in the loop only where that is strictly unavoidable — and on an authorisation protocol whose guarantee is formal under stated assumptions: inside a correctly attributed execution lineage, a confused deputy is not representable. Outside those assumptions the failure is not eliminated, only inherited.

## Applicability of the threat model

This article does not claim that every AI-agent deployment or every distributed system must adopt this threat model. It applies to systems in which execution is long-running or concurrent, authority may be retained from independent requests, later calls or concrete successor occurrences may be selected at runtime, and the executor's own internal authority selection is not accepted as the proof of correct execution attribution.

The same analysis applies to distributed execution architectures in which authority crosses independently verified process, workload, service, broker, queue, host, or administrative boundaries; concurrent authority contexts may coexist; and no globally trusted mediator preserves the authority-to-execution binding for every step. Whether a particular architecture or deployment has these characteristics requires a separate system-specific assessment.

## The threat model, distilled

The two tables above overlap. Distilled to remove the redundancy, the threat model reduces to five elements — the call graph row folds into the first N+1 problem, and the invalid-transition and intent-selection rows fold into the second:

| Element | What it means |
| --- | --- |
| **Transport is untrusted** | Channel location, routing, or possession of a copied artefact is not itself proof that the authority belongs to the execution being continued. |
| **Execution is untrusted and has no global mediator** | The executor's internal behaviour is not the proof of correct attribution, and no separate globally trusted component is assumed to separate every execution step. Local trusted verification and enforcement may still be required. |
| **Execution is concurrent** | Independent requests and authority contexts may coexist and progress at the same time. |
| **The N+1 Unidentified Successor Problem** | A concrete successor occurrence need not exist or be identifiable when authority is originated. Eligibility conditions may be defined in advance; conformance is evaluated when the successor materialises. |
| **The N+1 Invalid Authority-State Problem** | A successor state must not be accepted if it expands the authenticated predecessor authority context or attributes authority from one execution to the continuation of another. |

## The property required by this threat model

The required property is receiver-verifiable execution attribution, including execution-context non-mixing. A receiving execution boundary must be able to decide, without relying on the predecessor's discretionary assertion of correct purpose selection or correct internal context management, whether the presented authority state is a valid continuation of one concrete predecessor execution and request.

This is not merely authority authenticity or possession. An authority artefact may be genuine, correctly signed, and genuinely possessed while still belonging to a different execution. The property therefore requires that:

- authority associated with execution A not be accepted as a continuation of execution B;
- authority states associated with A and B not be accepted as one ordinary continuation merely because the same executor possesses both;
- no accepted successor carry authority outside the applicable authenticated predecessor context;
- attribution remain verifiable where A and B have the same principal, executor, resource, or privilege set.

The requirement is occurrence-sensitive rather than merely privilege-set-sensitive.

Two independent executions may legitimately carry exactly the same authority. Equality of their authority sets does not make the executions themselves identical. They may still continue different requests, have different predecessors, and require different authorisation decisions.

What must remain distinguishable is the concrete execution occurrence and predecessor relationship under which the authority is presented.

<blockquote class="callout-math">

<p style="color: var(--text-primary);"><strong>Formal notation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

<p style="color: var(--text-primary);">Equality of the authority contexts:</p>

\[
C_A=C_B
\]

<p style="color: var(--text-primary);">does not imply equality of the execution occurrences:</p>

\[
X_A=X_B.
\]

</blockquote>

This property does not establish subjective intention, bug-free code, physical causation, semantic correctness of generated content, scheduler correctness, internal memory isolation, or correct local execution inside an executor. It governs whether the receiving boundary accepts and propagates the presented authority as belonging to the represented execution.

## Defining the problem: a vulnerability, not a bug

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

A concrete implementation may establish this separation through request-scoped isolation, sequencing, non-transferable references, explicit lineage state, trusted mediation, PIC, or another equivalent mechanism. The diagram does not claim otherwise.

**What is not being claimed.** Nothing here says an AI agent cannot receive capabilities as arguments alongside the request. The statement is narrower: under the threat model adopted by this article, the agent's internal behaviour cannot be relied upon to preserve a protocol-verifiable request-to-authority binding across long-running and concurrent executions. An implementation may introduce request-scoped state, synchronisation, isolation, sequencing, lineage identifiers, or non-transferable references, and those mechanisms may prevent particular interleavings. The question is whether the binding between authority and execution is a verifiable property of the protocol or an assumption of the implementation.

**The article-defined Temporal Confused Deputy condition.** For the purposes of this article, *Temporal Confused Deputy* names the cross-execution authority/causality mismatch defined here. It describes a temporal and multi-step instance of the general mismatch exemplified by the classical Confused Deputy Problem. The term is introduced by this article and is not attributed to Hardy.

It is not primarily an authority-expansion failure. In the classical case the deputy uses its own authority on a resource designated by the requester. In the temporal case one executor hosts more than one execution occurrence and presents authority associated with one occurrence while continuing another.

The violation is cross-execution authority misattribution, not the mere coexistence of several authority states. The same executor may legitimately possess every authority involved. The question is whether the state presented for the current continuation remains attributable to the represented predecessor execution.

Every authority involved may be genuine, correctly signed, really delegated, and valid in some context. Two occurrences may even project to the same principal, resource, and privilege set while remaining distinct executions.

> Validity of the authority is not the same as validity of its attribution to the current execution.

The label applies only when the stated threat-model conditions and acceptance assumptions are satisfied. It does not imply that every long-running agent, concurrent system, distributed system, or capability implementation admits such an execution.

**A vulnerability rather than necessarily a bug.** A transition satisfying the article-defined Temporal Confused Deputy condition is a security violation within the adopted threat model because authority associated with one execution is accepted as part of another execution's continuation without the required verified relationship.

The failure requires neither forged authority nor malicious conduct. It follows from a model in which authority from concurrent executions may enter shared state without a protocol-verifiable execution binding. Whether that state-sharing design constitutes an implementation defect depends on the requirements of the concrete system. Premise 1 covers the other situation, where an executor diverges from what it was asked; this one requires no divergence at all. What is absent is a verifiable representation distinguishing authority that belongs to Request A from authority that belongs to Request B.

Calling the condition a vulnerability does not assert that every concrete system contains it. The classification applies where the system adopts the stated threat model and its acceptance rule permits the invalid cross-execution attribution.

**Execution as a third coordinate.** In the classical Confused Deputy, the capability makes resource designation and authority inseparable at invocation. The problem examined here adds one coordinate: the concrete execution lineage in which that authority may be exercised. The execution does not replace the resource — operation and resource remain relevant. It is the additional coordinate that determines where otherwise valid authority may continue.

> Capability security makes the resource and the authority inseparable at invocation. Authority continuity additionally makes the authority and its execution lineage inseparable across time.

**Operations over the execution.** Once the execution is an explicit object of authorisation, operations traditionally defined over capabilities or resources have to be defined over the execution context as well. An execution is originated. It may be continued. Its authority may be attenuated. Several independent executions may participate jointly without merging their authorities into one lineage. An execution may be revoked or interrupted by coordinates of its own. And a continuation must prove which execution it belongs to.

**A `run` command can have this shape.** A user may authorise `run this task`, or `start this execution under authority C`. At the moment the command is given the process may not exist yet, the next executor may not be known, one or many executors may appear later, and no identity is necessarily available in advance to bind the authority to.

> A `run` command does not necessarily identify the process that will eventually perform every step. It originates an execution whose future executors may materialise later. The security question is therefore whether each later use of authority remains a valid continuation of that execution.

**The two questions.**

> Hardy's compiler asked: which authority should this operation use?
>
> Hardy's AI agent asks: which execution does this authority belong to?

The classical capability answer binds designation and authority at invocation. The additional requirement examined here is to preserve that binding as authority continues across time, concurrency, and not-yet-known successors. Possession or invocation alone does not establish the authority-continuity property defined by this article, unless the system additionally represents and verifies the relevant execution binding.

## The vulnerability at runtime

Capabilities address the classical Confused Deputy Problem by having the client supply, with the request, the capability that both designates the target resource and conveys the authority to be exercised. The additional question examined here is whether the deputy's selection among all authority it holds remains attributable to the execution being continued.

Within the deliberately minimal model and assumptions stated below, an execution satisfying this article's definition of the **Temporal Confused Deputy** condition is reachable. This means only that the stated countermodel admits cross-execution authority misattribution under its deliberately minimal acceptance rule. Whether a concrete capability implementation or deployment admits an equivalent execution requires a separate system-specific analysis.

To see the failure under the stated assumptions, take a deliberately minimal setup. Alice is the only user of the agent, so every authority the agent holds comes from Alice, and the model uses a shared possession-based accumulator that composes capabilities as they arrive.

**Scope of the example.** This example assumes that the accumulator provides no protocol-verifiable binding between authority and execution lineage, that concurrent scheduling does not preserve lineage separation, and that no external synchronisation or request-scoped isolation mechanism prevents the illustrated interleaving. It does not purport to describe every capability implementation. An implementation may prevent this particular execution through request-scoped state, explicit lineage identifiers, synchronisation, isolation, sequencing, or other mechanisms. The narrower question examined here is whether the relevant authority-to-execution binding follows from the protocol property being analysed under the stated threat model, or depends on additional implementation mechanisms and assumptions.

For this countermodel, `C_A` and `C_B` are the authority contexts carried by `capA` and `capB`. Each context is a set of operation-and-resource privilege pairs.

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

<p style="color: var(--text-primary);">Composition in this countermodel is set union:</p>

\[
\operatorname{compose}(X,Y)=X\cup Y.
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

**Relationship to existing implementations.** This article does not claim that every existing capability-based implementation exhibits this runtime behaviour. Implementations may include request-scoped state, lineage identifiers, synchronisation, isolation, sequencing, non-transferable references, or other mechanisms that prevent particular forms of cross-request authority composition. The question addressed here is whether authority continuity is established as a protocol property under the stated threat model, or supplied by additional implementation mechanisms and assumptions.

This result follows from the structure of the minimal model under the stated concurrency assumptions and does not require malicious conduct. Whether the stated shared-state construction would constitute an implementation defect depends on the requirements of the concrete system. A buggy or compromised executor creates additional risks, but the example isolates a narrower issue: valid authority from independent executions is composed without a protocol-verifiable representation of execution lineage. Three consequences follow within that model:

| Consequence | Why |
| --- | --- |
| **The model has no request-scoped separator** | In this minimal shared-state model, no request-scoped mechanism separates the two authority contexts. |
| **Execution attribution is absent** | Nothing in the accumulated authority records which execution each authority item belongs to. |
| **Deputy cooperation is not the proof** | The deputy's cooperation cannot be used as the premise that proves correct execution attribution under this threat model. |

> Under this threat model, continuity cannot be established solely through the deputy's cooperation. It must be represented and independently verified at the receiving boundary, whether through PIC or through another construction shown to establish an equivalent property.

## Bearer token assumptions

“Bearer” describes presentation and use semantics, not an encoding and not the complete security properties of every token profile. A bearer artefact is usable by a party that possesses and presents it, subject to the receiving system's validation rules.

Copyability or presentability alone does not determine whether an artefact will be accepted. The relevant comparison is the complete receiving acceptance predicate: token validity, issuer, audience, holder binding where applicable, transaction conditions, request binding, predecessor binding, execution-contract conformance, non-expansion, and any lineage or continuity evidence required by the mechanism.

**What is in question, and what is not.** This article concerns authority propagation across execution boundaries. Authentication and the creation of initial authority are outside its scope. OIDC and OAuth are mentioned only as examples of mechanisms that may participate before the propagation stage; this article makes no claim that either mechanism is universally sufficient, settled, or appropriate for every deployment. The question begins once authority has reached a workload, system, or agent and must be propagated further under the threat model defined here.

<blockquote class="callout-tip">

<p style="color: var(--text-primary);">This article does not evaluate OIDC or the initial creation of an OAuth access token. <span style="color: var(--green); font-weight: 600;">It examines whether the authority artefact and the receiving acceptance predicate preserve the required authority-to-execution binding when authority is propagated further.</span> An OAuth 2.0 Token Exchange profile for deriving a PCA₀ is a proposed future integration direction. It is not defined by the current PIC specification set and is not presented here as an existing interoperability guarantee.</p>

</blockquote>

**This is not a defect claim.** Token mechanisms may correctly address the threat models for which they were designed. The comparison here uses a narrower criterion: what the receiving execution boundary is required to verify before propagated authority may be exercised.

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);"><strong>OAuth Transaction Tokens.</strong> The supplied <em>draft-ietf-oauth-transaction-tokens-09</em> must not be treated as a conventional OAuth access token. It defines short-lived signed JWTs associated with a specific transaction and propagated through a Call Chain within a Trust Domain. Those tokens may carry user or workload identity, authorisation context, request context, transaction context, and values intended to remain immutable through the Call Chain.</p>

<p style="color: var(--text-primary);">The supplied draft also constrains replacement tokens: it prohibits scope expansion, preserves specified transaction identifiers, and requires the Call Chain to be maintained, while stating that the mechanism for maintaining that Call Chain is outside the specification's scope. This article therefore does not claim that Transaction Tokens lack transaction context or that they are equivalent to ordinary bearer access tokens.</p>

<p style="color: var(--text-primary);">Whether their complete issuance, validation, replacement, Trust Domain, and Call Chain rules establish a property equivalent to PIC's predecessor-specific execution continuity requires a separate comparison under common definitions, assumptions, acceptance predicates, and proof obligations. No conclusion about that equivalence is made here.</p>

</blockquote>

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);"><strong>Copied or replayed artefacts.</strong> Bearer tokens, sender-constrained tokens, transaction-scoped tokens, capabilities, and PCAs may all be represented by artefacts that can be observed or presented. Copyability alone therefore settles nothing. The relevant distinction is whether the receiver verifies only token validity, holder, audience, or transaction conditions, or also verifies predecessor-specific execution continuity, request binding, execution-contract conformance, and authority non-expansion.</p>

</blockquote>

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);"><strong>Successor binding.</strong> Sender-constraining binds use to a holder key and is valuable where that holder exists and is known. The threat-model element examined here concerns a different point: the concrete successor occurrence may not yet exist when authority is originated. Eligibility conditions may be fixed in advance, but the concrete successor proves conformance only when it materialises.</p>

</blockquote>

Whether a particular deployment obtains an equivalent authority-to-execution binding through other mechanisms is a separate, system-specific question.

## Capability assumptions

This section compares specific passages from the cited work with the additional property defined above. Each entry gives the reference, the passage verbatim and uncut, the result established by that passage, and the narrower comparison made under this article's threat model. Absence of an entry implies nothing about the work.

<blockquote style="border-left: 3px solid #e6edf3;">

<p style="color: var(--text-primary);">Spiessens, A. (2007). <em style="color: var(--text-primary);">Patterns of Safe Collaboration</em>. PhD thesis, Université catholique de Louvain, Louvain-la-Neuve — <a href="https://www.evoluware.eu/fsp_thesis.pdf" target="_blank" rel="noopener noreferrer">fsp_thesis.pdf</a></p>

</blockquote>

<blockquote class="callout-tip">

<p style="color: var(--text-primary);"><span style="color: var(--green); font-weight: 600;">One element is conceded up front: on <em style="color: var(--green);">transport is untrusted</em> there is nothing to distinguish.</span> Cryptographically protected capability systems and PIC both operate over untrusted transport. The four entries below concern the remaining elements.</p>

</blockquote>

### What the cited capability model already establishes

The cited work establishes substantive security properties that this article accepts within their stated model. Capabilities combine designation and access permission, allowing the client to provide the authority the deputy is expected to exercise. This closes the classical designation–authority gap addressed by the Confused Deputy example.

The model also supports dynamic creation, parenthood, endowment, and authority propagation through interaction. Its KBM safety analysis uses a fixed finite set of abstract subjects for tractability, while potentially unbounded concrete runtime entities may be represented through aggregation. The resulting analysis is conditional on the safety and representativeness of that abstraction.

Stack walking and capability delegation are separate approaches. The parallel and distributed limitation quoted below applies to the stack-based approach, not automatically to the capability construction.

A capability invocation, as characterised by the cited work and the companion paper, provides a local request-to-authority discriminator by binding designation and access permission at that invocation. The narrower question examined here is whether the cited result establishes that local binding as a receiver-verifiable invariant across a long-running, multi-hop execution lineage.

### From local discrimination to composable continuity

A capability invocation, as characterised by the companion paper, is not equivalent to the lineage-invariant possession policy of Definition 7: designation and access permission are bound at one causal step, so a local discriminator is already present. A capability later treated as a freely held artefact and applied outside the occurrence that carried it may nevertheless fall within the possession-based case analysed by the companion paper. The paper treats the invocation-level binding as a one-hop instance of the continuity primitive.

The discriminator theorem therefore does not show that capabilities lack discrimination. It establishes, under its stated definitions, that a policy distinguishing an authorised occurrence from a confused occurrence must read some lineage-sensitive discriminator.

The trade-off theorem further establishes, under its stated definitions, that lineage-invariant authorisation, authority-mixing-capable delegation, and confused-deputy safety cannot all be retained simultaneously. The comparison below therefore concerns where the discriminator is represented, who verifies it, and whether the local one-hop binding composes as a receiver-verifiable invariant across multiple execution steps.

This article does not classify the cited capability construction as possession-only authorisation, does not apply a theorem whose hypotheses it does not satisfy, and does not claim that an equivalent capability-based construction is impossible.

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
<td>The cited result is conditional on the deputy not substituting its own authority for the authority delegated by the client. The passage does not itself establish the additional receiver-verifiable execution-attribution property defined here.<br><br><em>This comparison does not establish impossibility, insecurity of capability systems generally, or a defect in the cited result.</em></td>
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
<td>For the <em>Check Who's Asking</em> approach, exact client or intention attribution is not established by the cited passage. The additional receiver-verifiable execution-attribution property therefore does not follow from this approach as described.<br><br><em>This comparison does not establish impossibility, insecurity of capability systems generally, or a defect in the cited result.</em></td>
</tr>
<tr>
<th scope="row">Under PIC</th>
<td><strong>Mechanism.</strong> Intent is not inferred. The receiving decision evaluates whether the presented state is a contract-conforming, non-expansive continuation of one represented predecessor and concrete request under the applicable PIC profile. The decision does not depend on selecting which member of a delegation chain the deputy subjectively serves. It validates one represented predecessor relationship through the applicable ordered checks.<br><br><strong>Boundary.</strong> Proof of Relationship does not establish physical, counterfactual, subjective, or prior-designation causation. Together with the complete receiving checks, it establishes only the model-relative PIC execution-causality and continuation property defined by the specification.</td>
</tr>
</tbody>
</table>

### From "Who is asking?" to execution continuity

PIC is closer to the attribution question raised by *Who is asking?* than to an attempt to infer the deputy's psychology. It preserves the need for attribution but changes its object: from identifying a caller or client in a delegation chain to verifying the concrete predecessor execution that the presented authority state continues.

PIC does not restore stack walking, identify a human caller, or infer subjective intention. The receiving boundary instead asks whether the presented state is a contract-conforming, non-expansive continuation of one authenticated predecessor and concrete request.

The question changes from *which client is the deputy working for?* to *which authenticated execution is this authority state validly continuing?*

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
<td>The cited stack-walking approach is outside the parallel and distributed execution scope adopted here. Separately, deputy cooperation is not accepted as the proof of execution attribution under this article's threat model.<br><br><em>No broader conclusion about capability systems follows from the stack-walking scope limitation.</em></td>
</tr>
<tr>
<th scope="row">Under PIC</th>
<td><strong>Mechanism.</strong> Acceptance does not depend on trusting the predecessor's discretionary assertion that it selected the correct authority. The receiving boundary validates the continuation evidence required by the applicable PIC profile. The chain representation is not limited to a local call stack and may cross process, thread, host, and network boundaries.<br><br><strong>Boundary.</strong> Correct verification and enforcement remain trusted at every receiving execution boundary. The foundational formal chain is linear; separation of independent concurrent lineages through single-predecessor binding and non-expansion is not itself a proof over every arbitrary fork, join, DAG, or general concurrency semantics. The assurance and collusion assumptions also differ among incremental, full-chain, snapshot, and other deployment profiles.</td>
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
<td>The cited passage assigns correct-purpose authority use to the deputy. It does not itself establish the additional receiver-verifiable multi-hop execution-attribution property defined here. The passage does not establish or refute whether another mediator, capability construction, or additional mechanism could provide that property.<br><br><em>This comparison does not establish impossibility, insecurity of capability systems generally, or a defect in the cited result.</em></td>
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

The discussion above does not establish an impossibility result for capability systems generally or a defect in the cited result. It identifies the additional property that must be established. The narrower formal consequence below applies only to authorisation decisions that remain invariant under execution lineage.

### Formal consequence — lineage-invariant propagation cannot establish execution-context non-mixing

This section applies the companion paper's occurrence-individuation and trade-off results to the execution-context non-mixing requirement defined by this article. It does not introduce a separate universal theorem about capability systems.

In the terminology defined above, a **Temporal Confused Deputy** execution is an accepted authority-use occurrence that is valid with respect to the projected operation and resource but is not validly attributable to the execution lineage under which it is accepted. The formal argument below concerns that article-defined condition. It does not rename Hardy's historical problem or attribute the temporal formulation to him.

### The argument in ordinary language

An authority-use occurrence has three relevant coordinates:

- the operation;
- the resource;
- the execution lineage in which the use occurs.

A lineage-invariant authorisation policy ignores the third coordinate. It therefore gives the same decision whenever two occurrences use the same operation and resource, even when the occurrences belong to different lineages.

The adopted threat model can require the opposite. One occurrence of a privilege may be a valid continuation of the authorising execution and must be accepted. Another occurrence of the same privilege may belong to a different execution and must be rejected.

A policy that ignores lineage must give those occurrences the same decision. Execution-context non-mixing requires different decisions. The requirements are therefore inconsistent.

The conclusion is limited:

> A lineage-invariant authorisation policy cannot establish execution-context non-mixing where two authority-use occurrences have the same operation and resource but their execution lineages require different authorisation decisions.

Any policy that distinguishes the two occurrences must read and verify some execution- or lineage-sensitive discriminator. The argument does not prescribe where that discriminator is stored or which implementation family supplies it.

It is therefore not an impossibility result for capability systems generally. A capability-based construction may satisfy the requirement by introducing and verifying an equivalent lineage-sensitive binding.

<div class="math-block">

<p style="color: var(--text-primary);"><strong>Formal derivation — optional for narrative reading.</strong> The prose above states the complete substantive claim. Readers following the narrative may skip this box; formal and technical reviewers should inspect it.</p>

Let:

\[
E=O\times R\times L
\]

be the set of authority-use occurrences, where:

- \(O\) is the set of operations;
- \(R\) is the set of resources;
- \(L\) is the set of execution lineages.

An event:

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

be an authorisation policy.

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

It follows that a lineage-invariant authorisation policy cannot establish execution-context non-mixing for occurrences that have the same operation and resource but belong to execution lineages requiring different authorisation decisions.

This conclusion is an application of the companion paper's Theorems 3 and 4. Theorem 3 establishes that a lineage-invariant policy cannot individuate occurrences whose projections are equal. Theorem 4 establishes that a policy distinguishing those occurrences must read some lineage-sensitive discriminator.

Formally, the receiving decision must depend on a function:

\[
g:L\rightarrow X
\]

such that:

\[
g(\ell_A)\neq g(\ell_B).
\]

The representation of \(g\) is not fixed by this argument. It may be carried alongside a request, embedded in an artefact, represented through a predecessor relationship, implemented through a non-transferable reference, or supplied by another verified construction.

The relevant question is whether the receiving authorisation decision reads and verifies the discriminator. Its storage location or implementation category does not alter the formal requirement.

</div>

### Relation to authority coexistence and delegation

The result does not prohibit capability composition, attenuation, delegation, or the legitimate coexistence of several authority sources.

An executor may legitimately hold:

- request-derived authority;
- its own service authority;
- authority associated with another execution;
- several independently delegated capabilities.

The impossibility concerns the simultaneous retention of these three properties:

1. the authorisation decision remains lineage-invariant;
2. the executor may hold or select authority associated with independent contexts;
3. the system requires confused-deputy safety and execution-context non-mixing.

This is the trade-off formalised by Theorem 5 of the companion paper.

Composition and attenuation may still be performed. The impossibility result does not remove, prohibit, or invalidate either operation.

The restriction concerns the receiving authorisation decision. A decision that considers only the operation and resource cannot distinguish two occurrences whose operation and resource are identical but whose execution lineages require different outcomes.

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

This is an impossibility result for lineage-invariant authorisation under the stated assumptions. It is not an impossibility result for capability systems generally, and the name Temporal Confused Deputy does not enlarge the scope of that result.

An equivalent capability-based construction remains possible if it represents and verifies an equivalent per-execution, multi-hop relationship.

## Independence of the problem statement and the proposed construction

The runtime example, the definition of authority continuity, and the PIC construction are distinct parts of the argument.

A defect in the PIC construction or formal proof would not, by itself, determine whether the runtime example is valid under its stated assumptions or whether authority continuity is a useful security property. Those questions would need to be evaluated independently.

Conversely, demonstrating the illustrated runtime failure under the stated assumptions would not by itself establish that PIC is correct, necessary, or the only possible construction. PIC must be assessed separately through its definitions, assumptions, formal proof, and correspondence with the systems to which it is applied.

If the PIC construction or proof contains an error, the appropriate conclusion may be that the construction requires correction, that a different construction is needed, or that the model itself must be revised. No part of the argument should be treated as insulated from independent criticism.

## PIC assumptions and the formal model

The five elements of the distilled threat model are properties of the environment, not defects to be repaired inside an executor. PIC does not remove them. It removes the need for them to be false. Each is addressed below with its mechanism and, where one exists, its boundary.

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

- **Cryptographic unforgeability is assumed.** The relationship evidence is taken as unforgeable, and a break of the underlying cryptography falls outside the model — as it does for capability and token systems alike.
- **Executor behaviour stays outside the guarantee.** No authorisation model can establish that an application is free of bugs. What this one bounds is whether a local fault can propagate as valid authority.
- **Deployment profiles are not equivalent.** The invariants are identical whether a chain is validated fully decentralised or with the help of a trusted snapshot component, but the concrete assurance and trust assumptions differ by profile. Incremental validation does not provide the same full-prefix assurance as full-chain validation against consecutive colluding hops; any such claim must remain profile-specific.
- **The guarantee does not come from transport.** A compromised channel may read, copy, delay, reorder, or drop messages. Under the stated cryptographic, freshness, verification, and enforcement assumptions, channel control alone does not allow a forged, altered, or expanded PCA to be accepted as a valid continuation. Confidentiality and availability are separate properties and are not claimed here.
- **Verifier and enforcement correctness are assumed.** The ordered checks, canonicalisation, hashing, signature validation, attestation validation, and enforcement decision must be implemented correctly.
- **Concrete-to-abstract correspondence remains an assumption.** The formal refinement relies on the stated correspondence between concrete verifier acceptance and the abstract Proof-of-Relationship relation. The model does not prove that correspondence for every implementation.
- **Origination remains a trust boundary.** The continuity invariant does not establish that a `PCA0` was semantically correct or that its originator was entitled to originate the requested authority.
- **Attestation assumptions remain profile-specific.** The trust placed in attestation issuers, evidence, and execution characteristics depends on the applicable deployment profile.
- **Heterogeneous propagation requires translation soundness.** Where authority is translated across domains, the result is bounded by the soundness and monotonicity of the translation rather than by a literal identity between the initial and final authority representations.
- **The foundational lineage model is linear.** Fan-out is addressed by the branch-capable revocation profiles, and joint participation of independent lineages by the Sandboxed Execution profile. General fork, join, fan-in, and DAG-shaped composition is identified as future work in the companion paper and must not be represented as proved by the linear-chain theorem.


## Consequences: from possession to continuity

**Time is treated here as a distinct dimension of authority propagation.** In the systems and work examined by this article, temporal continuity may otherwise be represented indirectly through possession, transaction scope, sequencing, state isolation, or related mechanisms. Under the definitions and assumptions of the PIC model, possession alone does not establish the authority-continuity property defined here.

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

Every constituent authority item in \(C^{*}\) may be genuine, correctly delegated, and correctly integrity-protected. The defect illustrated here is not invalid input. It is missing execution attribution.

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

**PIC adds the represented execution lineage as a coordinate of authorisation, alongside the operation and resource.** Two authority uses with the same operation and resource may therefore remain distinguishable when they belong to different predecessor executions or requests.

Composition, attenuation, and related operations must be evaluated over the execution context as well as over the privilege set. At the level of primitives, this is a temporal refinement of the local binding already present at capability invocation. At the level of system construction, the receiving boundary verifies whether the current use continues one represented predecessor rather than relying only on the executor's internal association between authority and request.

**Conformance runs through both primitives.** A PIC-conforming implementation must represent the invariants that Proof of Relationship and Proof of Continuity require, and by the specification's own conformance language whatever violates those invariants is not PIC-compliant regardless of naming. A capability-based construction may satisfy an equivalent authority-continuity property if it represents and verifies an equivalent per-execution binding. Establishing equivalence requires comparable definitions, assumptions, acceptance predicates, and proof. In such a construction, request-local state, isolation, synchronisation, sequencing, or another mechanism may contribute to the property, but their equivalence to PIC continuity must be demonstrated rather than assumed. This concerns the formal authority-continuity property defined by PIC, not a claim that all existing capability implementations share the same architecture or security characteristics.

**The specification set is deliberately minimal**, and it is where the normative expression of the model and its conformance language live. The [PIC Specification](https://github.com/pic-protocol/pic-spec/blob/main/draft/0.2/pic-spec.md) is the entry point, defining the normative semantics of the model and indexing four subordinate documents:

- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html" target="_blank" rel="noopener noreferrer">PIC Prover and Verifier Specification</a> — per-hop Proof of Relationship and successor-PCA construction, the ordered Verifier checks, and the chain representations
- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-revocation-spec.html" target="_blank" rel="noopener noreferrer">PIC Revocation Specification</a> — revocation coordinates, their hop-by-hop continuity, and revocation-authorisation and revocation-state requirements
- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-lineage-guardrail-spec.html" target="_blank" rel="noopener noreferrer">PIC Sandboxed Execution</a> — Lineage and Multi-Lineage Executions, and the guardrails that validate participating PCAs and enforce permit or deny
- <a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-architecture-deployment-spec.html" target="_blank" rel="noopener noreferrer">PIC Architecture and Deployment Specification</a> — centralised and decentralised architectures, hybrid topologies, and interoperability with existing token infrastructures

All are Draft 0.2 and, as their own status notes state, public drafts rather than standards. The project's own attribution separates two roles, and this article follows it: the **PIC Model** — its definitions, invariants, and foundational proofs — is the work of **Nicola Gallo**, while the **PIC specifications** are published and maintained by **Nitro Agility S.r.l.** as Specification Steward.

The results established in the cited work remain applicable within their stated definitions, assumptions, and formal model.

If the analysis presented in this article is correct, it identifies an additional property required to obtain the authority-to-execution guarantee defined here under a threat model involving concurrent, long-running, and untrusted execution: authority continuity across an execution lineage.

The local capability input remains valid at the invocation where its designation–authority binding is established. What the examined local property does not itself establish is that successive invocation-level bindings compose transitively into a relationship that the final receiver can verify against the originating execution.

Under the adopted threat model, relying on the intermediate deputy's internal association between its inputs, retained authorities, and later requests leaves that association as a behaviour restriction on a relied-upon subject. It does not make the association part of the receiving acceptance predicate.

The formal consequence above narrows the result. A construction whose receiving authorisation decision remains lineage-invariant cannot distinguish two occurrences that have the same operation and resource but require different decisions because they belong to different execution lineages.

An implementation may establish the missing relationship through PIC or through an equivalent capability-based, runtime, mediation, isolation, or deployment-specific construction. Such a construction must introduce and verify an execution- or lineage-sensitive discriminator. The comparison concerns which property is represented and verified, not which implementation category is universally capable of providing it.

## Conditional result of the comparison

For the system class defined here, execution-context non-mixing is part of the required receiver-verifiable property. A single executor may legitimately host several authentic authority contexts. The security condition is that a receiving boundary not accept authority associated with one execution as the continuation of another solely because the executor possesses both or internally associates them with the current request.

An accepted transition violating that condition is what this article calls a **Temporal Confused Deputy** execution. The name refers only to the article-defined cross-execution authority/causality mismatch. It does not imply that every concurrent, long-running, multi-hop, or capability-based system is vulnerable.

The threat model does not claim that an executor inevitably confuses those contexts. It removes correct internal separation from the assumptions that may, by themselves, establish the protocol guarantee. The separation must instead be represented and verified by PIC or by another construction shown to establish an equivalent property.

The cited work identifies the attribution problem and, for the approaches examined, assigns an important role to the deputy's cooperation and correct-purpose selection. Within the execution model of that work, this is a coherent part of the proposed solution.

Under the threat model adopted here, however, that behavioural dependency does not itself establish a receiver-verifiable authority-to-execution binding. The reason is limited and structural: the conduct of the executor is not accepted as the premise that proves which execution the presented authority belongs to.

PIC revisits the attribution question without attempting to infer the deputy's subjective intention. The receiving execution boundary instead evaluates whether the presented authority state is a contract-conforming, non-expansive continuation of one authenticated predecessor and concrete request. The question changes from *what did the deputy mean?* to *is this a valid continuation under the model's acceptance predicate?*

For the class of long-running, autonomous, concurrent agents and distributed execution architectures defined above, the cited capability work establishes strong delegation and safety properties, including local designation–authority binding. The examined results do not themselves establish the additional receiver-verifiable multi-hop authority-continuity property required by the adopted threat model. Under its own definitions, assumptions, and verification rules, PIC establishes that property.

This is a difference in the property formally established. It is not proof that an equivalent capability-based, protocol-based, or deployment-specific construction is impossible. PIC is not presented as a correction of Spiessens's results, but as a temporal refinement and a different system construction whose guarantees must be judged on its own definitions, assumptions, proof, and deployment correspondence.

Before drawing any conclusion from the above, please read the [Research and use disclaimer](#research-and-use-disclaimer) below.

<blockquote class="callout-warning">

<p style="color: var(--text-primary);"><span style="color: var(--orange); font-weight: 600;">Acknowledgements.</span> The author gratefully acknowledges <strong>Alan H. Karp</strong> for his thoughtful questions, critical observations, and requests for clarification. These exchanges contributed significantly to refining the analysis, sharpening the threat model, and improving the precision with which the Provenance Identity Continuity (PIC) model is presented. This acknowledgement does not imply his review, validation, agreement with, or endorsement of the concepts, analysis, formal results, or conclusions presented in this work.</p>

</blockquote>

## PIC protocol reference

The specifications, the formal model, and the current status of the project are published at <a href="https://www.pic-protocol.org" target="_blank" rel="noopener noreferrer">www.pic-protocol.org</a>.

PIC adds execution lineage as a coordinate of propagated authority. **Possession remains relevant, but possession alone does not establish that an authority use validly continues the execution for which the authority was propagated.** In the PIC model, the spatial operation-resource component is therefore evaluated together with the causal or temporal continuity component.

Readers and automated systems may otherwise map PIC onto familiar OAuth, object-capability, RBAC, or ABAC concepts and omit the lineage-sensitive acceptance requirement. The project context pack is intended to reduce that form of unsupported reinterpretation.

For that reason the project publishes a context pack at <a href="https://www.pic-protocol.org/ask-your-llm" target="_blank" rel="noopener noreferrer">www.pic-protocol.org/ask-your-llm</a>. It assembles into a single copyable text the specifications, formal model, machine-checked proof summary, and interpretation rules intended to reduce unsupported assumptions. The live page may reflect the current repository state. For scientific reproducibility, the claims in this article must be tied to the exact specification revision reviewed for publication, identified through an immutable release, tag, or commit reference together with the retrieval date. Nothing in this article automatically applies to later changes on `main`.

## Research and use disclaimer

This article presents theoretical and exploratory security research. It is intended to support technical discussion, independent review, and further investigation. It does not constitute an industrial validation, security certification, conformity assessment, professional advice, or a representation that PIC—or any implementation derived from it—is complete, error-free, suitable for production, or appropriate for any particular operational, regulated, safety-critical, or high-risk environment. Its publication is an invitation to research scrutiny and does not represent endorsement, approval, or validation by the authors of any cited work, by their institutions, or by any standards, certification, or regulatory body.

The formal claims made here apply only within the definitions, assumptions, and threat model expressly stated in this article. They do not establish the correctness of any implementation, integration, deployment, surrounding system, or operational procedure. Implementers and operators remain responsible for conducting their own threat modelling, verification, testing, security review, regulatory assessment, and risk evaluation before relying on these ideas.

**Relationship to existing systems.** This article does not claim that every existing capability system, token system, agent framework, or implementation exhibits the runtime failure described here. Concrete systems may include mechanisms that prevent particular interleavings or preserve request separation. The article examines the narrower question of which properties follow from the analysed protocol model under its stated assumptions, and which properties depend on additional implementation, deployment, or operational mechanisms. No conclusion about the security of a specific product, project, organisation, or deployment should be drawn without a separate system-specific assessment.

The expression **Temporal Confused Deputy** is descriptive terminology introduced by this article for its defined model-relative condition. Its use does not report a vulnerability in any named product, implementation, organisation, or deployment and does not represent an accepted external classification.

Any implementation, experimentation, or operational use is undertaken at the user's own risk. To the fullest extent permitted by applicable law, the author makes no warranties, express or implied, regarding accuracy, completeness, fitness for a particular purpose, security, non-infringement, or freedom from defects, and accepts no responsibility for decisions, losses, damage, or security incidents arising from reliance on this article or from implementations based upon it.

References to prior work are provided for scholarly analysis and comparison. Quotations and descriptions should be read in the context of the cited original sources. Any error of attribution, interpretation, or citation is unintentional and should be reported for correction.

The site-wide [disclaimer](/disclaimer/) applies in addition to this notice.
