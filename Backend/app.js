const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/routes/auth.routes");
const reportRoutes = require("./src/routes/githubReport.routes");

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,

    "http://localhost:5173",
    "http://localhost:5174"
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        // Normalize origin and allowed origins to compare without trailing slashes
        const normalizedOrigin = origin ? origin.replace(/\/$/, "") : null;
        const isAllowed = !origin || allowedOrigins.some(url => url.replace(/\/$/, "") === normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS`));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
module.exports = app;

