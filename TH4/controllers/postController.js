const BlogPost = require('../models/BlogPost');

// Trang chủ: Danh sách bài viết (Đã thêm Tìm kiếm & Lọc)
exports.index = async (req, res) => {
    try {
        let query = {};
        const { search, category } = req.query; // Lấy dữ liệu từ URL (?search=...&category=...)

        // 1. Xử lý tìm kiếm theo Tiêu đề (không phân biệt hoa thường)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // 2. Xử lý lọc theo Danh mục
        if (category && category !== 'Tất cả') {
            query.category = category;
        }

        const posts = await BlogPost.find(query).sort({ createdAt: -1 });
        
        // Gửi posts cùng với search và category để View hiển thị lại giá trị đã chọn
        res.render('index', { posts, search, category });
    } catch (err) {
        res.status(500).send("Lỗi hệ thống: " + err.message);
    }
};

// Trang tạo mới bài viết
exports.newPost = (req, res) => {
    res.render('create');
};

// Lưu bài viết mới (Tự động lưu cả category từ form gửi lên)
exports.storePost = async (req, res) => {
    try {
        await BlogPost.create(req.body);
        res.redirect('/');
    } catch (err) {
        res.redirect('/blogposts/new');
    }
};

// Xem chi tiết bài viết
exports.getPost = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('detail', { post });
};

// Trang chỉnh sửa
exports.editPost = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('edit', { post });
};

// Cập nhật bài viết
exports.updatePost = async (req, res) => {
    await BlogPost.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/');
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/');
};