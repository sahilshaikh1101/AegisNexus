# AegisNexus — MITRE ATT&CK Framework Mapping

**Author:** Zainab Memon (@zainab-m54)  
**Role:** AI Research & Threat Intelligence Engineer  
**Standard:** MITRE ATT&CK v15 (Enterprise & Phishing Sub-techniques)

---

## Executive Overview

AegisNexus aligns multi-modal threat correlation against standardized MITRE ATT&CK techniques to eliminate siloed alert fatigue and bridge cross-vector intelligence.

| Modality | MITRE ID | Technique Name | Detection Heuristics |
|---|---|---|---|
| **EMAIL** | `T1566.002` | **Phishing: Spearphishing Link / Attachment** | Urgency NLP scoring, reply-to deviation, VIP display name spoofing |
| **URL** | `T1584.001` | **Compromise Infrastructure: Domains** | Levenshtein distance typo-squatting, newly registered domain (NRD) telemetry |
| **AUDIO** | `T1656` | **Impersonation (Synthetic Voice Deepfake)** | Mel-Frequency Cepstral Coefficients (MFCC) vocoder artifacts, speaker embedding mismatch |
| **IDENTITY** | `T1586.002` | **Compromise Accounts: Email / Mobile Account** | Out-of-band communication deviation, anomalous device fingerprinting |
| **NETWORK** | `T1583.001` | **Acquire Infrastructure: Domains & ASNs** | ASN reputation cross-indexing, bulletproof hosting infrastructure overlap |

---

## Cross-Modal Attack Chain (BEC Scenario INC-001)

```
[Attacker Registration: T1583.001]
               │
               ▼
[Synthetic Voice Deepfake: T1656] ──► [Unapproved Mobile Pivot: T1586.002]
               │                                      │
               └───────────────┬──────────────────────┘
                               ▼
            [Urgent Spearphishing Email: T1566.002]
                               │
                               ▼
            [Typo-squatted Portal Domain: T1584.001]
                               │
                               ▼
            [AegisNexus Deterministic Defense Gate: 95/100]
                               │
                               ▼
          [Human-in-the-Loop Quarantine PB-07 Triggered]
```

---

## NIST AI RMF 1.0 & MITRE Integration

By combining MITRE ATT&CK taxonomy with NIST AI RMF Playbooks, AegisNexus ensures:
1. **Explainability**: Every alert includes exact MITRE technique IDs for SIEM correlation.
2. **Deterministic Response**: Playbook PB-07 maps directly to MITRE D3FEND counter-measures (`D3-DQ`: Disallow Query, `D3-MA`: Message Analysis).
