import Order from "../models/Order.js";
import User from "../models/User.js";

// ==========================
// THEO NGÀY
// ==========================
export const getRevenueByDay = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 7;

    const startDate = new Date();

    startDate.setDate(startDate.getDate() - limit);

    const statistics = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },

          createdAt: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            day: {
              $dayOfMonth: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },

            year: {
              $year: "$createdAt",
            },
          },

          revenue: {
            $sum: "$totalPrice",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const formatted = statistics.map((item) => ({
      label: `${item._id.day}/${item._id.month}`,

      revenue: item.revenue,

      orders: item.orders,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Lỗi getRevenueByDay:", error);

    res.status(500).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};

// ==========================
// THEO THÁNG
// ==========================
export const getRevenueByMonth = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;

    const startDate = new Date();

    startDate.setMonth(startDate.getMonth() - limit);

    const statistics = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },

          createdAt: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },

            year: {
              $year: "$createdAt",
            },
          },

          revenue: {
            $sum: "$totalPrice",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const formatted = statistics.map((item) => ({
      label: `T${item._id.month}`,

      revenue: item.revenue,

      orders: item.orders,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Lỗi getRevenueByMonth:", error);

    res.status(500).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};

// ==========================
// DASHBOARD
// ==========================
export const getDashboardStats = async (req, res) => {
  try {
    console.log("API dashboard called");

    // hôm nay
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // hôm qua
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    // =====================
    // DOANH THU
    // =====================

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },

          createdAt: {
            $gte: today,
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    const yesterdayRevenue = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },

          createdAt: {
            $gte: yesterday,

            $lt: today,
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    // =====================
    // ĐƠN HÀNG
    // =====================

    const todayOrders = await Order.countDocuments({
      status: {
        $ne: "cancelled",
      },

      createdAt: {
        $gte: today,
      },
    });

    const yesterdayOrders = await Order.countDocuments({
      status: {
        $ne: "cancelled",
      },

      createdAt: {
        $gte: yesterday,

        $lt: today,
      },
    });

    // =====================
    // USER MỚI
    // =====================

    const todayUsers = await User.countDocuments({
      createdAt: {
        $gte: today,
      },
    });

    const yesterdayUsers = await User.countDocuments({
      createdAt: {
        $gte: yesterday,

        $lt: today,
      },
    });

    // =====================
    // VALUE
    // =====================

    const revenueToday = todayRevenue[0]?.total || 0;

    const revenueYesterday = yesterdayRevenue[0]?.total || 0;

    // =====================
    // PERCENT
    // =====================

    const calcPercent = (todayValue, yesterdayValue) => {
      if (yesterdayValue === 0) {
        return 100;
      }

      return (((todayValue - yesterdayValue) / yesterdayValue) * 100).toFixed(
        1,
      );
    };

    res.status(200).json({
      revenue: {
        value: revenueToday,

        percent: calcPercent(revenueToday, revenueYesterday),
      },

      orders: {
        value: todayOrders,

        percent: calcPercent(todayOrders, yesterdayOrders),
      },

      users: {
        value: todayUsers,

        percent: calcPercent(todayUsers, yesterdayUsers),
      },
    });
  } catch (error) {
    console.error("Lỗi getDashboardStats:", error);

    res.status(500).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};
