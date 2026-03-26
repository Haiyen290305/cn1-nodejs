const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
    .then(() => console.log('Kết nối MongoDB thành công'))
    .catch(err => console.log('Lỗi kết nối:', err));


app.get('/', async (req, res) => {
    const posts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.render('index', { posts });
});


app.get('/blogposts/new', (req, res) => {
    res.render('create');
});

app.post('/blogposts/store', async (req, res) => {
    await BlogPost.create(req.body);
    res.redirect('/');
});


app.get('/blogposts/:id', async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('detail', { post });
});


app.get('/blogposts/edit/:id', async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('edit', { post });
});

// 6. CẬP NHẬT (Bước 10.3): Lưu thay đổi
app.post('/blogposts/update/:id', async (req, res) => {
    await BlogPost.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/');
});

// 7. XÓA (Bước 10.3): Xóa bài viết
app.post('/blogposts/delete/:id', async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

app.listen(3000, () => console.log('Server chạy tại http://localhost:3000'));