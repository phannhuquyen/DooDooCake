// biểu đồ thống kê
import express from "express";
import {
  getRevenueStatistics,
  getRevenueStatisticsByDay,
} from "../controllers/statisticsControllers.js";

const router = express.Router();
router.get("/revenue", getRevenueStatistics);
router.get("/revenue/day", getRevenueStatisticsByDay);

export default router;
