exports.login = (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "123456") {
        req.session.user = username;
        return res.json({ message: "Login thành công" });
    }

    return res.status(401).json({ message: "Sai tài khoản" });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.json({ message: "Đã logout" });
};