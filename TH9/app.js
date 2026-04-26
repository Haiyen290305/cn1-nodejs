const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");

const logger = require("./middleware/logger.middleware");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

app.use(logger);

app.use("/", authRoutes);
app.use("/students", studentRoutes);

app.get("/heavy-sync", (req, res) => {
    let sum = 0;
    for (let i = 0; i < 1e9; i++) sum += i;
    res.send("Done sync");
});

app.get("/heavy-async", async (req, res) => {
    setTimeout(() => {
        res.send("Done async");
    }, 1000);
});

app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});