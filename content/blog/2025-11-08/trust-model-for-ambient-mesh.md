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

- **Trust Elevation** — the process of moving from one **authorization context** to another, for example when a workload needs to act with a different or higher level of privilege.  
Each context enforces its own policies, and elevation is granted only when the **authorization decision**, evaluated under the **target context’s policies**, explicitly permits it under verified conditions.
- **Trust Levels** — define the **rules and assurance requirements** that make **Trust Elevation** possible.  
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

## The Microsegmentation challenge

xxxxx

## The Async Flows Frontier

xxxxx

## Bridging SPIFFEID to DIDs

xxxxx

## Conclusion — Toward Composable, Verifiable Trust

xxxxx
