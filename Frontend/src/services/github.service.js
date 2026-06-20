import axios from "axios";

export const generateReport = async (repoUrl, activeMode = "Beginner", activeLanguage = "English") => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports/generate`,
        {
            repoUrl,
            activeMode,
            activeLanguage
        },
        {
            withCredentials: true
        }
    );

    return response.data;
};