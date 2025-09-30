import { useState } from "react";
import { signUp } from "../firebaseAuth";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
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
      await signUp(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2),_transparent_55%)]" />
      <div className="absolute -top-20 left-10 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-500/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 md:grid-cols-[1fr_1.05fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-cyan-500/20 backdrop-blur-lg">
            <div className="absolute -top-24 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-500/40 blur-2xl" />
            <div className="absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-100">
                New Cohort
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
                Learn prompt engineering with interactive labs and live feedback.
              </h1>
              <p className="mt-5 max-w-sm text-sm text-slate-100/80">
                Master workflows trusted by product designers, marketers, and builders. Activate a personal workspace built for experimentation.
              </p>

              <div className="mt-8 grid gap-4 text-sm text-slate-100/90">
                {["Curated templates to jumpstart ideation", "Weekly challenges with peer solutions", "Progress timeline that celebrates streaks"].map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/40">
                      ✓
                    </span>
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/70 p-10 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <div className="absolute inset-px rounded-[calc(1.5rem-2px)] bg-slate-950/70" />
            <div className="relative">
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-semibold text-white">Create your account</h2>
                <p className="mt-2 text-sm text-slate-300/90">
                  It only takes a minute to unlock the full curriculum.
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
                      className="input-field rounded-xl border border-slate-700/60 bg-slate-900/60 text-white placeholder-slate-500/70 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40"
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
                      placeholder="Create a password"
                      required
                      className="input-field rounded-xl border border-slate-700/60 bg-slate-900/60 text-white placeholder-slate-500/70 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-white/40 to-transparent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
                  <span className="relative">{loading ? "Creating Account..." : "Create Account"}</span>
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
