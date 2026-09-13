# AegisNexus demo and explanation guide

## One-sentence explanation

AegisNexus is a human-controlled security console that combines phishing, identity, audio, URL, and network evidence into one explainable risk decision before a payment or privileged action is completed.

## The problem

Attackers can combine a convincing phishing message, an impersonated executive identity, a look-alike domain, and synthetic voice or video. Traditional tools often create separate alerts, so analysts see fragments instead of one coordinated attack. The important question is not only “Is this email fake?” but “Do these signals together indicate an impersonation campaign that could cause financial or access loss?”

## The solution

AegisNexus receives communication and security signals. Each detector produces evidence and a confidence value. The correlation layer connects shared people, domains, devices, phones, and previous alerts in an attack graph. The risk engine combines the available evidence and business impact into a risk band. The Copilot explains the decision using the evidence. Finally, a safe-response playbook recommends containment, while high-impact actions remain under analyst approval.

## What to demonstrate

Begin on the Overview page and say: “I will demonstrate a fake CFO payment request. This is a controlled simulation; the response actions are not connected to a real corporate system.” Click **Run demo incident**. The screen shows a critical risk score of 95/100, confidence of 94%, and five correlated signals.

Click each evidence row. Explain that the email contributes urgency and payment intent, the URL contributes look-alike-domain risk, the voice note contributes an authenticity anomaly, the identity signal shows an unapproved channel, and the network signal links the domain to prior indicators. The selected evidence card shows the rule and detector output so the decision is explainable.

Click **Expand** on the attack graph. Explain that the graph turns separate alerts into one incident by connecting the CFO identity, email, URL, voice note, DNS infrastructure, and prior alert. This is the main differentiator: weak signals become actionable when they converge.

Open **Policies** from the left navigation. Explain the prototype thresholds: low risk is monitored, medium risk requests verification, high risk is quarantined and independently verified, and critical risk opens an incident requiring analyst approval. Missing modalities are excluded rather than guessed.

Open **Playbooks** and click **Approve playbook**, or use the main response button. Explain that the prototype simulates quarantine, URL blocking, and analyst notification. In production, those actions would be connected to approved integrations and logged in an audit trail.

Use the scenario tabs or **Incidents** drawer to load the suspicious-redirect and known-good cases. Explain that a good detector must also avoid treating every finance message as malicious. The known-good case produces a low score, while the mixed case shows that one suspicious URL can raise risk even when the sender is legitimate.

Open **Export incident** and generate the incident brief. Explain that the export contains the risk decision, evidence, graph relationships, response state, and analyst notes for handoff or review.

## What is implemented and what is simulated

| Capability | Current prototype status |
|---|---|
| Interactive dashboard | Implemented in the browser. |
| Three incident scenarios | Implemented as deterministic demo cases. |
| Evidence selection and explanations | Implemented in the browser. |
| Attack graph visualization and entity explorer | Implemented in the browser. |
| Risk bands, confidence, and policy thresholds | Implemented as prototype policy logic. |
| Copilot interaction | Implemented as a grounded demo interaction; model connection is not yet live. |
| Email, URL, audio, and network detector outputs | Represented by deterministic simulated detector outputs. |
| Video deepfake detection | Planned modular extension, not claimed as fully implemented. |
| Quarantine/block/notification | Simulated only; no real external action is performed. |
| Database, authentication, production integrations | Not included in this static POC. |

## Questions judges may ask

**How is the risk score calculated?** The prototype uses weighted evidence contributions and policy thresholds. In a production version, the weights would be calibrated on labeled data and monitored for false positives. The important design choice is that the output includes evidence, confidence, and business impact rather than only a fake/genuine label.

**What happens if audio or video is missing?** The engine excludes unavailable modalities and recalculates confidence. It never treats a missing modality as evidence of authenticity or manipulation.

**Why use an attack graph?** A graph exposes relationships that a list of alerts hides. Shared infrastructure, repeated targeting, and identity relationships can show that separate events belong to one campaign.

**Is the system fully real-time?** Lightweight email, URL, identity, and network checks can run quickly. Deeper audio or video analysis can run in parallel and return asynchronously. The UI should report measured latency rather than claiming a universal real-time guarantee.

**Can it block a payment automatically?** The recommendation can be automated, but high-impact actions require analyst approval. This reduces the risk of an AI false positive causing an irreversible business action.

**How is privacy handled?** The prototype uses simulated data. A production system should use consent-based samples, minimize biometric retention, restrict access, encrypt sensitive artifacts, and maintain audit logs.

## What not to claim

Do not say that the current POC detects every real deepfake, provides production-grade accuracy, blocks real URLs, or uses a live AI model unless those features are actually connected and tested. Say instead: “This POC proves the end-to-end decision workflow with deterministic detector outputs and a modular path for connecting real models and enterprise integrations.”

## Closing statement

“AegisNexus does not replace the analyst with an unexplained AI verdict. It gives the analyst one defensible incident view: what happened, why it is risky, what is connected, and what safe action should happen next.”
