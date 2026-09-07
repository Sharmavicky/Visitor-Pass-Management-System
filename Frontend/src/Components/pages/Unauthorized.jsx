import {
  ShieldAlert,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import unauthorizedImage from "../../assets/Unauthorized.png";

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6">

            {/* ================= TOP BADGE ================= */}
            <div className="pt-7">
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-sm text-[8px] font-medium tracking-widest uppercase"
                >
                    <ShieldAlert className="w-3 h-3" />
                    Visitor Clearance · Host Check Required
                </span>
            </div>


            {/* ================= MAIN CONTENT ================= */}
            <main
                className="w-full max-w-2xl flex flex-col items-center text-center pt-6"
            >

                {/* ================= IMAGE ================= */}
                <div
                    className="w-full max-w-[180px] h-[145px] flex items-center justify-center"
                >
                    {/* Replace this with your image */}
                    <img
                        src={unauthorizedImage}
                        alt="Unauthorized access"
                        className="w-full h-full object-contain"
                    />
                </div>


                {/* ================= HEADING ================= */}
                <h1
                    className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"
                >
                    You need a visitor pass or host
                    <br className="hidden sm:block" />
                    clearance for this area
                </h1>


                {/* ================= DESCRIPTION ================= */}
                <p
                    className="mt-3 max-w-lg text-[11px] sm:text-xs text-slate-500 leading-relaxed"
                >
                    It looks like this section is reserved for hosts or security
                    administrators. If you were invited here or need temporary
                    badge access, we can help you get back on track.
                </p>


                {/* ================= RETURN BUTTON ================= */}
                <div className="mt-7">

                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 min-w-[155px] h-10 px-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium rounded-sm transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Return to Dashboard
                    </Link>

                </div>


                {/* ================= HELP TEXT ================= */}
                <div
                    className="mt-6 flex flex-col items-center gap-2 text-[9px] text-slate-500"
                >

                    {/* Assistance */}
                    <p className="flex items-center gap-1.5">
                        <HelpCircle className="w-3 h-3 text-indigo-600" />

                        Need immediate assistance? Call the front desk at ext. 4400
                        or chat with Security.
                    </p>


                    {/* Help Links */}
                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            className="hover:text-indigo-600 transition"
                        >
                            Switch Account
                        </button>

                        <span className="text-slate-300">
                        •
                        </span>

                        <button
                            type="button"
                            className="hover:text-indigo-600 transition"
                        >
                            Request Pass
                        </button>

                        <span className="text-slate-300">
                        •
                        </span>

                        <button
                            type="button"
                            className="hover:text-indigo-600 transition"
                        >
                            Visitor Policy FAQ
                        </button>

                    </div>

                </div>

            </main>


            {/* ================= FOOTER ================= */}
            <footer
                className="mt-auto w-full py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[8px] text-slate-400 uppercase tracking-wide"
            >

                <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    Corporate Trust · Visitor Access Network
                </span>

                <span>
                    Building: Tower A · Level 4
                </span>

            </footer>

        </div>
    );
};