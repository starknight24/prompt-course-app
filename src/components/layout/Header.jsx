import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import { logOut } from "../../firebaseAuth";
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default function Header({ onToggleSidebar, onOpenFeedback }) {
  const { user, profile, isAdmin } = useUser();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  const initials = (profile?.displayName || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Hamburger (mobile) */}
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30">
            ⚡
          </span>
          <span className="hidden text-lg font-bold text-slate-900 sm:block dark:text-white">
            PromptCraft
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="ml-4 hidden flex-1 md:block lg:max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lessons, modules…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Feedback button */}
          <button
            onClick={onOpenFeedback}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Send Feedback"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {dark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User avatar menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              {initials}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.displayName || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  {isAdmin && (
                    <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      Admin
                    </span>
                  )}
                </div>
                <div className="py-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/bookmarks"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Bookmarks
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Admin Panel
                    </Link>
                  )}
                </div>
                <div className="border-t border-slate-100 py-1 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
