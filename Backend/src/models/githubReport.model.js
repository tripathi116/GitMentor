const mongoose = require("mongoose");

const githubReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        repoName: {
            type: String,
            required: true
        },

        projectSummary: {
            type: String,
            required: false
        },

        projectSummaryBeginnerEnglish: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        projectSummaryBeginnerHinglish: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        projectSummaryProfessional: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        activeMode: {
            type: String,
            enum: ["Beginner", "Professional"],
            default: "Beginner"
        },

        activeLanguage: {
            type: String,
            enum: ["English", "Hinglish"],
            default: "English"
        },

        folderStructure: {
            type: String
        },

        workflow: {
            type: String
        },

        healthScore: {
            overall: { type: Number, min: 0, max: 100 },
            codeQuality: { type: Number, min: 0, max: 100 },
            documentation: { type: Number, min: 0, max: 100 },
            gitPractices: { type: Number, min: 0, max: 100 },
            security: { type: Number, min: 0, max: 100 },
            projectStructure: { type: Number, min: 0, max: 100 }
        }
    },
    {
        timestamps: true
    }
);

const GithubReport = mongoose.model("GithubReport", githubReportSchema);

module.exports = GithubReport;