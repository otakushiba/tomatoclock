import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { session, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setMessage("Account created! Check your email to confirm your address.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4"
      style={{ background: "hsl(234 30% 10%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">🍅 FocusFlow</h1>
          <p className="mt-2 text-white/40 text-sm">Stay focused, one pomodoro at a time.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "hsl(234 30% 15% / 0.8)",
            border: "1px solid hsl(234 30% 30% / 0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Mode toggle */}
          <div className="flex rounded-xl mb-6 p-1" style={{ background: "hsl(234 30% 10%)" }}>
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setMessage(null); }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: mode === m ? "hsl(234 30% 28%)" : "transparent",
                  color: mode === m ? "white" : "hsl(234 10% 50%)",
                }}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "hsl(234 30% 10%)",
                  border: "1px solid hsl(234 30% 30% / 0.5)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(234 60% 60% / 0.8)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(234 30% 30% / 0.5)")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "hsl(234 30% 10%)",
                  border: "1px solid hsl(234 30% 30% / 0.5)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(234 60% 60% / 0.8)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(234 30% 30% / 0.5)")}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}
            {message && (
              <p className="text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: "hsl(234 60% 55%)", color: "white" }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "hsl(234 60% 62%)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(234 60% 55%)")}
            >
              {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
