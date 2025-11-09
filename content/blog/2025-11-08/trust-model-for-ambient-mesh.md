+++
author = "Nicola Gallo"
title = "A Trust Model for Ambient Mesh, microsegmentation, and async flows"
date = "2025-11-08"
description = "As Ambient Mesh redefines Cloud Native networking, ZTAuth* completes the model."
tags = ["security", "authz", "ambient mesh", "cloud native"]
+++

**Ambient Mesh** is redefining the Cloud Native service mesh for Zero Trust, whilst [**ZTAuth\***](https://spec.ztauthstar.com/openprotocolspec/2025-04-05/) completes it with **Trust Chains** built on **Trust Elevation**, **Trust Levels**, and **cryptographic signatures**. This article explores how these concepts apply to microsegmented and asynchronous workloads.

<!--more-->

## Ambient Mesh is redefining Zero Trust in the Cloud Native Service Mesh

Last month I had the pleasure of discussing **Ambient Mesh** with a leading mind in the **Cloud Native** space.

**Ambient Mesh** is transforming how services communicate in a **Zero Trust** world — eliminating the need for **sidecars** and enabling **seamless, secure connectivity**.  

If you haven’t looked into it yet, I highly recommend checking out the [Ambient Mesh documentation](https://ambientmesh.io/).  

Beyond the impressive engineering work — removing **sidecars** and introducing **ztunnels** and **waypoints** — what truly stands out is the **architectural shift** it represents.  

For the first time, we’re seeing a **rock-solid foundation** for exploring concepts like **Trust Elevations**, **Trust Levels**, and **Trust Chains**.  

IMHO, this direction marks a **meaningful evolution in Cloud Native security**, especially for **enterprise environments**, where **verifiable trust** and **workload identity** are becoming essential building blocks.  

However, there’s one point where I respectfully disagree.  
The documentation states that *“an application might benefit from knowing the peer identity.”*  

> In my view, this is more than a “**nice to have**” — it represents a **fundamental shift** in how we think about service identity. When **peer identity** becomes part of the **security protocol itself**, it transforms the entire trust model. I believe this capability should be **mandatory** for **Zero Trust architectures**.

IMHO, the **peer identity** remains **underestimated** in its potential impact on **Zero Trust architectures**.  

The **ztunnel** component exposes **peer identity information** for mesh-enabled workloads through a **metadata service**.  
This service returns connection details, including the **`peerIdentity`**, typically expressed as a [SPIFFE](https://spiffe.io/) identifier such as:

```json
{
  "peerIdentity": "spiffe://cluster.local/ns/application/sa/client"
}
```

This **`peerIdentity`** represents the **verified identity of the calling workload**. To learn more, see the official [Ambient Mesh Peer Identity documentation](https://ambientmesh.io/docs/security/peer-identity/).  

That said, in my opinion, two core components are still missing to fully realize this vision: **Trust Elevations** and **Trust Levels**.

In the next sections, we’ll explore how these ideas extend the model with **ZTAuth\***, through enterprise use cases based on **microsegmentation** and **asynchronous flows**.

## One step back to leap ahead: Rethinking Trust Models for Zero Trust

Current **authentication** and **authorization** models are built around the concept of a **static identity** and **static policies**. The best you can typically do is **revoke a token**.

The deeper issue lies in the **impersonation model** itself: tokens often propagate across multiple workloads, and each workload can **impersonate the original caller**.

The core issue is the lack of a standardized mechanism to **bind workloads** to the underlying **security context**, ensuring they are **explicitly represented** in the **trust decision**, especially when identities operate under distinct **governance domains** or act **on behalf of** others.

While the industry is moving toward solving this with initiatives such as **SPIFFE/SPIRE** and **mTLS-based service identity**, the workload is still not treated as a **first-class security principal**.

This gap leaves distributed systems with **limited visibility** and **weak governance**, turning interactions into a **black box** once requests cross **application boundaries** or **network segments**.

Protocols such as **OAuth** were designed in an era where the main goal was **delegated user access**, *not workload-to-workload trust*.  

The original use cases were about a **user granting access** to their own resources — *for example, letting a third-party app access a photo gallery or social profile* — not about one service acting *on behalf of* another inside a distributed system.  

No one would ever delegate full access to their **email** or **social accounts** (Facebook, LinkedIn, Twitter/X) to another user. Think about it — *this was the context in which these solutions were originally designed*. The problem space, timing, and security assumptions were radically different from today’s distributed environments.

OAuth was born in this **web-centric world**, with a clear perimeter: a **frontend application**, an **API**, and a **firewall or WAF** protecting it. But the real complexity, and where security models start to break, lies **behind that firewall**.

That’s where **microservices**, **event-driven systems**, and **asynchronous patterns** live. It’s where most of the actual **business logic**, **data processing**, and **cross-domain orchestration** occur.  

And yet, we still rely on the same **stateless token paradigm**, designed for **user-centric web access**, not for **dynamic, distributed workloads**.  

Inside the internal network, we don’t need a new transport protocol — **HTTP works perfectly**.  
It delivers **consistent observability, tracing, and monitoring** across every boundary — same headers, same semantics, same logic — no matter the network segment or application.  

Security, however, never achieved this level of consistency.  
We’ve built it on **two disconnected layers**, and that’s a **warning sign, not a strength**.

- One layer is **external**, standardized and observable — driven by **identity providers**, **OAuth servers**, and **API gateways**.  
- The other is **internal**, often **implicit** or **nonexistent**, based on **network boundaries**, **local tokens**, or **assumed trust**.

This fragmentation didn’t happen by chance — *it’s the outcome of security models built around **perimeters**, not **protocols***.  
While HTTP became a universal protocol, **security protocols diverged**, with **public** and **private** domains adopting incompatible assumptions that cannot interoperate.

And this is not a new problem brought by **AI agents** — it’s been there for decades.  
The difference is that **distributed orchestration**, **asynchronous messaging**, and **AI-driven workflows** are now making the gap impossible to ignore.  

When security needs to be **enforced twice** — once at the perimeter and again inside the system — it’s not *defense in depth*; it’s **trust fragmentation**.  
We gain no additional assurance, just complexity and blind spots.

This becomes even more evident in **event-driven** and **message-based** architectures, where **tokens cannot safely travel** with each message.  
Retries, batching, and fan-out make token forwarding both **insecure** and **operationally unsound**.  
Yet these messages still carry **authenticated intent** — they must be **trusted, traced, and authorized** consistently across the system.  
Without a **unified trust substrate**, internal security becomes **opaque**, and **Zero Trust stops at the edge**.

> **Note:**  
> In distributed systems — especially those using **orchestration** or **choreography** — both traditional, **capability**, and **transaction tokens** face **structural limits**.  
> In **orchestrated flows**, persistence and recovery break token statelessness; in **choreographed (event-driven)** systems, ensuring **validity and trust continuity** at consumption time is nearly impossible once messages are queued or replayed.  
> These issues can’t be solved by token design alone — even capability or tx-tokens need a **new trust model** that governs how **trust is established, propagated, and verified** across distributed and asynchronous boundaries.

This is why a **new trust model** is needed — one that embeds **workload identity**, **trust context**, and **verifiable continuity** directly into the interaction protocols.  
That’s the foundation of **ZTAuth\***: a conceptual and protocol-level framework extending **Zero Trust** beyond synchronous APIs into **microsegmented** and **asynchronous systems**.

It’s about making **trust dynamic, composable, and verifiable** — across workloads, domains, and flows.  

And yes, technologies like **OAuth**, **SAML**, or **OpenID Connect** will continue to play their role — but as **initial trust triggers**, not as the backbone of distributed trust.  
The model must evolve to accommodate **decentralized**, **context-aware**, and **cryptographically verifiable** trust frameworks that match the distributed nature of modern systems.

> **Important Note:**  
> Some trust evaluations belong at the **application level**, while others make sense at the **mesh layer**.  
> The example shown here could also be implemented through **Waypoints** with **External AuthZ**, but it was kept at the workload level to focus on the logical model.  
> A dedicated article will later explore how the same **ZTAuth\*** approach applies to **Waypoints** once extended **authZ** and **metadata** capabilities are available.

## The ZTAuth* Approach: Trust Elevations, Trust Levels, and Trust Chains

Before diving into specific use cases, it’s important to clarify the foundational concepts behind **ZTAuth***.  

<figure class="post-banner">
  <img src="/images/2025-11-08/trust-model-for-ambient-mesh/ztauthstar-architecture.png" alt="ZTAuth*" loading="lazy">
</figure>

As illustrated in the model above, the architecture defines how **trust** is **evaluated**, **elevated**, and **propagated** across autonomous components in distributed systems:

**TRUSTED INPUT**  
Represents the initial *trust material* — any credential, token, or signed document that can be **cryptographically verified** and **linked to a subject** (user, service, or workload).  
Examples include **JWTs**, **OAuth access tokens**, **ZCAPs**, **UCANs**, **W3C Verifiable Credentials**, or other **digitally signed artifacts**.  
The key requirement is that it can be **verified for authenticity and integrity**, regardless of format or trust model — centralized or decentralized.

**TRUSTED CHANNEL**  
Represents the **secure communication substrate** over which trust information — such as requests, attestations, or signed data — is transmitted.  
A trusted channel is any medium that ensures **confidentiality**, **integrity**, **authentic endpoint verification**, and **protection against replay or tampering**.  
It can operate over **HTTPS**, **mTLS**, **gRPC**, **message buses**, **DDS**, **DIDComm**, or other **centralized or decentralized transports**.  
The model remains valid even in **hostile or intermittently connected environments** (e.g., IoT, edge, or defense systems), where sessions may be disrupted but trust continuity must persist.  
In enterprise contexts, the trusted channel underpins **secure, verifiable, and policy-governed trust exchange** across all communication boundaries.

**AUTONOMOUS COMPONENT**  
Represents the **workload** or **execution entity** performing an action.  
It must possess a **verifiable workload identity** — such as a **SPIFFE ID**, **workload certificate**, or **attested cryptographic key** — that uniquely binds the running instance to its provenance and trust domain.  
Each autonomous component acts as a **Policy Enforcement Point (PEP)**, evaluating and enforcing **trust and authorization decisions locally**, ensuring that only **authenticated and policy-compliant operations** are executed, even in disconnected or distributed environments.

**POLICY DECISION POINT (PDP)**  
The component that **evaluates trust context** and produces an **authorization decision** based on policies and attestations.  
A PDP can be **centralized** or **distributed**, but it always relies on two key concepts:  

- **TRUST ELEVATION**: the process of moving from one **authorization context** to another, for example when a workload needs to act with a different or higher level of privilege.  
Each context enforces its own policies, and elevation is granted only when the **authorization decision**, evaluated under the **target context’s policies**, explicitly permits it under verified conditions.
- **TRUST LEVELS**: define the **rules and assurance requirements** that make **TRUST ELEVATION** possible.  
They describe *when* and *under which guarantees* a context can assume or delegate trust to another.  
Together, these ensure that every authorization decision is **policy-driven**, **context-aware**, and **verifiably enforced** across workloads.

**TRUST GOVERNANCE**  
Defines how **policies, trust relationships, and attestations** are authored, distributed, and evaluated.  
It encompasses **Business Policies** that govern application-level behavior, **Trust Policies** that define trust levels and elevation rules, and **Trust Statements** that express cross-domain or infrastructural trust assertions, such as delegation.  
This layer ensures that trust remains **auditable**, **revocable**, and **consistent** across domains.

Each of these layers forms a single **Trust Ring**. When multiple rings interact — for example, when a workload includes in its **Trusted Input** a **verifiable proof** that a previous peer’s identity and action were authorized under a valid trust context — they interconnect to form a **Trust Chain**.  

A **Trust Chain** provides **cryptographically verifiable continuity of trust** across workloads, asynchronous boundaries, and administrative domains. It enables **distributed authorization** that is **context-aware**, **revocable**, and **Zero Trust–compliant by design**.

This model allows trust to move naturally between **centralized and decentralized environments**.  
A trust exchange may start in a **centralized system**, for example using an **OAuth access token** issued by an identity provider, and then continue in a **decentralized context** using **DID-based credentials** or **verifiable attestations** over public networks.  
Likewise, decentralized identities can be **mapped or bound** to internal trust primitives such as **SPIFFE IDs** or **workload certificates** within private or enterprise domains.  
This approach keeps trust **consistent and verifiable** across boundaries, ensuring that policy enforcement and assurance do not break when shifting between **federated** and **distributed** systems.

## The Microsegmentation Challenge

**Microsegmentation** is essential to maintaining security and resilience in distributed systems.  
It allows each part of the infrastructure to operate as an independent **trust segment**, so that when something goes wrong, isolation can happen precisely — without taking the whole system down.

Let’s consider a simple **e-commerce application** deployed across different **security segments**:

1. A user places an order through the **Order API**.  
2. The **Order Service** processes the request and calls the **Payment Service** to charge the registered card.  
3. Once payment is confirmed, it triggers the **Shipment Service** to prepare the delivery.

Each service runs in its own **trust segment**:

- `order-api` in the **Retail segment** (public-facing).  
- `payment-svc` in the **PCI segment** (regulated zone).  
- `shipment-svc` in the **Logistics segment** (partner or external network).

For simplicity, let’s assume that in this example, each **trust segment** corresponds to a **namespace** where its **service account** lives — this makes the model easier to illustrate.

Example identities might look like this:

- Retail / Order API → `spiffe://cluster.local/ns/retail/sa/order-api`  
- PCI / Payment Service → `spiffe://cluster.local/ns/pci/sa/payment-svc`

Now imagine the flow:  
John authenticates with the IdP and gets an **OAuth Access Token (JWT)**. He calls the **Order API**, which checks with the **PDP** (Policy Decision Point) if John is allowed to place the order.  
Once approved, the **Order API** exchanges the access token and calls the **Payment Service** to charge the card.  
The **Payment Service** then performs its own PDP check to verify that John can proceed with the payment.

So far, everything works fine.  
But now, the **security team** detects **anomalous behavior** in the **Retail segment** (the namespace where the Order API runs).  
They need to **disable only the “place-order” action** for workloads in that segment — while keeping other actions (like order status or history) fully operational.

Revoking John’s access token is **not an option**, because it would break all his ongoing operations, even those unrelated to the affected workload.  
Instead, the right approach is to apply a **Trust Policy** that denies specific actions for workloads in the compromised segment.

``` yaml
IF namespace == "retail-segment" AND action == "place-order" THEN DENY
```

With **ZTAuth\***, the PDP receives not only the **JWT** but also the **peer identity** of the calling workload — in this case, the **Payment Service** acting on behalf of the **Order API**.  
The PDP input therefore includes:

- The **user credential** (`JWT` for John).  
- The **peer identity** (`spiffe://cluster.local/ns/retail/sa/order-api`).  
- The **executor identity** (`spiffe://cluster.local/ns/pci/sa/payment-svc`).  

<figure class="post-banner">
  <img src="/images/2025-11-08/trust-model-for-ambient-mesh/ztauth-and-ambient-mesh.png" alt="ZTAuth* and Ambient Mesh" loading="lazy">
</figure>

> **Note:**  
> In this model, what the PDP sees as the **peer identity** (the caller workload) is, from the application’s perspective, the **executor** — the service that actually performs the operation.  
> This creates an interesting inversion: at the protocol level (e.g., Ambient Mesh), the **peer** represents the caller in the secure channel, while at the application level it represents the **executor** of the delegated action.  
> It’s important to make this distinction explicit, as it defines how **trust elevation** and **authorization context** are evaluated within ZTAuth\*.

The PDP tries to **elevate trust** from the Retail peer to the PCI executor (Payment Service).  
Because the Trust Policy explicitly denies the “place-order” action for the Retail segment, the **trust elevation fails**, and the operation is safely blocked.

This approach allows the system to **quarantine only the affected segment** without disrupting valid operations in other parts of the system.  
It demonstrates why **Peer Identity** is essential for precise trust decisions in distributed environments.

If, in the future, **Ambient Mesh** extends its **metadata exchange** to expose the **executor identity** — the identity of the workload actually performing the operation — alongside the **peer identity**, it would enable far more precise **policy evaluation** and **trust propagation**.  
Such metadata would allow **PDPs** to differentiate between **who initiated** an action and **who executed** it, providing the missing link for **fine-grained Zero Trust orchestration**.  
While this capability is not yet available, its addition would represent a natural evolution of the **Ambient Mesh trust model**.

> **Note:**  
> The same principle should also apply at the **first hop** — when John initially calls the **Order API**.  
> Even at that entry point, the PDP should evaluate not only John’s token but also the **workload identity** of the API instance serving the request.  
> Trust must be verified at *every boundary*, starting from the very first connection.

I can already hear someone saying:  
*“Well, these are just context details — I could extract them myself and send them to the PDP.”*  

Of course you can.  
You could also manage credentials manually, handcraft your own trust propagation logic, or maybe even write a new communication mechanism from scratch.  

But that’s exactly the point — **protocols exist to make this systematic**.  
What ZTAuth\* (and models like Ambient Trust) aim to do is **move trust from being an implementation detail to being a first-class protocol property**.  
Because if every team keeps “doing it by hand,” we’re not doing Zero Trust — we’re just reinventing it, badly.

## The Async Flows Frontier

At some point, every distributed system faces the same reality: **a service goes down**, but the business can’t stop.  
In our case, the **Payment Service** becomes unavailable — yet new **orders** must still be accepted.  
The solution? Implement an **asynchronous flow** using a **message queue**.

Sounds familiar, right? It’s the same old challenge of **trust in async systems** — the same one now being repackaged as an “AI agent problem.”  
But this is not new. It’s what happens every time a system moves from **direct orchestration** to **event choreography**.

Here’s the problem:  
The **token** that authenticated John’s order can’t safely travel inside the message.  
You could encrypt it, sure — but there’s no guarantee it’ll still be **valid** or **trusted** by the time the message is consumed.  
Forwarding refresh tokens or credentials through the queue would just turn the system into an *“Internet of shared secrets.”* Clearly, that’s not Zero Trust.

The real solution is to create a **cryptographic attestation** — a verifiable statement that proves the message’s origin, **the acting workload**, and **on whose behalf** the action was performed — so that the **trust chain** continues securely through the message.

```yaml
attestation:
  order_id: "12345"
  action: "place-order"
  act_on_behalf_of: "john.doe@example.com"
  workload_identity: "spiffe://cluster.local/ns/retail/sa/order-api"
  peer_identity: "spiffe://cluster.local/ns/pci/sa/payment-svc"
  signature: "<cryptographic-proof>"
```

When the **consumer** (e.g., a Shipment Service) receives the message, it must be able to:

1. **Validate** the attestation signature.  
2. **Verify** the trust chain continuity.  
3. **Authorize** the operation based on current policies and context.  

This happens through a **ZTAuth\*** **PDP**, which doesn’t rely on token forwarding but on **proof continuity**.  
Even if the consumer no longer has the original peer identity, the **attestation signature** ensures that the previous step in the trust chain was legitimate and verifiable.

> **Note:**  
> Where sensitive data or personal identifiers are involved, the message payload should also include **content-level encryption**.  
> This ensures that only authorized workloads — validated through the trust chain — can decrypt and process the information, maintaining **privacy** and **data minimization** in compliance with Zero Trust principles.

The next natural step is to **standardize how attestations are created, signed, and verified** across asynchronous and distributed environments.  
This means defining both a **protocol format** (to describe attestation data) and a **system component** responsible for **signing and validating** these proofs between workloads.  

Such a component doesn’t yet exist in **Ambient Mesh**, but it will have to — either as a **native extension** or as an **external service** integrated with workload identity.  
It’s what will allow **messages to carry verifiable trust** across asynchronous hops, even in **disconnected or cross-domain** scenarios.

This is the missing piece that transforms message passing into **trust propagation**.  
Once this layer exists, **trust** itself becomes a **first-class protocol property**, not an afterthought bolted onto application logic.  
That’s when Zero Trust finally extends beyond HTTP calls — into **queues, events, streams**, and **distributed transactions** alike.

## Bridging SPIFFE IDs and DIDs

At this point, the direction should be clear:  
if **OAuth** and **SAML** represent only the **starting point**, and **SPIFFE IDs** define the **workload identity** within internal trust domains —  
then the next natural question is:  
**what if we could extend that identity beyond the enterprise boundary?**  

What if a **SPIFFE ID** could be directly **mapped to** — or even **expressed as** — a **Decentralized Identifier (DID)**,  
allowing the same trust model — the one we’ve built through **ZTAuth\*** — to operate natively across **decentralized protocols** such as **ZCAP**, **UCAN**, or **DIDComm**?

That’s the real bridge:  
a unified **trust substrate** where **centralized and decentralized systems** converge,  
and **trust** becomes continuous — from the datacenter to the open internet.

From a technical perspective, **SPIFFE** and **DID** serve complementary purposes:

- **SPIFFE IDs** are optimized for **fast, internal workload authentication** — ideal for low-latency, microsegmented environments where identities are short-lived and directly attested by trusted infrastructure.  
- **DIDs**, on the other hand, excel in **public or cross-domain interactions** — they offer verifiable, self-contained identity records suitable for open networks, third parties, and offline verification.

Now imagine bridging the two:  
an **attester** that issues an **SVID** (SPIFFE Verifiable Identity Document) could also include a **Verifiable Credential** in its metadata, linking that identity to a corresponding **DID**.  
In other words, your workload’s **SPIFFE ID** could be **anchored** in a verifiable, decentralized trust graph — allowing secure interoperability across enterprise and decentralized domains.

This would create a **hybrid trust model**:

- Internally, workloads authenticate and communicate using **SPIFFE/mTLS**, preserving speed and isolation.  
- Externally, the same workloads can **prove their identity** and **extend their trust context** using **DIDs** and **Verifiable Credentials** — cryptographically bound to their original SPIFFE attestation.

This bridge unlocks an entirely new class of **trust-native architectures** —  
where enterprise workloads, decentralized agents, and autonomous services can all operate under a **single verifiable trust continuum**.

As for **delegation protocols** like **ZCAP** or **UCAN**, they already hint at this direction —  
but to fully support **trust elevation**, **workload identity**, and **verifiable continuity**, these protocols may need to evolve.  
They must integrate concepts like **Trust Levels**, **Elevation Policies**, and **contextual authorization** into their semantics.

That’s where a **new model emerges** — one where **agents and workloads** act autonomously,  
identified through **Verifiable Credentials** and **DIDs**,  
yet governed by the same **policy-driven trust substrate** that secures enterprise environments today.

This isn’t just interoperability — it’s **trust continuity across paradigms**.  
It’s where Zero Trust stops being an enterprise framework and becomes a **universal trust protocol** —  
spanning **SPIFFE to DID**, **mTLS to DIDComm**, **SVIDs to Verifiable Credentials** —  
all part of a single, cryptographically unified trust architecture.

## Conclusion — Toward Composable, Verifiable Trust

This architectural vision will evolve step by step — but one thing is clear:  
**OAuth**, **SAML**, and similar models remain important. They will continue to serve as **entry points** for user and system authentication.  
However, inside the distributed fabric — where trust often breaks down — we need a **new protocol layer** capable of **unifying trust end-to-end**.

Sooner or later, **AI agents** and **autonomous workloads** will require this **unique, systemic security layer** — one that treats **trust** as a first-class protocol concern, not an application add-on.  
Traditional models like OAuth with static scopes or detached policies were never designed to handle **workload-to-workload trust**, **dynamic authorization**, or **distributed Zero Trust contexts**.

We’ve only explored one of the missing pieces here — **continuous trust verification** —  
but Zero Trust goes far beyond that.  
It’s about **contextual elevation, provenance, attestation, and continuity of trust** across every boundary: user, workload, or agent.

These are the principles that **ZTAuth\*** builds upon —  
and the next articles will continue to expand on how this new model can make **trust truly composable, verifiable, and universal**.
