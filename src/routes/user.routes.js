const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { UserRole } = require('../constants/roles');
const checkRole = require('../middlewares/checkRole');
const checkOwnership = require('../middlewares/checkOwnership');
const User = require('../models/user.model');

// Lấy tất cả users (phân trang) - chỉ admin
router.get('/', checkRole([UserRole.ADMIN]), userController.getAllUsers);

// Lấy user theo ID - admin hoặc chính user đó
router.get('/:id', checkOwnership(User), userController.getUserById);

// Tạo user mới - chỉ admin
router.post('/', checkRole([UserRole.ADMIN]), userController.createUser);

// Cập nhật user - admin hoặc chính user đó
router.put('/:id', checkOwnership(User), userController.updateUser);

// Xóa user - chỉ admin
router.delete('/:id', checkRole([UserRole.ADMIN]), userController.deleteUser);

// Tìm kiếm user - chỉ admin
router.get('/search', checkRole([UserRole.ADMIN]), userController.searchUsers);

// Thay đổi trạng thái user - chỉ admin
router.put('/:id/toggle-status', checkRole([UserRole.ADMIN]), userController.toggleUserStatus);

// Cập nhật thông tin cá nhân - chính user đó
router.put('/profile', checkOwnership(User), userController.updateProfile);

module.exports = router; 