const { UserRole } = require('../constants/roles');

const checkRole = (roles) => {
    return (req, res, next) => {
        // Kiểm tra xem user đã đăng nhập chưa
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized - Please login first' 
            });
        }

        // Kiểm tra role của user có trong danh sách roles được phép không
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'Forbidden - You do not have permission to access this resource' 
            });
        }

        // Nếu có quyền thì cho phép tiếp tục
        next();
    };
};

module.exports = checkRole; 