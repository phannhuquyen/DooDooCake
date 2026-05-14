// biểu đồ thống kê
import express from "express";
import {
  getDashboardStats,
  getRevenueByDay,
  getRevenueByMonth,
} from "../controllers/statisticsControllers.js";

const router = express.Router();
router.get("/revenue/day", getRevenueByDay);
router.get("/revenue/month", getRevenueByMonth);
router.get("/dashboard", getDashboardStats);

export default router;
