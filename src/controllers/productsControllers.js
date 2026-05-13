import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const Products = await Product.find().sort({ createdAt: -1 }); //description >< asc

    res.status(200).json(Products);
  } catch (error) {
    console.error("Loi kho call getAllProducts", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      price,
      stock,
      sold,
      description,
      details,
      status,
      images,
    } = req.body;

    const product = new Product({
      categoryId,
      name,
      price,
      stock,
      sold,
      description,
      details,
      status,
      images,
    });
    const newProduct = await product.save();

    res.status(201).json(newProduct); //201: create thanh cong
  } catch (error) {
    console.error("Loi kho call createProduct", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const {
//       categoryId,
//       name,
//       price,
//       stock,
//       sold,
//       description,
//       details,
//       status,
//       images,
//       quantity
//     } = req.body;
//     const updateProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       { categoryId, name, price, stock, sold, description, details, status, images },
//       { new: true }
//     );

//     if (!updateProduct) {
//       return res.status(404).json({ message: "Product khong ton tai" });
//     }

//     res.status(200).json(updateProduct);
//   } catch (error) {
//     console.error("Loi kho call updateProduct", error);
//     res.status(500).json({ message: "Loi he thong !!!" });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      price,
      stock,
      sold,
      description,
      details,
      status,
      images,
      quantity, // Thêm quantity vào destructuring
      isFeatured,
    } = req.body;

    // Tạo object chứa các trường cần cập nhật bình thường
    let updateData = {
      categoryId,
      name,
      price,
      stock,
      sold,
      description,
      details,
      status,
      images,
      isFeatured,
    };

    // Logic xử lý Kho hàng:
    // 1. Nếu có quantity (đang cập nhật từ đơn hàng) -> dùng $inc để tự trừ/cộng
    // 2. Nếu có stock/sold cụ thể (đang sửa từ Admin) -> cập nhật giá trị tuyệt đối
    let updateQuery = { $set: updateData };

    if (quantity) {
      // chưa xử lý stock âm
      updateQuery.$inc = { stock: -quantity, sold: quantity };
    } else {
      // Nếu không có quantity thì mới cập nhật stock/sold theo số nhập vào
      if (stock !== undefined) updateData.stock = stock;
      if (sold !== undefined) updateData.sold = sold;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product không tồn tại" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Lỗi khi gọi updateProduct", error);
    res.status(500).json({ message: "Lỗi hệ thống !!!" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    // kiểm tra product có tồn tại không
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // kiểm tra sản phẩm có trong đơn chưa hoàn thành không
    const existedOrder = await Order.findOne({
      "items.productId": id,
      status: {
        $in: ["pending", "confirmed", "shipping"],
      },
    });

    if (existedOrder) {
      return res.status(400).json({
        message:
          "Không thể xóa sản phẩm vì đang tồn tại trong đơn hàng chưa hoàn thành",
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Lỗi deleteProduct:", error);

    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Tìm sản phẩm theo ID, đồng thời populate (nạp) thông tin danh mục
    const product = await Product.findById(productId);
    // .populate('category'); // Populate trường 'category'

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Loi khi call getProductById", error);
    // Lỗi 500 nếu có lỗi server hoặc lỗi ID không hợp lệ
    res.status(500).json({ message: "Lỗi hệ thống khi tìm sản phẩm" });
  }
};

//lấy tất cả sản phẩm nổi bật
export const getFeaturedProducts = async (req, res) => {
  try {
    // Chỉ lấy những sản phẩm có isFeatured = true
    const products = await Product.find({ isFeatured: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm nổi bật" });
  }
};
