import { useState, useEffect } from "react";
import { DbUser } from "./types.ts";
import Header from "./components/Header.tsx";
import AuthForm from "./components/AuthForm.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import UserDashboard from "./components/UserDashboard.tsx";
import StoreDashboard from "./components/StoreDashboard.tsx";
import { Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync Auth State from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadUserProfile(storedToken);
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loadUserProfile = async (idToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDbUser(data);
        setError("");
      } else {
        // If token is invalid or expired, clear it
        localStorage.removeItem("token");
        setToken("");
        setDbUser(null);
        setError(data.error || "Session expired. Please log in again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reach platform authentication services.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (idToken: string) => {
    setLoading(true);
    localStorage.setItem("token", idToken);
    setToken(idToken);
    await loadUserProfile(idToken);
  };

  const handleLogout = async () => {
    setLoading(true);
    localStorage.removeItem("token");
    setToken("");
    setDbUser(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div id="loading-spinner-container" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-sm text-slate-500 font-medium">Checking authentication...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Login / Register flow if unauthenticated
  if (!dbUser || !token) {
    return (
      <div id="auth-page-container" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200 w-full max-w-md">
                <span>{error}</span>
              </div>
            )}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Render main screen with Header and Dashboards based on roles
  return (
    <div id="app-main-layout" className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={dbUser} token={token} onLogout={handleLogout} />

      <main className="flex-1 bg-slate-50/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={dbUser.role}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {dbUser.role === "admin" && <AdminDashboard token={token} />}
            {dbUser.role === "user" && <UserDashboard token={token} />}
            {dbUser.role === "store_owner" && <StoreDashboard token={token} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
