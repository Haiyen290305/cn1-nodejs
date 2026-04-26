const { v4: uuidv4 } = require("uuid");
let students = require("../data/students");

// GET all + filter + pagination
exports.getAll = (req, res) => {
    let result = students.filter(s => !s.isDeleted);

    const { name, class: cls, sort, page = 1, limit = 2 } = req.query;

    if (name) result = result.filter(s => s.name.includes(name));
    if (cls) result = result.filter(s => s.class === cls);

    if (sort === "age_desc") {
        result.sort((a, b) => b.age - a.age);
    }

    const start = (page - 1) * limit;
    const data = result.slice(start, start + Number(limit));

    res.json({
        page: Number(page),
        limit: Number(limit),
        total: result.length,
        data
    });
};

// GET by id
exports.getById = (req, res) => {
    const student = students.find(s => s.id === req.params.id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(student);
};

// CREATE
exports.create = (req, res) => {
    const { name, email, age, class: cls } = req.body;

    if (name.length < 2) {
        return res.status(400).json({ message: "Tên quá ngắn" });
    }

    if (students.find(s => s.email === email)) {
        return res.status(400).json({ message: "Email trùng" });
    }

    if (age < 16 || age > 60) {
        return res.status(400).json({ message: "Tuổi không hợp lệ" });
    }

    const newStudent = {
        id: uuidv4(),
        name,
        email,
        age,
        class: cls,
        isDeleted: false
    };

    students.push(newStudent);
    res.json(newStudent);
};

// UPDATE
exports.update = (req, res) => {
    const student = students.find(s => s.id === req.params.id);

    if (!student) return res.status(404).json({ message: "Không tìm thấy" });

    Object.assign(student, req.body);
    res.json(student);
};

// DELETE (soft delete)
exports.remove = (req, res) => {
    const student = students.find(s => s.id === req.params.id);

    if (!student) return res.status(404).json({ message: "Không tìm thấy" });

    student.isDeleted = true;
    res.json({ message: "Đã xóa mềm" });
};
exports.stats = (req, res) => {
    const active = students.filter(s => !s.isDeleted);
    const deleted = students.filter(s => s.isDeleted);

    const avgAge =
        active.reduce((sum, s) => sum + s.age, 0) / (active.length || 1);

    res.json({
        total: students.length,
        active: active.length,
        deleted: deleted.length,
        averageAge: avgAge
    });
};

exports.statsByClass = (req, res) => {
    const result = {};

    students.forEach(s => {
        if (!s.isDeleted) {
            result[s.class] = (result[s.class] || 0) + 1;
        }
    });

    const data = Object.keys(result).map(cls => ({
        class: cls,
        count: result[cls]
    }));

    res.json(data);
};