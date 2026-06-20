const express = require("express");
const router = express.Router();
const {generateReport,updateActiveMode,getMyReports,getReportById,deleteReport} = require("../controllers/githubReport.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/generate", protect, generateReport);
router.get("/my-reports", protect, getMyReports);
router.get("/:id", protect, getReportById);
router.put("/:id/active-mode", protect, updateActiveMode);
router.delete("/:id", protect, deleteReport);

module.exports = router;