import Order from "../models/Order.js";

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
      message: "Lỗi hệ thống",
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
      message: "Lỗi hệ thống",
    });
  }
};
