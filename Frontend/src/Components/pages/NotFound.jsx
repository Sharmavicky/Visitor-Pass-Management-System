import {
    ArrowLeft,
    Headphones,
    ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import error404 from "../../assets/Error404.png";

export default function NotFound(){
    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8">

            {/* ================= TOP BADGE ================= */}
            <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-sm text-[9px] font-medium tracking-widest uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    404 · Unmapped Visitor Route
                </span>
            </div>


            {/* ================= MAIN CONTENT ================= */}
            <main className="w-full max-w-2xl flex flex-col items-center text-center mt-8">

                {/* ================= ILLUSTRATION ================= */}
                <div className="w-full max-w-[260px] h-[190px] flex items-center justify-center">

                    {/* Add your image here */}
                    <img
                        src={error404}
                        alt="Visitor management 404 illustration"
                        className="w-full h-full object-contain"
                    />

                </div>


                {/* ================= HEADING ================= */}
                <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    Looks like you took a wrong turn in the hallway
                </h1>


                {/* ================= DESCRIPTION ================= */}
                <p className="mt-3 max-w-xl text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Don't worry, even frequent visitors take a wrong turn sometimes.
                    The page you requested isn't here. It may have moved or expired,
                    but we'll help you get right back to your way.
                </p>


                {/* ================= ACTION BUTTONS ================= */}
                <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">

                    {/* Back to Dashboard */}
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2
                                min-w-[160px] h-10 px-5
                                bg-black hover:bg-slate-800
                                text-white text-xs font-medium
                                rounded-sm transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Dashboard
                    </Link>


                    {/* Contact Helpdesk */}
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2
                                min-w-[175px] h-10 px-5
                                bg-white hover:bg-slate-50
                                border border-slate-200
                                text-slate-600 text-xs font-medium
                                rounded-sm transition"
                    >
                        <Headphones className="w-3.5 h-3.5" />
                        Contact Helpdesk / Reception
                    </button>

                </div>

            </main>


            {/* ================= FOOTER ================= */}
            <footer className="mt-auto pt-16 pb-2 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

                <span className="text-[9px] text-slate-400 uppercase tracking-wide">
                    © Directory V1.2
                </span>

                <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />

                <span className="text-[9px] text-slate-400 uppercase tracking-wide">
                    Environment: VMS V2.0 · 404
                </span>

            </footer>

        </div>
    );
};
