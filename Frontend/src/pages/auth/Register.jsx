import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, LogIn, Eye, EyeOff, LoaderCircle } from "lucide-react";
import api from "../../api/api"; 
import { useAuth } from "../../Context/AuthContext";

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [fullName, setFullName]         = useState("");
    const [email, setEmail]               = useState("");
    const [phoneNumber, setPhoneNumber]   = useState("");
    const [password, setPassword]         = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // ✅ Client-side validation before API call
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", {
                name: fullName,
                phone: phoneNumber,
                email,
                password,
            });

            login(data);

            const routes = {
                admin:    "/admin/dashboard",
                security: "/security/dashboard",
                employee: "/employee/dashboard",
                visitor:  "/visitor/dashboard",
            };
            navigate(routes[data.user.role] || "/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
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
                        Create your account.
                        <br />
                        Manage visitors securely.
                    </h1>
                    <p className="mt-5 text-sm lg:text-base text-indigo-100 leading-relaxed max-w-md">
                        Set up your VMS Pro account and make visitor management
                        simple, secure, and professional.
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
                            Create your account
                        </h2>
                        <p className="text-xs text-slate-500 mt-2">
                            Visitor registration — enter your details below.
                        </p>
                    </div>

                    {/* Visitor-only notice */}
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-3 py-2.5 rounded-sm mb-5 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                        <span>
                            This registration is for <strong>visitors only</strong>.
                            If you are staff, contact your admin for access.
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-sm mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Password
                            </label>
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
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !fullName || !email || !phoneNumber || !password}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-sm transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading
                                ? <LoaderCircle className="w-4 h-4 animate-spin" />  // ✅ animate-spin added
                                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                            }
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-500">Or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Back to Login */}
                    <Link
                        to="/login"
                        className="w-full h-11 border border-slate-300 rounded-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        <LogIn className="w-4 h-4" />
                        Already have an account? Sign In
                    </Link>

                </div>
            </div>
        </div>
    );
}