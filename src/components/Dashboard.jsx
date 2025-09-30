import { auth } from "../firebase";
import { logOut } from "../firebaseAuth";
import { useNavigate } from "react-router-dom";
import useLessons from "../hooks/useLessons";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { lessons, loading } = useLessons();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  const getUserInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const totalLessons = lessons.length;
  const progressPercent = totalLessons ? Math.min(totalLessons * 12, 100) : 8;
  const recommendedLessons = lessons.slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.22),_transparent_55%)]" />
      <div className="absolute -top-36 -left-24 h-96 w-96 rounded-full bg-blue-500/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-500/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="border-b border-white/10 bg-slate-950/60 px-6 py-5 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-semibold text-white shadow-lg shadow-blue-500/40">
                ⚡
              </span>
              <div>
                <h1 className="text-xl font-semibold">Prompt Engineering Studio</h1>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-200/80">
              <span>{getGreeting()}, {auth.currentUser?.email?.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/20 px-4 py-2 font-medium text-red-100 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-500/30"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 pb-12 pt-10 lg:flex-row">
          <aside className="order-2 w-full space-y-6 lg:order-1 lg:w-80">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/20 backdrop-blur-xl">
              <div className="mb-6 flex items-center space-x-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xl font-semibold text-white shadow-lg shadow-blue-500/40">
                  {getUserInitials(auth.currentUser?.email)}
                </div>
                <div>
                  <p className="text-sm text-blue-100/80">Creator</p>
                  <h3 className="text-lg font-semibold text-white">
                    {auth.currentUser?.email?.split('@')[0] || "Learner"}
                  </h3>
                  <p className="text-xs text-slate-200/80">{auth.currentUser?.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-blue-100/70">
                  <span>Progress</span>
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-200/80">
                  <span>Daily streak</span>
                  <span className="inline-flex items-center space-x-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-blue-100">
                    <span>🔥</span>
                    <span>1 day</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-200/80">
                Quick stats
              </h4>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-slate-200/80">Total lessons</span>
                  <span className="text-white font-semibold">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-transparent px-4 py-3 text-slate-200/80">
                  <span>In progress</span>
                  <span className="text-blue-200 font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200/80">
                  <span>Completed</span>
                  <span className="text-green-200 font-semibold">0</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6 shadow-2xl shadow-blue-500/30 backdrop-blur-xl">
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
                Focus tip
              </h4>
              <p className="mt-4 text-sm text-blue-50/90">
                Schedule a 25 minute sprint to review yesterday's prompts, then experiment with a fresh tone or persona.
              </p>
            </div>
          </aside>

          <main className="order-1 flex-1 space-y-8 lg:order-2">
            <section className="overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent p-8 shadow-2xl shadow-blue-500/30 backdrop-blur-xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-100/80">
                    {getGreeting()}, {auth.currentUser?.email?.split('@')[0] || 'Creator'}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
                    Let’s build sharper prompts today.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-blue-100/80">
                    Continue your journey with curated lessons and hands-on tasks designed to make your AI workflows more intentional and reliable.
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-white shadow-inner">
                  <div className="flex items-center justify-between">
                    <span>Next milestone</span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white">
                      Strategy Lab
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-blue-100/80">
                    <span>Lessons unlocked</span>
                    <span className="text-white font-semibold">{totalLessons}</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Available lessons</h3>
                  <p className="text-sm text-slate-300/90">
                    {totalLessons} lesson{totalLessons === 1 ? '' : 's'} ready for your next deep dive.
                  </p>
                </div>
                <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200/80">
                  <span>📚</span>
                  <span>Learning path</span>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-white/10 bg-white/5 py-16 shadow-2xl shadow-blue-500/10">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  <span className="text-sm text-slate-300/90">Loading lessons...</span>
                </div>
              ) : totalLessons === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl shadow-blue-500/10">
                  <p className="text-lg text-slate-200/80">No lessons available yet.</p>
                  <p className="mt-2 text-sm text-slate-300/70">
                    Check back soon for new drops crafted by the course team.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {lessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-lg transition-transform duration-300 hover:-translate-y-1 hover:border-blue-400/40"
                    >
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-2xl" />
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-semibold text-white shadow-lg shadow-blue-500/40">
                          {index + 1}
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200/80">
                          Lesson {lesson.order || index + 1}
                        </span>
                      </div>
                      <h4 className="relative mt-6 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-blue-100">
                        {lesson.title}
                      </h4>
                      <p className="relative mt-3 text-sm leading-relaxed text-slate-200/80 line-clamp-3">
                        {lesson.description}
                      </p>
                      <div className="relative mt-6 flex items-center justify-between text-xs text-blue-100/80">
                        <span className="inline-flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>Available now</span>
                        </span>
                        <span className="inline-flex items-center space-x-2 text-blue-100">
                          <span>Start lesson</span>
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {recommendedLessons.length > 0 && (
              <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-lg">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Recommended next steps</h3>
                    <p className="text-sm text-slate-300/80">
                      A quick playlist based on the latest modules.
                    </p>
                  </div>
                  <span className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-blue-100/80">
                    <span>✨</span>
                    <span>Fresh drops</span>
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {recommendedLessons.map((item, idx) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-200/80">
                      <span className="text-xs uppercase tracking-[0.3em] text-blue-100/70">
                        Step {idx + 1}
                      </span>
                      <p className="mt-3 text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-2 line-clamp-3 text-xs text-slate-300/80">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
