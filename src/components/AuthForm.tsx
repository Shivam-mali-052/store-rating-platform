import React, { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  MapPin,
  LogIn,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthFormProps {
  onAuthSuccess: (token: string) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  // States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Field Real-time Validations
  const isNameValid = name.length >= 20 && name.length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid =
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  const isAddressValid = address.length > 0 && address.length <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to sign in. Please check your credentials.");
        }

        onAuthSuccess(data.token);
      } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message || "Failed to sign in.");
      } finally {
        setLoading(false);
      }
    } else {
      // Registration validation
      if (!isNameValid) {
        setError("Name must be min 20 and max 60 characters.");
        return;
      }
      if (!isEmailValid) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!isPasswordValid) {
        setError(
          "Password must be 8-16 characters and contain at least one uppercase letter and one special character."
        );
        return;
      }
      if (!isAddressValid) {
        setError("Address is required and must be at most 400 characters.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            address,
            role: "user", // Registration registers normal users
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to register profile.");
        }

        onAuthSuccess(data.token);
      } catch (err: any) {
        console.error("Signup error:", err);
        setError(err.message || "Failed to sign up.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="auth-form-card" className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100/50 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-slate-500">
          {isLogin ? "Sign in to access your dashboard" : "Register a normal user profile"}
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50">
        <button
          id="btn-tab-signin"
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            isLogin ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign In
        </button>
        <button
          id="btn-tab-signup"
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            !isLogin ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div id="auth-error-alert" className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {/* Sign Up Custom Fields */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    id="input-full-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="20 to 60 characters"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      name ? (isNameValid ? "border-emerald-200 bg-emerald-50/10" : "border-rose-200") : "border-slate-200"
                    }`}
                  />
                </div>
                {name && (
                  <span className={`text-[10px] block mt-1 ${isNameValid ? "text-emerald-600" : "text-rose-500"}`}>
                    {isNameValid ? "Name length is perfect!" : `Name must be min 20 and max 60 chars (Current: ${name.length})`}
                  </span>
                )}
              </div>

              {/* Physical Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
                  <textarea
                    id="input-address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter physical address (max 400 characters)"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                      address ? (isAddressValid ? "border-emerald-200 bg-emerald-50/10" : "border-rose-200") : "border-slate-200"
                    }`}
                  />
                </div>
                {address && (
                  <span className={`text-[10px] block text-right ${isAddressValid ? "text-emerald-600" : "text-rose-500"}`}>
                    {address.length}/400 characters
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="input-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="input-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? "Enter your password" : "8-16 chars, uppercase & special"}
              className={`w-full pl-10 pr-10 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                !isLogin && password
                  ? isPasswordValid
                    ? "border-emerald-200 bg-emerald-50/10"
                    : "border-rose-200"
                  : "border-slate-200"
              }`}
            />
            <button
              id="btn-toggle-password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {!isLogin && password && (
            <div className="text-[10px] space-y-1 mt-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="font-bold text-slate-500 block">Requirements:</span>
              <div className="grid grid-cols-2 gap-1.5 text-slate-500">
                <span className={`flex items-center gap-1 ${password.length >= 8 && password.length <= 16 ? "text-emerald-600" : ""}`}>
                  {password.length >= 8 && password.length <= 16 ? "✓" : "•"} 8-16 characters
                </span>
                <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-emerald-600" : ""}`}>
                  {/[A-Z]/.test(password) ? "✓" : "•"} 1 Uppercase Letter
                </span>
                <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-emerald-600" : ""}`}>
                  {/[^A-Za-z0-9]/.test(password) ? "✓" : "•"} 1 Special Character
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          id="btn-auth-submit"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100/50 transition-all shrink-0 cursor-pointer"
        >
          {isLogin ? <LogIn className="w-4.5 h-4.5" /> : <UserPlus className="w-4.5 h-4.5" />}
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Register Profile"}
        </button>
      </form>
    </div>
  );
}
