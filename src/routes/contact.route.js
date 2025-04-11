const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");
const userRole = require("../enums/userRole.enum");

// Public routes
router.post("/", contactController.create);

// Admin routes
router.get("/", isAuthenticated, isAdmin, contactController.getAll);
router.get("/:id", isAuthenticated, isAdmin, contactController.getById);
router.put("/:id", isAuthenticated, isAdmin, contactController.update);
router.delete("/:id", isAuthenticated, isAdmin, contactController.delete);

module.exports = router;
