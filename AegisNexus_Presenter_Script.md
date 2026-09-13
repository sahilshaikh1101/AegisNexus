# AegisNexus Presenter Script

## How to use this file

Read the sections titled **Say** aloud. Follow the sections titled **Action** on the screen. The script is written for a clear 6–8 minute demonstration. Speak slowly, pause after each result, and do not claim that simulated actions are connected to a real company system.

## 1. Opening: introduce the problem

### Say

“Good morning. Our project is called **AegisNexus**. It is a human-controlled security console for detecting and explaining coordinated business email compromise and phishing incidents.

The problem we are addressing is that modern attacks rarely depend on only one suspicious email. An attacker may combine a trusted executive identity, an urgent payment request, a look-alike website, a suspicious voice message, and infrastructure that was connected to earlier attacks. These signals are often separated across different tools, so the analyst sees fragments instead of one complete incident.

The important question is not only, ‘Is this individual message suspicious?’ The important question is, ‘Do these signals together indicate a coordinated attack that could cause financial or access loss?’

The FBI describes business email compromise as a financially damaging crime involving spoofed accounts or websites, spearphishing, invoice and payment requests, and pressure to act quickly [1]. This is why our solution focuses on correlation, explanation, and safe human approval.”

### Action

Remain on the Overview page. Point to the incident title, risk score, business impact, and evidence stream.

## 2. Explain the solution

### Say

“AegisNexus follows an evidence-first workflow.

First, the system records signals from communication, URL, identity, audio, and network sources. Each signal contains a source, a score, and an explanation.

Second, the correlation layer groups related signals into one incident. This is shown through the attack graph.

Third, the risk engine combines the evidence into a visible risk score, confidence level, and policy band.

Finally, the system recommends a safe response, but it does not silently take a high-impact action. The analyst remains responsible for approving the response.

This design is also consistent with the NIST AI Risk Management Framework, which encourages organizations to consider trustworthiness when designing, developing, using, and evaluating AI systems [2]. In our POC, that means the decision is explainable, the confidence is visible, the evidence is inspectable, and the human approval step is explicit.”

## 3. Demonstrate the critical incident

### Action

Click **CFO impersonation** or use the critical demo incident.

### Say

“I will now demonstrate a controlled simulation of a fake CFO payment request. This is not connected to a real corporate mailbox, payment system, or blocking service.”

“The console shows a risk score of **95 out of 100**, with **94 percent confidence**. The business impact is an **$84,500 payment instruction**, so the system does not treat this as an ordinary low-priority alert.”

“The response state is currently **Awaiting approval**. This is intentional. A high-impact action should remain under analyst control.”

## 4. Explain the evidence

### Action

Click each evidence row one at a time.

### Say

“The first signal is an urgent payment request from the CFO mailbox. The important feature is the pressure and payment intent.

The second signal is a look-alike payment domain. The domain differs from the approved finance portal by one character. The FBI recommends carefully examining email addresses and URLs and independently verifying payment or account-change requests [1].

The third signal is a voice-note authenticity anomaly. The speaker pattern and communication history do not match the expected executive profile.

The fourth signal is an unapproved communication channel. The profile allows approved channels, but the request arrived from an unknown mobile number.

The fifth signal is related network infrastructure. The domain shares infrastructure with earlier blocked indicators.

The key point is that each signal is understandable on its own, but their combination is much more meaningful. The analyst can select a signal and see its source, score, rule, detector output, and explanation. This makes the decision auditable instead of presenting an unexplained yes-or-no answer.”

## 5. Demonstrate the attack graph

### Action

Click **Expand** beside Attack graph.

### Say

“This graph turns separate alerts into one connected incident. The center node represents the risk decision. Around it are the identity, email, URL, audio, and network signals.

The graph also records relationships between entities. For example, the email is connected to the look-alike domain, the domain is connected to the network address, and the network address is connected to a prior alert.

This is the main differentiator of AegisNexus: it helps an analyst see the campaign structure instead of investigating every alert in isolation.”

## 6. Demonstrate policy and human approval

### Action

Open **Policies** from the left navigation.

### Say

“These policy bands make the response understandable. Low risk is monitored. Medium risk requests verification. High risk recommends quarantine and independent verification. Critical risk opens an incident and requires analyst approval.

CISA, NSA, FBI, and MS-ISAC guidance emphasizes stopping phishing attacks early and improving defensive practices [3]. Our POC applies that idea through early evidence review, visible verification guidance, and a human-controlled response.

I will now approve the simulated response. In a production system this could be connected to approved enterprise integrations, but in this POC the action is only recorded locally.”

### Action

Open **Playbooks** or click **Approve simulated response**.

### Say

“The incident is now marked **Contained**. The response can also be reset, which allows the demonstration to be repeated without deleting the incident.”

## 7. Demonstrate manual incident creation

### Action

Click **Record incident**.

### Say

“The POC is not limited to three hard-coded demo screens. An analyst can manually create an incident.

I can enter the incident name, summary, risk score, confidence, business impact, and analyst notes. I can then add one or more evidence signals, including the type, source, score, and explanation.

I will save this record now.”

### Action

Enter a short incident, add at least one signal, and click **Save and show incident**.

### Say

“The new record is now the active incident. The dashboard, evidence panel, graph, response state, and export view all update from the new data. The incident is also saved in this browser so it can be reviewed again from the Incident queue.”

## 8. Demonstrate incident review and export

### Action

Open **Incidents**, select the created incident, then open **Export incident**.

### Say

“The Incident queue allows the analyst to select any saved record. Search can also find incidents by name, impact, evidence label, or source.

The export view provides two formats. The text brief is designed for a human handoff or review meeting. The JSON file is designed for structured integration or later processing.

Both exports include the incident ID, risk decision, confidence, business impact, response state, evidence, graph relationships, and analyst notes. This makes the incident portable instead of keeping the explanation trapped inside the interface.”

### Action

Click **Download brief (.txt)**. If time allows, also click **Download record (.json)**.

## 9. Explain feasibility and current limitations

### Say

“Our POC is feasible because the core workflow can start with deterministic rules and existing security telemetry. Email, URL, identity, and network checks can create an initial record quickly. More advanced audio or video analysis can be added later as separate modules.

We want to be precise about what this POC does and does not claim. It proves the incident workflow, evidence correlation, explanation, human approval, local persistence, and export. It does not claim production-grade detection accuracy, universal deepfake detection, real URL blocking, or a live connection to an enterprise mailbox or payment system.

A production version would add authentication, role-based access, server-side storage, immutable audit logs, enterprise connectors, calibrated detector models, privacy controls, and monitored response integrations. These would extend the current design rather than replace it.”

## 10. Explain adaptability to industry feedback

### Say

“If the industry partner provides new requirements, the data-driven design allows us to adapt quickly.

A new evidence source can be added as a new signal type. New risk thresholds can be added as policy rules. A new approval requirement can be added to the response workflow. A new report format can be added as another export serializer. A requested enterprise integration can replace the simulated action while keeping the approval gate.

Our process would be to classify the feedback, update the smallest affected module, test the critical workflow, and demonstrate the change using a new incident scenario.”

## 11. Closing statement

### Say

“To conclude, AegisNexus does not replace the analyst with an unexplained AI verdict. It gives the analyst one defensible incident view: what happened, why it is risky, what is connected, what action is recommended, and what evidence supports that recommendation.

The POC is ready and demonstrates the complete workflow from incident creation to evidence review, correlation, analyst approval, persistence, and export. The remaining production work is integration, security hardening, model validation, and deployment.”

## Likely evaluator questions and answers

### Q1. Why is this better than a normal alert dashboard?

“A normal alert dashboard may show several separate warnings. AegisNexus correlates them into one incident and explains how they are related. This reduces fragmented investigation and helps the analyst prioritize the business impact.”

### Q2. How is the risk score calculated?

“In the POC, the score is based on deterministic weighted evidence contributions and visible policy thresholds. In production, the weights would be calibrated on labelled data, monitored for false positives, and reviewed as the threat environment changes.”

### Q3. Is the system using a live AI model?

“No. The current POC uses deterministic simulated detector outputs. The architecture is modular so live models can be connected later, but we do not claim that they are already connected.”

### Q4. Can the system block a payment automatically?

“The POC only simulates containment and records the analyst decision. We intentionally keep high-impact actions under human approval. A production system could connect approved integrations after authentication, authorization, policy checks, and audit logging.”

### Q5. What happens if audio or video is missing?

“Missing modalities should be excluded rather than treated as evidence of authenticity or manipulation. The confidence should be recalculated using only the available signals. This is part of the planned production detector architecture.”

### Q6. How would you protect sensitive audio, identity, or payment data?

“A production deployment would use consent-based collection, data minimization, encryption, retention controls, role-based access, audit logs, and restricted biometric storage. The current POC uses simulated data and does not store real sensitive media.”

### Q7. What is the biggest limitation of the current POC?

“The biggest limitation is that detector outputs, persistence, and response actions are simulated or browser-local. The POC proves the user workflow, but production validation would require real data, real connectors, security testing, and measured accuracy.”

### Q8. How will you respond to new industry feedback?

“We will map the feedback to the incident model, signal layer, policy layer, response layer, or reporting layer. Then we will implement the smallest required change, run regression tests, and demonstrate the updated scenario. The current data-driven design makes this adaptation practical.”

## One-minute backup explanation

“AegisNexus is a human-controlled incident console for coordinated phishing and business email compromise. It combines email, URL, identity, audio, and network evidence into one explainable incident. The analyst can see the risk score, confidence, business impact, evidence explanations, graph relationships, and recommended action. The analyst remains responsible for approving high-impact responses. The POC also supports manual incident creation, local persistence, incident search, and text or JSON export. It proves the end-to-end workflow while clearly separating simulated capabilities from future production integrations.”

## Presenter reminders

| Do | Avoid |
|---|---|
| Say “controlled simulation” before demonstrating response actions. | Do not say that the POC blocks real URLs or payments. |
| Explain the evidence before emphasizing the score. | Do not present the score as production accuracy. |
| Mention human approval as a deliberate safety design. | Do not claim that a live AI model is already connected. |
| Show manual incident creation to prove the POC is dynamic. | Do not describe the three demo scenarios as the only possible incidents. |
| Use the export to show practical handoff value. | Do not claim universal deepfake detection. |

## References

[1]: https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise "FBI — Business Email Compromise"

[2]: https://www.nist.gov/itl/ai-risk-management-framework "NIST — AI Risk Management Framework"

[3]: https://www.cisa.gov/resources-tools/resources/phishing-guidance-stopping-attack-cycle-phase-one "CISA — Phishing Guidance: Stopping the Attack Cycle at Phase One"

## Attachment demonstration

### Say

“Before saving a manual incident, I can attach supporting evidence. I can paste a suspicious URL, upload an `.eml` or `.msg` email file, or upload an audio recording. The POC stores the attachment metadata and local file content with the incident record. When I export the incident, the text brief lists the attachments and the JSON export preserves the structured attachment record for later integration.”

### Action

In **Record incident**, paste a URL and click **Add URL**. Use **Email or voice file** to upload an email or audio file, then click **Save and show incident**. Open **Export incident** and confirm the attachment count and names before downloading the `.txt` or `.json` record.

> For this local POC, keep uploaded files below 2 MB. Do not upload real confidential company data during a public demonstration.

## Login demonstration

### Say

“Because this is a security console, the analyst should sign in before recording or exporting incidents. For this POC, I use a lightweight demo login. In production, this would be replaced with secure identity, MFA, roles, sessions, and audit logs.”

### Demo credentials

Email: `analyst@aegisnexus.com`  
Password: `demo123`

After signing in, the analyst can record incidents, review evidence, approve responses, attach supporting files, and export records. The sign-out icon in the top-right protects the console again.
