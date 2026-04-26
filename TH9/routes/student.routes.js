const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/student.controller");
const { requireLogin } = require("../middleware/auth.middleware");

router.use(requireLogin);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.get("/stats/all", ctrl.stats);
router.get("/stats/class", ctrl.statsByClass);

module.exports = router;