import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
//cho admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // lấy hết
    // .populate("user", "name email")
    // .populate("items.product", "name price");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi getAllOrders", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//tạo đơn hàng
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      address,
      items,
      totalPrice,
      fee,
      promotion,
      paymentMethod,
    } = req.body;

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const productDetail = await Product.findById(item.productId);

        if (!productDetail) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
        }

        // ✅ Gán giá trị name và price lấy từ database
        return {
          productId: item.productId,
          name: productDetail.name,
          price: productDetail.price,
          quantity: item.quantity,
          images: productDetail.images,
        };
      })
    );

    const order = new Order({
      userId,
      name,
      email,
      phone,
      address,
      items: enrichedItems, // {productId, quantity, price}
      totalPrice,
      fee,
      promotion,
      paymentMethod,
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Lỗi create order", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//sua status don hang
export const updateOrder = async (req, res) => {
  try {
    const { status, address } = req.body;
    const updateOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status, address },
      { new: true }
    );

    if (!updateOrder)
      return json.status(404).json({ message: "Order khong ton tai" });
    res.status(200).json(updateOrder);
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


