const BaseRepository = require("./base.repository");
const dayjs = require("dayjs");

class UserRepository extends BaseRepository {
  constructor() {
    super("User");
  }

  async getAllByRole(role) {
    return await this.model.find({ role: role });
  }
}

class AppointmentRepository extends BaseRepository {
  constructor() {
    super("Appointment");
  }

  async getByStatus(status) {
    return await this.model.find({ status: status });
  }

  async addMedical_record_id(appointment_id, medical_record_id) {
    return await this.model.findByIdAndUpdate(
      appointment_id,
      { medical_record_id },
      { new: true }
    );
  }
}

class ComesticRepository extends BaseRepository {
  constructor() {
    super("Comestic");
  }

  async sortByPrice(type) {
    return await this.model.find().sort({ price: type }); // 1 để sắp xếp tăng dần, -1 để sắp xếp giảm dần
  }

  async updateQuantity(id, quantity) {
    return await this.model.findByIdAndUpdate(
      id,
      { $inc: { quantity: -quantity } },
      { new: true }
    );
  }
}

class MedicineRepository extends BaseRepository {
  constructor() {
    super("Medicine");
  }

  async updateQuantity(id, quantity) {
    return await this.model.findByIdAndUpdate(
      id,
      { $inc: { quantity: -quantity } },
      { new: true }
    );
  }
}

class Medical_RecordRepository extends BaseRepository {
  constructor() {
    super("Medical_Record");
  }

  async getByCustomerId(_id) {
    return await this.model.find({ customer_id: _id });
  }
}

class CartRepository extends BaseRepository {
  constructor() {
    super("Cart");
  }

  async getCartByCustomerId(currentCustomerId) {
    return await this.model.findOne({ customer_id: currentCustomerId });
  }
}

class OrderRepository extends BaseRepository {
  constructor() {
    super("Order");
  }

  async getByCustomerId(currentCustomerId) {
    return await this.model.find({ customer_id: currentCustomerId });
  }
}

class TreatmentRepository extends BaseRepository {
  constructor() {
    super("Treatment");
  }
}

class TransactionRepository extends BaseRepository {
  constructor() {
    super("Transaction");
  }

  async getByDate(date) {
    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    return await this.model.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  async getByWeek(startOfWeek, endOfWeek) {
    return await this.model.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });
  }

  async getByMonth(month, year) {
    const startOfMonth = moment(`${year}-${month}-01`)
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}-01`).endOf("month").toDate();
    return await this.model.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });
  }
}

class ScheduleRepository extends BaseRepository {
  constructor() {
    super("Schedule");
  }

  async getDoctorsByDate(date) {
    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    return await this.model
      .find({
        "schedules.schedule_date": { $gte: startOfDay, $lt: endOfDay }, //$ gte: greater than or equal. $lt: less than
        "schedules.status": "available",
      })
      .populate("doctor", "name") // Lấy name từ bảng User
      .select("doctor -_id"); // Loại bỏ `_id` của `Schedule`
    // Giải thích thêm trong file
  }

  async getByDoctorId(_id) {
    return await this.model.find({ doctor: _id });
  }
}

module.exports = {
  userRepository: new UserRepository(),
  appointmentRepository: new AppointmentRepository(),
  comesticRepository: new ComesticRepository(),
  medicineRepository: new MedicineRepository(),
  medical_RecordRepository: new Medical_RecordRepository(),
  cartRepository: new CartRepository(),
  orderRepository: new OrderRepository(),
  treatmentRepository: new TreatmentRepository(),
  transactionRepository: new TransactionRepository(),
  scheduleRepository: new ScheduleRepository(),
};
