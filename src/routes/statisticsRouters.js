// biểu đồ thống kê
import express from "express";
import { getRevenueStatistics } from "../controllers/statisticsControllers";

const router = express.Router();
router.get("/revenue", getRevenueStatistics);

export default router;
