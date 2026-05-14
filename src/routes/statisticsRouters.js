// biểu đồ thống kê
import express from "express";
import {
  getRevenueByDay,
  getRevenueByMonth,
} from "../controllers/statisticsControllers.js";

const router = express.Router();
router.get("/revenue/day", getRevenueByDay);
router.get("/revenue", getRevenueByMonth);

export default router;
