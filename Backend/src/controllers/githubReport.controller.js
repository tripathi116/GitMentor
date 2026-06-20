const GithubReport = require("../models/githubReport.model");
const { getRepoInfo, getFolderStructure, getReadme } = require("../services/github.service");
const { generateRepoReport } = require("../services/ai.service");

const parseMarkdownSections = (markdownText) => {
    const defaultObj = {
        projectSummary: "",
        folderStructureExplanation: "",
        developmentWorkflow: "",
        keyTechnologies: "",
        howToUnderstand: ""
    };

    if (!markdownText) return defaultObj;
    if (typeof markdownText === "object") {
        return { ...defaultObj, ...markdownText };
    }

    const sections = { ...defaultObj };

    const headingMap = {
        "PROJECT SUMMARY": "projectSummary",
        "FOLDER STRUCTURE EXPLANATION": "folderStructureExplanation",
        "DEVELOPMENT WORKFLOW": "developmentWorkflow",
        "KEY TECHNOLOGIES USED": "keyTechnologies",
        "HOW TO UNDERSTAND THIS PROJECT": "howToUnderstand"
    };

    // Split by markdown headings: # or ## or ###
    const parts = markdownText.split(/(?=\n#\s+|\n##\s+|^#\s+|^##\s+)/g);
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
};

const generateReport = async (req, res) => {
    try {
        const { repoUrl, activeMode = "Beginner", activeLanguage = "English" } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ message: "Repository URL is required" });
        }

        if (!repoUrl.includes("github.com")) {
            return res.status(400).json({ message: "Please provide a valid GitHub repository URL" });
        }

        const repoName = repoUrl.split("github.com/")[1];

        if (!repoName) {
            return res.status(400).json({ message: "Invalid GitHub repository URL" });
        }

        const repoInfo = await getRepoInfo(repoName);
        const folderStructure = await getFolderStructure(repoName);
        const readmeContent = await getReadme(repoName);

        const aiReport = await generateRepoReport(
            repoName,
            repoInfo,
            folderStructure,
            readmeContent
        );

        let aiReportObj;
        try {
            aiReportObj = JSON.parse(aiReport);
        } catch (e) {
            console.error("Failed to parse Gemini output as JSON, using fallback", e);
            aiReportObj = {
                beginnerEnglish: aiReport,
                beginnerHinglish: aiReport,
                professional: aiReport,
                healthScore: {
                    overall: 0,
                    codeQuality: 0,
                    documentation: 0,
                    gitPractices: 0,
                    security: 0,
                    projectStructure: 0
                }
            };
        }

        const beginnerEnglish = aiReportObj.beginnerEnglish || aiReport;
        const beginnerHinglish = aiReportObj.beginnerHinglish || aiReport;
        const professional = aiReportObj.professional || aiReport;
        
        const healthScore = aiReportObj.healthScore || {
            overall: 0,
            codeQuality: 0,
            documentation: 0,
            gitPractices: 0,
            security: 0,
            projectStructure: 0
        };

        const parsedBeginnerEnglish = parseMarkdownSections(beginnerEnglish);
        const parsedBeginnerHinglish = parseMarkdownSections(beginnerHinglish);
        const parsedProfessional = parseMarkdownSections(professional);

        let defaultSummary = parsedBeginnerEnglish.projectSummary;
        if (activeMode === "Professional") {
            defaultSummary = parsedProfessional.projectSummary;
        } else if (activeMode === "Beginner" && activeLanguage === "Hinglish") {
            defaultSummary = parsedBeginnerHinglish.projectSummary;
        }

        const report = await GithubReport.create({
            userId: req.user.id,
            repoName,
            projectSummary: defaultSummary,
            projectSummaryBeginnerEnglish: parsedBeginnerEnglish,
            projectSummaryBeginnerHinglish: parsedBeginnerHinglish,
            projectSummaryProfessional: parsedProfessional,
            activeMode,
            activeLanguage,
            folderStructure,
            healthScore,
        });

        const reportObj = report.toObject();
        reportObj.projectSummaryBeginnerEnglish = parsedBeginnerEnglish;
        reportObj.projectSummaryBeginnerHinglish = parsedBeginnerHinglish;
        reportObj.projectSummaryProfessional = parsedProfessional;

        res.status(201).json({
            message: "Report generated successfully",
            report: reportObj
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActiveMode = async (req, res) => {
    try {
        const { activeMode, activeLanguage } = req.body;
        const report = await GithubReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (activeMode) report.activeMode = activeMode;
        if (activeLanguage) report.activeLanguage = activeLanguage;

        const parsedEnglish = parseMarkdownSections(report.projectSummaryBeginnerEnglish);
        const parsedHinglish = parseMarkdownSections(report.projectSummaryBeginnerHinglish);
        const parsedProfessional = parseMarkdownSections(report.projectSummaryProfessional);

        if (report.activeMode === "Professional") {
            report.projectSummary = parsedProfessional.projectSummary;
        } else if (report.activeMode === "Beginner" && report.activeLanguage === "Hinglish") {
            report.projectSummary = parsedHinglish.projectSummary;
        } else {
            report.projectSummary = parsedEnglish.projectSummary;
        }

        await report.save();

        const reportObj = report.toObject();
        reportObj.projectSummaryBeginnerEnglish = parsedEnglish;
        reportObj.projectSummaryBeginnerHinglish = parsedHinglish;
        reportObj.projectSummaryProfessional = parsedProfessional;

        res.status(200).json({
            message: "Active mode updated successfully",
            report: reportObj
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyReports = async (req, res) => {
    try {
        const reports = await GithubReport.find({ userId: req.user.id })
            .select("-projectSummary")
            .sort({ createdAt: -1 });

        res.status(200).json({ reports });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReportById = async (req, res) => {
    try {
        const report = await GithubReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const reportObj = report.toObject();
        reportObj.projectSummaryBeginnerEnglish = parseMarkdownSections(reportObj.projectSummaryBeginnerEnglish);
        reportObj.projectSummaryBeginnerHinglish = parseMarkdownSections(reportObj.projectSummaryBeginnerHinglish);
        reportObj.projectSummaryProfessional = parseMarkdownSections(reportObj.projectSummaryProfessional);

        res.status(200).json({ report: reportObj });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await GithubReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await GithubReport.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Report deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateReport, updateActiveMode, getMyReports, getReportById, deleteReport };