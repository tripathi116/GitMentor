const axios = require("axios");

const getHeaders = () => ({
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
});

const getRepoInfo = async (repoName) => {
    const response = await axios.get(
        `https://api.github.com/repos/${repoName}`,
        { headers: getHeaders() }
    );
    return response.data;
};

const getFolderStructure = async (repoName) => {
    const response = await axios.get(
        `https://api.github.com/repos/${repoName}/git/trees/HEAD?recursive=1`,
        { headers: getHeaders() }
    );
    return response.data.tree
        .map(item => item.path)
        .join("\n");
};

const getReadme = async (repoName) => {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${repoName}/readme`,
            { headers: getHeaders() }
        );
        return Buffer.from(
            response.data.content,
            "base64"
        ).toString("utf-8");
    } catch {
        return "No README found";
    }
};

module.exports = { getRepoInfo, getFolderStructure, getReadme };