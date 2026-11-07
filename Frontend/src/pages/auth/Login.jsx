import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, UserPlus, EyeOff, Eye, Loader2 } from "lucide-react";
import api from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail]             = useState("");
    const [password, setPassword]       = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/api/auth/login", { email, password });
            login(data);  // ✅ AuthContext handles storage + state

            const routes = {
                admin:    "/admin/dashboard",
                security: "/security/dashboard",
                employee: "/employee/dashboard",
                visitor:  "/visitor/dashboard",
            };
            navigate(routes[data.user.role] || "/login");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* LEFT PANEL */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-linear-to-br from-slate-950 via-indigo-950 to-indigo-700 text-white p-8 lg:p-12 flex-col">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-sm flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-700" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight">VMS Pro</span>
                </div>

                <div className="my-auto max-w-lg">
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                        Secure, seamless visitor<br />management.
                    </h1>
                    <p className="mt-5 text-sm lg:text-base text-indigo-100 leading-relaxed max-w-md">
                        Streamline arrivals, enhance security, and deliver a
                        professional front-desk experience with VMS Pro.
                    </p>
                </div>

                <p className="text-xs text-indigo-300">
                    © 2025 VMS Pro. All rights reserved.
                </p>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">

                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center justify-center gap-3 mb-10">
                        <div className="w-9 h-9 bg-indigo-600 rounded-sm flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-slate-900">VMS Pro</span>
                    </div>

                    <div className="mb-7">
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Sign in to your account
                        </h2>
                        <p className="text-xs text-slate-500 mt-2">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-sm mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-slate-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer transition"
                            >
                                {showPassword
                                    ? <EyeOff className="w-4 h-4" />
                                    : <Eye className="w-4 h-4" />
                                }
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-sm transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                            }
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-500">Or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Pre-register */}
                    <Link
                        to="/register"
                        className="w-full h-11 border border-slate-300 rounded-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        <UserPlus className="w-4 h-4" />
                        I'm a Visitor — Pre-register My Visit
                    </Link>

                </div>
            </div>
        </div>
    );
}