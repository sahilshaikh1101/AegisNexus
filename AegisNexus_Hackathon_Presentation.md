# AegisNexus — GLS Nexus Hackathon 2026

## Cover
AegisNexus  
Explainable defense against coordinated communication fraud  
GLS Nexus Hackathon 2026

## Slide 1
### The problem is coordinated, not isolated
- Business email compromise combines identity, urgency, links, voice, and infrastructure signals.
- Analysts often investigate fragmented alerts across separate tools.
- High-impact actions require fast decisions with defensible evidence.

## Slide 2
### Our solution creates one explainable incident
- Correlates email, URL, identity, audio, and network evidence.
- Converts signals into risk, confidence, business impact, and relationships.
- Keeps containment and approval under human control.

## Slide 3
### The workflow is simple and auditable
1. Record or select an incident.
2. Add evidence signals and attachments.
3. Review risk, confidence, graph relationships, and analyst notes.
4. Approve or reset the simulated response.
5. Export a portable text brief or structured JSON record.

## Slide 4
### The POC is dynamic, not a static mockup
- Analyst login protects the console.
- Manual incident creation updates the dashboard and graph.
- URL, email, and voice attachments are stored with the incident.
- Local persistence keeps records available after refresh.

## Slide 5
### Technology supports a fast, feasible build
- React + TypeScript + Vite for the console.
- Local browser persistence for the POC.
- Deterministic, explainable scoring and policy bands.
- Modular model supports future enterprise connectors and live detectors.

## Slide 6
### Demo: CFO payment diversion
- Risk: 95/100; confidence: 94%.
- Impact: $84,500 payment instruction.
- Five correlated signals reveal a coordinated attack pattern.
- Analyst reviews evidence before approving simulated containment.

## Slide 7
### Impact: better decisions with less fragmentation
- Gives analysts one decision surface instead of disconnected alerts.
- Makes the reason for the risk score inspectable.
- Creates a portable incident record for handoff and review.
- Supports rapid adaptation when a partner adds new signals or policies.

## Slide 8
### What is complete and what comes next
- Complete: working POC, login, manual recording, evidence correlation, attachments, approval flow, persistence, and export.
- Next: secure backend authentication, enterprise integrations, immutable audit logs, calibrated detectors, and production testing.
- The POC proves the end-to-end workflow while clearly separating simulated actions from production claims.

## Slide 9
### Research basis and responsible design
- FBI guidance identifies spoofed accounts, spearphishing, fake websites, and urgent payment requests as BEC patterns [1].
- NIST AI RMF emphasizes trustworthy design and evaluation of AI systems [2].
- CISA guidance emphasizes stopping phishing early and strengthening defensive practices [3].
- Human approval, visible evidence, and explicit limitations are deliberate safety choices.

## Slide 10
### The ask
AegisNexus turns scattered communication warnings into one explainable, human-approved incident decision.  
Thank you.

## References
[1] FBI — Business Email Compromise: https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise  
[2] NIST — AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework  
[3] CISA — Phishing Guidance: https://www.cisa.gov/resources-tools/resources/phishing-guidance-stopping-attack-cycle-phase-one
