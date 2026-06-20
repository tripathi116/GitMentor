import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { generateReport } from "../services/github.service";
import { getMyReports, deleteReport } from "../services/report.service";
import { useNavigate } from "react-router-dom";
import robotImg from "../assets/ax09_robot.png";
import axios from "axios";

const Home = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(0);
    const [showAccountPopup, setShowAccountPopup] = useState(false);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [accountError, setAccountError] = useState("");
    const [accountSuccess, setAccountSuccess] = useState("");
    const [accountLoading, setAccountLoading] = useState(false);
    const heroRef = useRef(null);
    const reportsRef = useRef(null);
    const workingRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
        }
    }, [user]);

    // Scroll progress
    const { scrollYProgress } = useScroll();
    const { scrollYProgress: reportsScroll } = useScroll({ target: reportsRef, offset: ["start start", "end start"] });
    const { scrollYProgress: workingScroll } = useScroll({ target: workingRef, offset: ["start start", "end start"] });
    const { scrollYProgress: ctaScroll } = useScroll({ target: ctaRef, offset: ["start start", "end start"] });

    // Scroll-based transforms
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.92]);
    const textParallaxY = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
    const robotParallaxY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    const reportsOpacity = useTransform(reportsScroll, [0, 0.25], [1, 0]);
    const reportsScale = useTransform(reportsScroll, [0, 0.25], [1, 0.95]);

    const workingOpacity = useTransform(workingScroll, [0, 0.25], [1, 0]);
    const workingScale = useTransform(workingScroll, [0, 0.25], [1, 0.95]);

    const ctaOpacity = useTransform(ctaScroll, [0, 0.25], [1, 0]);
    const ctaScale = useTransform(ctaScroll, [0, 0.25], [1, 0.95]);

    useEffect(() => {
        setTimeout(() => setLoaded(true), 50);
    }, []);

    // Fetch reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getMyReports();
                setReports(data.reports || []);
            } catch (err) {
                console.error("Failed to load reports", err);
            }
        };
        fetchReports();
    }, []);

    // Section observer
    useEffect(() => {
        const sections = document.querySelectorAll("[data-section]");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(Number(entry.target.dataset.section));
                    }
                });
            },
            { threshold: 0.4 }
        );
        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    const handleGenerate = async () => {
        if (!repoUrl.trim()) return;
        setLoading(true);
        setError("");
        try {
            const data = await generateReport(repoUrl);
            setReports((prev) => [data.report, ...prev]);
            navigate(`/report/${data.report._id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            await deleteReport(reportId);
            setReports((prev) => prev.filter((r) => r._id !== reportId));
        } catch (err) {
            console.error("Failed to delete report", err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setAccountLoading(true);
        setAccountError("");
        setAccountSuccess("");
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                { name: editName, password: editPassword || undefined },
                { withCredentials: true }
            );
            updateUser(response.data.user);
            setAccountSuccess("Profile updated successfully!");
            setTimeout(() => {
                setIsEditingAccount(false);
                setEditPassword("");
                setAccountSuccess("");
            }, 1500);
        } catch (err) {
            setAccountError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setAccountLoading(false);
        }
    };

    return (
        <div className="bg-[#E8E8E8] font-sans overflow-x-hidden">

            {/* ===== FIXED NAV ===== */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#E8E8E8]/80 backdrop-blur-md"
            >
                <motion.h1
                    className="text-xl md:text-2xl font-bold uppercase text-[#1A1A1A]"
                    style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.2em" }}
                    whileHover={{ scale: 1.05 }}
                >
                    GITMENTOR
                </motion.h1>
                <div className="flex items-center gap-4">
                    {user && (
                        <span
                            className="text-[10px] text-[#6B7280] uppercase hidden sm:block"
                            style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}
                        >
                            {user.name}
                        </span>
                    )}
                    <motion.button
                        className="flex flex-col gap-1.5 p-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.span className="block w-6 h-[2px] bg-[#1A1A1A]" />
                        <motion.span className="block w-4 h-[2px] bg-[#1A1A1A]" />
                        <motion.span className="block w-6 h-[2px] bg-[#1A1A1A]" />
                    </motion.button>
                </div>
            </motion.nav>

            {/* ===== HERO SECTION ===== */}
            <motion.section
                ref={heroRef}
                data-section="0"
                id="hero-section"
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="min-h-screen flex flex-col lg:flex-row items-center relative px-6 md:px-12 lg:px-20 pt-20 lg:pt-0"
            >
                {/* LEFT — Text Content + Input */}
                <motion.div
                    style={{ y: textParallaxY }}
                    className="flex-1 flex flex-col justify-center max-w-xl lg:max-w-none lg:w-[48%] py-12 lg:py-0 z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 60 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span
                            className="text-[10px] md:text-xs text-[#6B7280] uppercase block mb-4"
                            style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em" }}
                        >
                            AI-Powered GitHub Analysis TO
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 80 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold uppercase text-[#1A1A1A] leading-[0.85]"
                        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.03em" }}
                    >
                        UNDERSTAND
                    </motion.h2>
                    <motion.h2
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 80 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold uppercase leading-[0.85]"
                        style={{
                            fontFamily: "Anton, sans-serif",
                            letterSpacing: "0.03em",
                            background: "linear-gradient(135deg, #1A1A1A 0%, #4B5563 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        ANY REPO
                    </motion.h2>

                    <div className="my-6 md:my-8 h-[2px]" />

                    <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-sm sm:text-base md:text-lg text-[#6B7280] leading-relaxed"
                        style={{ fontFamily: "Inter, sans-serif", maxWidth: "540px" }}
                    >
                        Paste any GitHub repository URL and get an AI-generated breakdown of the project — structure, tech stack, workflow, and how to understand it.
                    </motion.p>

                    {/* ===== INPUT AREA ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-8 md:mt-10"
                    >
                        <div className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                            <input
                                type="text"
                                className="flex-1 px-4 py-3.5 rounded-xl bg-[#E8E8E8] border border-[#D1D5DB] text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A]/30 focus:bg-[#F8F9FB] transition-all duration-300 text-sm md:text-base"
                                style={{ fontFamily: "Inter, sans-serif" }}
                                placeholder="Enter GitHub repository URL..."
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGenerate}
                                disabled={loading || !repoUrl.trim()}
                                className={`px-6 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300 w-full sm:w-auto ${loading || !repoUrl.trim()
                                    ? "bg-[#1A1A1A]/10 text-[#1A1A1A]/40 cursor-not-allowed"
                                    : "bg-[#1A1A1A] text-[#F8F9FB] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]"
                                    }`}
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-[#F8F9FB]/30 border-t-[#F8F9FB] rounded-full inline-block"
                                        />
                                        Analyzing...
                                    </span>
                                ) : (
                                    "Generate Report"
                                )}
                            </motion.button>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-xs text-red-500 mt-3"
                                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loaded ? 1 : 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="flex gap-8 md:gap-12 mt-8 md:mt-10"
                    >
                        {[
                            { label: "Reports", value: reports.length.toString() },
                            { label: "Languages", value: "All" },
                            { label: "AI Model", value: "Gemini" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                            >
                                <div
                                    className="text-lg md:text-xl font-bold text-[#1A1A1A]"
                                    style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.05em" }}
                                >
                                    {stat.value}
                                </div>
                                <div
                                    className="text-[9px] md:text-[10px] text-[#9CA3AF] uppercase mt-1"
                                    style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}
                                >
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* RIGHT — Industrial Robot Presentation */}
                <motion.div
                    style={{ y: robotParallaxY }}
                    className="flex-1 flex items-center justify-center lg:w-[48%] relative min-h-[400px] lg:min-h-screen z-10"
                >
                    {/* Ambient Glow */}
                    <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none bg-gradient-to-tr from-[#1A1A1A]/5 to-[#8A8F98]/10 blur-3xl" />

                    {/* Industrial Frame */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.95 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="w-[280px] h-[400px] sm:w-[340px] sm:h-[480px] md:w-[380px] md:h-[540px] border border-[#1A1A1A]/10 rounded-2xl p-6 bg-white/40 backdrop-blur-md relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center group"
                    >
                        {/* Technical Blueprint Ticks */}
                        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#1A1A1A]/20" />
                        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#1A1A1A]/20" />
                        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#1A1A1A]/20" />
                        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#1A1A1A]/20" />

                        {/* Technical Specifications Overlay */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                            <span className="text-[9px] font-bold text-[#1A1A1A] tracking-widest font-mono">SYS_STATUS // ACTIVE</span>
                            <span className="text-[8px] text-[#8A8F98] font-mono">MODEL // AX-09</span>
                        </div>
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-20">
                            <span className="text-[9px] font-bold text-[#1A1A1A] tracking-widest font-mono">SYS_VER // 1.0.0</span>
                            <span className="text-[8px] text-[#8A8F98] font-mono">CLASS // HUMANOID</span>
                        </div>

                        <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-20">
                            <span className="text-[8px] text-[#8A8F98] font-mono">COORDS // 45.9.12</span>
                            <span className="text-[8px] text-[#8A8F98] font-mono">DOCK // SEC_09</span>
                        </div>
                        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 z-20 font-mono">
                            <span className="text-[8px] text-[#8A8F98]">MATERIAL // CERAMIC_COMPOSITE</span>
                            <span className="text-[8px] text-[#8A8F98]">PALETTE // #F8F9FB | #1A1A1A</span>
                        </div>

                        {/* Floating Robot Image */}
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-[85%] h-[85%] flex items-center justify-center"
                        >
                            <motion.img
                                src={robotImg}
                                alt="AX-09 Industrial Humanoid"
                                className="w-full h-full object-contain mix-blend-multiply opacity-95 transition-transform duration-500 group-hover:scale-105"
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 1 : 0 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span
                        className="text-[9px] text-[#9CA3AF] uppercase"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em" }}
                    >
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-[1px] h-6 bg-[#9CA3AF]/50"
                    />
                </motion.div>
            </motion.section>

            {/* ===== REPORTS SECTION ===== */}
            <motion.section
                ref={reportsRef}
                style={{ opacity: reportsOpacity, scale: reportsScale }}
                data-section="1"
                id="reports-section"
                className="min-h-[60vh] px-6 md:px-12 lg:px-20 py-20 relative"
            >
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12"
                >
                    <span
                        className="text-[10px] text-[#6B7280] uppercase block mb-4"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em" }}
                    >
                        Analysis History
                    </span>
                    <h3
                        className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase text-[#1A1A1A]"
                        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.03em" }}
                    >
                        Your Reports
                    </h3>
                </motion.div>

                {reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
                        {reports.map((report, i) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                                className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-2xl p-5 md:p-6 transition-shadow duration-300 group"
                            >
                                {/* Report Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className="text-base md:text-lg font-semibold text-[#1A1A1A] truncate"
                                            style={{ fontFamily: "Inter, sans-serif", color: "#1A1A1A" }}
                                        >
                                            {report.repoName}
                                        </h4>
                                        <p
                                            className="text-[10px] text-[#9CA3AF] mt-1"
                                            style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}
                                        >
                                            {new Date(report.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {report.healthScore && (
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${report.healthScore.overall >= 80
                                                ? "bg-emerald-100 text-emerald-700"
                                                : report.healthScore.overall >= 50
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                            style={{ fontFamily: "Anton, sans-serif" }}
                                        >
                                            {report.healthScore.overall}
                                        </div>
                                    )}
                                </div>

                                {/* Summary Preview */}
                                {report.projectSummary && (
                                    <p
                                        className="text-xs text-[#6B7280] mb-4 leading-relaxed"
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {typeof report.projectSummary === "string"
                                            ? report.projectSummary.substring(0, 150) + "..."
                                            : "Report generated successfully"}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate(`/report/${report._id}`)}
                                        className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] text-[#F8F9FB] text-xs font-medium uppercase tracking-wider transition-colors duration-200 hover:bg-[#1A1A1A]/90"
                                        style={{ fontFamily: "Inter, sans-serif" }}
                                    >
                                        View Report
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDelete(report._id)}
                                        className="w-10 h-10 rounded-lg border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#1A1A1A]/10 rounded-2xl bg-white/40 backdrop-blur-md max-w-2xl text-center mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                        <svg className="w-12 h-12 text-[#9CA3AF] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-2 uppercase" style={{ fontFamily: "Inter, sans-serif" }}>No Reports Generated Yet</h4>
                        <p className="text-sm text-[#6B7280] mb-6 max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                            Enter a repository URL in the hero section above to analyze and generate your first AI report.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-[#F8F9FB] text-xs font-semibold uppercase tracking-wider transition-all duration-300"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Analyze Now
                        </motion.button>
                    </div>
                )}
            </motion.section>

            {/* ===== HOW IT WORKS SECTION ===== */}
            <motion.section
                ref={workingRef}
                style={{ opacity: workingOpacity, scale: workingScale }}
                data-section="2"
                id="working-section"
                className="min-h-[70vh] flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 py-20 bg-[#E8E8E8] relative overflow-hidden"
            >
                {/* Background Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 relative z-10"
                >
                    <span
                        className="text-[10px] text-[#6B7280] uppercase block mb-4"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em" }}
                    >
                        Process
                    </span>
                    <h3
                        className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase text-[#1A1A1A]"
                        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.03em" }}
                    >
                        How It Works
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
                    {[
                        {
                            step: "01",
                            title: "Paste URL",
                            desc: "Enter any public GitHub repository URL into the input field above.",
                        },
                        {
                            step: "02",
                            title: "AI Analysis",
                            desc: "Gemini AI analyzes the repo structure, README, and codebase in seconds.",
                        },
                        {
                            step: "03",
                            title: "Get Report",
                            desc: "Receive a detailed breakdown with health scores, explanations, and guidance.",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.03 }}
                            className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-2xl p-8 hover:border-[#10B981]/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                        >
                            <div
                                className="text-3xl md:text-4xl font-bold text-[#10B981]/40 mb-4"
                                style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.05em" }}
                            >
                                {item.step}
                            </div>
                            <h4
                                className="text-lg font-semibold text-[#1A1A1A] mb-3 uppercase"
                                style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}
                            >
                                {item.title}
                            </h4>
                            <p
                                className="text-sm text-[#6B7280] leading-relaxed"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ===== CTA SECTION ===== */}
            <motion.section
                ref={ctaRef}
                style={{ opacity: ctaOpacity, scale: ctaScale }}
                data-section="3"
                className="min-h-[50vh] flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 py-20 relative"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <span
                        className="text-[10px] text-[#6B7280] uppercase block mb-6"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em" }}
                    >
                        Start Analyzing
                    </span>
                    <h3
                        className="text-4xl sm:text-5xl md:text-7xl font-bold uppercase text-[#1A1A1A] mb-6"
                        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.03em" }}
                    >
                        Ready to Explore?
                    </h3>
                    <p
                        className="text-base text-[#6B7280] max-w-md mx-auto mb-10"
                        style={{ fontFamily: "Inter, sans-serif", lineHeight: "1.8" }}
                    >
                        Paste a GitHub repository URL above and let our AI mentor break it down for you.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="group flex items-center gap-3 bg-[#1A1A1A] text-[#F8F9FB] px-10 py-4 rounded-full font-medium text-sm uppercase tracking-wider mx-auto"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        Get Started
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        >
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                        </svg>
                    </motion.button>
                </motion.div>
            </motion.section>

            {/* ===== FOOTER METADATA BAR ===== */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="border-t border-[#E5E7EB] bg-[#E8E8E8]/90 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between px-6 md:px-12 h-10">
                    <span
                        className="text-[10px] text-[#9CA3AF] uppercase"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em" }}
                    >
                        AI-POWERED · GEMINI 2.5
                    </span>
                    <span
                        className="text-[10px] text-[#9CA3AF] uppercase"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em" }}
                    >
                        GITMENTOR © 2026
                    </span>
                    <span
                        className="text-[10px] text-[#9CA3AF] uppercase"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em" }}
                    >
                        v1.0.0
                    </span>
                </div>
            </motion.div>

            {/* ===== FIXED BOTTOM NAV ===== */}
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-[#F8F9FB]/95 backdrop-blur-md border-t border-[#E5E7EB]"
            >
                <div className="flex items-center justify-around h-16 sm:h-[72px] px-6 relative">
                    {/* ===== ACCOUNT POPUP ===== */}
                    <AnimatePresence>
                        {showAccountPopup && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-[80px] right-4 sm:right-12 w-[320px] bg-[#F8F9FB] border border-[#1A1A1A]/10 rounded-2xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.15)] z-[60] text-left"
                            >
                                {/* blueprint ticks */}
                                <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[#1A1A1A]/20" />
                                <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[#1A1A1A]/20" />
                                <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[#1A1A1A]/20" />
                                <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[#1A1A1A]/20" />

                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold uppercase text-[#1A1A1A] tracking-wider" style={{ fontFamily: "Anton, sans-serif" }}>
                                        {isEditingAccount ? "Edit Account" : "Account Info"}
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setShowAccountPopup(false);
                                            setIsEditingAccount(false);
                                            setAccountError("");
                                            setAccountSuccess("");
                                        }}
                                        className="text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {accountError && (
                                    <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                                        <p className="text-[10px] text-red-500 font-mono">{accountError}</p>
                                    </div>
                                )}
                                {accountSuccess && (
                                    <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                                        <p className="text-[10px] text-emerald-500 font-mono">{accountSuccess}</p>
                                    </div>
                                )}

                                {isEditingAccount ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                                        <div>
                                            <label className="text-[9px] text-[#6B7280] uppercase tracking-wider font-mono block mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-[#6B7280] uppercase tracking-wider font-mono block mb-1">New Password (Optional)</label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={editPassword}
                                                onChange={(e) => setEditPassword(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]/30"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={accountLoading}
                                                className="flex-1 py-2 rounded-lg bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#1A1A1A]/90 transition-colors disabled:opacity-50"
                                            >
                                                {accountLoading ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingAccount(false);
                                                    setEditName(user?.name || "");
                                                    setEditPassword("");
                                                    setAccountError("");
                                                }}
                                                className="flex-1 py-2 rounded-lg border border-[#1A1A1A]/10 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white/60 border border-[#1A1A1A]/5 rounded-xl">
                                            <div className="text-[9px] text-[#9CA3AF] uppercase font-mono tracking-wider mb-0.5">Name</div>
                                            <div className="text-xs font-semibold text-[#1A1A1A]">{user?.name || "Guest"}</div>
                                        </div>
                                        <div className="p-3 bg-white/60 border border-[#1A1A1A]/5 rounded-xl">
                                            <div className="text-[9px] text-[#9CA3AF] uppercase font-mono tracking-wider mb-0.5">Password</div>
                                            <div className="text-xs font-semibold text-[#1A1A1A] font-mono">••••••••</div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => setIsEditingAccount(true)}
                                                className="flex-1 py-2 rounded-lg border border-[#1A1A1A]/20 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
                                            >
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowAccountPopup(false);
                                                    navigate("/login");
                                                }}
                                                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {[
                        { label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", id: "hero-section" },
                        { label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", id: "reports-section" },
                        { label: "Working", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", id: "working-section" },
                        { label: "Account", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", id: "account" },
                    ].map((item, i) => {
                        const isHighlighted =
                            (item.id === "account" && showAccountPopup) ||
                            (item.id !== "account" && !showAccountPopup && activeSection === i);

                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (item.id === "account") {
                                        setShowAccountPopup(!showAccountPopup);
                                    } else {
                                        setShowAccountPopup(false);
                                        const el = document.getElementById(item.id);
                                        if (el) {
                                            el.scrollIntoView({ behavior: "smooth" });
                                        } else if (item.id === "hero-section") {
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }
                                    }
                                }}
                                className={`flex flex-col items-center gap-1 transition-colors duration-200 ${isHighlighted ? "text-[#1A1A1A]" : "text-[#6B7280]"
                                    }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={item.icon} />
                                </svg>
                                <span
                                    className="text-[9px] uppercase tracking-wider font-medium"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                >
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.nav>
        </div>
    );
};

export default Home;