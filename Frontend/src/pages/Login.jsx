import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                formData,
                { withCredentials: true }
            );

            login(response.data.user);
            navigate("/");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] relative overflow-hidden font-sans px-4 sm:px-6">
            
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Ambient Glow */}
            <div className="absolute w-[300px] h-[300px] rounded-full pointer-events-none bg-gradient-to-tr from-[#1A1A1A]/5 to-[#8A8F98]/10 blur-3xl" />

            {/* ===== NAV / BRAND ===== */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 bg-transparent">
                <h1 
                    onClick={() => navigate("/")}
                    className="text-xl font-bold uppercase text-[#1A1A1A] cursor-pointer tracking-[0.2em]"
                    style={{ fontFamily: "Anton, sans-serif" }}
                >
                    GITMENTOR
                </h1>
            </div>

            {/* ===== LOGIN CARD ===== */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md border border-[#1A1A1A]/10 rounded-2xl p-8 md:p-10 bg-white/40 backdrop-blur-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] z-10"
            >
                {/* Technical Blueprint Ticks */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#1A1A1A]/20" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#1A1A1A]/20" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#1A1A1A]/20" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#1A1A1A]/20" />

                {/* Technical Specifications Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                    <span className="text-[8px] font-bold text-[#1A1A1A] tracking-widest font-mono">SYS_AUTH // SIGN_IN</span>
                </div>
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-20">
                    <span className="text-[8px] text-[#8A8F98] font-mono">SECURE_SSL</span>
                </div>

                <div className="mt-4 mb-8 text-center">
                    <h2 
                        className="text-3xl font-bold uppercase text-[#1A1A1A]"
                        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.05em" }}
                    >
                        Login
                    </h2>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-mono mt-1">
                        Access your repository dashboard
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                        <p className="text-xs text-red-500 font-mono">
                            {error}
                        </p>
                    </div>
                )}

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label 
                            className="text-[10px] text-[#6B7280] uppercase tracking-wider font-mono mb-1.5 ml-1"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-[#1A1A1A]/10 text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A]/30 focus:bg-white/90 transition-all duration-300 text-sm"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label 
                            className="text-[10px] text-[#6B7280] uppercase tracking-wider font-mono mb-1.5 ml-1"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-[#1A1A1A]/10 text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A]/30 focus:bg-white/90 transition-all duration-300 text-sm"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300 mt-2 bg-[#1A1A1A] text-[#F8F9FB] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] ${
                            loading ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        type="submit"
                        disabled={loading}
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </motion.button>
                </form>

                <p 
                    className="text-xs text-[#6B7280] mt-8 text-center font-mono"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                    Don't have an account?
                    <Link 
                        to="/register" 
                        className="text-[#1A1A1A] font-semibold underline hover:text-[#10B981] ml-1 transition-colors"
                    >
                        Register here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;