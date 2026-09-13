import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === "analyst@aegisnexus.com" && password === "demo123") {
      localStorage.setItem("aegisnexus.auth", "demo");
      setError("");
      toast.success("Signed in", { description: "Welcome to the AegisNexus analyst console." });
      onSuccess();
    } else {
      setError("Use the demo credentials shown below.");
    }
  };

  return <main className="login-page"><section className="login-card"><div className="login-brand"><div className="brand-mark"><ShieldCheck size={24} /></div><div><strong>Aegis<span>Nexus</span></strong><small>DEFENSE CONSOLE</small></div></div><div className="eyebrow accent">SECURE ACCESS / SOC NORTHSTAR</div><h1>Analyst sign in</h1><p className="login-lead">Access incident recording, evidence review, response approval, and export.</p><form onSubmit={submit}><label>Analyst email<input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="analyst@aegisnexus.com" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></label>{error && <div className="login-error">{error}</div>}<button className="primary-button login-button" type="submit"><LockKeyhole size={15} /> Sign in <ArrowRight size={15} /></button></form><div className="demo-credentials"><span className="eyebrow">DEMO ACCESS</span><strong>analyst@aegisnexus.com</strong><strong>demo123</strong></div><small className="login-disclaimer">POC login only. Production deployment requires secure identity, MFA, roles, sessions, and audit logs.</small></section></main>;
}
