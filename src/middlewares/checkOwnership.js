const { UserRole } = require('../constants/roles');

const checkOwnership = (model) => {
    return async (req, res, next) => {
        try {
            // Nếu là admin thì cho phép luôn
            if (req.user.role === UserRole.ADMIN) {
                return next();
            }

            // Lấy ID từ request params
            const resourceId = req.params.id;
            
            // Tìm resource trong database
            const resource = await model.findById(resourceId);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Kiểm tra xem user có phải là chủ sở hữu không
            if (resource.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this resource'
                });
            }

            // Nếu là chủ sở hữu thì cho phép
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };
};

module.exports = checkOwnership; 