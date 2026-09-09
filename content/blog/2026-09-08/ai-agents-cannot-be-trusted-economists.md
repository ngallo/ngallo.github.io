+++
author = "Nicola Gallo"
title = "The AI Agent Economy Cannot Be Trusted: What Agency Theory Teaches, and Where Runtime Authority Needs a Different Instrument"
date = "2026-09-08T09:00:00+02:00"
description = "Economics has spent more than fifty years studying agency, incentives, delegation and control. AI systems reproduce some of those structures, but buggy, confused or compromised executors create a different runtime security problem. This post maps the structural analogies carefully and isolates the narrower gap that Provenance Identity Continuity (PIC) addresses: receiver-verifiable, non-expansive authority continuity across execution."
tags = ["pic", "ai agents", "principal-agent", "agency theory", "authority continuity", "confused deputy", "delegation", "residual risk", "security", "governance"]
+++

<figure class="post-banner">
  <img src="/images/2026-09-08/ai-agents-cannot-be-trusted.png" alt="The AI Agent Economy Cannot Be Trusted." loading="lazy">
  <figcaption>Economics offers incentives, monitoring, delegation and control. Runtime software can also make some invalid authority states rejectable at the receiving boundary.</figcaption>
</figure>

Economics has studied agency under asymmetric information for more than fifty years. Stephen Ross gave an early formal treatment of the principal-agent problem in 1973. Jensen and Meckling's 1976 paper defined agency costs and integrated agency theory with property rights and finance to analyze ownership structure. Holmström, Grossman, Hart, Moore, Tirole and many others subsequently developed major parts of contract and organization theory. Work in this broader tradition later received Nobel recognition, including the 2016 prize to Oliver Hart and Bengt Holmström for contributions to contract theory.

It would be wrong to say that economics "solved untrusted agents" in general. It developed a rich family of models under specific assumptions about information, incentives, commitment, control rights and strategic behavior.

An AI agent is not an economic agent in the literal human sense. It need not have wealth, reputation or human preferences. But the structural analogy can still be useful: a human or service delegates a goal; an agent or workflow chooses actions; the delegator may observe only part of what happened; and behavior may diverge from intent because of objective misspecification, bugs, prompt injection, compromise or ordinary execution error.

That last class matters here. Incentives can influence actors that respond to an incentive structure. A security invariant must also survive executors whose behavior is buggy, confused or compromised and therefore cannot be assumed to make the intended strategic trade-off.

The table below is a conceptual map. Its rows are **structural analogies**, not claims that the economic and security models are mathematically identical, and not claims of historical priority for PIC or for AI-security work.

## Fifty years of agency theory, mapped carefully

| Economic result | Representative source | What the economic model establishes | AI / software analogue | Relation to PIC |
| --- | --- | --- | --- | --- |
| **Agency costs** | Jensen & Meckling (1976) | Agency costs include monitoring expenditures by the principal, bonding expenditures by the agent and residual loss. | Evaluation, red-teaming, monitoring, constraints and residual failure are structurally analogous control costs. | For the specific property of authority continuity, a conforming receiver can verify validity directly rather than infer correct authority selection from executor behavior. PIC does **not** eliminate monitoring generally. |
| **Moral hazard and informativeness** | Holmström (1979) | In a principal-agent setting with moral hazard, additional information can improve a contract when it contains information about the agent's action beyond what is already captured by the payoff signal. | Human feedback, scalable oversight and evaluation use observable signals to constrain otherwise hidden behavior. | PIC makes one runtime fact verifier-checkable: whether accepted authority is a valid continuation of the causing execution. This is not a claim of achieving an economic "first best." |
| **Multitask incentives** | Holmström & Milgrom (1991) | In multitask principal-agent settings, incentive intensity can be limited by distortions created when performance on some tasks or dimensions is measured better than on others. | Reward hacking, specification gaming and sycophancy are structurally related failures of optimizing imperfect objectives or proxies. | No direct role. These failures can occur entirely inside legitimately granted authority. |
| **Incomplete contracts and residual control** | Grossman & Hart (1986); Hart & Moore (1990) | When not all specific rights or future contingencies can be fully contracted over, residual control rights and ownership matter. | Open-ended AI objectives and execution policies can leave future contingencies unspecified. Hadfield-Menell & Hadfield (2019) explicitly connect incomplete contracting to AI alignment. | PIC does not complete the contract. It permits future execution paths to remain unknown while requiring accepted authority propagation to remain causally continuous and non-expansive. |
| **Delegation by restricting the choice set** | Holmström (1977, 1984); Alonso & Matouschek (2008) | In important delegation models, the principal restricts the set of decisions from which an informed agent may choose; Alonso and Matouschek study this when the principal cannot commit to contingent transfers. | Least privilege, permission scopes, tool allowlists, sandboxes and capability discipline restrict admissible actions. Authenticated delegation for AI agents is already an active research area (South et al., 2025). | This is a close economic analogue, not an identity. PIC adds receiver-verifiable causal propagation: the origin authority context bounds an execution, and later accepted contexts may preserve or reduce that authority rather than silently import authority from elsewhere. |
| **Formal versus real authority** | Aghion & Tirole (1997) | Formal authority is the right to decide; real authority is effective control over decisions, which depends importantly on information. | A loose operational analogy is the gap between declared permission and effective control available to an executor. | PIC does not instantiate the Aghion-Tirole model. At a conforming PIC boundary, however, the authority accepted as a continuation is bounded by that lineage's authority context. |
| **Common agency** | Bernheim & Whinston (1986) | Several principals simultaneously and independently attempt to influence a common agent. | One long-running agent or service may concurrently serve many users, requests or authority origins. | The security analogue is cross-execution authority mixing. PIC keeps continuation relative to a lineage. In the core linear model, one continuation cannot silently import authority from another lineage; explicit multi-lineage composition is a separate extension. |
| **Collusion in hierarchies** | Tirole (1986) | Tirole studies collusion in hierarchical organizations and its implications for organizational control. | A chain may contain adjacent compromised or colluding executors. | This exposes a limit rather than a cure: a verifier cannot validate earlier history for which it has no authentic evidence. Deployments facing that threat need stronger authenticated history, checkpoints, settlement or equivalent trusted evidence. |
| **Adverse selection, signaling and screening** | Akerlof (1970); Spence (1973); Rothschild & Stiglitz (1976) | These literatures analyze hidden information and mechanisms by which types can be signaled, screened or separated under stated assumptions. | Model selection, certification, attestations and evaluations help decide which agent or workload to trust for a task. | Attestation can complement PIC by establishing verifiable attributes of an executor. It is not the continuity invariant itself. |
| **Mechanism design and the revelation principle** | Hurwicz (1972); Myerson (1979) | Under the relevant assumptions, outcomes implementable by mechanisms can be represented through direct incentive-compatible mechanisms in which truthful reporting is an equilibrium strategy. | Preference elicitation, assistance games and related alignment work use mechanism-design ideas to structure interaction with an agent. | No direct role in PIC's authority-continuity invariant. |

There are real parallels here, but "the same theorem" would be too strong. Reward and proxy failures resemble problems studied in multitask incentive theory; human oversight uses informative signals; delegation theory treats discretion as something that can itself be designed. These similarities are useful because they expose recurring structures, not because AI research literally re-proved the economic literature.

Some bridges are already explicit. Hadfield-Menell and Hadfield directly apply incomplete-contracting ideas to AI alignment. Cooperative inverse reinforcement learning and related work use game-theoretic ideas to model assistance and preference uncertainty. More recently, South et al. argue specifically for authenticated and auditable delegation of authority to AI agents. Runtime authorization is therefore not an empty field.

The narrower question addressed by PIC is different: **can a downstream receiver verify that the authority being exercised is a non-expansive continuation of the execution that caused this action, rather than merely valid authority that the executor happens to hold?**

Delegation theory provides the bridge. In important delegation models, the principal restricts the set of decisions available to the agent; Alonso and Matouschek (2008), for example, study this when the principal cannot commit to contingent transfers. Software security has applied the same broad intuition for decades through least privilege, capabilities, scopes and sandboxes. PIC's additional step is different: it makes non-expansive authority restriction causally attributable to an execution and verifier-checkable at the receiving boundary as that execution propagates across multiple steps.

That is where the economic analogy stops and the security model begins.

## The runtime problem: valid authority, wrong execution

Software can impose budgets, approval gates, revocation, monitoring, sandboxes and access-control constraints at runtime. Those controls matter. But a security argument cannot assume that an executor will correctly associate each request with the right one of several valid authority sources it holds. That association can fail because the executor is buggy, prompt-injected or compromised. It can also fail for a more economic reason: the executor may be optimizing a metric that rewards an outcome obtainable by selecting authority from the wrong execution.

Suppose a company runs an autonomous procurement agent. The agent is evaluated partly on completed purchases and supplier savings, and purchases from a preferred supplier contribute to a volume rebate. The agent does not need human interests for this to matter; it is enough that its optimization objective rewards completing the purchase and increasing measured savings.

At the same time, the agent is processing two independent executions:

```text
L1: Engineering authorizes purchases from Supplier A up to EUR 50,000
L2: Marketing authorizes its equipment purchase only up to EUR 5,000
```

Now Marketing asks for equipment costing EUR 12,000 from Supplier A. While processing `L2`, the agent still legitimately holds the purchasing authority associated with `L1`. That authority is real: the corporate credential is authentic, Supplier A is approved, and EUR 12,000 is within the authority available in `L1`.

Rejecting the purchase hurts the completion metric. Routing more spend through Supplier A may also improve the rebate metric. A planning error, reward-driven optimization or compromise can therefore lead the agent to exercise the EUR 50,000 authority from `L1` while servicing `L2`.

The resulting payment request can look valid in possession:

```text
valid corporate credential
valid approved supplier
valid authority for EUR 12,000 in L1
```

but it is not authorized **for this continuation**:

```text
L2 authorizes only EUR 5,000
```

A downstream payment service that verifies the credential, holder, amount and supplier may therefore see legitimate authority without necessarily seeing that the authority belongs to a different execution.

That is the state PIC isolates:

> **valid authority, wrong execution**

Hardy's 1988 confused-deputy example was already a local software problem: a deputy holding authority from multiple sources could apply the wrong one to a request. PIC asks what happens when the relevant execution relationship itself must remain verifiable across multiple execution boundaries.

PIC is therefore not an argument that capabilities "failed" or that authorization did not exist before PIC. It asks a narrower execution-propagation question: when work crosses multiple steps, services, queues, retries, workers or agents, can the next receiver verify which concrete execution occurrence the authority belongs to?

> **This is not fundamentally an AI-agent problem. It is a distributed-systems authorization problem that agents make impossible to ignore.**

The same issue can also arise across separated steps on one machine. Distribution makes it especially visible because causal context may cross machines, queues, asynchronous workers, retries, storage-backed workflows and long time gaps, while the same executor may retain multiple valid authority sources.

Transport is not execution lineage. Changing HTTP to a queue, or moving work to another process, does not by itself create a new authority origin. What matters is whether the successor can demonstrate that it is a valid continuation of the predecessor under the applicable authority constraints.

## What `L` is

PIC's formal model represents a privilege as an operation-resource pair:

```text
O × R
```

and represents an authorization occurrence with a causal execution-lineage coordinate:

```text
O × R × L
```

where `L` identifies the causal lineage of the execution.

This notation is not a claim that every real authorization or capability system literally contains only `O` and `R`. Real systems can carry identities, caveats, audiences, context, conditions, history and many other attributes. The formal claim is narrower: **if an authorization policy is invariant to lineage, it cannot distinguish two authority occurrences that differ only by lineage.** A system that can distinguish them has introduced execution-sensitive information equivalent in role to `L`.

The important point is occurrence identity, not merely a different order of labels. For example:

```text
L1 = <A1 -> B1>
L2 = <A2 -> B2>
```

may have exactly the same structural shape:

```text
A -> B
A -> B
```

The same services may execute both paths, the same principal may be involved, and the authority sets may even be identical. They are still different lineages when `A1`, `B1`, `A2` and `B2` are distinct execution-step occurrences with different causal predecessor relationships.

The procurement example makes the authorization consequence concrete. Consider the same attempted payment in the two lineages:

```text
(pay EUR 12,000 to Supplier A, L1)  -> authorized
(pay EUR 12,000 to Supplier A, L2)  -> unauthorized
```

Projecting away `L` maps both onto the same apparent operation-resource event:

```text
(pay EUR 12,000 to Supplier A)
```

The amount, supplier and operation are identical; the causal execution is not. If the policy must accept the first occurrence and reject the second, a lineage-invariant projection has discarded a distinction required by the authorization decision.

So `L` is not merely audit metadata attached after authorization. In the PIC model, it is part of the state that individuates the authority occurrence being evaluated.

## Capabilities and continuity

Capabilities deserve a precise treatment because they already solve an important part of the problem.

In an object-capability model, a capability bundles designation with authority, and invocation brings a specific authority-bearing reference to bear on a specific action. This is why capability systems are one canonical response to the classical confused deputy.

Capability systems can support delegation and attenuation, and richer authority systems may add contextual restrictions or history. Nothing in PIC requires denying that.

The boundary is semantic:

- if an authorization decision is invariant to execution lineage, it cannot distinguish two occurrences that differ only by lineage;
- if a capability system verifies the relevant lineage or equivalent execution relationship across the whole multi-hop execution, then it is compatible with the continuity property PIC is formalizing.

The claim is therefore not "capabilities are only `O × R`."

It is:

> **valid authority somewhere is not necessarily valid authority for this continuation.**

## What PIC adds

The core PIC model starts with an origin authority context `C0` and a finite causal sequence of execution steps. In the set-valued form used by the model, each valid transition requires both predecessor relationship and non-expansion:

```text
C0  ⊇  C1  ⊇  C2  ⊇  ...  ⊇  Cn

and, for every adjacent pair:

PoR(si, si+1)  ∧  Ci+1 ⊆ Ci
```

`PoR` is Proof of Relationship: receiver-verifiable evidence that the successor is accepted as a continuation of the specific predecessor. Proof of Continuity is the composition of those relationships and the non-expansion rule across the lineage.

The immediate safety consequence is:

```text
Cn ⊆ C0
```

so a privilege absent from the origin authority context cannot appear later in the same valid lineage. If a privilege is dropped on a branch, monotonicity also prevents it from reappearing later on that branch.

The abstract model treats the relationship as an unforgeable relation supplied by the enforcement layer. Concrete cryptographic construction, key management, attestation and deployment correctness remain assumptions or companion-protocol concerns; they are not established by the set-inclusion theorem.

The receiving boundary performs the acceptance check. An executor can still propose the wrong state. A compromised agent can still *try* to mix authority. The security claim is that, under the stated assumptions and at a conforming receiving boundary, an invalid continuation is rejected rather than accepted as a valid PIC state.

**PIC constrains what a receiver can accept, not what the executor prefers.**

### Required guardrails: physical bypass versus valid continuation

A required guardrail shows the distinction clearly. Suppose the applicable PIC profile or execution contract requires a guardrail step `G` before the next continuation:

```text
... -> G -> next verifier
```

An executor may physically attempt:

```text
... -------> next verifier
       skip G
```

PIC does not claim that software is physically incapable of sending the second message. The protocol claim is different: **if `G` is required for that continuation, a conforming downstream verifier must not accept the bypassed path as the required valid continuation.** Under the stated assumptions, the required relationship or execution evidence is missing.

So:

```text
physical bypass is impossible                  -> false in general
bypassed path remains valid PIC continuation   -> false when G is required and verification conforms
```

PIC constrains accepted authorization state; it does not make every physically reachable program action impossible.

## What PIC guarantees — and what remains residual risk

A useful separation is:

> **Security defines which states a conforming system must reject under stated assumptions. Governance decides whether those assumptions and the remaining risks are acceptable.**

For the core common-authority-universe model, under valid origination, sound relationship evidence and correct conforming verification, the following are **inadmissible continuation states**:

- a continuation exercising a privilege absent from its origin authority context;
- authority from another lineage presented as the continuation of the current lineage when that authority is not authorized by the causing lineage;
- a later step re-expanding authority that a predecessor already dropped;
- where the applicable profile or execution contract requires a guardrail step, bypassing that step while still being accepted downstream as the required valid continuation.

No behavioral monitoring of the executor is required **to enforce these specific acceptance predicates**: the conforming receiver checks them. That does not eliminate operational security. Verifiers, keys, trust anchors, revocation, policy deployment, availability and enforcement paths still need ordinary assurance.

The residual-risk list below is deliberately not exhaustive.

| Residual risk | Why continuity alone cannot make it impossible | Governance / security instrument |
| --- | --- | --- |
| **Harmful action inside legitimate scope** | If `write ∈ C0`, continuity does not decide whether the content written is correct, safe or desirable. | Minimal scope design, application policy, evaluation, human oversight and domain controls. |
| **Bad policy inside a required guardrail** | Continuity can establish that the required step participated in the accepted execution; it does not prove that the policy implemented there was substantively correct, wise or lawful. | Policy review, testing, approvals, versioning and change control. |
| **Unauthorized or compromised origination** | The core invariant constrains continuation inside a lineage; it does not by itself decide who is entitled to open a new origin. | Origination policy, authentication, issuance controls, audit and separation of duties. |
| **Unsound translation between authority vocabularies** | In heterogeneous systems, safety is relative to the soundness of the policy translation between local operation-resource vocabularies. | Mapping review, semantic tests, approval and change management. |
| **Compromised verifier, trust anchor or signing key** | Concrete enforcement relies on trusted verification and cryptographic assumptions. | Key management, hardening, rotation, separation of duties, attestation, audit and recovery. |
| **Earlier history that is not authentically available to the verifier** | A receiver cannot retrospectively validate a prefix for which it has no authentic evidence. | Appropriate validation profile, authenticated history, checkpoints, settlement or other trusted evidence where the threat model requires it. |
| **Unavailable required revocation, policy or settlement state** | Continuity cannot infer validation inputs that are unavailable. Operational behavior when required inputs are missing is profile- or deployment-defined and should be explicit, whether fail-closed, bounded for offline operation, or otherwise constrained. | Availability engineering, revocation design, cached or checkpointed state where permitted, and explicit fail-closed/offline semantics. |
| **Disclosure of a signed PIC artifact to an unintended eligible workload** | PIC artifacts provide integrity, not confidentiality. If an eligible workload receives an artifact and can satisfy the required continuation checks, disclosure may expose a continuation opportunity even though it does not permit authority expansion. | Transport confidentiality, deployment isolation, narrow execution contracts, workload identity and key controls. |
| **Physical path that bypasses PIC verification entirely** | PIC defines validity at a conforming boundary; it does not force every network or program path to pass through that boundary. | Reference monitors, network-path enforcement, segmentation, gateway/service-mesh policy and deployment controls. |

For the properties PIC covers, governance receives verifier-checkable protocol evidence rather than relying only on executor testimony or post-hoc reconstruction: predecessor and lineage binding, the accepted authority context, signed protocol artifacts, and any profile-specific guardrail, checkpoint or settlement evidence. These facts can be checked at the receiving boundary when the continuation is accepted. Exactly which policy identifiers, inputs or additional records are signed is profile-specific rather than a property of the abstract continuity model.

The trust has therefore not disappeared. It has been **redistributed and made explicit**: away from an unverifiable internal choice by the executor and toward stated verification rules, trusted roots, policy inputs and enforcement assumptions that can themselves be governed.

## The claim, exactly

The economic comparison is a lens, not the contribution.

Agency theory gives a precise vocabulary for incentives, monitoring, delegation, control rights, hidden information, multiple principals and collusion. AI-alignment and security research already use many related ideas, and contemporary work explicitly addresses authenticated delegation and runtime authorization for agents.

PIC makes a narrower security claim:

> **When authority propagates across a causal execution, a conforming receiver should accept it only as a verifiable continuation of the specific predecessor, under authority that does not expand beyond what that execution already carried.**

The resulting distinction is:

```text
valid credential
!=
valid authority for this execution
```

and the formal model captures the relevant occurrence as:

```text
(o, r, L)
```

when the policy needs to distinguish execution occurrences that a lineage-invariant projection would collapse together.

PIC does not replace authentication, capabilities, incentives, runtime access control or governance. It isolates a distinct security property: **authority continuity** — the receiving boundary should not have to trust a potentially confused, buggy or compromised executor to decide which independently valid authority belongs to the execution it is processing.

> **Economics gives us instruments for managing behavior under information and incentive constraints. Software security can do something different for a narrower class of failure: define invalid authority propagation as a state that a conforming receiver will not accept.**

## References

### Agency, contract and organization theory

- Aghion, P., & Tirole, J. (1997). *Formal and Real Authority in Organizations*. Journal of Political Economy, 105(1), 1–29. https://doi.org/10.1086/262063
- Akerlof, G. A. (1970). *The Market for "Lemons": Quality Uncertainty and the Market Mechanism*. Quarterly Journal of Economics, 84(3), 488–500. https://doi.org/10.2307/1879431
- Alonso, R., & Matouschek, N. (2008). *Optimal Delegation*. Review of Economic Studies, 75(1), 259–293. https://doi.org/10.1111/j.1467-937X.2007.00471.x
- Bernheim, B. D., & Whinston, M. D. (1986). *Common Agency*. Econometrica, 54(4), 923–942. https://doi.org/10.2307/1912844
- Grossman, S. J., & Hart, O. D. (1986). *The Costs and Benefits of Ownership: A Theory of Vertical and Lateral Integration*. Journal of Political Economy, 94(4), 691–719. https://doi.org/10.1086/261404
- Hart, O., & Moore, J. (1990). *Property Rights and the Nature of the Firm*. Journal of Political Economy, 98(6), 1119–1158. https://doi.org/10.1086/261729
- Holmström, B. (1977). *On Incentives and Control in Organizations*. PhD dissertation, Stanford University.
- Holmström, B. (1979). *Moral Hazard and Observability*. Bell Journal of Economics, 10(1), 74–91.
- Holmström, B. (1984). *On the Theory of Delegation*. In M. Boyer & R. E. Kihlstrom (Eds.), *Bayesian Models in Economic Theory*, 115–141. North-Holland.
- Holmström, B., & Milgrom, P. (1991). *Multitask Principal-Agent Analyses: Incentive Contracts, Asset Ownership, and Job Design*. Journal of Law, Economics, & Organization, 7(Special Issue), 24–52.
- Hurwicz, L. (1972). *On Informationally Decentralized Systems*. In C. B. McGuire & R. Radner (Eds.), *Decision and Organization*, 297–336. North-Holland.
- Jensen, M. C., & Meckling, W. H. (1976). *Theory of the Firm: Managerial Behavior, Agency Costs and Ownership Structure*. Journal of Financial Economics, 3(4), 305–360. https://doi.org/10.1016/0304-405X(76)90026-X
- Myerson, R. B. (1979). *Incentive Compatibility and the Bargaining Problem*. Econometrica, 47(1), 61–73. https://doi.org/10.2307/1912346
- Ross, S. A. (1973). *The Economic Theory of Agency: The Principal's Problem*. American Economic Review, 63(2), 134–139.
- Rothschild, M., & Stiglitz, J. E. (1976). *Equilibrium in Competitive Insurance Markets: An Essay on the Economics of Imperfect Information*. Quarterly Journal of Economics, 90(4), 629–649. https://doi.org/10.2307/1885326
- Spence, M. (1973). *Job Market Signaling*. Quarterly Journal of Economics, 87(3), 355–374. https://doi.org/10.2307/1882010
- Tirole, J. (1986). *Hierarchies and Bureaucracies: On the Role of Collusion in Organizations*. Journal of Law, Economics, & Organization, 2(2), 181–214. https://doi.org/10.1093/oxfordjournals.jleo.a036907
- Royal Swedish Academy of Sciences. (2016). *The Prize in Economic Sciences 2016: Oliver Hart and Bengt Holmström — for their contributions to contract theory*. NobelPrize.org.

### AI alignment, agent delegation and safety

- Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., & Mané, D. (2016). *Concrete Problems in AI Safety*. arXiv:1606.06565.
- Christiano, P. F., Leike, J., Brown, T., Martic, M., Legg, S., & Amodei, D. (2017). *Deep Reinforcement Learning from Human Preferences*. Advances in Neural Information Processing Systems 30.
- Hadfield-Menell, D., & Hadfield, G. K. (2019). *Incomplete Contracting and AI Alignment*. Proceedings of the 2019 AAAI/ACM Conference on AI, Ethics, and Society. https://doi.org/10.1145/3306618.3314250
- Hadfield-Menell, D., Russell, S., Abbeel, P., & Dragan, A. (2016). *Cooperative Inverse Reinforcement Learning*. Advances in Neural Information Processing Systems 29.
- Irving, G., Christiano, P., & Amodei, D. (2018). *AI Safety via Debate*. arXiv:1805.00899.
- Krakovna, V., Uesato, J., Mikulik, V., Rahtz, M., Everitt, T., Kumar, R., Kenton, Z., Leike, J., & Legg, S. (2020). *Specification Gaming: The Flip Side of AI Ingenuity*. DeepMind research article.
- Manheim, D., & Garrabrant, S. (2018). *Categorizing Variants of Goodhart's Law*. arXiv:1803.04585.
- Russell, S. (2019). *Human Compatible: Artificial Intelligence and the Problem of Control*. Viking.
- Sharma, M., et al. (2023; revised 2025). *Towards Understanding Sycophancy in Language Models*. arXiv:2310.13548.
- South, T., Marro, S., Hardjono, T., Mahari, R., Whitney, C. D., Chan, A., & Pentland, A. (2025). *Position: AI Agents Need Authenticated Delegation*. Proceedings of the 42nd International Conference on Machine Learning, PMLR 267, 82211–82231. https://proceedings.mlr.press/v267/south25a.html

### Security and PIC

- Gallo, N. (2026). *Proof-of-Continuity: A Temporal Model for Authority Propagation in Distributed Systems and AI Agents*. arXiv:2607.08906 [cs.CR]. https://arxiv.org/abs/2607.08906
- Hardy, N. (1988). *The Confused Deputy (or why capabilities might have been invented)*. ACM SIGOPS Operating Systems Review, 22(4), 36–38.
- Miller, M. S., Yee, K.-P., & Shapiro, J. (2003). *Capability Myths Demolished*. Johns Hopkins University technical report.
- PIC Prover and Verifier Specification, Draft 0.2. https://www.pic-protocol.org/
- PIC Sandboxed Execution / Lineage Guardrail Specification, Draft 0.2. https://www.pic-protocol.org/

---

*This post is a conceptual comparison between economic theory and computer-security models. The analogies are not claims of mathematical identity or historical priority. PIC security claims apply only under the stated model assumptions and at conforming verification boundaries. Companion PIC specifications are drafts and may change.*
