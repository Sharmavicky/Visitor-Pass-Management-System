import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* files */
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../Context/AuthContext";

/* Icons */
import { ShieldCheck, ArrowRight, UserPlus, EyeOff, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data);

            const routes = {
                admin:    "/admin/dashboard",
                security: "/security/dashboard",
                employee: "/employee/dashboard",
                visitor:  "/visitor/dashboard",
            };
            
            navigate(routes[data.user.role] || "/login");
        } catch (error) {
            setError(error.response?.data?.message || "Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-white">

            {/* ================= LEFT SECTION ================= */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-linear-to-br from-slate-950 via-indigo-950 to-indigo-700 text-white p-8 lg:p-12 flex-col">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-sm flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-700" />
                    </div>

                    <span className="text-xl font-semibold tracking-tight">
                        VMS Pro
                    </span>
                </div>

                {/* Main Text */}
                <div className="my-auto max-w-lg">
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                        Secure, seamless visitor
                        <br />
                        management.
                    </h1>

                    <p className="mt-5 text-sm lg:text-base text-indigo-100 leading-relaxed max-w-md">
                        Streamline arrivals, enhance security, and deliver a
                        professional front-desk experience with VMS Pro.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-xs text-indigo-300">
                    © 2024 VMS Pro Technologies. All rights reserved.
                </p>
            </div>


            {/* ================= RIGHT SECTION ================= */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">

                <div className="w-full max-w-md">

                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center justify-center gap-3 mb-10">
                        <div className="w-9 h-9 bg-indigo-600 rounded-sm flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>

                        <span className="text-xl font-semibold text-slate-900">
                            VMS Pro
                        </span>
                    </div>


                    {/* Heading */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Sign in to your account
                        </h2>

                        <p className="text-xs text-slate-500 mt-2">
                            Enter your details to access the dashboard.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-sm mb-5">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Email address
                            </label>

                            <input
                                type="email"
                                placeholder="admin@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9.5 text-slate-400 hover:text-slate-600 cursor-pointer transition"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>


                        {/* Sign In */}
                        <button
                            type="submit"
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-sm transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                        </button>

                    </form>


                    {/* Divider */}
                    <div className="flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-slate-200"></div>

                            <span className="text-xs text-slate-500">
                            Or
                            </span>

                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-3 py-2.5 rounded-sm mb-6 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                        <span>
                            This registration is for <strong>visitors only</strong>.
                            If you are staff, contact your admin for access.
                        </span>
                    </div>  

                    {/* Create Account */}
                    <Link
                        to="/register"
                        className="w-full h-11 border border-slate-300 rounded-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        I'm a visitor - Pre-Registration my visit
                    </Link>

                </div>
            </div>

        </div>
    );
};