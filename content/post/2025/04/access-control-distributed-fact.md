+++
author = "Hugo Authors"
title = "Access Control: A Distributed Fact, Not a Claim"
date = "2019-03-05"
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
