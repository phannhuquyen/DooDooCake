import Order from "../models/Order.js";

export const getRevenueStatistics = async (req, res) => {
  try {
    const statistics = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
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
      label: `Tháng ${item._id.month}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Lỗi getRevenueStatistics:", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const getRevenueStatisticsByDay = async (req, res) => {
  try {
    const statistics = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
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
    console.error("Lỗi getRevenueStatisticsByDay:", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
