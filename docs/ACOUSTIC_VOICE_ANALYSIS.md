# Acoustic Voice Deepfake Detection & Telemetry Architecture

**Author:** Zainab Memon (@zainab-m54)  
**Role:** AI Research & Threat Intelligence Engineer  
**Component:** Audio Modality Anomaly Classifier

---

## 1. Threat Context

Modern Business Email Compromise (BEC) attacks frequently incorporate cloned voice notes via messaging platforms (WhatsApp, Signal, Telegram) to coerce finance personnel into overriding established verification steps.

---

## 2. Detection Methodology

AegisNexus evaluates voice notes through a dual-stage biometric anomaly pipeline:

### Stage 1: Spectral Anomaly Extraction (MFCC & Bispectral Analysis)
- Analyzes high-frequency vocoder phase artifacts typical of neural TTS (Text-to-Speech) engines (ElevenLabs, Bark, XTTS).
- Detects harmonic consistency degradation between 4 kHz – 8 kHz bands.

### Stage 2: Speaker Embedding Vector Distance
- Compares incoming voice note embedding $v_{\text{sample}}$ against the enrolled executive voice baseline $v_{\text{baseline}}$:
$$\text{Cosine Distance} = 1 - \frac{v_{\text{sample}} \cdot v_{\text{baseline}}}{\|v_{\text{sample}}\| \|v_{\text{baseline}}\|}$$
- When distance exceeds threshold $\tau = 0.42$, an authenticity penalty is added to the composite risk score.

---

## 3. Telemetry Integration

- **Signal Output**: `AUDIO: Voice note authenticity anomaly (+15 Risk)`
- **MITRE Technique**: `T1656` (Impersonation)
- **Zero Cloud Leak**: Biometric embeddings computed locally; raw voice files never transmitted externally.
