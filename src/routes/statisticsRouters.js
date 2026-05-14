import {
  getRevenueStatistics,
  getRevenueStatisticsByDay,
} from "../controllers/statisticsControllers.js";

router.get("/revenue", getRevenueStatistics);

router.get("/revenue/day", getRevenueStatisticsByDay);
