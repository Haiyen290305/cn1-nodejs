const express = require("express");
const multer = require("multer");

const app = express();

// 1. CẤU HÌNH LƯU FILE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// 2. DÙNG array() thay vì single()
const uploadManyFiles = multer({ storage }).array("many-files", 17);

// 3. HIỂN THỊ FORM
app.get("/", (req, res) => {
    res.send(`
        <h2>Upload nhiều file</h2>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="many-files" multiple />
            <br><br>
            <button type="submit">Upload</button>
        </form>
    `);
});

// 4. ROUTE UPLOAD
app.post("/upload", (req, res) => {
    uploadManyFiles(req, res, (err) => {
        if (err) {
            return res.send("Lỗi upload");
        }

        res.send("Upload nhiều file thành công");
    });
});

// 5. CHẠY SERVER
app.listen(8017, () => {
    console.log("Server chạy tại http://localhost:8017");
});