import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* files */
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../Context/AuthContext";

/* icons */
import { ShieldCheck, ArrowRight, LogIn, Eye, EyeOff, LoaderCircle } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate form fields
        if (!fullName || !email || !phoneNumber || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!/^\+?\d{10,15}$/.test(phoneNumber)) {
            setError("Please enter a valid phone number.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post("/auth/register", { name: fullName, email, phone: phoneNumber, password });
            
            // Call the login function from AuthContext to store user data and token in localStorage
            login(data);

            // Handle successful registration (e.g., show a success message, redirect to dashboard according to role, etc.)
            const routes = {
                admin:    "/admin/dashboard",
                security: "/security/dashboard",
                employee: "/employee/dashboard",
                visitor:  "/visitor/dashboard",
            };

            // Redirect to the appropriate dashboard based on the user's role
            navigate(routes[data.user.role] || "/login");
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred. Please try again.");
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
                        Create your account.
                        <br />
                        Manage visitors securely.
                    </h1>

                    <p className="mt-5 text-sm lg:text-base text-indigo-100 leading-relaxed max-w-md">
                        Set up your VMS Pro account and make visitor management
                        simple, secure, and professional.   
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
                            Create your account
                        </h2>

                        <p className="text-xs text-slate-500 mt-2">
                            Enter your details to create your VMS Pro account.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-sm mb-5">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
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
                                placeholder="john@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 px-3 border border-slate-300 rounded-sm text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Phone Number
                            </label>

                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1 234 567 890"
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


                        {/* Register Visitor */}
                        <button
                            type="submit"
                            disabled={loading || !fullName || !email || !phoneNumber || !password}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-sm transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            { loading ? (
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                                <><span>Register</span><ArrowRight className="w-4 h-4" /></>
                            )}
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


                    {/* Login */}
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
            