import { useState } from "react";
import { logIn } from "../firebaseAuth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await logIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_55%)]" />
      <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-blue-500/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="hidden h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-blue-500/20 backdrop-blur lg:flex">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-blue-100">
                PromptCraft
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
                Elevate every prompt with crisp, real-world lessons.
              </h1>
              <p className="mt-4 max-w-sm text-sm text-blue-100/80">
                Dive into curated modules that blend theory, practice, and creative challenges designed for product teams.
              </p>
            </div>
            <div className="space-y-4">
              {["Track your lesson progress in real time", "Unlock workshop-style prompt challenges", "Earn streaks for daily practice"].map((item) => (
                <div key={item} className="flex items-start space-x-3 text-sm text-blue-50/90">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
                    ✦
                  </span>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/70 p-10 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
            <div className="absolute inset-px rounded-[calc(1.5rem-2px)] bg-slate-950/70" />
            <div className="relative">
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-300/90">
                  Sign in to continue your prompt engineering journey.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-field rounded-xl border border-slate-700/60 bg-slate-900/60 text-white placeholder-slate-500/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="input-field rounded-xl border border-slate-700/60 bg-slate-900/60 text-white placeholder-slate-500/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-white/40 to-transparent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
                  <span className="relative">{loading ? "Signing In..." : "Sign In"}</span>
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-blue-300 transition-colors hover:text-blue-200"
                >
                  Create one
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
