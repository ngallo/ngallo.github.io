+++
author = "Nicola Gallo"
title = "Three Pillars for Bringing Agentic AI into Production"
date = "2026-09-15T09:00:00+00:00"
description = "Outcome-Oriented Programming moves software from pre-authored workflows toward runtime execution built around desired outcomes. Getting there requires three architectural pillars: separating probabilistic planning from controlled execution, containing actions through security and governance, and operating the system continuously through runtime evidence."
tags = ["ai agents", "agentic ai", "outcome-oriented programming", "security", "governance", "deterministic systems", "runtime", "ai architecture"]
+++

<figure class="post-banner">
  <img src="/images/2026-09-15/three-pillars-outcome-oriented-programming.png"
       alt="Three Pillars for Bringing Agentic AI into Production"
       loading="lazy">
</figure>

The current AI transition is often described as a revolution in software development.

Large language models generate code, tests, documentation and integrations. Natural language is increasingly becoming an interface to software construction, and development is becoming faster and cheaper.

But this is still, fundamentally, the traditional software model:

```text
Requirement
    ↓
Developer + AI
    ↓
Code
    ↓
Application
    ↓
User
    ↓
Outcome
```

AI has accelerated the construction of the application.

It has not necessarily changed the role of the application itself.

A more fundamental transition appears when the user no longer asks someone to build software that may later satisfy a request.

Instead, the user expresses the **desired outcome directly**.

```text
Intent
    ↓
Desired Outcome
    ↓
AI Planning
    ↓
Controlled Execution
    ↓
Observed Outcome
```

This is the starting point of **Outcome-Oriented Programming**, the architectural model explored in the book:

[Outcome-Oriented Programming: From Applications to Agentic Execution](https://github.com/nitroagility/books/tree/main/outcome-oriented-programming)

The book is currently a **draft and an ongoing research work**. It presents an architectural hypothesis and a direction of travel rather than a finalized implementation standard. Some concepts are already relatively mature, while others are still being refined, separated more clearly or formalized.

The central idea is simple:

> Instead of programming every possible workflow in advance, program the outcome, constraints and boundaries within which execution may be constructed.

The application does not necessarily disappear.

What changes is that it no longer has to be the mandatory pre-authored object between intent and execution.

---

## From Pre-Built Workflows to Runtime Execution

Traditional applications encode expected future behavior before the request exists.

A travel application, an underwriting platform, an expense system or a CRM contains workflows designed in advance because we expect similar requests to happen repeatedly.

The application is therefore a preassembled answer to a class of future requests.

In an outcome-oriented model, part of that composition can move to runtime.

A user might say:

> Renew the software subscriptions we still need next quarter, keep total spend below EUR 25,000, and ask for approval before creating any multi-year commitment.

The user has not described a workflow.

The user has described a **desired state and a set of constraints**.

An agent can determine that reaching this outcome may require:

- discovering active subscriptions;
- checking usage;
- requesting renewal quotations;
- applying procurement policies;
- optimizing cost;
- requesting approval where necessary;
- purchasing renewals;
- recording commitments in accounting.

Those are execution decisions.

They do not necessarily need to be manually encoded into one fixed workflow before the request exists.

This produces a different model:

```text
Intent
    ↓
Outcome + Constraints
    ↓
Semantic Interpretation
    ↓
Plan
    ↓
Plan Approval
    ↓
Runtime Binding
    ↓
Tools
    ↓
Execution Evidence
    ↓
Outcome Validation
```

But moving composition into runtime creates an immediate engineering problem.

If the process is no longer fully known before execution starts, many assumptions traditionally attached to software development also move into the execution path:

- correctness;
- security;
- authorization;
- compliance;
- governance;
- accountability;
- observability;
- risk management.

This is why agentic execution cannot simply mean:

```text
Prompt
    ↓
LLM
    ↓
API calls
```

A production architecture needs stronger boundaries.

A useful way to think about those boundaries is through **three pillars**:

**Separate. Contain. Operate.**

Before those three pillars, however, there is one critical boundary that deserves to be explicit.

---

## The First Gate: Did We Understand the Right Outcome?

A system can execute a plan perfectly and still produce the wrong result if it misunderstood the request.

This is a different class of failure from a bad API call, a broken tool or an authorization error.

It happens earlier.

```text
Prompt
    ↓
Semantic Interpretation
    ↓
Intended Outcome
```

If that interpretation is wrong, downstream verification can validate the execution flawlessly while still validating the **wrong outcome**.

For this reason, **plan approval is the first execution gate**.

The approval does not necessarily need to be a human clicking a button. It can be automated, policy-driven or delegated where appropriate.

The important point is architectural: before the system is allowed to cause meaningful effects, there must be a boundary at which the interpreted intent and proposed plan can be checked.

A simple analogy is a taxi driver asking:

> So, here?

The driver may be perfectly capable of reaching the destination. The first thing to verify is that both sides mean the same destination.

---

## Pillar 1 — Separate

### Probabilistic Planning vs Controlled Execution

The first principle is not merely:

> AI proposes, tools execute.

That pattern is already common in modern agent frameworks.

The more important distinction is **who is allowed to bind a semantic operation to an executable implementation**.

The model can reason about what should happen.

The runtime decides how that operation is actually realized.

```text
MODEL
Interprets intent
Reasons about the outcome
Proposes semantic operations
Builds a plan

        ↓

RUNTIME
Checks the plan
Selects compatible implementations
Evaluates contracts and assurance
Binds operations to tools
Controls execution
```

This is the critical boundary.

The model may propose:

```text
calculate_premium
```

But it should not be enough for the model to choose any function that happens to look like a premium calculator.

The runtime needs to determine which implementation is compatible with that semantic operation based on machine-readable properties such as:

- input and output contracts;
- preconditions;
- effects;
- postconditions;
- invariants;
- failure semantics;
- compensation behavior;
- assurance level;
- policy requirements.

This is where **Semantic Manifests**, contracts and tool metadata become important.

The planner proposes the operation.

The runtime owns the binding.

---

### Why Deterministic and Bounded Tools Matter

AI is useful precisely because it can reason under ambiguity.

It can:

- interpret natural language;
- understand context;
- generate alternatives;
- decompose outcomes into goals;
- select strategies;
- react to new information;
- propose execution plans.

These activities can legitimately remain probabilistic.

But many operations are naturally deterministic or should at least be strongly bounded:

- validating a schema;
- calculating a premium;
- checking a budget;
- evaluating a policy;
- signing a structure;
- applying a business rule;
- validating an invariant;
- executing a financial transaction;
- writing an approved record.

The higher the consequence of an error, the stronger the case for implementing the critical operation as reusable, constrained and verifiable software.

A useful rule is therefore:

> **Use AI to decide what should happen. Use the runtime to decide what implementation may perform it. Use bounded tools to cause the effect.**

The objective of the first pillar is:

> Separate probabilistic reasoning from controlled execution, and make runtime binding an explicit architectural responsibility.

---

## Pillar 2 — Contain

### Application Containment and Authority Containment

Separating planning from execution is necessary, but it is not sufficient.

A tool being technically available does not mean that every execution should be allowed to use it.

Imagine an agent process that has access to:

```text
read_document
delete_document
send_email
make_payment
```

Now the user asks:

```text
Summarize this document.
```

The process may possess credentials that allow `delete_document` because another task running in the same environment legitimately needs that capability.

But this execution does not.

That difference is central.

The question is not only:

> What permissions does this process possess?

It is also:

> What effects may this specific execution cause?

This leads to two distinct containment problems.

---

### Application Containment

The first question is:

> Is the selected software allowed to behave in the way required by the proposed operation?

A tool may claim to implement an operation, but the runtime should understand what that operation means and what effects the implementation can cause.

For example:

```text
Semantic operation:
    purchase

Tool implementation:
    purchase_order_service

Preconditions:
    quote_valid == true

Effects:
    commitment_created
    payment_initiated

Invariant:
    charged_amount <= approved_amount

Postcondition:
    purchase_status == confirmed
```

The model proposes the semantic operation.

The runtime checks whether the tool implementation is compatible with that operation and with the required assurance level.

This is **Application Containment**.

It constrains what the software component itself is allowed to do.

---

### Authority Containment

The second question is different:

> Is this specific execution authorized to cause that effect?

A tool describes what software **can do**.

Authority describes what this execution **may cause**.

Those are different properties.

Consider two tasks:

```text
Task A:
    Summarize document X

Task B:
    Delete document X after retention approval
```

The same process may technically hold credentials that make both `read_document` and `delete_document` possible.

A conventional permission check can tell us that deletion is possible.

It does not necessarily tell us whether this particular execution belongs to **Task A** or **Task B**.

This is where execution lineage matters.

Two executions can have the **same permissions on paper** and still be two different executions because they belong to different causal histories.

```text
same operation
same resource
same holder

but:

lineage A != lineage B
```

A natural objection is: why not simply issue a different token for each task?

That is useful, but it does not remove the underlying selection problem. Inside the same process, something still has to choose which token belongs to which execution, and that choice is exactly the kind of decision that compromised or injected instructions may try to influence.

Execution lineage moves the trust boundary: instead of trusting the executor to self-select the right authority context, the receiving side can verify whether the proposed continuation belongs to the execution it claims to continue.

The execution that originated from “summarize this document” must not inherit the authority of a different execution merely because both happen to run in the same process or share credentials.

That is **Authority Containment**.

The broader book explores this problem through **PIC — Provenance Identity Continuity**, where execution lineage becomes part of how authority continuity is represented and verified.

The important distinction is:

```text
APPLICATION PLANE
What can this software correctly do?

AUTHORITY PLANE
What may this execution cause?
```

Both questions must be answered before a critical action becomes an effect.

---

### Governance at the Execution Boundary

Even semantically valid and authorized actions may still require a governance decision.

Examples include:

- significant financial exposure;
- regulatory constraints;
- irreversible effects;
- unusual operational risk;
- missing evidence;
- policy exceptions;
- actions requiring explicit accountability.

This is where **Execution Gates** become useful.

```text
Proposed continuation
        ↓
Execution Gate
        ↓
Continue / Constrain / Escalate / Deny
```

A gate is not necessarily a UI asking a person to click “Approve”.

It is a runtime decision boundary.

The evaluator may be:

- deterministic policy;
- a security engine;
- a compliance system;
- a specialized governance agent;
- a human;
- or a combination of these.

The target is therefore not “human in the loop everywhere”.

A better principle is:

> **Intelligence at every gate. Humans at selected gates.**

This means that “no human in the loop” does not have to mean “no control”.

It can mean that control is implemented architecturally rather than manually.

The objective of the second pillar is:

> Ensure that every meaningful continuation is both behaviorally valid and authorized for this specific execution.

---

## Pillar 3 — Operate

### Evidence, Residual Risk and Runtime Adaptation

Pillar 2 defines the **decision boundary**.

Pillar 3 defines the **evidence and feedback loop that continuously feeds that boundary over time**.

This is important because agentic execution does not end at deployment.

If planning and composition continue at runtime, governance must also continue at runtime.

The system needs continuous evidence about what is actually happening.

A compact operational evidence set may include:

- selected tools and effects caused;
- execution lineage and authority state;
- policy and gate decisions;
- outcome progress and anomalies;
- risk, compliance and assurance state.

That evidence should not exist only for post-mortem logging.

It should influence execution while the execution is still happening.

```text
Execute
   ↓
Observe
   ↓
Measure
   ↓
Update runtime state
   ↓
Feed the next execution gate
```

For example:

```text
Risk threshold crossed
    ↓
Authority narrowed
    ↓
Next continuation re-evaluated
```

or:

```text
Unexpected tool behavior
    ↓
Implementation removed from eligible bindings
    ↓
Plan continues through another compatible tool
```

This is the distinction between observability and runtime governance.

Observability tells us what happened.

Runtime governance uses evidence to change what is allowed to happen next.

---

### Residual Risk Becomes Runtime State

The useful question is not:

> Can the agent make a mistake?

Every non-trivial software system can fail.

The more useful question is:

> Can we make the remaining risk observable, bounded and governable while execution is still in progress?

This requires keeping several roles distinct:

```text
SECURITY
Constrains what can happen.

RISK ANALYSIS
Characterizes what can still go wrong.

GOVERNANCE
Decides whether the remaining risk is acceptable.

ACCOUNTABILITY
Identifies who is authorized to own that decision.
```

Security and governance therefore meet at **residual risk**.

Security reduces and constrains risk.

Governance decides whether what remains can be accepted under the current context, policies and responsibilities.

The objective of the third pillar is:

> Turn residual risk into an observable runtime property that can continuously influence execution decisions.

---

## The Three Pillars Together

The three pillars are not three sequential stages.

They are three architectural responsibilities that interact throughout execution.

### 1. Separate

Separate semantic reasoning from executable implementation.

```text
Model proposes semantic operations
            ↓
Runtime binds compatible tools
            ↓
Bounded implementations cause effects
```

### 2. Contain

Evaluate every meaningful continuation against application, authority, security and governance constraints.

```text
Application Containment
        +
Authority Containment
        +
Execution Gates
```

### 3. Operate

Continuously generate evidence and feed it back into the next decision.

```text
Observe
   ↓
Measure
   ↓
Update risk / assurance / authority state
   ↓
Feed execution gates
```

A better mental model is therefore:

```text
┌──────────────────────────────────────────────────────────────┐
│                           OPERATE                            │
│              Evidence · Risk · Assurance · Feedback          │
│                                                              │
│  Intent                                                      │
│    ↓                                                         │
│  Interpretation                                              │
│    ↓                                                         │
│  Plan                                                        │
│    ↓                                                         │
│  Plan Approval                                               │
│    ↓                                                         │
│  ─────────────────────────────────────────────────────────   │
│  SEPARATE                                                    │
│  Model proposes semantic operations                          │
│  Runtime binds compatible implementations                    │
│  ─────────────────────────────────────────────────────────   │
│    ↓                                                         │
│  Tool / Implementation                                       │
│    ↓                                                         │
│  ─────────────────────────────────────────────────────────   │
│  CONTAIN                                                     │
│  Application validity                                        │
│  Authority continuity                                        │
│  Security + Governance gates                                 │
│  ─────────────────────────────────────────────────────────   │
│    ↓                                                         │
│  Effect                                                      │
│    ↓                                                         │
│  Observed Outcome                                            │
│    ↺ Evidence continuously updates later runtime decisions   │
└──────────────────────────────────────────────────────────────┘
```

Operate surrounds execution rather than appearing only after it.

Evidence produced during execution continuously updates the state used by later gates.

---

## From AI-Assisted Software to Outcome-Oriented Programming

These three pillars describe more than a safer way to deploy an LLM.

They describe part of the architectural transition from AI-assisted software development toward **Outcome-Oriented Programming**.

The first generation of AI software primarily optimizes software production:

```text
Human requirement
    ↓
AI-assisted developer
    ↓
Application
```

The next transition moves intelligence into execution itself:

```text
Human or system intent
    ↓
Semantic interpretation
    ↓
Dynamic planning
    ↓
Runtime-controlled execution
    ↓
Outcome
```

But production systems cannot simply move every responsibility into a probabilistic model.

The practical architecture is selective.

Use intelligence where open-ended reasoning creates semantic value.

Use reusable software where behavior is stable.

Use deterministic or formally justified verification where critical properties must hold.

Let the runtime — not the model — bind semantic operations to implementations.

Preserve authority across execution lineage.

Make residual risk visible as runtime state.

Use evidence to govern what may happen next.

This leads to a different understanding of software.

Software becomes less a collection of preassembled applications and more a **space of reliable operations that intelligence can compose under explicit constraints**.

Applications may remain.

User interfaces may remain.

Workflows may remain.

What changes is that none of them necessarily has to remain the universal unit through which every intent is expressed, every execution is composed and every authority relationship is defined.

The durable assets increasingly become:

- semantic domain models;
- reusable tools;
- explicit contracts;
- semantic manifests;
- authority models;
- execution runtimes;
- verification mechanisms;
- policies;
- governance gates;
- operational evidence.

The application becomes one possible host of execution rather than the only possible form of execution.

That is the deeper transition.

Not:

> AI writes software faster.

But:

> **Users program outcomes, intelligence proposes execution, and the runtime determines which proposals are allowed to become reality.**

---

## Further Reading

The broader architecture, including Intent Execution Representation, Semantic Manifests, application and authority containment, execution lineage, PIC, Governance Intelligence, verifier-oriented execution and formal tool contracts, is explored in:

**Nicola Gallo — Outcome-Oriented Programming: From Applications to Agentic Execution**

https://github.com/nitroagility/books/tree/main/outcome-oriented-programming

Its central engineering question is:

> **If an agent can generate almost anything, what should still be generated, what should instead be reused, and what must be verified before any proposal becomes an effect?**

The three pillars presented here provide a practical way to begin answering that question:

**Separate. Contain. Operate.**

And from there, move from programming applications toward programming outcomes.
