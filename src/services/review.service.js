const _repository = require("../repositories/sub.repository");

exports.getAllReviews = async () => {
  return await _repository.reviewRepository.getAll();
};

exports.getReviewById = async (id) => {
  const review = await _repository.reviewRepository.getById(id);
  
  if (!review) {
    throw Object.assign(new Error("Đánh giá không tồn tại"), { status: 404 });
  }
  
  return review;
};

exports.getReviewsByMenuItem = async (menuItemId) => {
  // Kiểm tra món ăn tồn tại
  const menuItem = await _repository.menuItemRepository.getById(menuItemId);
  
  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }
  
  return await _repository.reviewRepository.getByMenuItem(menuItemId);
};

exports.getUserReviews = async (userId) => {
  return await _repository.reviewRepository.getUserReviews(userId);
};

exports.createReview = async (reviewData) => {
  // Kiểm tra món ăn tồn tại
  const menuItem = await _repository.menuItemRepository.getById(reviewData.menuItem);
  
  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }
  
  // Kiểm tra người dùng tồn tại
  const user = await _repository.userRepository.getById(reviewData.user);
  
  if (!user) {
    throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
  }
  
  // Kiểm tra xem người dùng đã đánh giá món ăn này chưa
  const existingReview = await _repository.reviewRepository.model.findOne({
    user: reviewData.user,
    menuItem: reviewData.menuItem
  });
  
  if (existingReview) {
    throw Object.assign(
      new Error("Bạn đã đánh giá món ăn này trước đó"), 
      { status: 400 }
    );
  }
  
  // Không còn xử lý hình ảnh
  return await _repository.reviewRepository.add(reviewData);
};

exports.updateReviewStatus = async (id, status) => {
  // Kiểm tra đánh giá tồn tại
  const review = await _repository.reviewRepository.getById(id);
  
  if (!review) {
    throw Object.assign(new Error("Đánh giá không tồn tại"), { status: 404 });
  }
  
  // Kiểm tra trạng thái hợp lệ
  const validStatuses = ["pending", "approved", "rejected"];
  
  if (!validStatuses.includes(status)) {
    throw Object.assign(
      new Error("Trạng thái không hợp lệ"), 
      { status: 400 }
    );
  }
  
  return await _repository.reviewRepository.update(id, { status });
};

exports.deleteReview = async (id) => {
  // Kiểm tra đánh giá tồn tại
  const review = await _repository.reviewRepository.getById(id);
  
  if (!review) {
    throw Object.assign(new Error("Đánh giá không tồn tại"), { status: 404 });
  }
  
  // Không cần xóa hình ảnh nữa vì không có
  
  return await _repository.reviewRepository.delete(id);
};

exports.getPendingReviews = async () => {
  return await _repository.reviewRepository.getPendingReviews();
};
