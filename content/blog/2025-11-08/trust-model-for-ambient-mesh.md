+++
author = "Nicola Gallo"
title = "A Trust Model for Ambient Mesh, micro-segmentation, and async flows"
date = "2025-11-08"
description = "As Ambient Mesh redefines Cloud Native networking, ZTAuth* completes the model."
tags = ["security", "authz", "ambient mesh", "cloud native"]
+++

**Ambient Mesh** is redefining the Cloud Native service mesh for Zero Trust, whilst [**ZTAuth\***](https://spec.ztauthstar.com/openprotocolspec/2025-04-05/) completes it with **Trust Chains** built on **Trust Elevation**, **Trust Levels**, and **cryptographic signatures**. This article explores how these concepts apply to micro-segmented and asynchronous workloads.

<!--more-->

## Ambient Mesh is redefining Zero Trust in the Cloud Native Service Mesh

Last month I had the pleasure of discussing **Ambient Mesh** with some of the leading minds in the **Cloud Native** space.  

**Ambient Mesh** is transforming how services communicate in a **Zero Trust** world — eliminating the need for **sidecars** and enabling **seamless, secure connectivity**.  

If you haven’t looked into it yet, I highly recommend checking out the [Ambient Mesh documentation](https://ambientmesh.io/).  

Beyond the impressive engineering work — removing **sidecars** and introducing **ztunnels** and **waypoints** — what truly stands out is the **architectural shift** it represents.  

For the first time, we’re seeing a **rock-solid foundation** for exploring concepts like **Trust Elevations**, **Trust Levels**, and **Trust Chains**.  

IMHO, this direction marks a **meaningful evolution in Cloud Native security**, especially for **enterprise environments**, where **verifiable trust** and **workload identity** are becoming essential building blocks.  

However, there’s one point where I respectfully disagree.  
The documentation states that *“an application might benefit from knowing the peer identity.”*  

> In my view, this is more than a “**nice to have**” — it represents a **fundamental shift** in how we think about service identity. When **peer identity** becomes part of the **communication protocol itself**, it transforms the entire trust model. I believe this capability should be **mandatory** for **Zero Trust architectures**.  

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

In the next sections, we’ll explore how these ideas can extend the model with **ZTAuth\***, using real-world examples based on **micro-segmentation** and **asynchronous flows**.

## One step back to leap ahead: Rethinking Trust Models for Zero Trust

Current **authentication** and **authorization** models are built around the concept of a **static identity** and **static policies**. The best you can typically do is **revoke a token**.

The deeper issue lies in the **impersonation model** itself: tokens often propagate across multiple workloads, and each workload can **impersonate the original caller**.

Here is the problem: there is no standardized way to **bind the workload** to the security context or include it meaningfully in the trust decision. While the industry is moving toward solving this with initiatives such as **SPIFFE/SPIRE** and **mTLS-based service identity**, the workload is still not treated as a **first-class security principal**.

This gap leaves distributed systems with **limited visibility** and **weak provenance** once requests leave the application boundary.

Protocols such as **OAuth 2.0** were designed in an era where the main goal was **delegated user access**, *not workload-to-workload trust*.  

The original use cases were about a **user granting access** to their own resources — *for example, letting a third-party app access a photo gallery or social profile* — not about one service acting *on behalf of* another inside a distributed system.  

No one would ever delegate full access to their **email** or **social accounts** (Facebook, LinkedIn, Twitter/X) to another user.

OAuth was born in this **web-centric world**, with a clear perimeter: a **frontend application**, an **API**, and a **firewall or WAF** protecting it. But the real complexity, and where security models start to break, lies **behind that firewall**.

That’s where **microservices**, **event-driven systems**, and **asynchronous patterns** live. It’s where most of the actual **business logic**, **data processing**, and **cross-domain orchestration** occur.  

And yet, we still rely on the same **stateless token paradigm**, designed for **user-centric web access**, not for **dynamic, distributed workloads**.  

Inside the internal network, we don’t need a new transport protocol — **HTTP works perfectly**.  
The real issue is that we’ve ended up with **two parallel security layers**, and that should be a **warning sign, not a strength**.

- One layer is **external**, managed through standardized components such as **identity providers**, **OAuth servers**, and **API gateways** — it’s well-defined, observable, and policy-driven.  
- The other is **internal**, often **implicit**, **ad hoc**, or entirely **absent** — relying on **network boundaries**, **local tokens**, or **assumed trust**.

This duality exists because our systems evolved without a **unified trust substrate**. When security has to be enforced twice — once at the perimeter and once (inconsistently) inside — it’s a clear indication that **the trust model doesn’t extend end-to-end**.

We don’t have *defense in depth*; we have **trust fragmentation**.

This separation becomes even more problematic as systems move toward **asynchronous architectures** and **distributed transactions**.

For instance, in event-driven workflows or message-based orchestration, **tokens cannot safely travel** with each message. Each hop may involve retries, batching, or fan-out, making token forwarding both insecure and impractical.  

Yet, these messages still represent authenticated actions that must be **trusted, traced, and authorized**. Without a unified trust context that extends beyond HTTP calls, **internal security remains weakly coupled**, and **Zero Trust stops at the edge**.  

This mismatch becomes critical in modern environments, especially as **AI-driven orchestration** and **Zero Trust Application Networks (ZtAN)** emerge.  

These systems operate through **asynchronous flows** — events, queues, streams, and workflows — that extend far beyond simple API calls.  

Static tokens and global impersonation don’t scale in this model; they break both **security boundaries** and **trust traceability**.  

This is why we need a **new trust model**, one that embeds **workload identity** and **trust context** directly into the interaction protocols themselves.  

This is the foundation of what I started to define as **ZTAuth\***, a conceptual and protocol-level model designed to extend **Zero Trust principles** beyond synchronous APIs into **microsegmented** and **asynchronous architectures**.  

It’s about making **trust dynamic, composable, and verifiable** — across workloads, not just users.

## The Micro-Segmentation challenge

xxxxx

## The Async Flows Frontier

xxxxx

## Conclusion — Toward Composable, Verifiable Trust

xxxxx
