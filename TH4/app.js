const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const postRoutes = require('./routers/postRoutes'); 
const app = express();

// Kết nối Database
connectDB();

// Cấu hình Middleware và View Engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Sử dụng Routes
app.use('/', postRoutes);

app.listen(3000, () => console.log('Server chạy tại http://localhost:3000'));