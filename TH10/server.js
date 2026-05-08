const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cấu hình thư mục tĩnh để truy cập HTML, CSS, JS từ client
app.use(express.static('public'));

// ==========================
// QUẢN LÝ NGƯỜI DÙNG
// ==========================
// Lưu trữ dưới dạng: { "Tên_User": "Socket_ID" }
let users = {};

io.on('connection', (socket) => {
    console.log('--- Kết nối mới:', socket.id);

    // ==========================
    // ĐĂNG KÝ USER
    // ==========================
    socket.on('register-user', (username) => {
        // Kiểm tra nếu socket này đã từng đăng ký tên khác thì xóa đi
        for (let name in users) {
            if (users[name] === socket.id) {
                delete users[name];
            }
        }
        
        // Lưu người dùng mới vào object
        users[username] = socket.id;
        console.log(`User: ${username} đã đăng nhập với ID: ${socket.id}`);

        // Gửi danh sách tên người dùng online cho TẤT CẢ mọi người
        io.emit('update-user-list', Object.keys(users));
    });

    // ==========================
    // NHẮN TIN RIÊNG (PRIVATE MESSAGING)
    // ==========================
    
    // Gửi tin nhắn văn bản
    socket.on('private-message', (data) => {
        const receiverId = users[data.to];
        if (receiverId) {
            // Chỉ gửi cho người nhận cụ thể
            io.to(receiverId).emit('receive-private-message', data);
        }
    });

    // Gửi hình ảnh
    socket.on('send-image', (data) => {
        const receiverId = users[data.to];
        if (receiverId) {
            io.to(receiverId).emit('receive-image', data);
        }
    });

    // Thông báo đang nhập tin nhắn (Typing...)
    socket.on('typing', (data) => {
        const receiverId = users[data.to];
        if (receiverId) {
            io.to(receiverId).emit('show-typing', data.sender);
        }
    });

    // ==========================
    // LOGIC GAME CARO (P2P)
    // ==========================
    
    // Đồng bộ nước đi giữa 2 người chơi
    socket.on('game-move', (data) => {
        // 'data' nên chứa field 'to' để biết gửi nước đi cho ai
        if (data.to && users[data.to]) {
            io.to(users[data.to]).emit('update-game', data);
        } else {
            // Dự phòng: nếu không xác định người nhận thì gửi cho mọi người
            socket.broadcast.emit('update-game', data);
        }
    });

    // Reset bàn cờ
    socket.on('reset-game', (targetUser) => {
        if (targetUser && users[targetUser]) {
            io.to(users[targetUser]).emit('game-reset');
        } else {
            io.emit('game-reset');
        }
    });

    // ==========================
    // NGẮT KẾT NỐI (DISCONNECT)
    // ==========================
    socket.on('disconnect', () => {
        let disconnectedUser = '';
        
        // Tìm và xóa người dùng vừa thoát khỏi danh sách online
        for (let username in users) {
            if (users[username] === socket.id) {
                disconnectedUser = username;
                delete users[username];
                break;
            }
        }
        
        console.log(`--- User thoát: ${disconnectedUser || socket.id}`);
        
        // Cập nhật lại danh sách online cho những người còn lại
        io.emit('update-user-list', Object.keys(users));
    });
});

// Khởi động Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('-----------------------------------------');
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    console.log('-----------------------------------------');
});