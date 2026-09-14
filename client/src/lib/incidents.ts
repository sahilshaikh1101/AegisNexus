export type SignalType = "EMAIL" | "URL" | "AUDIO" | "IDENTITY" | "NETWORK";
export type SignalColor = "cyan" | "magenta" | "amber";
export type IncidentStatus = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ResponseState = "pending" | "contained";

export interface IncidentAttachment {
  id: string;
  name: string;
  kind: "EMAIL" | "URL" | "VOICE" | "FILE";
  mime: string;
  size: number;
  url?: string;
  dataUrl?: string;
}

export interface IncidentSignal {
  id: string;
  label: string;
  type: SignalType;
  source: string;
  score: number;
  color: SignalColor;
  detail: string;
  mitreId?: string;
}

export interface Incident {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  status: IncidentStatus;
  confidence: number;
  impacted: string;
  received: string;
  createdAt: string;
  responseState: ResponseState;
  notes: string;
  signals: IncidentSignal[];
  relationships: string[];
  attachments?: IncidentAttachment[];
}

const criticalSignals: IncidentSignal[] = [
  { id: "email", label: "Urgent payment request", type: "EMAIL", source: "CFO mailbox", score: 20, color: "cyan", mitreId: "T1566.002", detail: "Language pattern matches high-pressure payment fraud." },
  { id: "url", label: "Look-alike payment domain", type: "URL", source: "invoice-portal.co", score: 25, color: "magenta", mitreId: "T1584.001", detail: "Domain differs from the approved finance portal by one character." },
  { id: "audio", label: "Voice note authenticity anomaly", type: "AUDIO", source: "WhatsApp voice note", score: 15, color: "amber", mitreId: "T1656", detail: "Speaker embedding and channel history do not match the executive profile." },
  { id: "identity", label: "Unapproved communication channel", type: "IDENTITY", source: "Unknown mobile", score: 20, color: "magenta", mitreId: "T1586.002", detail: "CFO profile allows email and Teams; this sender used an unknown number." },
  { id: "network", label: "Related infrastructure alert", type: "NETWORK", source: "DNS / 185.91.22.14", score: 15, color: "cyan", mitreId: "T1583.001", detail: "The domain shares infrastructure with two prior blocked indicators." },
];

export const demoIncidents: Incident[] = [
  {
    id: "demo-critical",
    name: "CFO impersonation / payment diversion",
    subtitle: "Five correlated signals across email, voice, identity and network",
    score: 95,
    status: "CRITICAL",
    confidence: 94,
    impacted: "$84,500 payment instruction",
    received: "12 sec ago",
    createdAt: "2026-09-03T09:42:06.000Z",
    responseState: "pending",
    notes: "Hold payment and verify the request through an approved channel.",
    signals: criticalSignals,
    relationships: ["CFO identity → urgent email", "Urgent email → invoice-portal.co", "invoice-portal.co → 185.91.22.14", "Voice note → CFO identity", "185.91.22.14 → prior alert #017"],
  },
  {
    id: "demo-mixed",
    name: "Invoice review with suspicious redirect",
    subtitle: "Legitimate sender with a newly registered destination domain",
    score: 68,
    status: "HIGH",
    confidence: 86,
    impacted: "Vendor bank detail change",
    received: "1 min ago",
    createdAt: "2026-09-03T09:41:18.000Z",
    responseState: "pending",
    notes: "Quarantine the redirect and verify the vendor independently.",
    signals: criticalSignals.map((signal) => ({ ...signal, score: signal.id === "url" ? 25 : Math.round(signal.score * 0.35) })),
    relationships: ["Known vendor identity → invoice email", "Invoice email → invoice-portal.co", "invoice-portal.co → new registration"],
  },
  {
    id: "demo-legitimate",
    name: "Routine finance approval",
    subtitle: "Known sender, approved channel, normal transaction context",
    score: 12,
    status: "LOW",
    confidence: 98,
    impacted: "No high-impact action detected",
    received: "4 min ago",
    createdAt: "2026-09-03T09:38:10.000Z",
    responseState: "pending",
    notes: "Allow, monitor, and log the normal finance workflow.",
    signals: [criticalSignals[0]].map((signal) => ({ ...signal, score: 1, detail: "No anomaly found. Sender, channel, and message behavior align with the executive profile." })),
    relationships: ["Known sender → approved finance mailbox"],
  },
];

const STORAGE_KEY = "aegisnexus.incidents.v1";

export function getStoredIncidents(): Incident[] {
  if (typeof window === "undefined") return demoIncidents;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoIncidents;
    const parsed = JSON.parse(raw) as Incident[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : demoIncidents;
  } catch {
    return demoIncidents;
  }
}

export function saveIncidents(incidents: Incident[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  } catch {
    // Storage can be unavailable in private browsing; the in-memory UI still works.
  }
}

export function statusFromScore(score: number): IncidentStatus {
  if (score >= 85) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export function signalColor(type: SignalType): SignalColor {
  if (type === "URL" || type === "IDENTITY") return "magenta";
  if (type === "AUDIO") return "amber";
  return "cyan";
}

export function createId(prefix = "incident") {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}
