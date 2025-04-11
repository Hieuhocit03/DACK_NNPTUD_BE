const contactService = require("../services/contact.service");

const contactController = {
  // Tạo contact mới
  create: async (req, res) => {
    try {
      const contact = await contactService.create(req.body);
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy tất cả contacts (chỉ admin)
  getAll: async (req, res) => {
    try {
      const contacts = await contactService.getAll();
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy contact theo ID (chỉ admin)
  getById: async (req, res) => {
    try {
      const contact = await contactService.getById(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(200).json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật contact (chỉ admin)
  update: async (req, res) => {
    try {
      const contact = await contactService.update(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(200).json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Xóa contact (chỉ admin)
  delete: async (req, res) => {
    try {
      const contact = await contactService.delete(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = contactController; 