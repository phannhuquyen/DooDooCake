import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Loi kho call getAllCategories", error);
    res.status(500).json({ message: "Loi he thong !!!" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(409)
        .json({ message: "Bạn chưa nhập tên danh mục mới!!" });
    }
    if (name === (await Category.findOne({ name: name }))) {
      return res.status(409).json({ message: `Da co danh muc ${name} roi!!!` });
    }
    const category = new Category({ name });
    const newCategory = await category.save();

    res.status(201).json(newCategory);
  } catch (e) {
    console.error("Loi khi call create category", e);
    res.status(500).json({ message: "Loi he thongg!!!" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updateCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true },
    );
    if (!updateCategory) {
      return res.status(404).json({ message: "Category khong ton tai!!!" });
    }

    res.status(201).json(updateCategory);
  } catch (e) {
    console.error("Loi khi goi updateCategory ", e);
    res.status(500).json({ message: "Loi he thong!!" });
  }
};

// export const deleteCategory = async (req, res) => {
//   try {
//     const deleteCategory = await Category.findByIdAndDelete(req.params.id);

//     if (!deleteCategory) {
//       return res.status(404).json({ message: "Khong ton tai Category" });
//     }

//     res.status(200).json(deleteCategory);
//   } catch (error) {
//     console.error("Loi kho call deleteCategory", error);
//     res.status(500).json({ message: "Loi he thong !!!" });
//   }
// };

// Xóa danh mục và tất cả sản phẩm thuộc danh mục đó
// export const deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1. Kiểm tra danh mục có tồn tại không
//     const category = await Category.findById(id);
//     if (!category) {
//       return res.status(404).json({ message: "Danh mục không tồn tại" });
//     }

//     // 2. Xóa tất cả sản phẩm có categoryId trùng với id danh mục này
//     // Giả sử trong model Product bạn lưu trường categoryId hoặc category (id)
//     const deletedProducts = await Product.deleteMany({ category: id });

//     // 3. Xóa danh mục chính
//     await Category.findByIdAndDelete(id);

//     res.status(200).json({
//       message: "Xóa danh mục và các sản phẩm liên quan thành công",
//       deletedProductsCount: deletedProducts.deletedCount,
//     });
//   } catch (error) {
//     console.error("Lỗi khi xóa danh mục:", error);
//     res.status(500).json({ message: "Lỗi hệ thống khi xóa danh mục" });
//   }
// };
// còn sản phẩm thì không được xóa
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. kiểm tra danh mục tồn tại
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Danh mục không tồn tại",
      });
    }

    // 2. kiểm tra còn sản phẩm không
    const existedProduct = await Product.findOne({
      categoryId: id,
    });

    if (existedProduct) {
      return res.status(400).json({
        message: "Không thể xóa vì danh mục vẫn còn sản phẩm",
      });
    }

    // 3. xóa danh mục
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi deleteCategory:", error);

    res.status(500).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    // console.log(categoryId);

    // Kiểm tra category có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    // Lấy sản phẩm theo category
    const products = await Product.find({ category: categoryId })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
