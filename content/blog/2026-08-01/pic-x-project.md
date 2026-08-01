+++
author = "Nicola Gallo"
title = "Designing PIC-X: From Specification to Architecture to Code"
date = "2026-08-01"
description = "PIC has reached the point where people are asking how they can use and test it. This article introduces PIC-X, the first open-source implementation component in a broader PIC software ecosystem, and begins Designing PIC-X: a practical series following the project from specification to architecture and code."
tags = ["pic", "pic-x", "security", "authorization", "ai", "software engineering", "design"]
+++

<figure class="post-banner">
  <img src="/images/2026-08-01/from-spec-to-arch.png" alt="Designing PIC-X: From Specification to Architecture to Code." loading="lazy">
  <figcaption>Designing PIC-X. From Specification to Architecture to Code.</figcaption>
</figure>

<div class="post-hero">

<p class="hero-eyebrow"><span>PIC-X</span> stands for Provenance Identity Continuity Exchange.</p>

<p class="hero-lead">Verifiable Authority Continuity across execution boundaries.</p>

[PIC](https://www.pic-protocol.org/) has reached a point where the questions are becoming practical:

<p class="hero-questions">How can we use it? How can we test it? What should a real implementation look like?</p>

Answering those questions requires more than specifications. It requires building the components that enable software engineers and architects to experiment with PIC in real systems.

</div>

## From PIC to PIC-X

I am therefore starting **PIC-X**, the first open-source implementation component in what can become a broader PIC software ecosystem.

PIC-X will initially implement the exchange and Trust Plane capabilities needed to connect existing authority infrastructure with PIC. It is one component, not the complete PIC implementation landscape: other libraries, SDKs, enforcement components, integrations, and operational tools may follow as the ecosystem develops.

The first goal is to integrate PIC with existing OAuth infrastructure: exchange an OAuth token, evaluate the authority it represents, and create the PIC Context of Authority required to begin or continue a PIC execution.

```text
OAuth token  →  PIC-X Trust Plane  →  PIC Context of Authority
```

OAuth will be the first integration target, not the limit of the project. The architecture should later support other authority sources and exchange profiles without making PIC dependent on OAuth.

PIC-X will provide the first concrete way to run, inspect, and test this part of PIC. It will be released as open source so that others can experiment with it, review the implementation, contribute, or use it as a foundation for their own work.

## Designing PIC-X

This article also begins **Designing PIC-X**, a practical series dedicated specifically to the design and implementation of PIC-X.

The series is intended for software engineers and architects. It will develop in parallel with PIC-X, following the work from specification to architecture and code. Each article will use the **Designing PIC-X:** prefix and focus on a concrete design decision, architectural boundary, internal component, API, data flow, or implementation trade-off.

Many PIC concepts and requirements will necessarily appear throughout the series, but always through the practical question of how PIC-X should implement them. This is not the general implementation series for every future PIC component.

The articles will also form practical technical documentation for people who want to understand, run, integrate, or contribute to PIC-X.

Some early decisions will change. Implementation may reveal new constraints, security analysis may expose a better boundary, or a simpler design may replace the first approach. When that happens, later articles will preserve the earlier reasoning and explain what changed and why.

The latest implementation will show how PIC-X currently works. The complete series will show how its architecture arrived there. Other PIC components may receive their own dedicated series as they are designed and built.

## References

- [PIC Protocol](https://www.pic-protocol.org/)
- [PIC Prover and Verifier Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-prover-verifier-spec.html)
- [PIC Revocation Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-revocation-spec.html)
- [PIC Sandboxed Execution](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-lineage-guardrail-spec.html)
- [PIC Architecture and Deployment Specification](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pic-protocol/pic-spec/main/draft/0.2/rfc/pic-architecture-deployment-spec.html)

The next article will examine the first PIC-X flow: exchanging an OAuth access token for $PCA_0$, the origin PIC Context of Authority, and the design decisions required to make that conversion explicit and verifiable.
