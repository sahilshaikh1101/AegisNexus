import { FormEvent, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { toast } from "sonner";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const autoFillDemo = () => {
    setEmail("analyst@aegisnexus.com");
    setPassword("demo123");
    setError("");
    toast.info("Demo credentials loaded", { description: "Press Sign In to enter the command console." });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === "analyst@aegisnexus.com" && password === "demo123") {
      localStorage.setItem("aegisnexus.auth", "demo");
      setError("");
      toast.success("Access Granted", { description: "Welcome to the AegisNexus analyst command center." });
      onSuccess();
    } else {
      setError("Invalid credentials. Click 'Auto-fill Demo Credentials' below to proceed.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="wordmark-mark" aria-hidden="true">
            AN
          </div>
          <div>
            <strong>
              Aegis<span>Nexus</span>
            </strong>
            <small>DEFENSE INTELLIGENCE CONSOLE</small>
          </div>
        </div>

        <div className="eyebrow accent" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={13} /> SECURE GATEWAY / ZERO-TRUST SOC
        </div>
        <h1>Analyst sign in</h1>
        <p className="login-lead">
          AI-orchestrated cross-modal defense console against coordinated communication and wire fraud.
        </p>

        <form onSubmit={submit}>
          <label>
            Analyst email
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="analyst@aegisnexus.com"
              required
            />
          </label>
          <label>
            Master password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="primary-button login-button" type="submit">
            <LockKeyhole size={15} /> Authenticate Session <ArrowRight size={15} />
          </button>
        </form>

        <div className="demo-credentials">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="eyebrow" style={{ color: "var(--cyan)", display: "flex", alignItems: "center", gap: 5 }}>
              <KeyRound size={12} /> DEMO ENVIRONMENT
            </span>
            <button
              type="button"
              onClick={autoFillDemo}
              className="text-button"
              style={{ fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <Sparkles size={12} /> Auto-fill (1-Click)
            </button>
          </div>
          <strong>analyst@aegisnexus.com</strong>
          <strong>demo123</strong>
        </div>

        <small className="login-disclaimer">
          Hackathon & Executive Showcase Edition • NIST AI RMF & MITRE ATT&CK Aligned
        </small>
      </section>
    </main>
  );
}
