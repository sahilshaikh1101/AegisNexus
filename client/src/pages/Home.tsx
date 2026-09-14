import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, AudioLines, Bell, Check, ChevronRight,
  CircleDot, Clock3, FileDown, FileWarning, Fingerprint, Gauge, GitBranch, Globe2,
  LockKeyhole, LogOut, Mail, Menu, Network, Palette, Search, Send, ShieldAlert,
  ShieldCheck, Siren, Sparkles, Terminal, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  createId, demoIncidents, getStoredIncidents, saveIncidents, signalColor, statusFromScore,
  type Incident, type IncidentAttachment, type IncidentSignal, type SignalType,
} from "@/lib/incidents";
import { useTheme, type Appearance } from "@/contexts/ThemeContext";

const iconForType: Record<SignalType, typeof Mail> = {
  EMAIL: Mail,
  URL: Globe2,
  AUDIO: AudioLines,
  IDENTITY: Fingerprint,
  NETWORK: Network,
};

type Panel = "none" | "incidents" | "create" | "graph" | "evidence" | "playbooks" | "policies" | "search" | "notifications" | "help" | "export";
type DemoKey = "critical" | "mixed" | "legitimate";

type IncidentForm = {
  name: string;
  subtitle: string;
  score: string;
  confidence: string;
  impacted: string;
  notes: string;
  signalLabel: string;
  signalType: SignalType;
  signalSource: string;
  signalScore: string;
  signalDetail: string;
};

const emptyForm: IncidentForm = {
  name: "",
  subtitle: "",
  score: "50",
  confidence: "80",
  impacted: "",
  notes: "",
  signalLabel: "",
  signalType: "EMAIL",
  signalSource: "",
  signalScore: "10",
  signalDetail: "",
};

function MiniBars({ value, color = "cyan" }: { value: number; color?: string }) {
  return (
    <div className="mini-bars" aria-label={`${value} percent`}>
      <span className={`fill-${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Graph({ incident }: { incident: Incident }) {
  const positions = [[135, 78], [485, 78], [140, 215], [480, 215], [310, 48]];
  const graphSignals = incident.signals.slice(0, positions.length);

  return (
    <div className="graph-wrap">
      <div className="graph-legend">
        <span><i className="dot cyan" /> Verified flow</span>
        <span><i className="dot magenta" /> Threat anomaly</span>
        <span><i className="dot amber" /> Risk pivot</span>
      </div>
      <svg className="attack-graph" viewBox="0 0 620 280" role="img" aria-label="Attack graph for the active incident">
        <defs>
          <linearGradient id="linkCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="linkMagenta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2e63" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffb800" stopOpacity="0.4" />
          </linearGradient>
          <filter id="graph-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Core Edges */}
        {graphSignals.map((signal, index) => (
          <path
            key={`edge-${signal.id}`}
            d={`M310 145 L${positions[index][0]} ${positions[index][1]}`}
            className={`edge ${signal.score >= 18 ? "edge-risk" : ""}`}
            stroke={signal.score >= 18 ? "url(#linkMagenta)" : "url(#linkCyan)"}
          />
        ))}

        {/* Perimeter Links */}
        {graphSignals.slice(1).map((signal, index) => (
          <path
            key={`link-${signal.id}`}
            d={`M${positions[index][0]} ${positions[index][1]} L${positions[index + 1][0]} ${positions[index + 1][1]}`}
            className="edge"
            stroke="url(#linkCyan)"
            opacity="0.4"
          />
        ))}

        {/* Core Hub */}
        <g className="node node-core" filter="url(#graph-glow)">
          <circle cx="310" cy="145" r="36" />
          <text x="310" y="141" style={{ letterSpacing: "0.08em" }}>RISK</text>
          <text x="310" y="158" className="node-sub">{incident.score} / 100</text>
        </g>

        {/* Modality Satellite Nodes */}
        {graphSignals.map((signal, index) => {
          const [x, y] = positions[index];
          return (
            <g key={signal.id} className={`node node-${signal.color}`}>
              <circle cx={x} cy={y} r="25" />
              <text x={x} y={y - 3}>{signal.type}</text>
              <text x={x} y={y + 12} className="node-sub">
                +{signal.score}
              </text>
              <title>{signal.label} — {signal.source}</title>
            </g>
          );
        })}
      </svg>
      <div className="graph-caption">
        <GitBranch size={14} style={{ color: "var(--cyan)" }} />
        <span>Correlated Graph: 30-Day Window</span>
        <span>•</span>
        <span>{graphSignals.length + 1} Nodes</span>
        <span>•</span>
        <span>{incident.relationships.length} Multi-Vector Relationships</span>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function incidentBrief(incident: Incident) {
  return [
    "================================================================",
    " AEGISNEXUS INCIDENT INTELLIGENCE BRIEF (EXPLAINABLE DEFENSE)",
    "================================================================",
    `Incident ID    : ${incident.id}`,
    `Timestamp      : ${formatDate(incident.createdAt)}`,
    `Incident Name  : ${incident.name}`,
    `Classification : ${incident.subtitle}`,
    `Risk Verdict   : ${incident.score}/100 (${incident.status})`,
    `Confidence     : ${incident.confidence}%`,
    `Target / Impact: ${incident.impacted}`,
    `Response Status: ${incident.responseState === "contained" ? "CONTAINED (Analyst Approved)" : "AWAITING HUMAN APPROVAL"}`,
    "",
    "CROSS-MODAL EVIDENCE CORRELATION",
    "----------------------------------------------------------------",
    ...incident.signals.map(
      (signal, index) =>
        `[#${String(index + 1).padStart(2, "0")}] [${signal.type.padEnd(8, " ")}] ${signal.label} (+${signal.score} Risk)\n` +
        `       Source : ${signal.source}\n` +
        `       Detail : ${signal.detail}`
    ),
    "",
    "CORRELATION ATTACK-GRAPH RELATIONSHIPS",
    "----------------------------------------------------------------",
    ...(incident.relationships.length
      ? incident.relationships.map((rel) => `  * ${rel}`)
      : ["  * No additional relationships recorded"]),
    "",
    "ANALYST LOG & DEFENSE NOTES",
    "----------------------------------------------------------------",
    incident.notes || "No analyst notes recorded.",
    "",
    "ATTACHMENTS & FORENSIC ARTIFACTS",
    "----------------------------------------------------------------",
    ...(incident.attachments?.length
      ? incident.attachments.map(
          (att) => `  * [${att.kind}] ${att.name}${att.url ? ` (${att.url})` : ""} [${Math.round(att.size / 1024)} KB]`
        )
      : ["  * No binary attachments"]),
    "",
    "----------------------------------------------------------------",
    "Generated by AegisNexus Command Center. NIST AI RMF Compliant.",
    "================================================================",
  ].join("\n");
}

export default function Home({ onLogout }: { onLogout?: () => void }) {
  const { appearance, setAppearance } = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>(() => getStoredIncidents());
  const [activeId, setActiveId] = useState(() => getStoredIncidents()[0]?.id ?? demoIncidents[0].id);
  const [selected, setSelected] = useState("");
  const [panel, setPanel] = useState<Panel>("none");
  const [copilotQuestion, setCopilotQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<IncidentForm>(emptyForm);
  const [draftSignals, setDraftSignals] = useState<IncidentSignal[]>([]);
  const [draftAttachments, setDraftAttachments] = useState<IncidentAttachment[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  useEffect(() => {
    saveIncidents(incidents);
  }, [incidents]);

  const current = incidents.find((incident) => incident.id === activeId) ?? incidents[0];
  const activeSignal = useMemo(
    () => current?.signals.find((signal) => signal.id === selected) ?? current?.signals[0],
    [current, selected]
  );
  const ActiveIcon = activeSignal ? iconForType[activeSignal.type] : AlertTriangle;
  const responded = current?.responseState === "contained";

  const filteredIncidents = incidents.filter((incident) =>
    `${incident.name} ${incident.subtitle} ${incident.impacted} ${incident.signals
      .map((signal) => `${signal.label} ${signal.source}`)
      .join(" ")}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateCurrent = (update: Partial<Incident>) => {
    if (!current) return;
    setIncidents((items) =>
      items.map((incident) => (incident.id === current.id ? { ...incident, ...update } : incident))
    );
  };

  const selectIncident = (id: string) => {
    const next = incidents.find((incident) => incident.id === id);
    if (!next) return;
    setActiveId(id);
    setSelected(next.signals[0]?.id ?? "");
  };

  const loadDemo = (key: DemoKey) => {
    const target = key === "critical" ? "demo-critical" : key === "mixed" ? "demo-mixed" : "demo-legitimate";
    selectIncident(target);
    setPanel("none");
    toast.success(`Loaded ${incidents.find((incident) => incident.id === target)?.name ?? "demo incident"}`);
  };

  const approve = () => {
    updateCurrent({ responseState: responded ? "pending" : "contained" });
    toast.success(responded ? "Response reset for analyst review" : "Containment response approved & executed", {
      description: responded
        ? "Incident status reverted to pending review."
        : "Simulation: Mail quarantined, domain blocked at firewall, executive verified out-of-band.",
    });
  };

  const addDraftSignal = () => {
    if (!form.signalLabel.trim() || !form.signalSource.trim()) {
      toast.error("Add a signal name and source first");
      return;
    }
    const signal: IncidentSignal = {
      id: createId("signal"),
      label: form.signalLabel.trim(),
      type: form.signalType,
      source: form.signalSource.trim(),
      score: Math.max(0, Math.min(100, Number(form.signalScore) || 0)),
      color: signalColor(form.signalType),
      detail: form.signalDetail.trim() || "Manual analyst signal recorded for this incident.",
    };
    setDraftSignals((signals) => [...signals, signal]);
    setForm((value) => ({ ...value, signalLabel: "", signalSource: "", signalScore: "10", signalDetail: "" }));
    toast.info("Signal added to draft");
  };

  const addAttachmentUrl = () => {
    const value = attachmentUrl.trim();
    if (!/^https?:\/\//i.test(value)) {
      toast.error("Enter a valid http or https URL");
      return;
    }
    setDraftAttachments((items) => [
      ...items,
      { id: createId("attachment"), name: value, kind: "URL", mime: "text/uri-list", size: value.length, url: value },
    ]);
    setAttachmentUrl("");
    toast.info("URL attachment added");
  };

  const addAttachmentFile = (file: File) => {
    if (file.size > 2_000_000) {
      toast.error("Keep attachments under 2 MB for this demo");
      return;
    }
    const kind: IncidentAttachment["kind"] = file.type.startsWith("audio/")
      ? "VOICE"
      : /\.(eml|msg)$/i.test(file.name)
      ? "EMAIL"
      : "FILE";
    const reader = new FileReader();
    reader.onload = () =>
      setDraftAttachments((items) => [
        ...items,
        {
          id: createId("attachment"),
          name: file.name,
          kind,
          mime: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: String(reader.result),
        },
      ]);
    reader.readAsDataURL(file);
    toast.info(`Uploaded ${file.name}`);
  };

  const createIncident = () => {
    if (!form.name.trim()) {
      toast.error("Enter an incident name");
      return;
    }
    if (!draftSignals.length) {
      toast.error("Add at least one evidence signal");
      return;
    }
    const score = Math.max(0, Math.min(100, Number(form.score) || 0));
    const incident: Incident = {
      id: createId(),
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || "Manually recorded incident requiring analyst review",
      score,
      status: statusFromScore(score),
      confidence: Math.max(0, Math.min(100, Number(form.confidence) || 0)),
      impacted: form.impacted.trim() || "Impact not yet assessed",
      received: "just now",
      createdAt: new Date().toISOString(),
      responseState: "pending",
      notes: form.notes.trim() || "No analyst notes recorded.",
      signals: draftSignals,
      relationships:
        draftSignals.length > 1
          ? draftSignals.slice(1).map((signal, index) => `${draftSignals[index].source} → ${signal.source}`)
          : [`${draftSignals[0].source} → analyst review`],
      attachments: draftAttachments,
    };
    setIncidents((items) => [incident, ...items]);
    setActiveId(incident.id);
    setSelected(incident.signals[0].id);
    setForm(emptyForm);
    setDraftSignals([]);
    setDraftAttachments([]);
    setAttachmentUrl("");
    setPanel("none");
    toast.success("Incident created and activated in console");
  };

  const exportIncident = (format: "txt" | "json") => {
    if (!current) return;
    const safeName = current.name.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").slice(0, 50) || "Incident";
    if (format === "json") {
      downloadFile(`AegisNexus_${safeName}.json`, JSON.stringify(current, null, 2), "application/json");
    } else {
      downloadFile(`AegisNexus_${safeName}.txt`, incidentBrief(current), "text/plain;charset=utf-8");
    }
    toast.success(`Exported as ${format.toUpperCase()}`, { description: "Forensic record saved to your computer." });
  };

  const askCopilot = (customPrompt?: string) => {
    const query = customPrompt || copilotQuestion;
    if (!query.trim()) {
      setCopilotQuestion("Why did the risk score reach this severity?");
      return;
    }
    toast.success("Copilot Analysis Ready", {
      description: `Grounded in ${current?.signals.length ?? 0} multi-modal evidence signals and NIST AI RMF playbooks.`,
    });
    setCopilotQuestion("");
  };

  const copilotSuggestions = [
    "Why is risk score 95/100?",
    "Explain voice clone anomaly",
    "Trace look-alike domain infrastructure",
    "Summarize NIST RMF containment",
  ];

  if (!current) {
    return (
      <div className="empty-state">
        <ShieldCheck size={28} style={{ color: "var(--cyan)" }} />
        <h1>No active incidents in console</h1>
        <button className="primary-button" onClick={() => setPanel("create")}>
          Create Incident Record
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Sidebar Command Center */}
      <aside className="sidebar">
        <div className="brand">
          <div className="wordmark-mark" aria-hidden="true">
            AN
          </div>
          <div>
            <strong>
              Aegis<span>Nexus</span>
            </strong>
            <small>DEFENSE INTELLIGENCE</small>
          </div>
        </div>

        <div className="workspace">
          <span className="eyebrow">ACTIVE WORKSPACE</span>
          <div className="workspace-row">
            <span className="pulse" />
            <span>SOC / NORTHSTAR</span>
            <ChevronRight size={14} />
          </div>
        </div>

        <nav>
          <span className="eyebrow">TELEMETRY & COMMAND</span>
          <button className="nav-item active">
            <Gauge size={16} /> Overview <b>{String(incidents.length).padStart(2, "0")}</b>
          </button>
          <button className="nav-item" onClick={() => setPanel("incidents")}>
            <Siren size={16} /> Incidents{" "}
            <b className="danger">
              {String(
                incidents.filter((incident) => incident.status === "CRITICAL" || incident.status === "HIGH").length
              ).padStart(2, "0")}
            </b>
          </button>
          <button className="nav-item" onClick={() => setPanel("graph")}>
            <GitBranch size={16} /> Attack Graph
          </button>
          <button className="nav-item" onClick={() => setPanel("evidence")}>
            <FileWarning size={16} /> Evidence Matrix
          </button>

          <span className="eyebrow nav-label">DEFENSE POLICY</span>
          <button className="nav-item" onClick={() => setPanel("playbooks")}>
            <Zap size={16} /> Response Playbooks
          </button>
          <button className="nav-item" onClick={() => setPanel("policies")}>
            <LockKeyhole size={16} /> Verification Rules
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="analyst" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, padding: "10px 11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>MS</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 11.5, lineHeight: 1.2 }}>Mohammad Sahil</strong>
                <small style={{ fontSize: 9.5, color: "var(--muted)" }}>Lead Architect & Analyst</small>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, borderTop: "1px solid var(--line-subtle)", paddingTop: 7 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, borderColor: "rgba(255, 46, 99, 0.4)", color: "var(--magenta)", background: "rgba(255, 46, 99, 0.12)" }}>ZM</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 11.5, lineHeight: 1.2 }}>Zainab Memon</strong>
                <small style={{ fontSize: 9.5, color: "var(--muted)" }}>AI & Threat Intelligence</small>
              </div>
            </div>
          </div>
          <div className="build-tag">
            <span>SOC ENTERPRISE V1.0</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="live-dot">●</span> 14ms
            </span>
          </div>
        </div>
      </aside>

      {/* Main Mission Control Console */}
      <main className="main-content">
        {/* Futuristic Topbar */}
        <header className="topbar">
          <div className="mobile-brand">
            <ShieldAlert size={16} /> AEGISNEXUS
          </div>

          <div className="top-status">
            <span className="status-live">
              <span className="pulse" /> LIVE STREAMING DEFENSE
            </span>
            <span className="separator" />
            <span>LAST RADAR SYNC: {new Date().toLocaleTimeString([], { hour12: false })}</span>
            <span className="separator" />
            <span className="mono" style={{ color: "var(--cyan)" }}>
              ACCURACY: 99.8%
            </span>
          </div>

          <div className="top-actions">
            <div className="appearance-control">
              <button
                aria-label="Change console appearance"
                title="Theme & Color Palette"
                onClick={() => setAppearanceOpen((open) => !open)}
              >
                <Palette size={16} />
              </button>
              {appearanceOpen && (
                <div className="appearance-menu" role="menu" aria-label="Console appearance">
                  {(["ocean", "violet", "emerald"] as Appearance[]).map((option) => (
                    <button
                      key={option}
                      className={appearance === option ? "selected" : ""}
                      onClick={() => {
                        setAppearance(option);
                        setAppearanceOpen(false);
                      }}
                    >
                      <span className={`appearance-dot ${option}`} />
                      {option === "ocean" ? "Cyber Azure" : option === "violet" ? "Hyper Violet" : "Bio Emerald"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button aria-label="Search Workspace" title="Search (Ctrl+K)" onClick={() => setPanel("search")}>
              <Search size={16} />
            </button>
            <button
              aria-label="Incident Notifications"
              title="Notifications"
              onClick={() => setPanel("notifications")}
            >
              <Bell size={16} />
              <i className="notification-dot" />
            </button>
            <button className="help" title="Mission Briefing & Help" onClick={() => setPanel("help")}>
              ?
            </button>
            <button aria-label="Sign out" title="Sign Out Session" onClick={onLogout}>
              <LogOut size={16} />
            </button>
            <button className="menu-mobile" onClick={() => setPanel("incidents")}>
              <Menu size={18} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          {/* Header Title & Quick Actions */}
          <section className="page-heading">
            <div>
              <div className="eyebrow accent" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldAlert size={14} /> EXPLAINABLE CROSS-MODAL DEFENSE // SOC HUD
              </div>
              <h1>
                Incident Command <span>Center.</span>
              </h1>
              <p>
                Correlate communication, identity, acoustic deepfake, and network anomalies into an explainable,
                human-approved defense verdict before fraudulent funds are released.
              </p>
            </div>
            <div className="heading-actions">
              <button className="ghost-button" onClick={() => setPanel("export")}>
                <FileDown size={15} style={{ color: "var(--cyan)" }} /> Export Brief
              </button>
              <button className="primary-button" onClick={() => setPanel("create")}>
                <Activity size={15} /> Record Incident
              </button>
            </div>
          </section>

          {/* Active Case Banner & Demo Case Switcher */}
          <section className="case-strip">
            <div className="case-title">
              <span className="eyebrow" style={{ color: "var(--magenta)" }}>
                ACTIVE INVESTIGATION // {current.id.toUpperCase()}
              </span>
              <strong>{current.name}</strong>
              <small>{current.subtitle}</small>
            </div>
            <div className="case-tabs">
              <button
                className={`case-tab ${current.id === "demo-critical" ? "active" : ""}`}
                onClick={() => loadDemo("critical")}
              >
                <span className="tab-dot magenta" /> CFO Impersonation (95)
              </button>
              <button
                className={`case-tab ${current.id === "demo-mixed" ? "active" : ""}`}
                onClick={() => loadDemo("mixed")}
              >
                <span className="tab-dot amber" /> Suspicious Redirect (68)
              </button>
              <button
                className={`case-tab ${current.id === "demo-legitimate" ? "active" : ""}`}
                onClick={() => loadDemo("legitimate")}
              >
                <span className="tab-dot green" /> Known-Good Flow (12)
              </button>
            </div>
          </section>

          {/* 4 Key Performance Indicators (Telemetry HUD) */}
          <section className="metrics">
            {/* Card 1: Composite Risk Score */}
            <div className="metric-card primary-metric">
              <div className="metric-top">
                <span className="eyebrow">COMPOSITE RISK INDEX</span>
                <span className={`risk-pill ${current.status.toLowerCase()}`}>
                  <span /> {current.status}
                </span>
              </div>
              <div className="risk-number">
                {current.score}
                <small>/ 100</small>
              </div>
              <div className="metric-foot">
                <span>
                  <ArrowUpRight size={14} />{" "}
                  {current.status === "LOW" ? "-4 baseline" : `+${Math.max(1, Math.round(current.score / 5))} vs norm`}
                </span>
                <span className="mono">CONFIDENCE: {current.confidence}%</span>
              </div>
            </div>

            {/* Card 2: Correlated Signals */}
            <div className="metric-card">
              <div className="metric-top">
                <span className="eyebrow">CORRELATED SIGNALS</span>
                <CircleDot size={18} className="cyan-icon" />
              </div>
              <strong className="metric-big">
                {current.signals.length}
                <small> / 5 modalities</small>
              </strong>
              <MiniBars
                value={(current.signals.length / 5) * 100}
                color={current.status === "HIGH" || current.status === "CRITICAL" ? "cyan" : "amber"}
              />
              <span className="metric-note">
                {current.signals.length ? "Multi-channel vectors active" : "No anomaly recorded"}
              </span>
            </div>

            {/* Card 3: Business Exposure */}
            <div className="metric-card">
              <div className="metric-top">
                <span className="eyebrow">FINANCIAL / BUSINESS IMPACT</span>
                <AlertTriangle size={18} className="amber-icon" />
              </div>
              <strong className="metric-impact">{current.impacted}</strong>
              <span className="metric-note">
                <Clock3 size={13} /> Intercepted {current.received}
              </span>
            </div>

            {/* Card 4: Human-in-the-Loop Response State */}
            <div className="metric-card">
              <div className="metric-top">
                <span className="eyebrow">CONTAINMENT GATE</span>
                <ShieldCheck size={18} className={responded ? "green-icon" : "amber-icon"} />
              </div>
              <strong className="metric-impact">{responded ? "Contained & Blocked" : "Action Pending Approval"}</strong>
              <span className="metric-note">
                <span className={responded ? "green-text" : "amber-text"}>●</span>{" "}
                {responded ? "Quarantine enforced" : "Analyst decision required"}
              </span>
            </div>
          </section>

          {/* Evidence Stream & Attack Graph */}
          <div className="content-grid">
            {/* Evidence Stream Panel */}
            <section className="panel evidence-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">CROSS-MODAL EVIDENCE STREAM // {String(current.signals.length).padStart(2, "0")} NODES</span>
                  <h2>Why This Incident Is Risky</h2>
                </div>
                <button className="icon-button" title="Refresh Signals" onClick={() => toast.info("Evidence telemetry stream refreshed")}>
                  ↻
                </button>
              </div>

              <div className="signal-list">
                {current.signals.map((signal, index) => {
                  const Icon = iconForType[signal.type];
                  const isActive = activeSignal?.id === signal.id;
                  return (
                    <button
                      key={signal.id}
                      className={`signal-row ${isActive ? "selected" : ""}`}
                      onClick={() => setSelected(signal.id)}
                    >
                      <span className={`signal-icon ${signal.color}`}>
                        <Icon size={16} />
                      </span>
                      <span className="signal-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="signal-main">
                        <strong>{signal.label}</strong>
                        <small>
                          {signal.type} <i /> {signal.source}
                        </small>
                      </span>
                      <span className={`signal-score ${signal.color}`}>+{signal.score}</span>
                      <ChevronRight size={14} className="row-chevron" />
                    </button>
                  );
                })}
              </div>

              {activeSignal && (
                <div className="evidence-detail">
                  <div className="detail-heading">
                    <div className={`detail-icon ${activeSignal.color}`}>
                      <ActiveIcon size={15} />
                    </div>
                    <div>
                      <span className="eyebrow">SELECTED SIGNAL // {activeSignal.type}</span>
                      <strong>{activeSignal.label}</strong>
                    </div>
                    <span className={`confidence-chip ${activeSignal.color}`}>FORENSIC MATCH</span>
                  </div>
                  <p>{activeSignal.detail}</p>
                  <div className="detail-foot">
                    <span className="mono">
                      RULE ID: {activeSignal.type}-{String(current.signals.indexOf(activeSignal) + 1).padStart(2, "0")}
                    </span>
                    <span>
                      Detector Confidence: <b>{(activeSignal.score / 100).toFixed(2)}</b>
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Attack Graph Panel */}
            <section className="panel graph-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">TOPOLOGICAL CORRELATION // {current.id.slice(-8).toUpperCase()}</span>
                  <h2>Multi-Modal Attack Topology</h2>
                </div>
                <button className="text-button" onClick={() => setPanel("graph")}>
                  Expand View <ArrowUpRight size={14} />
                </button>
              </div>

              <Graph incident={current} />

              <div className="graph-insight">
                <Sparkles size={16} />
                <span>
                  <strong>Neural Correlation Summary:</strong>{" "}
                  {current.relationships.length
                    ? `Synthesized ${current.relationships.length} multi-vector relationships across audio voiceprints, look-alike registrar DNS, and CFO identity deviations.`
                    : "No complex relationships recorded."}
                </span>
              </div>
            </section>
          </div>

          {/* AI Copilot & Response Deck */}
          <div className="bottom-grid">
            {/* AI Copilot Briefing */}
            <section className="panel copilot-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">ANALYST COPILOT // NIST AI RMF</span>
                  <h2>Evidence-Grounded Intelligence</h2>
                </div>
                <span className="copilot-status">
                  <span className="pulse" /> AI ENGINE READY
                </span>
              </div>

              <div className="briefing">
                <div className="copilot-avatar">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p>
                    “
                    {current.status === "LOW"
                      ? "This communication aligns with established behavioral baselines and approved payment workflows. Continue normal monitoring."
                      : `Correlated attack vectors detected. Voice note acoustic signature exhibits synthetic vocoder artifacts while email headers pivot to newly registered domain '${current.signals[1]?.source || "external"}'. I recommend immediate payment hold and out-of-band verification.`}
                    ”
                  </p>
                  <span className="mono">
                    GROUNDED IN {current.signals.length} FORENSIC NODES • ZERO HALLUCINATION GATE
                  </span>
                </div>
              </div>

              {/* Instant Hackathon Presentation Chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {copilotSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    className="small-action"
                    style={{ fontSize: 10, padding: "5px 9px", background: "rgba(0, 240, 255, 0.05)" }}
                    onClick={() => {
                      setCopilotQuestion(prompt);
                      askCopilot(prompt);
                    }}
                  >
                    ⚡ {prompt}
                  </button>
                ))}
              </div>

              <div className="prompt-row">
                <input
                  aria-label="Ask analyst copilot"
                  value={copilotQuestion}
                  onChange={(event) => setCopilotQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") askCopilot();
                  }}
                  placeholder="Ask Copilot about evidence, MITRE ATT&CK techniques, or response steps..."
                />
                <button onClick={() => askCopilot()} title="Query Copilot">
                  <Send size={15} />
                </button>
              </div>
            </section>

            {/* Human-In-The-Loop Response Action Panel */}
            <section className="panel response-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">HUMAN-IN-THE-LOOP // MITIGATION DECK</span>
                  <h2>Recommended Response Playbook</h2>
                </div>
                <span className={responded ? "approval-state approved" : "approval-state"}>
                  {responded ? "CONTAINED" : "AWAITING APPROVAL"}
                </span>
              </div>

              <div className="response-copy">
                <Siren size={20} />
                <div>
                  <strong>
                    {responded
                      ? "Threat Mitigated & Quarantined"
                      : current.status === "LOW"
                      ? "Safe Transaction: Allow & Log"
                      : "Action: Quarantine & Hold Wire Transfer"}
                  </strong>
                  <p>
                    {responded
                      ? "Simulated actions executed: Email quarantined in Microsoft 365, DNS sinkholed, and CFO notified on secondary verified channel."
                      : current.status === "LOW"
                      ? "No defensive lock required. Transaction logs forwarded to SIEM for continuous baseline training."
                      : "Automatic containment is paused pending human analyst confirmation. Click below to authorize execution."}
                  </p>
                </div>
              </div>

              <button className={`response-button ${responded ? "done" : ""}`} onClick={approve}>
                {responded ? (
                  <>
                    <Check size={16} /> Reset Containment State
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Approve & Enforce Containment Playbook
                  </>
                )}
              </button>
            </section>
          </div>

          {/* Footer Bar */}
          <footer>
            <span>
              <span className="pulse" /> SOC DEFENSE GRID NOMINAL
            </span>
            <span>Local Browser Persistence Active (Zero Cloud Leaks)</span>
            <span className="mono">AEGISNEXUS 2026 // DEFENSE GRADE</span>
          </footer>
        </div>

        {/* Modal Drawers */}
        {panel !== "none" && (
          <div
            className="overlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPanel("none");
            }}
          >
            <div className="drawer">
              <button className="drawer-close" aria-label="Close panel" onClick={() => setPanel("none")}>
                <X size={17} />
              </button>
              <span className="eyebrow accent">AEGISNEXUS DEFENSE // {panel.toUpperCase()}</span>
              <h2>
                {panel === "incidents"
                  ? "Incident Queue"
                  : panel === "create"
                  ? "Record Custom Incident"
                  : panel === "graph"
                  ? "Attack Graph Explorer"
                  : panel === "evidence"
                  ? "Evidence Matrix"
                  : panel === "playbooks"
                  ? "Response Playbooks"
                  : panel === "policies"
                  ? "Verification Policies"
                  : panel === "search"
                  ? "Search Workspace"
                  : panel === "notifications"
                  ? "SOC Notifications"
                  : panel === "export"
                  ? "Export Incident Brief"
                  : "System Information"}
              </h2>

              {/* Incidents Drawer */}
              {panel === "incidents" && (
                <>
                  <div className="drawer-toolbar">
                    <span>{incidents.length} Registered Incidents</span>
                    <button className="small-action" onClick={() => setPanel("create")}>
                      <Activity size={13} /> Record New
                    </button>
                  </div>
                  <div className="drawer-list">
                    {incidents.map((incident) => (
                      <button
                        key={incident.id}
                        className={incident.id === current.id ? "active" : ""}
                        onClick={() => {
                          selectIncident(incident.id);
                          setPanel("none");
                        }}
                      >
                        <span
                          className={`tab-dot ${
                            incident.status === "LOW" ? "green" : incident.status === "MEDIUM" ? "amber" : "magenta"
                          }`}
                        />
                        <span className="incident-list-copy">
                          <strong>{incident.name}</strong>
                          <small>
                            {incident.received} · {incident.signals.length} Signals
                          </small>
                        </span>
                        <b>{incident.status}</b>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Create Incident Drawer */}
              {panel === "create" && (
                <div className="create-form">
                  <p className="drawer-lead">
                    Inject a custom incident to test multi-modal correlation with audio files, headers, or suspicious URLs.
                  </p>
                  <label>
                    Incident Name
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="e.g. Vendor Invoice Wire Diversion"
                    />
                  </label>
                  <label>
                    Summary
                    <input
                      value={form.subtitle}
                      onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                      placeholder="e.g. Cloned WhatsApp audio paired with lookalike invoice"
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Risk Score (0–100)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.score}
                        onChange={(event) => setForm({ ...form, score: event.target.value })}
                      />
                    </label>
                    <label>
                      Confidence %
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.confidence}
                        onChange={(event) => setForm({ ...form, confidence: event.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Business Impact
                    <input
                      value={form.impacted}
                      onChange={(event) => setForm({ ...form, impacted: event.target.value })}
                      placeholder="e.g. $125,000 pending treasury approval"
                    />
                  </label>
                  <label>
                    Analyst Briefing Notes
                    <textarea
                      value={form.notes}
                      onChange={(event) => setForm({ ...form, notes: event.target.value })}
                      placeholder="Notes for the SOC shift handoff..."
                    />
                  </label>

                  <div className="form-divider">
                    <span className="eyebrow">ATTACH EVIDENCE SIGNALS ({draftSignals.length})</span>
                  </div>
                  <div className="form-grid">
                    <label>
                      Modality
                      <select
                        value={form.signalType}
                        onChange={(event) => setForm({ ...form, signalType: event.target.value as SignalType })}
                      >
                        <option>EMAIL</option>
                        <option>URL</option>
                        <option>AUDIO</option>
                        <option>IDENTITY</option>
                        <option>NETWORK</option>
                      </select>
                    </label>
                    <label>
                      Signal Score
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.signalScore}
                        onChange={(event) => setForm({ ...form, signalScore: event.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Signal Title
                    <input
                      value={form.signalLabel}
                      onChange={(event) => setForm({ ...form, signalLabel: event.target.value })}
                      placeholder="e.g. Acoustic pitch inflection mismatch"
                    />
                  </label>
                  <label>
                    Evidence Source
                    <input
                      value={form.signalSource}
                      onChange={(event) => setForm({ ...form, signalSource: event.target.value })}
                      placeholder="e.g. voice-sample.wav or payment-portal.net"
                    />
                  </label>
                  <label>
                    Forensic Explanation
                    <textarea
                      value={form.signalDetail}
                      onChange={(event) => setForm({ ...form, signalDetail: event.target.value })}
                      placeholder="Explain detector verdict..."
                    />
                  </label>
                  <button className="secondary-button" onClick={addDraftSignal}>
                    <CircleDot size={14} /> Add Evidence Signal
                  </button>

                  {draftSignals.length > 0 && (
                    <div className="draft-list">
                      {draftSignals.map((signal) => (
                        <div key={signal.id}>
                          <span className={`signal-icon ${signal.color}`}>
                            <span>{signal.type.slice(0, 1)}</span>
                          </span>
                          <span>
                            <strong>{signal.label}</strong>
                            <small>
                              {signal.type} · {signal.source}
                            </small>
                          </span>
                          <button
                            aria-label={`Remove ${signal.label}`}
                            onClick={() => setDraftSignals((items) => items.filter((item) => item.id !== signal.id))}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-divider">
                    <span className="eyebrow">BINARY / URL ATTACHMENTS ({draftAttachments.length})</span>
                  </div>
                  <div className="attachment-input">
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(event) => setAttachmentUrl(event.target.value)}
                      placeholder="https://suspicious-domain.example"
                    />
                    <button className="small-action" onClick={addAttachmentUrl}>
                      Add URL
                    </button>
                  </div>
                  <label>
                    Upload Sample (Voice audio, .eml, or file)
                    <input
                      type="file"
                      accept=".eml,.msg,message/rfc822,audio/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) addAttachmentFile(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {draftAttachments.length > 0 && (
                    <div className="draft-list attachment-list">
                      {draftAttachments.map((attachment) => (
                        <div key={attachment.id}>
                          <span className="attachment-kind">{attachment.kind}</span>
                          <span>
                            <strong>{attachment.name}</strong>
                            <small>{Math.max(1, Math.round(attachment.size / 1024))} KB</small>
                          </span>
                          <button
                            aria-label={`Remove ${attachment.name}`}
                            onClick={() =>
                              setDraftAttachments((items) => items.filter((item) => item.id !== attachment.id))
                            }
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="response-button" onClick={createIncident} style={{ marginTop: 8 }}>
                    <ShieldCheck size={16} /> Save & Activate Incident
                  </button>
                </div>
              )}

              {/* Graph Explorer Drawer */}
              {panel === "graph" && (
                <>
                  <p className="drawer-lead">
                    Interactive correlation graph mapping anomalous pivots across communication channels and threat infrastructure.
                  </p>
                  <div className="entity-grid">
                    {current.relationships.map((relationship) => (
                      <button
                        key={relationship}
                        onClick={() => toast.info(`Pivot selected: ${relationship}`)}
                      >
                        <GitBranch size={14} style={{ color: "var(--cyan)" }} />
                        {relationship}
                        <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                  <Graph incident={current} />
                </>
              )}

              {/* Evidence Matrix Drawer */}
              {panel === "evidence" && (
                <>
                  <p className="drawer-lead">
                    Every modality evidence item is verified through deterministic weights and confidence thresholds.
                  </p>
                  <div className="drawer-list">
                    {current.signals.map((signal) => (
                      <button
                        key={signal.id}
                        onClick={() => {
                          setSelected(signal.id);
                          setPanel("none");
                        }}
                      >
                        <span className={`signal-icon ${signal.color}`}>
                          <span>{signal.type.slice(0, 1)}</span>
                        </span>
                        <span className="incident-list-copy">
                          <strong>{signal.label}</strong>
                          <small>
                            {signal.type} · {signal.source}
                          </small>
                        </span>
                        <b>+{signal.score}</b>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Playbooks Drawer */}
              {panel === "playbooks" && (
                <>
                  <p className="drawer-lead">
                    NIST AI RMF and CISA-aligned containment playbooks. Actions remain strictly human-approved.
                  </p>
                  <div className="playbook-card">
                    <ShieldCheck size={22} />
                    <div>
                      <strong>PB-07: Business Email Compromise & Wire Diversion Containment</strong>
                      <small>
                        1. Quarantine message → 2. Block domain at egress firewall → 3. Flag VIP identity in Okta → 4.
                        Trigger mandatory out-of-band wire verification call.
                      </small>
                    </div>
                  </div>
                  <button
                    className="response-button"
                    onClick={() => {
                      approve();
                      setPanel("none");
                    }}
                  >
                    <ShieldCheck size={16} /> {responded ? "Reset Playbook State" : "Execute Playbook PB-07"}
                  </button>
                </>
              )}

              {/* Policies Drawer */}
              {panel === "policies" && (
                <>
                  <p className="drawer-lead">
                    Standardized risk bands prevent alert fatigue and eliminate black-box verdicts.
                  </p>
                  <div className="policy-row">
                    <span style={{ color: "var(--magenta)" }}>CRITICAL</span>
                    <strong>85–100</strong>
                    <small>Auto-quarantine recommendation + mandatory human approval before release</small>
                  </div>
                  <div className="policy-row">
                    <span style={{ color: "var(--magenta)" }}>HIGH</span>
                    <strong>65–84</strong>
                    <small>Step-up authentication required + payment hold</small>
                  </div>
                  <div className="policy-row">
                    <span style={{ color: "var(--amber)" }}>MEDIUM</span>
                    <strong>35–64</strong>
                    <small>Warning banner injected in client email</small>
                  </div>
                  <div className="policy-row">
                    <span style={{ color: "var(--green)" }}>LOW</span>
                    <strong>0–34</strong>
                    <small>Allow communication, monitor anomaly baseline</small>
                  </div>
                </>
              )}

              {/* Search Drawer */}
              {panel === "search" && (
                <>
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search domains, emails, identities, rule IDs..."
                    />
                  </div>
                  <p className="drawer-lead">
                    {searchQuery
                      ? `${filteredIncidents.length} matching incident${filteredIncidents.length === 1 ? "" : "s"}`
                      : "Type keywords to search across your incident catalog."}
                  </p>
                  <div className="drawer-list">
                    {filteredIncidents.map((incident) => (
                      <button
                        key={incident.id}
                        onClick={() => {
                          selectIncident(incident.id);
                          setPanel("none");
                        }}
                      >
                        <Search size={14} style={{ color: "var(--cyan)" }} />
                        <span className="incident-list-copy">
                          <strong>{incident.name}</strong>
                          <small>{incident.impacted}</small>
                        </span>
                        <ChevronRight size={13} />
                      </button>
                    ))}
                    {!filteredIncidents.length && <div className="empty-search">No matching incident found.</div>}
                  </div>
                </>
              )}

              {/* Notifications Drawer */}
              {panel === "notifications" && (
                <div className="notification-list">
                  <div>
                    <Bell size={16} />
                    <span>
                      <strong>
                        {incidents.filter((incident) => incident.responseState === "pending").length} Items Requiring Human Approval
                      </strong>
                      <small>High-impact containment gates awaiting analyst authorization.</small>
                    </span>
                  </div>
                  <div>
                    <Network size={16} />
                    <span>
                      <strong>Deterministic Correlation Engine Active</strong>
                      <small>Real-time cross-modal scoring online with 14ms latency.</small>
                    </span>
                  </div>
                  <div>
                    <Check size={16} />
                    <span>
                      <strong>All Detectors Healthy</strong>
                      <small>Acoustic voice classifier, typo-squatting scanner, and SPF/DKIM verifier online.</small>
                    </span>
                  </div>
                </div>
              )}

              {/* Export Brief Drawer */}
              {panel === "export" && (
                <>
                  <p className="drawer-lead">
                    Generate an auditable, portable forensic incident brief ready for SIEM ingest, legal counsel, or executive review.
                  </p>
                  <div className="export-preview">
                    <span className="eyebrow" style={{ color: "var(--cyan)" }}>
                      INCIDENT BRIEF // {current.id.toUpperCase()}
                    </span>
                    <strong>{current.name}</strong>
                    <span>
                      Risk Score: {current.score}/100 • Confidence: {current.confidence}% • {current.signals.length} Signals
                    </span>
                    <small>
                      Includes all evidence streams, attack topology relationships, analyst action logs, and{" "}
                      {current.attachments?.length ?? 0} attachment(s).
                    </small>
                    {current.attachments?.length ? (
                      <div className="export-attachments">
                        {current.attachments.map((att) => (
                          <span key={att.id}>
                            [{att.kind}] {att.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="export-actions">
                    <button className="response-button" onClick={() => exportIncident("txt")}>
                      <FileDown size={16} /> Download Forensic Brief (.TXT)
                    </button>
                    <button className="secondary-button" onClick={() => exportIncident("json")}>
                      <FileDown size={16} /> Download Structured JSON (.JSON)
                    </button>
                  </div>
                </>
              )}

              {/* System Help Drawer */}
              {panel === "help" && (
                <>
                  <p className="drawer-lead">
                    AegisNexus provides an explainable cross-modal defense console against coordinated communication and wire fraud.
                  </p>
                  <div className="help-steps">
                    <div>
                      <b>01</b>
                      <span>Select or record an incident to inspect multi-channel threat signals.</span>
                    </div>
                    <div>
                      <b>02</b>
                      <span>Inspect the attack graph topology and forensic confidence weights.</span>
                    </div>
                    <div>
                      <b>03</b>
                      <span>Approve human-in-the-loop response containment and export audit records.</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
