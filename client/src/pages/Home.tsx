import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, AudioLines, Bell, Check, ChevronRight,
  CircleDot, Clock3, FileDown, FileWarning, Fingerprint, Gauge, GitBranch, Globe2,
  LockKeyhole, LogOut, Mail, Menu, Network, Search, Send, ShieldCheck, Siren,
  Sparkles, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  createId, demoIncidents, getStoredIncidents, saveIncidents, signalColor, statusFromScore,
  type Incident, type IncidentAttachment, type IncidentSignal, type SignalType,
} from "@/lib/incidents";

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
  return <div className="mini-bars" aria-label={`${value} percent`}><span className={`fill-${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function Graph({ incident }: { incident: Incident }) {
  const positions = [[145, 75], [475, 72], [150, 230], [472, 228], [310, 50]];
  const graphSignals = incident.signals.slice(0, positions.length);
  return <div className="graph-wrap">
    <div className="graph-legend"><span><i className="dot cyan" />Verified context</span><span><i className="dot magenta" />Anomaly</span><span><i className="dot amber" />Risk node</span></div>
    <svg className="attack-graph" viewBox="0 0 620 300" role="img" aria-label="Attack graph for the active incident">
      <defs><filter id="graph-glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {graphSignals.map((signal, index) => <path key={`edge-${signal.id}`} d={`M310 150 L${positions[index][0]} ${positions[index][1]}`} className={`edge ${signal.score >= 18 ? "edge-risk" : ""}`} />)}
      {graphSignals.slice(1).map((signal, index) => <path key={`link-${signal.id}`} d={`M${positions[index][0]} ${positions[index][1]} L${positions[index + 1][0]} ${positions[index + 1][1]}`} className="edge" />)}
      <g className="node node-core" filter="url(#graph-glow)"><circle cx="310" cy="150" r="34" /><text x="310" y="146">RISK</text><text x="310" y="163" className="node-sub">{incident.score} / 100</text></g>
      {graphSignals.map((signal, index) => {
        const [x, y] = positions[index];
        const Icon = iconForType[signal.type];
        return <g key={signal.id} className={`node node-${signal.color}`}><circle cx={x} cy={y} r="24" /><text x={x} y={y - 3}>{signal.type}</text><text x={x} y={y + 12} className="node-sub">{signal.label.slice(0, 13)}</text><title>{signal.label} — {signal.source}</title><foreignObject x={x - 9} y={y - 9} width="18" height="18" className="graph-icon"><Icon size={0} /></foreignObject></g>;
      })}
    </svg>
    <div className="graph-caption"><GitBranch size={14} /> Correlation window: 30 days <span>•</span> {graphSignals.length + 2} nodes <span>•</span> {incident.relationships.length} relationships</div>
  </div>;
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
    "AEGISNEXUS INCIDENT BRIEF",
    "==========================",
    `Incident ID: ${incident.id}`,
    `Created: ${formatDate(incident.createdAt)}`,
    `Name: ${incident.name}`,
    `Summary: ${incident.subtitle}`,
    `Risk: ${incident.score}/100 (${incident.status})`,
    `Confidence: ${incident.confidence}%`,
    `Business impact: ${incident.impacted}`,
    `Response state: ${incident.responseState === "contained" ? "Contained" : "Awaiting analyst approval"}`,
    "",
    "EVIDENCE",
    "--------",
    ...incident.signals.map((signal, index) => `${String(index + 1).padStart(2, "0")}. [${signal.type}] ${signal.label} | ${signal.source} | +${signal.score}\n    ${signal.detail}`),
    "",
    "CORRELATION RELATIONSHIPS",
    "-------------------------",
    ...(incident.relationships.length ? incident.relationships.map((relationship) => `- ${relationship}`) : ["- No relationships recorded"]),
    "",
    "ANALYST NOTES",
    "-------------",
    incident.notes || "No analyst notes recorded.",
    "",
    "ATTACHMENTS",
    "-----------",
    ...(incident.attachments?.length ? incident.attachments.map((attachment) => `- [${attachment.kind}] ${attachment.name}${attachment.url ? ` | ${attachment.url}` : ""} | ${Math.round(attachment.size / 1024)} KB`) : ["- No attachments recorded"]),
    "",
    "Generated by AegisNexus. Response actions in this environment are simulated.",
  ].join("\n");
}

export default function Home({ onLogout }: { onLogout?: () => void }) {
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

  useEffect(() => {
    saveIncidents(incidents);
  }, [incidents]);

  const current = incidents.find((incident) => incident.id === activeId) ?? incidents[0];
  const activeSignal = useMemo(() => current?.signals.find((signal) => signal.id === selected) ?? current?.signals[0], [current, selected]);
  const ActiveIcon = activeSignal ? iconForType[activeSignal.type] : AlertTriangle;
  const responded = current?.responseState === "contained";
  const filteredIncidents = incidents.filter((incident) => `${incident.name} ${incident.subtitle} ${incident.impacted} ${incident.signals.map((signal) => `${signal.label} ${signal.source}`).join(" ")}`.toLowerCase().includes(searchQuery.toLowerCase()));

  const updateCurrent = (update: Partial<Incident>) => {
    if (!current) return;
    setIncidents((items) => items.map((incident) => incident.id === current.id ? { ...incident, ...update } : incident));
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
    toast.success(responded ? "Response reset for review" : "Response approved and logged", { description: responded ? "The incident is awaiting analyst approval again." : "Simulation: message quarantined, URL blocked, analyst notified." });
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
  };

  const addAttachmentUrl = () => {
    const value = attachmentUrl.trim();
    if (!/^https?:\/\//i.test(value)) { toast.error("Enter a valid http or https URL"); return; }
    setDraftAttachments((items) => [...items, { id: createId("attachment"), name: value, kind: "URL", mime: "text/uri-list", size: value.length, url: value }]);
    setAttachmentUrl("");
  };

  const addAttachmentFile = (file: File) => {
    if (file.size > 2_000_000) { toast.error("Keep attachments under 2 MB for this local POC"); return; }
    const kind: IncidentAttachment["kind"] = file.type.startsWith("audio/") ? "VOICE" : /\.(eml|msg)$/i.test(file.name) ? "EMAIL" : "FILE";
    const reader = new FileReader();
    reader.onload = () => setDraftAttachments((items) => [...items, { id: createId("attachment"), name: file.name, kind, mime: file.type || "application/octet-stream", size: file.size, dataUrl: String(reader.result) }]);
    reader.readAsDataURL(file);
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
      relationships: draftSignals.length > 1 ? draftSignals.slice(1).map((signal, index) => `${draftSignals[index].source} → ${signal.source}`) : [`${draftSignals[0].source} → analyst review`],
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
    toast.success("Incident created", { description: "The new incident is now active and saved in this browser." });
  };

  const exportIncident = (format: "txt" | "json") => {
    if (!current) return;
    const safeName = current.name.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").slice(0, 50) || "Incident";
    if (format === "json") downloadFile(`AegisNexus_${safeName}.json`, JSON.stringify(current, null, 2), "application/json");
    else downloadFile(`AegisNexus_${safeName}.txt`, incidentBrief(current), "text/plain;charset=utf-8");
    toast.success(`Incident ${format.toUpperCase()} exported`, { description: "The file was downloaded to your device." });
  };

  const askCopilot = () => {
    if (!copilotQuestion.trim()) {
      setCopilotQuestion("Why did the risk score increase?");
      return;
    }
    toast.success("Copilot analyzed the incident", { description: `Answer grounded in ${current?.signals.length ?? 0} evidence signals.` });
    setCopilotQuestion("");
  };

  if (!current) return <div className="empty-state"><ShieldCheck size={26} /><h1>No incidents yet</h1><button className="primary-button" onClick={() => setPanel("create")}>Create incident</button></div>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ShieldCheck size={24} /></div><div><strong>Aegis<span>Nexus</span></strong><small>DEFENSE CONSOLE</small></div></div>
      <div className="workspace"><span className="eyebrow">WORKSPACE</span><div className="workspace-row"><span className="pulse" /> SOC / NORTHSTAR <ChevronRight size={14} /></div></div>
      <nav><span className="eyebrow">COMMAND</span><button className="nav-item active"><Gauge size={17} /> Overview <b>{String(incidents.length).padStart(2, "0")}</b></button><button className="nav-item" onClick={() => setPanel("incidents")}><Siren size={17} /> Incidents <b className="danger">{String(incidents.filter((incident) => incident.status === "CRITICAL" || incident.status === "HIGH").length).padStart(2, "0")}</b></button><button className="nav-item" onClick={() => setPanel("graph")}><GitBranch size={17} /> Attack graph</button><button className="nav-item" onClick={() => setPanel("evidence")}><FileWarning size={17} /> Evidence</button><span className="eyebrow nav-label">CONTROL</span><button className="nav-item" onClick={() => setPanel("playbooks")}><Zap size={17} /> Playbooks</button><button className="nav-item" onClick={() => setPanel("policies")}><LockKeyhole size={17} /> Policies</button></nav>
      <div className="sidebar-bottom"><div className="analyst"><div className="avatar">MS</div><div><strong>Mohammad Sahil</strong><small>Lead analyst</small></div><ChevronRight size={14} /></div><div className="build-tag"><span>BUILD 0.9.0</span><span className="live-dot">●</span> LOCAL DATA</div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><ShieldCheck size={20} /> AEGISNEXUS</div><div className="top-status"><span className="status-live"><span className="pulse" /> LIVE MONITORING</span><span className="separator" /><span>LAST SYNC {new Date().toLocaleTimeString([], { hour12: false })}</span><span className="separator" /><span className="mono">LOCAL MODE</span></div><div className="top-actions"><button aria-label="Search" onClick={() => setPanel("search")}><Search size={17} /></button><button aria-label="Notifications" onClick={() => setPanel("notifications")}><Bell size={17} /><i className="notification-dot" /></button><button className="help" onClick={() => setPanel("help")}>?</button><button aria-label="Sign out" title="Sign out" onClick={onLogout}><LogOut size={16} /></button><button className="menu-mobile"><Menu size={18} /></button></div></header>
      <div className="page-wrap">
        <section className="page-heading"><div><div className="eyebrow accent">SEC-01 / INCIDENT OVERVIEW</div><h1>Decision surface <span>for high-risk communication.</span></h1><p>Review an existing incident, record one manually, and export a portable brief without leaving the console.</p></div><div className="heading-actions"><button className="ghost-button" onClick={() => setPanel("export")}><FileDown size={15} /> Export incident</button><button className="primary-button" onClick={() => setPanel("create")}><Activity size={14} /> Record incident</button></div></section>
        <section className="case-strip"><div className="case-title"><span className="eyebrow">ACTIVE INCIDENT</span><strong>{current.name}</strong><small>{current.subtitle}</small></div><div className="case-tabs"><button className={`case-tab ${current.id === "demo-critical" ? "active" : ""}`} onClick={() => loadDemo("critical")}><span className="tab-dot magenta" /> CFO impersonation</button><button className={`case-tab ${current.id === "demo-mixed" ? "active" : ""}`} onClick={() => loadDemo("mixed")}><span className="tab-dot amber" /> Suspicious redirect</button><button className={`case-tab ${current.id === "demo-legitimate" ? "active" : ""}`} onClick={() => loadDemo("legitimate")}><span className="tab-dot green" /> Known-good check</button></div></section>
        <section className="metrics"><div className="metric-card primary-metric"><div className="metric-top"><span className="eyebrow">CURRENT RISK</span><span className={`risk-pill ${current.status.toLowerCase()}`}><span /> {current.status}</span></div><div className="risk-number">{current.score}<small>/100</small></div><div className="metric-foot"><span><ArrowUpRight size={14} /> {current.status === "LOW" ? "-4" : `+${Math.max(1, Math.round(current.score / 5))}`} vs. baseline</span><span className="mono">CONFIDENCE {current.confidence}%</span></div></div><div className="metric-card"><div className="metric-top"><span className="eyebrow">CORRELATED SIGNALS</span><CircleDot size={17} className="cyan-icon" /></div><strong className="metric-big">{current.signals.length}<small> / 5 modalities</small></strong><MiniBars value={current.signals.length / 5 * 100} color={current.status === "HIGH" || current.status === "CRITICAL" ? "cyan" : "amber"} /><span className="metric-note">{current.signals.length ? "Evidence recorded for review" : "No evidence recorded"}</span></div><div className="metric-card"><div className="metric-top"><span className="eyebrow">BUSINESS IMPACT</span><AlertTriangle size={17} className="amber-icon" /></div><strong className="metric-impact">{current.impacted}</strong><span className="metric-note"><Clock3 size={13} /> Received {current.received}</span></div><div className="metric-card"><div className="metric-top"><span className="eyebrow">RESPONSE STATE</span><ShieldCheck size={17} className={responded ? "green-icon" : "amber-icon"} /></div><strong className="metric-impact">{responded ? "Contained" : "Awaiting approval"}</strong><span className="metric-note"><span className={responded ? "green-text" : "amber-text"}>●</span> {responded ? "Analyst action logged" : "Human decision required"}</span></div></section>
        <div className="content-grid"><section className="panel evidence-panel"><div className="panel-header"><div><span className="eyebrow">EVIDENCE STREAM / {String(current.signals.length).padStart(2, "0")}</span><h2>Why this incident is risky</h2></div><button className="icon-button" onClick={() => toast.info("Evidence stream refreshed")}>↻</button></div><div className="signal-list">{current.signals.map((signal, index) => { const Icon = iconForType[signal.type]; const isActive = activeSignal?.id === signal.id; return <button key={signal.id} className={`signal-row ${isActive ? "selected" : ""}`} onClick={() => setSelected(signal.id)}><span className={`signal-icon ${signal.color}`}><Icon size={16} /></span><span className="signal-index">{String(index + 1).padStart(2, "0")}</span><span className="signal-main"><strong>{signal.label}</strong><small>{signal.type} <i /> {signal.source}</small></span><span className={`signal-score ${signal.color}`}>+{signal.score}</span><ChevronRight size={14} className="row-chevron" /></button>; })}</div>{activeSignal && <div className="evidence-detail"><div className="detail-heading"><div className={`detail-icon ${activeSignal.color}`}><ActiveIcon size={15} /></div><div><span className="eyebrow">SELECTED EVIDENCE / {activeSignal.type}</span><strong>{activeSignal.label}</strong></div><span className={`confidence-chip ${activeSignal.color}`}>RECORDED</span></div><p>{activeSignal.detail}</p><div className="detail-foot"><span className="mono">RULE / {activeSignal.type}-{String(current.signals.indexOf(activeSignal) + 1).padStart(2, "0")}</span><span>Detector output <b>{(activeSignal.score / 100).toFixed(2)}</b></span></div></div>}</section>
          <section className="panel graph-panel"><div className="panel-header"><div><span className="eyebrow">CORRELATION LAYER / {current.id.slice(-8).toUpperCase()}</span><h2>Attack graph memory</h2></div><button className="text-button" onClick={() => setPanel("graph")}>Expand <ArrowUpRight size={14} /></button></div><Graph incident={current} /><div className="graph-insight"><Sparkles size={15} /><span><strong>Correlation insight</strong> {current.relationships.length ? `This incident contains ${current.relationships.length} recorded relationship${current.relationships.length === 1 ? "" : "s"} across its evidence.` : "No relationships have been recorded yet."}</span></div></section></div>
        <div className="bottom-grid"><section className="panel copilot-panel"><div className="panel-header"><div><span className="eyebrow">AEGIS COPILOT / GROUNDED</span><h2>Analyst briefing</h2></div><span className="copilot-status"><span className="pulse" /> READY</span></div><div className="briefing"><div className="copilot-avatar"><Sparkles size={17} /></div><div><p>“{current.status === "LOW" ? "This incident aligns with known-good context. Continue monitoring and keep the action reversible." : `This incident is ${current.status.toLowerCase()} risk. I found ${current.signals.length} recorded signal${current.signals.length === 1 ? "" : "s"} and recommend reviewing the evidence before taking action.`}”</p><span className="mono">GENERATED FROM {current.signals.length} EVIDENCE NODES · LOCAL GROUNDED VIEW</span></div></div><div className="prompt-row"><input aria-label="Ask Aegis Copilot" value={copilotQuestion} onChange={(event) => setCopilotQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") askCopilot(); }} placeholder="Ask about this incident..." /><button onClick={askCopilot}><Send size={15} /></button></div></section><section className="panel response-panel"><div className="panel-header"><div><span className="eyebrow">SAFE RESPONSE / PLAYBOOK-07</span><h2>Recommended action</h2></div><span className={responded ? "approval-state approved" : "approval-state"}>{responded ? "APPROVED" : "NEEDS REVIEW"}</span></div><div className="response-copy"><Siren size={18} /><div><strong>{responded ? "Incident contained" : current.status === "LOW" ? "Allow and monitor" : "Hold and verify independently"}</strong><p>{responded ? "Response action logged in the local incident record." : current.status === "LOW" ? "Keep the action reversible and monitor for additional signals." : "Review the evidence, quarantine the message if needed, and verify through an approved channel."}</p></div></div><button className={`response-button ${responded ? "done" : ""}`} onClick={approve}>{responded ? <><Check size={15} /> Reset response state</> : <><ShieldCheck size={15} /> Approve simulated response</>}</button></section></div>
        <footer><span><span className="pulse" /> SYSTEMS NOMINAL</span><span>Incident records persist in this browser</span><span className="mono">NEXUS 2026 / AEGISNEXUS</span></footer>
      </div>
      {panel !== "none" && <div className="overlay" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel("none"); }}><div className="drawer"><button className="drawer-close" aria-label="Close panel" onClick={() => setPanel("none")}><X size={17} /></button><span className="eyebrow accent">AEGISNEXUS / {panel.toUpperCase()}</span><h2>{panel === "incidents" ? "Incident queue" : panel === "create" ? "Record incident" : panel === "graph" ? "Attack graph explorer" : panel === "evidence" ? "Evidence library" : panel === "playbooks" ? "Response playbooks" : panel === "policies" ? "Verification policies" : panel === "search" ? "Search workspace" : panel === "notifications" ? "Analyst notifications" : panel === "export" ? "Export incident" : "About this console"}</h2>
        {panel === "incidents" && <><div className="drawer-toolbar"><span>{incidents.length} saved incident{incidents.length === 1 ? "" : "s"}</span><button className="small-action" onClick={() => setPanel("create")}><Activity size={13} /> Record new</button></div><div className="drawer-list">{incidents.map((incident) => <button key={incident.id} className={incident.id === current.id ? "active" : ""} onClick={() => { selectIncident(incident.id); setPanel("none"); }}><span className={`tab-dot ${incident.status === "LOW" ? "green" : incident.status === "MEDIUM" ? "amber" : "magenta"}`} /><span className="incident-list-copy"><strong>{incident.name}</strong><small>{incident.received} · {incident.signals.length} signal{incident.signals.length === 1 ? "" : "s"}</small></span><b>{incident.status}</b></button>)}</div></>}
        {panel === "create" && <div className="create-form"><p className="drawer-lead">Record an incident manually. Add its evidence signals, choose the risk score, and it will be available from the incident queue.</p><label>Incident name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Suspicious vendor request" /></label><label>Summary<input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="What happened?" /></label><div className="form-grid"><label>Risk score<input type="number" min="0" max="100" value={form.score} onChange={(event) => setForm({ ...form, score: event.target.value })} /></label><label>Confidence<input type="number" min="0" max="100" value={form.confidence} onChange={(event) => setForm({ ...form, confidence: event.target.value })} /></label></div><label>Business impact<input value={form.impacted} onChange={(event) => setForm({ ...form, impacted: event.target.value })} placeholder="e.g. Payment instruction" /></label><label>Analyst notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="What should the next analyst know?" /></label><div className="form-divider"><span className="eyebrow">ADD EVIDENCE / {draftSignals.length}</span></div><div className="form-grid"><label>Signal type<select value={form.signalType} onChange={(event) => setForm({ ...form, signalType: event.target.value as SignalType })}><option>EMAIL</option><option>URL</option><option>AUDIO</option><option>IDENTITY</option><option>NETWORK</option></select></label><label>Signal score<input type="number" min="0" max="100" value={form.signalScore} onChange={(event) => setForm({ ...form, signalScore: event.target.value })} /></label></div><label>Signal name<input value={form.signalLabel} onChange={(event) => setForm({ ...form, signalLabel: event.target.value })} placeholder="e.g. New forwarding rule" /></label><label>Source<input value={form.signalSource} onChange={(event) => setForm({ ...form, signalSource: event.target.value })} placeholder="e.g. finance mailbox" /></label><label>Why it matters<textarea value={form.signalDetail} onChange={(event) => setForm({ ...form, signalDetail: event.target.value })} placeholder="Explain the signal" /></label><button className="secondary-button" onClick={addDraftSignal}><CircleDot size={14} /> Add evidence signal</button>{draftSignals.length > 0 && <div className="draft-list">{draftSignals.map((signal) => <div key={signal.id}><span className={`signal-icon ${signal.color}`}><span>{signal.type.slice(0, 1)}</span></span><span><strong>{signal.label}</strong><small>{signal.type} · {signal.source}</small></span><button aria-label={`Remove ${signal.label}`} onClick={() => setDraftSignals((items) => items.filter((item) => item.id !== signal.id))}><X size={13} /></button></div>)}</div>}<div className="form-divider"><span className="eyebrow">ATTACHMENTS / {draftAttachments.length}</span></div><div className="attachment-input"><input type="url" value={attachmentUrl} onChange={(event) => setAttachmentUrl(event.target.value)} placeholder="https://suspicious-domain.example" /><button className="small-action" onClick={addAttachmentUrl}>Add URL</button></div><label>Email or voice file<input type="file" accept=".eml,.msg,message/rfc822,audio/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) addAttachmentFile(file); event.currentTarget.value = ""; }} /></label>{draftAttachments.length > 0 && <div className="draft-list attachment-list">{draftAttachments.map((attachment) => <div key={attachment.id}><span className="attachment-kind">{attachment.kind}</span><span><strong>{attachment.name}</strong><small>{Math.max(1, Math.round(attachment.size / 1024))} KB</small></span><button aria-label={`Remove ${attachment.name}`} onClick={() => setDraftAttachments((items) => items.filter((item) => item.id !== attachment.id))}><X size={13} /></button></div>)}</div>}<button className="response-button" onClick={createIncident}><ShieldCheck size={15} /> Save and show incident</button></div>}
        {panel === "graph" && <><p className="drawer-lead">Select a connected entity to inspect how the active incident was grouped. The graph is generated from the current incident record.</p><div className="entity-grid">{current.relationships.map((relationship) => <button key={relationship} onClick={() => toast.info(`${relationship} linked to the active incident`)}><GitBranch size={14} />{relationship}<ChevronRight size={13} /></button>)}</div><Graph incident={current} /></>}
        {panel === "evidence" && <><p className="drawer-lead">Every signal below is stored with its source, score, and explanation.</p><div className="drawer-list">{current.signals.map((signal) => <button key={signal.id} onClick={() => { setSelected(signal.id); setPanel("none"); }}><span className={`signal-icon ${signal.color}`}><span>{signal.type.slice(0, 1)}</span></span><span className="incident-list-copy"><strong>{signal.label}</strong><small>{signal.type} · {signal.source}</small></span><b>+{signal.score}</b></button>)}</div></>}
        {panel === "playbooks" && <><p className="drawer-lead">Actions remain human-controlled. Approving this local playbook updates the active incident response state.</p><div className="playbook-card"><ShieldCheck size={19} /><div><strong>Incident review and containment</strong><small>Review · quarantine if needed · verify · log</small></div></div><button className="response-button" onClick={() => { approve(); setPanel("none"); }}><ShieldCheck size={15} /> {responded ? "Reset response state" : "Approve playbook"}</button></>}
        {panel === "policies" && <><p className="drawer-lead">Risk bands keep high-impact actions human-controlled and make the score explainable.</p><div className="policy-row"><span>CRITICAL</span><strong>85–100</strong><small>Open incident + analyst approval</small></div><div className="policy-row"><span>HIGH</span><strong>65–84</strong><small>Quarantine and verify independently</small></div><div className="policy-row"><span>MEDIUM</span><strong>35–64</strong><small>Warn and request verification</small></div><div className="policy-row"><span>LOW</span><strong>0–34</strong><small>Allow, monitor, and log</small></div></>}
        {panel === "search" && <><div className="search-box"><Search size={16} /><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search incidents, domains, identities..." /></div><p className="drawer-lead">{searchQuery ? `${filteredIncidents.length} matching incident${filteredIncidents.length === 1 ? "" : "s"}` : "Search your saved incident records."}</p><div className="drawer-list">{filteredIncidents.map((incident) => <button key={incident.id} onClick={() => { selectIncident(incident.id); setPanel("none"); }}><Search size={14} /><span className="incident-list-copy"><strong>{incident.name}</strong><small>{incident.impacted}</small></span><ChevronRight size={13} /></button>)}{!filteredIncidents.length && <div className="empty-search">No matching incidents.</div>}</div></>}
        {panel === "notifications" && <div className="notification-list"><div><Bell size={15} /><span><strong>{incidents.filter((incident) => incident.responseState === "pending").length} approval item{incidents.filter((incident) => incident.responseState === "pending").length === 1 ? "" : "s"}</strong><small>Incident records waiting for analyst action.</small></span></div><div><Network size={15} /><span><strong>Local persistence active</strong><small>New records are saved in this browser.</small></span></div><div><Check size={15} /><span><strong>Systems nominal</strong><small>All lightweight detectors are responding.</small></span></div></div>}
        {panel === "export" && <><p className="drawer-lead">Download the active incident as a portable text brief or structured JSON record.</p><div className="export-preview"><span className="eyebrow">INCIDENT BRIEF / {current.id.slice(-8).toUpperCase()}</span><strong>{current.name}</strong><span>Risk {current.score}/100 · Confidence {current.confidence}% · {current.signals.length} evidence signals</span><small>Includes evidence, graph relationships, response state, analyst notes, and {current.attachments?.length ?? 0} attachment{(current.attachments?.length ?? 0) === 1 ? "" : "s"}.</small>{current.attachments?.length ? <div className="export-attachments">{current.attachments.map((attachment) => <span key={attachment.id}>{attachment.kind}: {attachment.name}</span>)}</div> : null}</div><div className="export-actions"><button className="response-button" onClick={() => exportIncident("txt")}><FileDown size={15} /> Download brief (.txt)</button><button className="secondary-button" onClick={() => exportIncident("json")}><FileDown size={15} /> Download record (.json)</button></div></>}
        {panel === "help" && <><p className="drawer-lead">AegisNexus correlates communication, identity, media, and network evidence into an explainable decision before money or access is transferred.</p><div className="help-steps"><div><b>01</b><span>Record or select an incident</span></div><div><b>02</b><span>Inspect evidence and relationships</span></div><div><b>03</b><span>Approve, reset, or export</span></div></div></>}
      </div></div>}
    </main>
  </div>;
}
