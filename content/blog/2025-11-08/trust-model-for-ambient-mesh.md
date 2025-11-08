+++
author = "Nicola Gallo"
title = "A Trust Model for Ambient Mesh, micro-segmentation, and async flows"
date = "2025-11-08"
description = "As Ambient Mesh redefines Cloud Native networking, ZTAuth* completes the model."
tags = ["security", "authz", "ambient mesh", "cloud native"]
+++

**Ambient Mesh** is redefining the Cloud Native service mesh for Zero Trust, whilst [**ZTAuth\***](https://spec.ztauthstar.com/openprotocolspec/2025-04-05/) completes it with **Trust Chains** built on **Trust Elevation**, **Trust Levels**, and **cryptographic signatures**. This article explores how these concepts apply to micro-segmented and asynchronous workloads.

<!--more-->

## Ambient Mesh is Redefining Zero Trust in the Cloud Native Service Mesh

Last month I had the pleasure of discussing **Ambient Mesh** with some of the leading minds in the **Cloud Native** space.  

**Ambient Mesh** is transforming how services communicate in a **Zero Trust** world — eliminating the need for **sidecars** and enabling **seamless, secure connectivity**.  

If you haven’t looked into it yet, I highly recommend checking out the [Ambient Mesh documentation](https://ambientmesh.io/).  

Beyond the impressive engineering work — removing **sidecars** and introducing **ztunnels** and **waypoints** — what truly stands out is the **architectural shift** it represents.  

For the first time, we’re seeing a **rock-solid foundation** for exploring concepts like **Trust Elevation**, **Trust Levels**, and **Trust Chains**.  

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

That said, in my opinion, two core components are still missing to fully realize this vision: **Trust Elevation** and **Trust Levels**.

In the next sections, we’ll explore how these ideas can extend the model with **ZTAuth\***, using real-world examples based on **micro-segmentation** and **asynchronous flows**.

## One Step Back to Leap Ahead: Rethinking Trust Models for Zero Trust

xxxxx

## The Micro-Segmentation challenge

xxxxx

## The Async Flows Frontier

xxxxx

## Conclusion — Toward Composable, Verifiable Trust

xxxxx
