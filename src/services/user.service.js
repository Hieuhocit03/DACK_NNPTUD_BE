const _repository = require("../repositories/sub.repository");

class UserService {
  async getAllByRole(role) {
    return await _repository.userRepository.getAllByRole(role);
  }

  async getById(id) {
    return await _repository.userRepository.getById(id);
  }

  async add(entity) {
    await _repository.userRepository.add(entity);
    return "Thêm thành công";
  }

  async update(id, entity) {
    await _repository.userRepository.update(id, entity);
    return "Đã cập nhật thành công";
  }

  async delete(id) {
    await _repository.userRepository.delete(id);
    return "Đã xóa thành công";
  }
}

module.exports = new UserService();
