+++
author = "Hugo Authors"
title = "Access Control: A Distributed Fact, Not a Claim"
date = "2025-04-18"
description = "The purpose of this post is to explain why access should not be treated as a simple claim, but rather as a verified, distributed, and enforced fact, something that must be checked by a Policy Decision Point (PDP) across trust boundaries."
tags = [
    "authz",
    "tokens",
    "ztauth*",
]
+++

Authorization (also known as `AuthZ`) is gaining attention as a critical component of modern systems. However, the ecosystem still lacks the same level of standardization that Authentication (`AuthN`) has already achieved.

While it may seem reasonable to rely on `tokens` to manage authorization, this approach must be carefully considered. Authorization is inherently a distributed fact.

<!--more-->

When talking about distributed systems, the CAP theorem becomes highly relevant. Any approach to authorization must take into account the trade-offs between consistency, availability, and partition tolerance. Understanding these limits is essential for building secure and reliable systems.

## 1. Identity and Authentication Token

Let:

$$
\mathcal{I} \text{ be the set of identities}
$$

$$
\mathcal{T} \text{ be the set of authentication tokens}
$$

$$
F_{\text{token}} : \mathcal{T} \to \mathcal{I} \text{ be a function mapping each token } \tau \in \mathcal{T} \text{ to an identity } i \in \mathcal{I}
$$

Then:

$$
\forall \tau \in \mathcal{T}, \exists i \in \mathcal{I} \text{ such that } F_{\text{token}}(\tau) = i
$$

## 2. Authorization and Time-Dependent Permissions

Let:

$$
\mathcal{P} \text{ be the set of all possible permissions}
$$

$$
P : \mathcal{I} \times \mathbb{R}^+ \to \mathcal{P}(\mathcal{P}) \text{ be a function returning the set of permissions assigned to identity } i \in \mathcal{I} \text{ at time } t \in \mathbb{R}^+
$$

We define *permission stability* over a time interval $$[t_0, t_1]$$ as:

$$
\forall t_a, t_b \in [t_0, t_1],\quad P(i, t_a) = P(i, t_b)
$$

If permissions are stable over time, an authentication token issued at $$t_0$$ remains valid for authorization up to $$t_1$$.

If permissions are *mutable*, then:

$$
\exists t_1 > t_0 \text{ such that } P(i, t_1) \neq P(i, t_0)
$$

## 3. Token Reliability Condition

Let $$\tau \in \mathcal{T}$$ be an authentication token issued at time $$t_0$$, and let $$i = F_{\text{token}}(\tau)$$.

The token $$\tau$$ is *reliable* for authorization at time $$t_1 > t_0$$ *if and only if*:

$$
P(i, t_1) = P(i, t_0)
$$

Otherwise, if:

$$
P(i, t_1) \neq P(i, t_0)
$$

then the token cannot guarantee valid authorization at $$t_1$$:

$$
\tau \not\Rightarrow \text{valid authorization at } t_1
$$

## 4. Conclusion

Authentication tokens are valid tools for *identifying* an identity over time.  
However, *authorization must be evaluated in real time*, since permissions may change unpredictably.

Access decisions should therefore be based on a runtime evaluation function:

$$
\text{Access}(i, r, t) = D(i, r, t)
$$

where $$D$$ takes as input the identity $$i$$, the resource $$r$$, and the current time $$t$$.
