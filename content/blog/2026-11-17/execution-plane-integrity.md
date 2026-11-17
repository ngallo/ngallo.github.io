---
title: "Beyond Permissions: Verifiable Execution for AI Agents and Distributed Systems"
description: "Why authorization alone cannot guarantee that a workflow actually followed its approved path, and how PIC/COSS could support verifiable execution integrity."
slug: "verifiable-execution-integrity-pic-coss"
date: "2026-11-17"
tags:
  - AI agents
  - distributed systems
  - security engineering
  - PIC
  - COSS
  - provenance
---

**Authorization answers what an executor may do. Execution integrity asks whether the result really came from the permitted execution.**

Imagine an AI agent that must call Tool A and pass the result to Tool B. If access to A is denied, the security layer has done its job. Yet the agent can still produce a plausible answer and send it to B *as though A had executed*. Even when A is available, the agent may change an inconvenient result before forwarding it.

The problem is not limited to AI. A distributed service can misroute data, a pipeline can skip a mandatory validation step, and a compromised component can substitute an output. Every downstream receiver faces the same question: **Can I verify how this input was actually produced?**

<figure>
  <img src="/images/2026-11-17/01-permission-vs-execution-gap.png"
       alt="Two failure modes: fabricated tool output after access denial, and tampered tool output after an authorized call."
       loading="lazy">
  <figcaption>
    Authorization can succeed at every boundary while the data path is false: a fabricated result after a denied call, or a tampered result after an authorized one.
  </figcaption>
</figure>

## The missing security question

Most security architectures check the identity of the caller, the requested operation, and the permissions available at that boundary. Those checks matter, but they do not establish that a downstream input comes from the tool, workflow, or transformation it claims to come from.

A system may therefore be locally authorized at every step while the *story connecting those steps is false*. An agent can hallucinate; ordinary software can contain a bug or be compromised. **Neither the agent's explanation nor a field named `source: "Tool A"` is evidence of provenance.**

This is the motivation for a broader execution model: make the history of an operation, the restrictions carried through it, and the evidence of its results verifiable at the next boundary.

## From PIC and COSS to execution integrity

**Provenance Identity Continuity (PIC)** starts from a key observation: holding a valid permission is not the same as exercising authority that belongs to the execution currently being continued. A valid next step must be causally connected to the right predecessor, and ordinary continuation must not silently gain authority.

**COSS** extends this perspective beyond a single authority state. Different security dimensions can travel along the same causal execution: authority, allowed information flows, relational constraints, provenance requirements, and other application-defined coordinates. Each dimension needs a meaningful restriction rule and a verifier.

The architectural proposal in this article is to introduce **Execution Integrity** as an additional coordinate: not just *was this tool call allowed?*, but *did this actual execution follow the required path, use authentic inputs, and apply permitted transformations?*

This is a proposed extension, **not a theorem already established by the PIC/COSS papers**. The published models provide the conceptual basis for causal continuity and restricted security states; a concrete execution-integrity protocol still needs to define and prove its own guarantees.

<figure>
  <img src="/images/2026-11-17/02-causal-execution-security-coordinates.png"
       alt="One causal execution carries independently validated security constraints, including a proposed execution-integrity coordinate."
       loading="lazy">
  <figcaption>
    One causal execution carries several independently validated coordinates. History accumulates; constraints are checked at each transition and never silently expanded.
  </figcaption>
</figure>

## The Execution Plan: a contract before execution

The starting point is a **Verifiable Execution Plan**. It describes which tools may or must run, which outputs each tool may consume, which filters or transformations are allowed, and how multiple results may be combined. It also states which security constraints must hold at each transition.

There are two practical ways to create it:

- **Business-defined:** a predefined workflow is reviewed and approved as part of system policy.
- **Agent-proposed:** the AI constructs a plan for a particular task; an independent policy validator checks it, and an authorized user approves it before execution.

Human approval is not a substitute for policy validation. Once accepted, the plan is bound to the execution so the agent cannot silently rewrite its steps or replace a required tool. Material changes require renewed validation and, where appropriate, approval.

The plan is a **security contract**, not merely a prompt or an orchestration diagram.

## A concrete example: four tools, three provenances

Consider the workflow:

```text
A ----------> D
               ^
B ----> C ----|
```

Tool A sends data directly to D. Tool B sends data through C. C selects which fields from B may pass onward and may also produce new results of its own.

D must therefore receive a *verified composition* of three contributions:

```text
Compose(
  A@Lineage1,
  B@Lineage2 [restricted by C],
  C@Lineage3
)
```

The meaning is precise:

**A's contribution** must be traceable to A's real output. **B's contribution** must retain its origin in B and show that it passed through C's approved restriction. **C's contribution** must be traceable to C's real execution. If C calculated its new values from B, those values must also retain B in their causal ancestry.

The agent cannot replace any of these contributions with unverified text. Nor can D accept B's original, unfiltered data when the plan requires B to pass through C. Each tool may restrict an inherited lineage, produce a newly attested output lineage, or do both. But creating a new lineage is **not a reset of permissions or provenance**: new authority requires an explicit, authorized origin, and derived data must retain its causal sources.

<figure>
  <img src="/images/2026-11-17/03-abcd-workflow-verified-composition.png"
       alt="Tool D only accepts verified data from A, B after C's filter, and C's own output; a direct B-to-D bypass is denied."
       loading="lazy">
  <figcaption>
    D accepts only the verified composition of A, B as restricted by C, and C’s own output. The direct B-to-D bypass is rejected by the plan.
  </figcaption>
</figure>

## How a proof travels between tools

The agent itself must **not** be the trusted source of the evidence. A **Trusted Execution Anchor** observes the real invocation and binds the tool identity, execution instance, approved plan, inputs, and outputs into an attested record.

Suppose A actually returns:

```json
{
  "value1": "A",
  "value2": "B"
}
```

Instead of asking the agent to copy these values faithfully, the execution layer can create a signed commitment to the output and verifiable evidence for each field. A later consumer could disclose and verify only `value1`, without exposing `value2`.

This resembles the selective-disclosure capabilities of Verifiable Credentials or **SD-JWT**, but the exact format is not the principle. The required capabilities are: **authentic source, tamper-evident content, field-level disclosure, binding to the correct execution, and verifiable derivation**.

A filtered value is different from a computed value. A selective-disclosure proof may establish that a field belonged to B's output. It does **not**, by itself, prove that C applied the correct filter. A derived value needs an additional basis for verification: for example, the relevant source data plus a reproducible deterministic calculation, or a trustworthy attestation of the transformation. Cryptographic verification of a signature alone does not establish the truth of an external system's result.

In a possible COSS implementation, each active security coordinate would have its own committed state, supporting evidence, and validation rule. A cryptographic hash protects the integrity of a claim; **the coordinate verifier determines whether the claim is actually admissible**. The same execution envelope can carry references to all the evidence required by the receiving boundary.

Before D runs, a **mediator or receiving tool** checks the evidence against the approved plan. It verifies the causal relationship, the permitted origins, the coordinate-specific restrictions, and the rules for joining inputs. If the checks succeed, D can process the validated data and issue its own attested output; otherwise, the call is rejected.

<figure>
  <img src="/images/2026-11-17/04-proof-carrying-execution-path.png"
       alt="A trusted anchor attests a real tool run; a verifier checks its provenance and the plan before a downstream tool accepts the input."
       loading="lazy">
  <figcaption>
    A trusted execution anchor attests the real tool run; the mediator checks origin, continuity and composition against the approved plan before the next tool accepts the input.
  </figcaption>
</figure>

## Restrictions can tighten; history must remain intact

Here is the central continuity rule in plain language: **an ordinary execution step may preserve or restrict its inherited security permissions and constraints; it cannot silently enlarge them**.

C can disclose less of B's output. It cannot make a field that was forbidden to D become allowed merely by copying it under a new label. It can generate new data, but doing so requires its own authorized execution and provenance; it does not erase any inputs that influenced that data.

When D combines the two branches, the combination is itself security-relevant. **Combining data is not automatically permission to combine authority.** The plan must explicitly authorize the composition and state the appropriate rule for every affected COSS coordinate. A join that increases authority cannot be disguised as ordinary continuation.

This distinction is vital: **causal history accumulates, while ordinary security constraints become no more permissive**.

## The same principle applies beyond AI

AI agents make the risk obvious because they can generate convincing but unsupported text between tool calls. Yet the architecture is not AI-specific.

A microservice may accept data that supposedly passed through a compliance service. An ETL pipeline may publish a dataset that claims to have been filtered. An event-driven system may combine records from several services. A CI/CD workflow may claim that a required check ran before deployment.

In each case, the receiver should be able to ask the same questions: **Which execution produced this value? Which constraints survived the path? Were the required steps and transformations verified?**

<figure>
  <img src="/images/2026-11-17/05-verifiable-execution-across-architectures.png"
       alt="AI agents, microservices, and pipelines can share one execution-verification model."
       loading="lazy">
  <figcaption>
    AI agents, microservices and pipelines can share the same pattern: plan, attested steps, verified transition, final consumer.
  </figcaption>
</figure>

## What this model can—and cannot—guarantee

With trusted observation, sound verification rules, and **complete mediation** of protected tool calls and effects, the system could reject fabricated tool results, unauthorized substitutions, and paths that bypass mandatory steps. This is stronger than trusting logs or an agent's self-reported chain of thought.

It does **not** mean every tool's answer is true, every program is bug-free, or every transformation is correct without an appropriate proof. It also cannot protect paths that bypass the trusted execution boundary altogether. These are explicit implementation and trust assumptions, not details that cryptography makes disappear.

## From authorized calls to verifiable execution

Permissions remain essential. But in a multi-step workflow, permission checks alone do not tell us whether the final result was produced through the authorized sequence of operations.

**The proposal is to make each protected execution step carry verifiable provenance and to make each next step enforce the approved plan.** PIC supplies the idea of causal authority continuity; COSS supplies a framework for multiple security constraints; an Execution Integrity coordinate would make the actual tool-and-data path part of the contract.

The long-term aim is a universal execution model—usable by AI agents, ordinary software, and distributed systems—in which an executor need not be believed when it says what happened. **The next boundary can verify the claim.**

---

### Foundations and implementation references

- **PIC:** Nicola Gallo, Stefano Silvestri, Antonio Radesca, *Authority Continuity for Verifiable Lineage in Distributed Systems and AI Agents*, IEEE NCA 2026. https://doi.org/10.1109/NCA71379.2026.00052
- **Relational PIC:** Nicola Gallo, *Beyond Proof of Possession: A Relational Theory of Authority* (25 September 2026).
- **COSS:** Nicola Gallo, *Full Provenance on the COSS Causal Axis: An Event-Level Closure of Causal Attribution and Confused-Deputy Exclusion* (2 October 2026).
- **Selective disclosure, as a possible building block:** [RFC 9901, SD-JWT](https://www.rfc-editor.org/rfc/rfc9901) and [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/).
- **Tool-protocol context:** [Model Context Protocol, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools). The provenance-aware contract described above is a proposal, not a built-in MCP security guarantee.
