import axios from "axios";

export const getReportById = async (id) => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reports/${id}`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

export const getMyReports = async () => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reports/my-reports`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

export const deleteReport = async (id) => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/reports/${id}`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

export const updateReportActiveMode = async (id, activeMode, activeLanguage) => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/reports/${id}/active-mode`,
        {
            activeMode,
            activeLanguage
        },
        {
            withCredentials: true
        }
    );

    return response.data;
};