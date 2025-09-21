+++
author = "Nicola Gallo"
title = "Programmable Fiduciary Money and Order Instruments"
date = "2025-09-21"
description = "Examining how fiduciary order instruments and verifiable commitments can provide AI agents with reliable, atomic, and accountable transactions across multiple merchants."
tags = ["security", "authz", "decentralization", "programmable-money"]
+++

Single-merchant payments are easy; real commerce is not. The moment users ask an AI agent to buy multiple items from different merchants at the best available prices — and expect all-or-nothing consistency — the problem shifts from a single transaction to multi-merchant coordination. And that’s where today’s token-based models break down.  

<!--more-->

> **TODAY:** “Book me a flight — wow!”  
> **TOMORROW:** “Plan my whole trip — flight, car, hotel — by selecting among different cities, but only within a set budget.”  

In a real scenario, the AI agent will need to request multiple quotes, compare options, and define the best combination. It may realize that within the budget only two cities are feasible instead of three — but that still produces the best trip.  

A true assistant should remove wasted effort: *“Here’s my budget, find me the best trip I can take under my conditions and current market prices.”*  

## The Problem for AI Agents

An AI agent may request multiple quotes, but by the time it decides to purchase, those quotes may no longer be valid.  

This can leave the agent in an inconsistent state — starting to buy but ending up with only half a trip.  

## Toward a Solution: Programmable Fiduciary Money

Programmable Fiduciary Money introduces a new model:  

- The AI agent holds a **payment instrument**.  
- From it, the agent can create **multiple smaller payment orders** to acquire commitments from different merchants.

If you haven’t read the previous article that introduces this concept, you can find it here:  
👉 [Decentralized Models for Programmable Fiduciary Money](https://www.ngallo.it/blog/2025-08-28/decentralized-pfm/)

## The Transactional Challenge

Once an AI agent has a payment instrument, it can use it in whole or in part.  
The agent sends a **‘request for order’** to multiple merchants, and:  

- Each merchant **locks an order with expiry** (including payment terms).  
  - The length and conditions of the lock depend on the business model (airlines, hotels, retailers).  
  - In fact, such locks already exist informally — even a browser checkout “hold” is a short-lived lock.  
- The AI agent **picks the preferred option**.  
- The agent then **creates payments for each order from the payment instrument** and closes the transaction.

Rollback is only possible if the merchant accepts it. Otherwise, the agent must proceed through legal remedies — or, where useful, rely on pre-arranged insurance coverage.  

## The Order Instrument

An **order instrument** is a verifiable commitment that is signed by the merchant.  

- The AI agent creates an order instrument by sending a **‘request for order’**.  
- The merchant responds with a **signed order instrument** that includes the details, price, expiry, and hash of the Terms & Conditions.  

The AI agent collects multiple signed order instruments, then chooses the best combination and executes payment.  

This is conceptually similar to derivatives in finance: a contract to buy or sell at a future date under agreed terms. The order instrument is a **commitment to sell the item at the agreed price within the expiry window**.  

## What’s Still Missing

The missing piece is a **legal framework** so that a *‘request for order’* and its signed response carry **contractual binding power**.  

This framework does not need to be heavy: standard T&Cs, versioned and hashed, could provide enough legal certainty.  

## Conclusions

When agents must coordinate across multiple merchants, ephemeral tokens break down and consistency fails.  

Programmable Fiduciary Money and order instruments point to a stronger foundation: **identity-anchored, verifiable commitments** that survive restarts, support rollback where accepted, and enforce accountability.  

With the right legal framework and standardized schemas for order instruments, this model could make multi-merchant, agent-driven commerce both practical and trustworthy.  

That’s the missing primitive for the next generation of agentic commerce.  

## What’s Next

The next step is to define a concrete object model for the Order Instrument — a verifiable artifact that:  

- Encodes the order details, price, expiry, and status.  
- References or embeds binding Terms & Conditions, anchored to a DID.  
- Provides clear lifecycle states (proposed, locked, expired, canceled).  
- Scales through **distributed standardization**, so thousands of merchants can interoperate without central chokepoints.  

In practice, each merchant-signed Order Instrument would cryptographically attest to both the commercial terms and the seller’s identity — making the commitment auditable, enforceable, and composable across markets.  
