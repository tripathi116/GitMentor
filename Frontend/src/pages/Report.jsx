import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, updateReportActiveMode } from "../services/report.service";
import { motion, AnimatePresence } from "framer-motion";

const Report = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const mainContentRef = useRef(null);
    const isScrollingRef = useRef(false);

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("Beginner");
    const [language, setLanguage] = useState("English");
    const [animateProgress, setAnimateProgress] = useState(false);
    const [activeSection, setActiveSection] = useState("project-summary");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (report) {
            const timer = setTimeout(() => {
                setAnimateProgress(true);
            }, 150);
            return () => {
                clearTimeout(timer);
                setAnimateProgress(false);
            };
        }
    }, [report, id]);

    useEffect(() => {
        const handleScroll = () => {
            if (isScrollingRef.current) return;

            const sectionIds = [
                "project-summary",
                "folder-structure",
                "visual-tree",
                "development-workflow",
                "key-technologies",
                "how-to-understand"
            ];

            const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 150;

            // Check if user has scrolled to the bottom of the page
            const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
            if (isAtBottom) {
                setActiveSection(sectionIds[sectionIds.length - 1]);
                return;
            }

            for (const id of sectionIds) {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;
                    const top = rect.top + scrollTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        const timer = setTimeout(handleScroll, 200);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timer);
        };
    }, [report, mode, language]);

    const getScoreColorClass = (score) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 50) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBgClass = (score) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 50) return "bg-amber-500";
        return "bg-red-500";
    };

    const getHealthStatus = (score) => {
        if (score >= 80) {
            return {
                title: "Excellent Health",
                desc: "Strong organization, robust documentation, and clean directory structure."
            };
        }
        if (score >= 50) {
            return {
                title: "Moderate Health",
                desc: "Decent codebase quality, with room to improve security practices or git guidelines."
            };
        }
        return {
            title: "Needs Attention",
            desc: "Significant improvements recommended in structure, documentation, or codebase security."
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const reportData = await getReportById(id);
                setReport(reportData.report);
                setMode(reportData.report.activeMode || "Beginner");
                setLanguage(reportData.report.activeLanguage || "English");
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load report");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleModeChange = async (newMode) => {
        setMode(newMode);
        try {
            await updateReportActiveMode(id, newMode, language);
        } catch (err) {
            console.error("Failed to save active mode preference", err);
        }
    };

    const handleLanguageChange = async (newLanguage) => {
        setLanguage(newLanguage);
        try {
            await updateReportActiveMode(id, mode, newLanguage);
        } catch (err) {
            console.error("Failed to save active language preference", err);
        }
    };

    const getActiveSections = () => {
        if (!report) return {
            projectSummary: "",
            folderStructureExplanation: "",
            developmentWorkflow: "",
            keyTechnologies: "",
            howToUnderstand: ""
        };

        let activeObj = report.projectSummaryBeginnerEnglish;
        if (mode === "Professional") {
            activeObj = report.projectSummaryProfessional;
        } else if (mode === "Beginner" && language === "Hinglish") {
            activeObj = report.projectSummaryBeginnerHinglish;
        }

        if (typeof activeObj === "string") {
            const defaultObj = {
                projectSummary: activeObj,
                folderStructureExplanation: "",
                developmentWorkflow: "",
                keyTechnologies: "",
                howToUnderstand: ""
            };

            const sections = { ...defaultObj };
            const headingMap = {
                "PROJECT SUMMARY": "projectSummary",
                "FOLDER STRUCTURE EXPLANATION": "folderStructureExplanation",
                "DEVELOPMENT WORKFLOW": "developmentWorkflow",
                "KEY TECHNOLOGIES USED": "keyTechnologies",
                "HOW TO UNDERSTAND THIS PROJECT": "howToUnderstand"
            };

            const parts = activeObj.split(/(?=\n#\s+|\n##\s+|^#\s+|^##\s+)/g);
            let currentKey = null;

            for (const part of parts) {
                const trimmedPart = part.trim();
                if (!trimmedPart) continue;

                const lines = trimmedPart.split("\n");
                const headingLine = lines[0] || "";
                const cleanHeading = headingLine.replace(/^#+\s+/, "").trim().toUpperCase();

                let found = false;
                for (const [key, value] of Object.entries(headingMap)) {
                    if (cleanHeading.includes(key)) {
                        currentKey = value;
                        found = true;
                        break;
                    }
                }

                if (found) {
                    const content = lines.slice(1).join("\n").trim();
                    sections[currentKey] = content;
                } else {
                    const targetKey = currentKey || "projectSummary";
                    sections[targetKey] = (sections[targetKey] + "\n" + trimmedPart).trim();
                }
            }
            return sections;
        }

        return activeObj || {};
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            isScrollingRef.current = true;
            setActiveSection(id);

            const rect = el.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollOffset = rect.top + scrollTop;

            window.scrollTo({
                top: scrollOffset - 20,
                behavior: "smooth"
            });

            // Reset isScrollingRef to false after the smooth scroll completes
            setTimeout(() => {
                isScrollingRef.current = false;
            }, 1000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] font-sans">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-[#1A1A1A]/10 border-t-[#1A1A1A] rounded-full"
                    />
                    <span className="text-sm font-mono text-[#6B7280] uppercase tracking-widest">Loading Report...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] font-sans px-6 text-center">
                <div className="max-w-md border border-red-500/20 bg-white/40 rounded-2xl p-6 relative">
                    <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-red-500/40" />
                    <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-red-500/40" />
                    <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-red-500/40" />
                    <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-red-500/40" />
                    <h2 className="text-lg font-bold text-red-500 font-mono mb-2">ERROR</h2>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-[#F8F9FB] text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const hasHealthScore = report && report.healthScore && typeof report.healthScore.overall === "number";

    return (
        <div className="relative min-h-screen w-full bg-[#E8E8E8] text-[#1A1A1A] font-sans overflow-x-clip">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Ambient Glow */}
            <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none bg-gradient-to-tr from-[#1A1A1A]/5 to-[#8A8F98]/10 blur-3xl" />

            {/* Top Navigation Back Action / Info */}
            <div className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-[#1A1A1A]/10 bg-[#E8E8E8]/80 backdrop-blur-md">
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 cursor-pointer text-[#6B7280] hover:text-[#1A1A1A] transition-all text-sm font-semibold uppercase tracking-wider font-mono"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    <span>Back</span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#6B7280]">
                    SYS_ID: <code className="bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] text-xs py-0.5 px-2 rounded ml-1 font-semibold">{id.substring(0, 8)}</code>
                </div>
            </div>

            <div className="relative z-10 px-6 md:px-12 py-8 w-full max-w-7xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="text-center md:text-left mb-2">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-mono block mb-2">
                        AI-Generated Repository Insights
                    </span>
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-[#1A1A1A]"
                        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "0.03em" }}
                    >
                        GitMentor Report
                    </h1>
                </div>

                {/* Toggle Bar */}
                <div
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/40 border border-[#1A1A1A]/10 backdrop-blur-md gap-4 shadow-sm"
                >
                    <div className="flex flex-col gap-1 text-left">
                        <span className="text-sm font-bold text-[#1A1A1A] font-sans">Interactive View Mode</span>
                        <span className="text-xs text-[#6B7280] font-mono">Select explanation complexity and language</span>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Mode Select */}
                        <div className="flex bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-full p-1">
                            <button
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${mode === "Beginner"
                                    ? "bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                                    }`}
                                onClick={() => handleModeChange("Beginner")}
                            >
                                Beginner
                            </button>
                            <button
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${mode === "Professional"
                                    ? "bg-[#1A1A1A] text-white shadow-[0_0_15px_rgba(0,0,0,0.15)]"
                                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                                    }`}
                                onClick={() => handleModeChange("Professional")}
                            >
                                Professional
                            </button>
                        </div>

                        {/* Language Select */}
                        {mode === "Beginner" && (
                            <div className="flex bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-full p-1">
                                <button
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${language === "English"
                                        ? "bg-[#1A1A1A] text-white"
                                        : "text-[#6B7280] hover:text-[#1A1A1A]"
                                        }`}
                                    onClick={() => handleLanguageChange("English")}
                                >
                                    English
                                </button>
                                <button
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${language === "Hinglish"
                                        ? "bg-[#1A1A1A] text-white"
                                        : "text-[#6B7280] hover:text-[#1A1A1A]"
                                        }`}
                                    onClick={() => handleLanguageChange("Hinglish")}
                                >
                                    Hinglish
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="report-layout">
                    {/* LEFT COLUMN: Sidebar Navigation */}
                    <div className="report-left-sidebar">
                        <div className="bg-white/40 border border-[#1A1A1A]/10 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                            <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest font-mono text-left">
                                Navigation Index
                            </div>
                            <ul className="flex flex-col gap-1.5">
                                {[
                                    { id: "project-summary", label: "📝 Summary" },
                                    { id: "folder-structure", label: "📂 Folder Structure" },
                                    { id: "visual-tree", label: "🌳 Folder Tree" },
                                    { id: "development-workflow", label: "⚡ Dev Workflow" },
                                    { id: "key-technologies", label: "🛠️ Key Tech" },
                                    { id: "how-to-understand", label: "📖 Code Guide" }
                                ].map((sec) => (
                                    <li
                                        key={sec.id}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-xs font-semibold uppercase tracking-wider transition-all duration-300 text-left border ${activeSection === sec.id
                                            ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                                            : "bg-transparent border-transparent text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
                                            }`}
                                        onClick={() => scrollToSection(sec.id)}
                                    >
                                        {sec.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* CENTER COLUMN: Main Content Scroll */}
                    <div ref={mainContentRef} className="report-main-content flex flex-col gap-5">
                        {/* Repo Details Card */}
                        <div className="bg-white/40 border border-[#1A1A1A]/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-left relative shadow-sm">
                            <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#1A1A1A]/20" />
                            <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#1A1A1A]/20" />
                            <h2
                                className="text-lg font-bold mb-4 text-[#1A1A1A] uppercase tracking-wider"
                                style={{ fontFamily: "Anton, sans-serif", color: "#1A1A1A" }}
                            >
                                Repository Specifications
                            </h2>
                            <div className="flex flex-col gap-3">
                                <p className="text-sm flex items-center gap-2 flex-wrap">
                                    <span className="text-[#6B7280] font-mono text-xs uppercase tracking-wider">Repository:</span>
                                    <code
                                        className="text-xs bg-white border border-[#1A1A1A]/10 px-2.5 py-1 rounded-md text-[#6B7280] font-mono font-bold"
                                        style={{ color: "#6B7280" }}
                                    >
                                        {report.repoName}
                                    </code>
                                </p>
                                <p className="text-xs font-mono text-[#6B7280]">
                                    <span className="uppercase tracking-wider">Generated At:</span> {new Date(report.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Section Content Cards */}
                        {(() => {
                            const sections = getActiveSections();
                            const sectionConfigs = [
                                { id: "project-summary", title: "📝 Project Summary", content: sections.projectSummary, placeholder: "No summary details available." },
                                { id: "folder-structure", title: "📂 Folder Structure Explanation", content: sections.folderStructureExplanation, placeholder: "No folder structure explanation details available." },
                                { id: "visual-tree", title: "🌳 Folder Tree Visualizer", content: report.folderStructure, isPre: true },
                                { id: "development-workflow", title: "⚡ Development Workflow", content: sections.developmentWorkflow, placeholder: "No workflow details available." },
                                { id: "key-technologies", title: "🛠️ Key Technologies Used", content: sections.keyTechnologies, placeholder: "No technology details available." },
                                { id: "how-to-understand", title: "📖 How to Understand This Project", content: sections.howToUnderstand, placeholder: "No guidance details available." }
                            ];

                            return sectionConfigs.map((sec) => {
                                if (sec.id === "visual-tree") {
                                    return (
                                        <div
                                            key={sec.id}
                                            id={sec.id}
                                            className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 sm:p-8 text-left relative shadow-lg transition-all duration-300"
                                        >
                                            {/* Folder Header */}
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Yellow Folder Icon */}
                                                    <svg
                                                        className="w-6 h-6 text-amber-400 fill-current"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                                                    </svg>
                                                    <h3
                                                        className="text-lg font-bold text-white tracking-wide"
                                                        style={{ fontFamily: "Anton, sans-serif" }}
                                                    >
                                                        Project Structure
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Pre/Code box with Copy Button */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(sec.content || "");
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-all border border-slate-700/30 cursor-pointer flex items-center justify-center"
                                                    title="Copy to clipboard"
                                                >
                                                    {copied ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold font-mono">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                            Copied!
                                                        </span>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                        </svg>
                                                    )}
                                                </button>

                                                <pre className="font-mono text-xs sm:text-sm bg-[#060810] border border-slate-900/60 p-6 rounded-xl overflow-x-auto text-slate-300 leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] pt-12 pr-12">
                                                    {sec.content}
                                                </pre>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={sec.id}
                                        id={sec.id}
                                        className="bg-white/40 border border-[#1A1A1A]/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-left relative shadow-sm transition-all hover:bg-white/50 duration-300"
                                    >
                                        <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#1A1A1A]/20" />
                                        <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#1A1A1A]/20" />
                                        <h3
                                            className="text-base font-bold mb-4 text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-3 uppercase tracking-wider"
                                            style={{ fontFamily: "Anton, sans-serif", color: "#1A1A1A" }}
                                        >
                                            {sec.title}
                                        </h3>
                                        {sec.isPre ? (
                                            <pre className="font-mono text-xs sm:text-sm bg-white/80 border border-[#1A1A1A]/10 p-5 rounded-xl overflow-x-auto text-[#1A1A1A] leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                                {sec.content}
                                            </pre>
                                        ) : (
                                            <div className="text-sm leading-relaxed text-[#374151] whitespace-pre-wrap font-sans">
                                                {sec.content || sec.placeholder}
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {/* RIGHT COLUMN: Health Score Sidebar */}
                    {hasHealthScore && (
                        <div className="report-right-sidebar">
                            <div className="bg-white/40 border border-[#1A1A1A]/10 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-6 text-left relative shadow-sm">
                                <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#1A1A1A]/20" />
                                <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#1A1A1A]/20" />
                                <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest font-mono">
                                    SYS_METRIC // OVERALL_HEALTH
                                </div>

                                {/* Radial Gauge */}
                                <div className="flex flex-col items-center justify-center py-2">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg width="128" height="128" viewBox="0 0 120 120" className="transform -rotate-90">
                                            <circle cx="60" cy="60" r="50" className="fill-none stroke-[#1A1A1A]/5 stroke-[8]" />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                className={`fill-none stroke-[8] stroke-current transition-all duration-1000 ease-out ${getScoreColorClass(report.healthScore.overall)}`}
                                                strokeDasharray="314.16"
                                                strokeDashoffset={animateProgress ? 314.16 - (314.16 * report.healthScore.overall) / 100 : 314.16}
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span
                                                className="text-3xl font-bold text-[#1A1A1A] leading-none"
                                                style={{ fontFamily: "Anton, sans-serif" }}
                                            >
                                                {report.healthScore.overall}
                                            </span>
                                            <span className="text-[8px] uppercase text-[#6B7280] font-bold tracking-widest font-mono mt-1">
                                                SCORE
                                            </span>
                                        </div>
                                    </div>

                                    <h4
                                        className="text-base font-bold mt-5 mb-1 text-center"
                                        style={{
                                            fontFamily: "Anton, sans-serif",
                                            color: report.healthScore.overall >= 80
                                                ? "#10B981"
                                                : report.healthScore.overall >= 50
                                                    ? "#F59E0B"
                                                    : "#EF4444"
                                        }}
                                    >
                                        {getHealthStatus(report.healthScore.overall).title}
                                    </h4>
                                    <p className="text-xs text-[#6B7280] text-center leading-relaxed px-2">
                                        {getHealthStatus(report.healthScore.overall).desc}
                                    </p>
                                </div>

                                <hr className="border-[#1A1A1A]/10" />

                                {/* Breakdowns */}
                                <div className="flex flex-col gap-4">
                                    <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest font-mono">
                                        Metric Components
                                    </div>

                                    {[
                                        { name: "Code Quality", score: report.healthScore.codeQuality, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
                                        { name: "Documentation", score: report.healthScore.documentation, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> },
                                        { name: "Git Practices", score: report.healthScore.gitPractices, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg> },
                                        { name: "Security", score: report.healthScore.security, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> },
                                        { name: "Project Structure", score: report.healthScore.projectStructure, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> }
                                    ].map((metric) => {
                                        const colorClass = getScoreColorClass(metric.score);
                                        const bgClass = getScoreBgClass(metric.score);
                                        return (
                                            <div key={metric.name} className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="flex items-center gap-2 font-semibold text-[#374151]">
                                                        {metric.icon}
                                                        {metric.name}
                                                    </span>
                                                    <span className={`font-bold font-mono ${colorClass}`}>
                                                        {metric.score}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${bgClass}`}
                                                        style={{ width: animateProgress ? `${metric.score}%` : "0%" }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Report;