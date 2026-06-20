const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateRepoReport = async (repoName, repoInfo, folderStructure, readmeContent) => {

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        You are a senior software engineer analyzing a GitHub repository.
        
        Repository Name: ${repoName}
        Description: ${repoInfo.description || "No description"}
        Primary Language: ${repoInfo.language || "Not specified"}
        
        Folder Structure:
        ${folderStructure}
        
        README:
        ${readmeContent}
        
        Please provide a detailed analysis of this repository in three different formats, and also evaluate repository health metrics.
        You MUST return a JSON object with exactly the following keys:
        1. "beginnerEnglish": A JSON object containing these keys with analysis written in simple, clear English tailored for beginners (without unexplained jargon):
           - "projectSummary": A clear summary of what this project does.
           - "folderStructureExplanation": An explanation of the purpose of the main folders and files.
           - "developmentWorkflow": An explanation of how this project works — from user action to response.
           - "keyTechnologies": A list and brief explanation of each technology used.
           - "howToUnderstand": A step-by-step guide for a beginner developer to understand this codebase.
        2. "beginnerHinglish": A JSON object containing the same keys (projectSummary, folderStructureExplanation, developmentWorkflow, keyTechnologies, howToUnderstand) with analysis written in friendly, conversational Hinglish (Hindi words written in the English/Latin alphabet, e.g., "Yeh project ek task manager hai..."). Crucial: Do NOT use Devnagari characters (like हिंदी), only use the Latin alphabet.
        3. "professional": A JSON object containing the same keys (projectSummary, folderStructureExplanation, developmentWorkflow, keyTechnologies, howToUnderstand) with a professional developer analysis in detailed, highly-technical English. Explain the repository's architecture, design patterns, detailed developer workflow, code structure rationale, and technology stack.
        4. "healthScore": A JSON object containing the following keys with integer values (from 0 to 100):
           - "overall": Overall repository quality score.
           - "codeQuality": Score based on structure, coding patterns, lint indicators, and modular design.
           - "documentation": Score based on README clarity/completeness, comments, and setup guides.
           - "gitPractices": Score based on git layouts, standard code repository structures, and presence of standard metadata files.
           - "security": Score based on security considerations (e.g., no exposed credentials/secrets, proper use of standard environment configuration files).
           - "projectStructure": Score based on directory naming, logical folder structures, and overall codebase organization.
        
        Note: The value for each section key inside "beginnerEnglish", "beginnerHinglish", and "professional" should be a well-formatted markdown string containing the actual detailed text analysis for that section, WITHOUT repeating the section title/header itself (e.g. do not write '# PROJECT SUMMARY' inside the 'projectSummary' field, just write the description text directly).
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
};

module.exports = { generateRepoReport };