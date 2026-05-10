import User from "../models/User.js";
import Product from "../models/Product.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); //desc >< asc

    res.status(200).json(users);
  } catch (error) {
    console.error("Loi kho call getAllUsers", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, name, email, phone, address, password, role } = req.body;
    if (role === "admin") {
      const hasAdmin = await User.findOne({ role: "admin" });
      if (hasAdmin) {
        return res.status(409).json({ message: "Da co admin roi!!!!" }); //409: Loi xung dot khong the tao moi
      }
    }
    const user = new User({ name, email, phone, address, password, role });
    const newUser = await user.save();

    res.status(201).json(newUser); //201: create thanh cong
  } catch (error) {
    console.error("Loi kho call createUser", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, address } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, password, role, address },
      { new: true },
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User khong ton tai" });
    }

    res.status(200).json(updateUser);
  } catch (error) {
    console.error("Loi kho call updateUser", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);

    if (!deleteUser) {
      return res.status(404).json({ message: "Khong ton tai User" });
    }

    res.status(200).json(deleteUser);
  } catch (error) {
    console.error("Loi kho call deleteUser", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

// ->>> update profile là update user:)))

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu ID người dùng (userId)." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin User theo ID:", error);
    // Kiểm tra lỗi ObjectId không hợp lệ (Mongoose cast error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID người dùng không hợp lệ." });
    }
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi lấy thông tin người dùng." });
  }
};

// them, xoa wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body; //su dung 2 bien
    if (!userId) {
      return res.status(401).json({ message: "Thiếu ID người dùng (userId)." });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const productIndex = user.wishlist.findIndex(
      (item) => item.equals(productId), // Sử dụng .equals() để so sánh ObjectId
    );

    let action;
    if (productIndex > -1) {
      user.wishlist.splice(productIndex, 1);
      action = "removed";
    } else {
      user.wishlist.push(productId);
      action = "added";
    }

    await user.save();
    res.status(200).json({
      message: `Sản phẩm đã được ${action} khỏi danh sách yêu thích.`,
      wishlist: user.wishlist,
      action: action, // Trả về hành động để frontend biết đã thêm hay xóa
    });
  } catch (error) {
    console.error("Lỗi xử lý toggle wishlist:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật wishlist." });
  }
};

/**
 * Lấy danh sách Wishlist của người dùng (Sử dụng POST để lấy userId từ body).
 */
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Thiếu ID người dùng (userId)." });
    }

    const user = await User.findById(userId)
      .select("wishlist") // Chỉ chọn trường wishlist
      .populate({
        path: "wishlist",
        select: "name price images description _id",
      });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    } // Trả về danh sách sản phẩm trong wishlist

    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error("Lỗi lấy wishlist:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi lấy wishlist." });
  }
};

//lấy giỏ hàng by userid
export const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("cart").populate({
      path: "cart.productId",
      select: "name images price",
    });
    if (!user) {
      return res.status(404).json({ message: "User khong ton tai!!!" });
    }
    return res.status(200).json(user.cart);
  } catch (err) {
    console.error("Lỗi getCart By IdUser", err);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

//thêm bớt quantity vao giỏ hàng
export const createCartItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product không tồn tại" });
    }

    const exitingItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId,
    );
    let message = "";
    if (exitingItemIndex > -1) {
      user.cart[exitingItemIndex].quantity = Math.max(1, quantity);
      user.cart[exitingItemIndex].price = product.price;
      message = `Đã tăng số lượng sản phẩm trong giỏ hàng`;
    } else {
      user.cart.push({
        productId: productId,
        quantity: 1,
        price: product.price,
      });
      message = "Đã thểm sản phẩm vào giỏ hàng";
    }
    await user.save();
    return res.status(200).json({
      message: message,
      cart: user.cart,
    });
  } catch (err) {
    console.error("Lỗi thêm sản phẩm vào giỏ hàng", err);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

//xóa cartitem
export const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          cart: { productId: productId },
        },
      },
      { new: true },
    ).select("cart");

    if (!updatedUser) {
      return res.status(404).json({ message: "User không tồn tại." });
    }

    return res.status(200).json({
      message: "Sản phẩm đã được xóa khỏi giỏ hàng.",
      cart: updatedUser.cart,
    });
  } catch (err) {
    console.error("Lỗi thêm sản phẩm vào giỏ hàng", err);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};
