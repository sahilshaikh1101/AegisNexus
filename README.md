# AegisNexus

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Explainable cross-modal defense console against coordinated communication fraud.**  
> Correlates email, URL, identity, audio, and network evidence into a unified, explainable incident view with human-in-the-loop response approval.

---

## Live Demonstration and Access

| Resource | Details |
|---|---|
| **Live POC URL** | [https://aegis-nexus-alpha.vercel.app/](https://aegis-nexus-alpha.vercel.app/) |
| **Demo Analyst Email** | `analyst@aegisnexus.com` |
| **Demo Password** | `demo123` |

### Walkthrough Sequence
1. Sign in with the demo credentials above.
2. Select the **CFO Impersonation** incident (`INC-2026-0916-001`) to inspect the five correlated signals (email urgency, look-alike domain, cloned voice note, VIP identity spoofing, and external ASN).
3. Open **Attack Graph** to view evidence relationships and multi-vector clustering.
4. Open **Policies** to see how risk thresholds map to recommended response actions.
5. Select **Record Incident** to create a custom incident with URL, email, or audio signal attachments.
6. Select **Export Incident** to download structured `.json` or human-readable `.txt` incident briefs.

---

## Problem Statement and Significance

Modern cyber fraud has evolved beyond simple phishing into coordinated, multi-channel attacks combining spearphishing emails, look-alike domains, voice deepfakes, and identity spoofing:

- **The Scale:** According to the **FBI IC3 2024 Report**, exposed Business Email Compromise (BEC) losses surpassed **$55.4 Billion** globally.
- **The Operational Challenge:** Traditional Security Operations Centers (SOCs) receive fragmented alerts. Analysts struggle to connect a voice note anomaly with a suspicious domain registration and an urgent payment email.
- **The Core Questions AegisNexus Answers:**
  1. What happened across communication channels?
  2. Why is it risky and what is the business impact?
  3. What evidence and attack-graph relationships substantiate the threat?
  4. What safe, human-approved mitigation should be triggered?

---

## Architecture and Cross-Modal Signal Flow

AegisNexus correlates multi-modal signals using deterministic risk scoring, confidence weighting, and explainable attack graphs:

```mermaid
flowchart TD
    subgraph Inputs["Multi-Modal Threat Signals"]
        E["Email Signal<br/>(Urgency, Look-alike Headers)"]
        U["URL Signal<br/>(Typo-squatting, Suspicious TLD)"]
        A["Audio / Voice Signal<br/>(Synthetic Acoustic Anomaly)"]
        I["Identity Signal<br/>(VIP Impersonation, Channel Deviation)"]
        N["Network Signal<br/>(Unrecognized ASN, Geo-mismatch)"]
    end

    subgraph Core["AegisNexus Correlation Engine"]
        CE["Correlation & Risk Scoring<br/>(Deterministic Weights + Confidence)"]
        AG["Attack Graph Generator<br/>(Entity & Vector Node Mapping)"]
        PE["NIST AI RMF Policy Engine<br/>(Risk Bands: Low / Med / High / Critical)"]
    end

    subgraph Output["Analyst Command Console"]
        UI["Explainable SOC Dashboard"]
        HI["Human-in-the-Loop Approval Gate"]
        EX["Portable Forensic Export<br/>(JSON / Plain Text)"]
    end

    E --> CE
    U --> CE
    A --> CE
    I --> CE
    N --> CE

    CE --> AG
    CE --> PE
    AG --> UI
    PE --> UI
    UI --> HI
    HI --> EX
```

---

## Key Capabilities

| Capability | Description | Status in POC |
|---|---|---|
| **Cross-Modal Ingestion** | Ingests and correlates Email, URL, Voice Note, Identity, and Network signals into one unified incident timeline. | Implemented |
| **Interactive Attack Graph** | Node-and-link topological visualization of threat relationships, entity associations, and risk contributors. | Implemented (SVG Canvas) |
| **Explainable Risk Scoring** | Transparent 0–100 risk score with confidence intervals and exact formula breakdowns without opaque black-box verdicts. | Implemented |
| **Human-in-the-Loop Response** | High-impact containment actions (isolate account, hold payment, block domain) require explicit analyst confirmation. | Implemented with Audit Log |
| **Incident Recording & Attachments** | Incident entry with support for attaching URLs, raw email files, and audio recordings. | Implemented (Browser Persistence) |
| **Search & Filtering** | Search across incident names, summaries, risk bands, and impacted entities. | Implemented |
| **Forensic Export** | Export to structured JSON or formatted text for SIEM/SOAR handoff. | Implemented |
| **Enterprise Connectors** | Live connectors to Microsoft Graph, Google Workspace, Okta, and enterprise SIEM platforms. | Planned |

---

## Local Setup and Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or later (tested on `v22.x`)
- **Package Manager**: `pnpm` (recommended) or `npm`

### Option 1: Using `pnpm` (Recommended)

```bash
# Clone the repository
git clone https://github.com/sahilshaikh1101/AegisNexus.git
cd AegisNexus

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Option 2: Using `npm`

```bash
# Clone the repository
git clone https://github.com/sahilshaikh1101/AegisNexus.git
cd AegisNexus

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Validation and Build Commands

```bash
# Type check TypeScript codebase
npm run check
# or
pnpm check

# Production bundle build
npm run build
# or
pnpm build
```

---

## Research and Standards Backing

AegisNexus is grounded in established cybersecurity standards and federal guidance:

1. **FBI Business Email Compromise Guidance**  
   Adheres to FBI guidance on domain verification, out-of-band communication, and holding high-value payment requests pending secondary authentication.  
   *Reference:* [FBI Common Frauds & Scams — BEC](https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise) | [IC3 $55.4B PSA](https://www.ic3.gov/PSA/2024/PSA240911)

2. **NIST AI Risk Management Framework (AI RMF 1.0)**  
   Implements core NIST AI RMF characteristics: **Validity, Reliability, Explainability, Transparency, and Human Agency**. Decisions provide visible evidence rationale rather than unexplainable automated blocks.  
   *Reference:* [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)

3. **CISA & NSA Phishing Defense Guidance**  
   Applies secure-by-default and defense-in-depth principles for stopping phishing attack cycles at Phase One.  
   *Reference:* [CISA Phishing Guidance](https://www.cisa.gov/resources-tools/resources/phishing-guidance-stopping-attack-cycle-phase-one)

---

## Repository Structure

```
AegisNexus/
├── client/                     # Frontend Application (React 19 + TypeScript + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # UI primitives & custom components (Map, Dialogs)
│   │   ├── contexts/           # Theme and state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Incident models, scoring algorithms, utility helpers
│   │   ├── pages/              # Primary views: Home (SOC Console), Login, NotFound
│   │   ├── index.css           # Mission-control Brutalism design tokens
│   │   └── main.tsx            # App entry point
│   └── index.html              # HTML shell
├── server/                     # Backend API & server entry point
├── shared/                     # Shared constants and contracts
├── LICENSE                     # MIT License
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

This project is licensed under the [MIT License](LICENSE).
