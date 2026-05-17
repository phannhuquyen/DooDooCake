import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { io } from "../server.js";
//cho admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // lấy hết
    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi getAllOrders", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hàm sinh mã đơn hàng
const generateOrderCode = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${datePart}-${randomPart}`;
};

export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, ...otherData } = req.body;

    // =========================
    // chuẩn bị dữ liệu sản phẩm
    // + check stock
    // =========================
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const productDetail = await Product.findById(item.productId);

        if (!productDetail) {
          throw new Error(`Sản phẩm ${item.productId} không tồn tại.`);
        }

        // check stock
        if (productDetail.stock < item.quantity) {
          throw new Error(`Sản phẩm ${productDetail.name} không đủ số lượng.`);
        }

        return {
          productId: item.productId,

          name: productDetail.name,

          price: productDetail.price,

          quantity: item.quantity,

          images: productDetail.images,
        };
      }),
    );

    // =========================
    // xử lý tạo đơn
    // =========================
    let newOrder;

    let isSaved = false;

    let retryCount = 0;

    const maxRetries = 5;

    while (!isSaved && retryCount < maxRetries) {
      try {
        const orderId = generateOrderCode();

        const order = new Order({
          _id: orderId,

          userId,

          items: enrichedItems,

          totalPrice,

          ...otherData,
        });

        newOrder = await order.save();
        io.emit("new-order", newOrder);

        // =========================
        // update stock + sold
        // CHỈ update khi save order thành công
        // =========================
        for (const item of enrichedItems) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: {
              stock: -item.quantity,

              sold: item.quantity,
            },
          });
        }

        isSaved = true;
      } catch (error) {
        // duplicate order id
        if (error.code === 11000) {
          retryCount++;

          console.warn(`Trùng mã đơn hàng, thử lại lần ${retryCount}`);
        } else {
          throw error;
        }
      }
    }

    if (!isSaved) {
      return res.status(500).json({
        message: "Không thể tạo mã đơn hàng duy nhất, vui lòng thử lại.",
      });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Lỗi create order:", error);

    res.status(500).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};

//sua status don hang
export const updateOrder = async (req, res) => {
  try {
    const { status, address } = req.body;
    const updateOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status, address },
      { new: true },
    );

    if (!updateOrder)
      // return json.status(404).json({ message: "Order khong ton tai" });
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    res.status(200).json(updateOrder);
    io.emit("update-order-status", updateOrder);
  } catch (err) {
    console.error("Loi khi call updateOrder");
    res.status(500).json({ message: "Loi he thong!!" });
  }
};

// lấy đơn hàng by id user
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const orders = await Order.find({ userId: userId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi getOrdersByUser", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// lấy chi tiết đơn hàng theo id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi getOrderById", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Đơn hàng đã bị hủy",
      });
    }

    if (order.status === "completed") {
      return res.status(400).json({
        message: "Không thể hủy đơn đã hoàn thành",
      });
    }

    // =========================
    // trả stock
    // giảm sold
    // =========================
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: item.quantity,
          sold: -item.quantity,
        },
      });
    }

    order.status = "cancelled";

    await order.save();
    io.emit("cancel-order", order);

    res.status(200).json({
      message: "Hủy đơn hàng thành công",
    });
  } catch (error) {
    console.error("Lỗi cancelOrder:", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
