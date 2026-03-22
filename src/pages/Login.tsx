import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { session, signIn, signUp, signInWithGoogle } = useAuth();
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "hsl(234 30% 30% / 0.4)" }} />
            <span className="text-xs text-white/30 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: "hsl(234 30% 30% / 0.4)" }} />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try { await signInWithGoogle(); }
              catch (err: unknown) { setError(err instanceof Error ? err.message : "Google sign-in failed."); setLoading(false); }
            }}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            style={{
              background: "hsl(234 30% 20%)",
              border: "1px solid hsl(234 30% 35% / 0.5)",
              color: "rgba(255,255,255,0.85)",
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "hsl(234 30% 25%)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(234 30% 20%)")}
          >
            {/* Google logo */}
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
