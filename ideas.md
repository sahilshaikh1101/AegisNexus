# AegisNexus design direction

## Three stylistic approaches

### Theme Name: Signal Room
Very dark security-operations interface with precise cyan instrumentation, amber risk states, and magenta identity anomalies. It feels like a calm command center for making high-consequence decisions.

**Probability:** 0.07

### Theme Name: Evidence Ledger
Warm off-white investigative workspace with ink typography, redacted annotations, and archival evidence cards. It makes complex security analysis feel forensic, deliberate, and human-readable.

**Probability:** 0.03

### Theme Name: Glass Protocol
Cool translucent panels, subtle frosted layers, and restrained electric blue highlights over a midnight field. It frames the product as an advanced but disciplined verification instrument.

**Probability:** 0.09

## Selected approach: Signal Room

### Design Movement
Contemporary mission-control brutalism, softened by editorial information design. The interface should feel operational, not decorative: every accent indicates a state, relationship, or action.

### Core Principles
1. **Evidence before drama:** show why an alert is risky before showing the response.
2. **Calm under pressure:** use dark space and controlled hierarchy so high-risk states feel urgent but not chaotic.
3. **Asymmetric command layout:** persistent navigation, a dominant incident canvas, and a narrow evidence rail rather than centered dashboard tiles.
4. **Human-in-the-loop by default:** recommendations can be fast; irreversible actions require explicit analyst approval.

### Color Philosophy
AegisNexus uses a nearly-black navy field as visual quiet. Signal cyan represents verified system activity and connective tissue; electric magenta marks identity or authenticity anomalies; amber marks risk and required attention; restrained green indicates verified or contained states. The colors are semantic, not ornamental.

### Layout Paradigm
A left command rail anchors navigation. The main stage is a wide, asymmetric incident canvas with a risk summary, evidence timeline, and attack graph. Secondary details sit in a right-side evidence rail. Dense information is broken by deliberate empty space and thin rules.

### Signature Elements
- A top telemetry line with live status, environment, and event latency.
- Thin circuit-like connectors and node motifs behind the attack graph.
- Numbered evidence rows with compact mono labels and colored state bars.

### Interaction Philosophy
Interactions should expose evidence progressively. Selecting a signal focuses the related graph node and highlights its contribution to risk. Response controls explain their consequences before committing. Hover states are subtle; active states use a bright edge or rail, never a large glow.

### Animation
Use short 160–240ms ease-out transitions for panels, tabs, evidence selection, and response drawers. Animate only opacity and transform. Stagger first-load evidence rows by 40ms. Let graph nodes gently pulse only when active. Respect reduced-motion preferences.

### Typography System
Use Space Grotesk for display and interface headings, Inter for readable body copy, and JetBrains Mono for telemetry, scores, IDs, timestamps, and code-like evidence labels. Headlines are compact and assertive; body text is short and high-contrast.

### Brand Essence
AegisNexus is an explainable cross-modal defense console for security teams verifying high-risk communication before money, access, or trust is transferred. Personality: **vigilant, lucid, controlled**.

### Brand Voice
Headlines sound decisive and evidence-led. CTAs are specific and operational. Microcopy explains the reason, not just the state.

Example lines:
- “Five signals. One incident. No guesswork.”
- “Hold the action until identity is verified.”

### Wordmark & Logo
The mark is a shield intersected by a small four-node nexus: a protective outline with a central connection point. It should be a bold geometric symbol without text, used in the command rail and favicon.

### Signature Brand Color
**Signal Cyan — #00D9FF**, used sparingly for verified system activity, connective lines, and primary interaction focus.

## Style Decisions
- Keep the product name unified as **AegisNexus**; remove all SentinelFlow references.
- The first prototype is a dashboard, not a marketing landing page.
- Every risk claim must have visible evidence and a confidence indicator.
- “Implemented,” “Simulated,” and “Planned” states must be explicit in the UI.
