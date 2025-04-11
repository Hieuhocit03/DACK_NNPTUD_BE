const Contact = require("../models/contact.model");

const contactService = {
  // Tạo contact mới
  create: async (data) => {
    const contact = new Contact(data);
    return await contact.save();
  },

  // Lấy tất cả contacts
  getAll: async () => {
    return await Contact.find().sort({ createdAt: -1 });
  },

  // Lấy contact theo ID
  getById: async (id) => {
    return await Contact.findById(id);
  },

  // Cập nhật contact
  update: async (id, data) => {
    return await Contact.findByIdAndUpdate(id, data, { new: true });
  },

  // Xóa contact
  delete: async (id) => {
    return await Contact.findByIdAndDelete(id);
  },
};

module.exports = contactService; 