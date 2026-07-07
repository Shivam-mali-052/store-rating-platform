import React, { useState } from "react";
import { DbUser } from "../types.ts";
import { LogOut, User, KeyRound, ShieldAlert, Store, UserCircle, MapPin, Mail, Sparkles, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  user: DbUser;
  token: string;
  onLogout: () => void;
}

export default function Header({ user, token, onLogout }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "UR";

  const roleLabelText =
    user.role === "admin"
      ? "System Administrator"
      : user.role === "store_owner"
      ? "Store Owner"
      : "Normal User";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            System Administrator
          </span>
        );
      case "store_owner":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Store className="w-3.5 h-3.5" />
            Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <UserCircle className="w-3.5 h-3.5" />
            Normal User
          </span>
        );
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password constraints exactly as specified
    if (newPassword.length < 8 || newPassword.length > 16) {
      setError("Password must be between 8 and 16 characters.");
      return;
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasUpper || !hasSpecial) {
      setError("Password must contain at least one uppercase letter and one special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                StoreRate<span className="text-indigo-600">Platform</span>
              </span>
            </div>

            {/* Profile Dropdown / Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {roleLabelText}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600 font-medium text-sm">
                    {initials}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Sidebar/Drawer */}
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-xl flex flex-col border-l border-gray-200"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-lg">My Profile</h3>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{user.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  </div>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</span>
                      <span className="text-sm text-gray-700 block mt-1">{user.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</span>
                      <span className="text-sm text-gray-700 block mt-1">{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password update option for normal users or store owners */}
              {user.role !== "admin" && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Update Password</h3>
                  <p className="text-xs text-gray-500">Secure your account by changing your password</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm flex items-center gap-2 border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2 border border-emerald-200">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter 8-16 characters password"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Must include at least 1 uppercase letter and 1 special character.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Re-enter password"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    {loading ? "Updating..." : "Save Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
