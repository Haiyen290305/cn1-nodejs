const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    body: { 
        type: String, 
        required: true 
    },
    // Thêm trường phân loại ở đây
    category: { 
        type: String, 
        default: 'Công nghệ' // Giá trị mặc định nếu không chọn
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);