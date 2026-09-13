# AegisNexus Evaluation Package

## Executive summary

AegisNexus is a human-controlled security console for detecting and explaining coordinated business email compromise and phishing incidents. It combines communication, URL, identity, audio, and network signals into one incident record, calculates an explainable risk band, shows relationships in an attack graph, recommends a safe response, and allows an analyst to export the incident for handoff or review.

The solution is significant because business email compromise often uses legitimate-looking requests, look-alike domains, urgency, and trusted identities. The FBI specifically warns that attackers spoof email accounts or websites, use spearphishing, exploit invoice and payment workflows, and pressure recipients to act quickly [1]. The IC3 reported more than $55.4 billion in exposed global BEC losses for 2013–2023, including $20.1 billion in reported U.S. losses [2].

## Problem statement

Security teams commonly receive fragmented alerts: a suspicious email, a new domain, an identity anomaly, an unusual voice note, or an infrastructure match. When these signals are investigated separately, analysts may miss that they belong to one coordinated attack. The operational problem is therefore not only to classify an individual message, but to provide a defensible incident view answering four questions:

1. What happened?
2. Why is it risky?
3. What evidence and relationships support the decision?
4. What safe action should an analyst approve next?

## Proposed solution

AegisNexus uses an evidence-first workflow. Each signal has a type, source, score, and explanation. The incident record combines those signals with a risk score, confidence, business impact, analyst notes, response state, and graph relationships. Policy thresholds convert the score into a risk band: low, medium, high, or critical. High-impact actions remain under analyst approval rather than being executed automatically.

This approach is practically feasible because it can begin with deterministic rules and existing enterprise telemetry. Lightweight email, URL, identity, and network checks can create an initial incident quickly, while deeper audio or video analysis can be added as asynchronous modules. The interface is intentionally modular: new signal types, detectors, integrations, and policy rules can be added without changing the core incident workflow.

## Research basis

The design follows established guidance rather than claiming that a prototype detector is production-grade. The FBI recommends carefully examining sender addresses and URLs, avoiding unsolicited links, and independently verifying payment or account-change requests through a known channel [1]. AegisNexus directly represents these practices through look-alike URL evidence, identity/channel evidence, business impact, and the “hold and verify independently” response.

CISA, NSA, FBI, and MS-ISAC guidance describes phishing techniques and provides guidance for network defenders and software manufacturers, including secure-by-design and secure-by-default practices [3]. AegisNexus applies this principle by making evidence and policy decisions visible to the analyst instead of hiding them behind an unexplained verdict.

NIST’s AI Risk Management Framework is intended to help organizations incorporate trustworthiness considerations into the design, development, use, and evaluation of AI systems [4]. The POC reflects this direction through explainable evidence, confidence, explicit limitations, human approval for consequential actions, and a clear separation between implemented, simulated, and planned capabilities.

## POC demonstration

The POC is ready to demonstrate in a browser. The recommended demonstration sequence is:

| Step | Demonstration | Evidence of completion |
|---|---|---|
| 1 | Start with the CFO impersonation scenario | A critical incident appears with a 95/100 risk score, confidence, business impact, and five signals. |
| 2 | Select evidence rows | Each signal shows its type, source, contribution, rule identifier, and explanation. |
| 3 | Expand the attack graph | The incident’s evidence and relationships are visualized as connected nodes. |
| 4 | Open Policies | The critical, high, medium, and low response thresholds are visible. |
| 5 | Approve the response | The incident changes from awaiting approval to contained; the action can also be reset. |
| 6 | Record incident | An analyst can manually enter a name, summary, score, confidence, impact, notes, and one or more evidence signals. |
| 7 | Save and show incident | The new incident becomes the active incident and is displayed throughout the dashboard. |
| 8 | Open Incidents or Search | Saved incident records can be selected and reviewed manually. |
| 9 | Export incident | The active record downloads as a readable `.txt` brief or structured `.json` file. |

## Requirement-to-evidence mapping

| Evaluation requirement | Current evidence in AegisNexus | Status |
|---|---|---|
| Understand the problem and its significance | Problem statement, BEC-focused scenario, evidence correlation, business-impact card, and explainable risk workflow | **Completed** |
| Clearly define a feasible proposed solution | Modular incident model, rule-based risk bands, analyst approval, local persistence, and export workflow | **Completed** |
| Provide a working POC | Functional dashboard with three demo scenarios and manual incident creation | **Completed** |
| Demonstrate how the solution works | Evidence selection, graph explorer, policies, response approval, incident queue, search, and export | **Completed** |
| Support the solution with strong research | FBI, IC3, CISA/NSA/FBI/MS-ISAC, and NIST sources mapped to design choices | **Completed for POC evaluation** |
| Justify technical and product decisions | Evidence-first design, independent verification, human approval, explainability, and explicit limitations | **Completed** |
| Adapt to industry feedback | Data-driven incident and signal model allows new fields, scenarios, policies, and detector types to be added | **Ready for feedback; live feedback not yet available** |

## Feasibility and limitations

The POC proves the end-to-end decision workflow, not a production security platform. It currently uses deterministic simulated detector outputs, browser-local persistence, and simulated response actions. It does not yet connect to a real mailbox, SIEM, URL reputation service, telephony system, enterprise identity provider, or payment system. It also does not claim universal deepfake detection or production-grade accuracy.

A production roadmap would add authenticated users and role-based access, a server-side incident database, immutable audit logs, enterprise connectors, calibrated detector models, privacy controls for audio and biometric data, monitoring for false positives and drift, and controlled integrations for quarantine or blocking. These additions are consistent with the current data-driven design and do not require replacing the analyst-facing workflow.

## Industry-feedback adaptation plan

If the industry partner changes the requirements during evaluation, the team should first classify the change as a new signal, a new policy, a new workflow action, a new integration, or a reporting requirement. The POC can then be adapted using the following process:

| Feedback type | Planned adaptation |
|---|---|
| New evidence source | Add a new signal type with source, score, detail, and graph relationship. |
| Different risk thresholds | Update the policy mapping while preserving the visible explanation. |
| New analyst role or approval rule | Add role-aware response permissions and audit metadata. |
| New export or reporting format | Add another serializer using the same incident record. |
| Enterprise integration request | Replace the simulated action with a reviewed connector while retaining approval gates. |
| Privacy or compliance requirement | Add retention, redaction, access-control, and audit fields. |

## Final evaluation statement

AegisNexus demonstrates a defensible approach to coordinated communication fraud: it turns fragmented indicators into one explainable incident, keeps consequential actions under human control, and produces a portable record for review. The POC is complete for demonstrating the proposed workflow. The remaining production-level work is integration, security hardening, model validation, and deployment—not a redesign of the core concept.

## References

[1]: https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise "FBI — Business Email Compromise"

[2]: https://www.ic3.gov/PSA/2024/PSA240911 "FBI IC3 — Business Email Compromise: The $55 Billion Scam"

[3]: https://www.cisa.gov/resources-tools/resources/phishing-guidance-stopping-attack-cycle-phase-one "CISA — Phishing Guidance: Stopping the Attack Cycle at Phase One"

[4]: https://www.nist.gov/itl/ai-risk-management-framework "NIST — AI Risk Management Framework"
