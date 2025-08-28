+++
author = "Nicola Gallo"
title = "Decentralized Models for Programmable Fiduciary Money"
date = "2025-08-28"
description = "Exploring how decentralized trust and authorization models can enable secure, privacy-preserving, and programmable fiduciary money."
tags = ["security", "authz", "decentralization", "programmable-money"]
+++

AI agents bring new security challenges, but also an opportunity to rethink traditional models.  
By looking at payments from a decentralized perspective, we can explore privacy-oriented solutions.  

<!--more-->

What follows is an **initial reflection** — not final, but already showing how such an approach could work in practice, and laying the ground for deeper exploration in future articles.  

## Introduction

Everyone is talking about **AI agents** and what they will do for us.  
Instead of imagining complex integrations where APIs magically solve everything, let’s start with a **simple case**:  

👉 **an agent making a **payment** on our behalf.**

This is a clear, well-defined model — and when it comes to money, **security is essential**.

Imagine a **smart washing machine** that manages your detergent supply:  

- monitors local levels through sensors  
- connects to a marketplace  
- orders more when supplies run low or when the price is favorable  

But here come the questions:

- How do we safely delegate this responsibility?  
- How do we guarantee security?  
- How do we protect our **privacy**?  

The idea is to move away from a **fully centralized model**.  

1. Start with a **Trusted Wallet** that manages verified credentials.  
2. Ask the bank to create a **payment instrument** that locks a certain amount of money.  
3. Use **decentralized mechanisms** so the washing machine can generate **Capability Tokens** from that instrument.  
4. These tokens allow payments *only under specific conditions*
   - when supplies are low  
   - when the price is right  

All this **without exposing your identity** or giving unlimited access to your funds.

## The Payment Flow

To provide a global view of how it works, the next image shows the complete flow; afterward, we analyze it step by step.

<figure class="post-banner">
  <img src="/images/2025-08-28/decentralized-pfm/pfm-flow.png" alt="PFM Flow" loading="lazy">
</figure>

### 1. Authentication with VC

- The user authenticates to the bank using a **Trusted Wallet** and  **Verifiable Credential (VC)** issued by the State (e.g., digital identity).  
- The bank verifies the VC cryptographically and confirms the user’s identity (KYC compliant).  

### 2. Issuance of Value Token (Payment Instrument)

- After verification, the bank issues a **value token** (for example, a digital payment instrument worth €100).  
- This token represents the available funds and is bound to the user’s identity.  

### 3. Delegation to an IoT/AI Agent

- The user decides whether the payment instrument can be used directly by them or by an authorized agent (e.g., IoT device or AI).  
- The delegation is managed through a **decentralized model** (for example, ZCAP-LD or similar).  
  The exact implementation can vary, but the key idea is that delegation happens in a **decentralized and auditable way**, not tied to a single central authority.  

The **Decentralized Delegation** specifies:  

- **Who** can act (e.g., the washing machine).  
- **What** can be done (spend).  
- **Under which limits** (amount, type of product, expiration).  
- **Under which conditions** (only if a specific condition is valid).

### 4. Request for a Capability Token

- The delegated agent (e.g., the smart washing machine) contacts the bank.  
- Using its delegation, it requests a **Capability Token** for a specific purpose:  
  - a certain amount,  
  - a defined goal (e.g., detergent purchase),  
  - within a given time window,  
  - from a specific e-commerce provider.  

### 5. Payment with Capability Token

- The smart washing machine sends the **Capability Token** to the e-commerce site.  
- The token preserves privacy: it only contains details of the **payment itself**, not the user’s personal data.  

### 6. Validation and Settlement

- The e-commerce provider forwards the **Capability Token** to the bank for validation.  
- The bank confirms the payment and settles the transaction.  

### 7. Outcome

- The **bank** is the only actor able to fully reconstruct the transaction history (as with card payments today).  
- The **citizen retains privacy and anonymity** toward third-party providers.  
- This creates a **sustainable and balanced model** where:  
  - banks remain guarantors of payments,  
  - identity verification relies on **Verifiable Credentials**,  
  - delegation is managed securely via **ZCAP-LD**,  
  - privacy is preserved even in digital currency contexts.  

## Conclusion

At this point, we have completed a full cycle:  

- The **State** issues verifiable credentials.  
- The **Citizen** manages them in their **Trusted Wallet**.  
- Through a **decentralized delegation**, the smart washing machine (or any AI agent) generates a **Capability Token**.  
- The **E-commerce provider** receives an anonymous payment request and forwards it to the bank.  
- The **Bank** issues payment instruments, creates capability tokens, and handles settlement.  

This ensures that:  

- The **bank** maintains full visibility of payment tracking, just as it does today with online banking and card transactions.  
- **Third parties** (like merchants) never receive personal data.  
- The system is **not centralized**, since control remains with the citizen’s **Trusted Wallet**.  

In short, this model combines **privacy, security, and regulatory compliance** in a way that is both practical and future-proof.  

## What is Next?

Of course, what we have described here is only a very basic implementation.  
In reality, such a system would need to handle **multiple identities**—including the identity of the smart washing machine itself (and, by extension, AI agents and IoT devices).  

This means we must define different types of trust and enable them through an **authorization protocol** that operates at the API layer of the bank and the decision point.  

In the next steps, we will start analyzing these aspects in detail.  
What should already be clear, however, is that by using a **decentralized model** we can shift toward a different approach and unlock new forms of commerce—forms that probably have not yet emerged because of today’s **security constraints**.  

IoT devices have existed for years, and now AI agents are becoming part of the picture. Yet both face unresolved security challenges. The same is true for **Zero Trust Network Access**: applications are still evolving to meet these new requirements.  

## Disclaimer

This article is only a **first exploration** of the topic.  
It does not present a complete solution, but rather an initial model to illustrate how decentralized approaches could be applied to payments and fiduciary money.  

Many technical, regulatory, and operational aspects still need to be analyzed in depth.  
The goal here is to open the discussion and provide a starting point for future work, not to claim that every challenge is already solved.  
