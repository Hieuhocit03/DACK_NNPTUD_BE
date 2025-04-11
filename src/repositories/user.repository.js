const BaseRepository = require("./base.repository");
const User = require("../models/user.model");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email: email });
  }

  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      return await User.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await User.find();
    } catch (error) {
      throw error;
    }
  }

  async findByRole(role) {
    return await this.getAll({ role: role });
  }

  async updateStatus(id, status) {
    return await this.updateOne({ _id: id }, { status: status });
  }

  async getUserByName(name) {
    return await this.getByName(name);
  }

  async searchUserByName(name) {
    return await this.searchByName(name);
  }
}

module.exports = UserRepository;
