class MenuItemRepository extends BaseRepository {
  constructor() {
    super("MenuItem");
  }

  async getByCategory(categoryId) {
    return await this.model.find({ category: categoryId, status: true });
  }

  async getTopRated(limit = 5) {
    return await this.model
      .find({ status: true })
      .sort({ ratingAverage: -1 })
      .limit(limit);
  }

  async search(query) {
    return await this.model.find({
      $text: { $search: query },
      status: true,
    });
  }
}
