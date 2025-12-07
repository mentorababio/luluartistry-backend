/**
 * src/core/repositories/BaseRepository.js
 * Base repository class with common CRUD operations
 * All repositories should extend this class
 */

const IBaseRepository = require('../interfaces/IBaseRepository');

class BaseRepository extends IBaseRepository {
  constructor(model) {
    super();
    this.model = model;
  }

  /**
   * Find resource by ID
   * @param {String} id - Resource ID
   * @returns {Promise<Object>}
   */
  async findById(id) {
    return await this.model.findById(id);
  }

  /**
   * Find all resources with filters and pagination
   * @param {Object} filters - MongoDB filter criteria
   * @param {Object} options - { skip, limit, sort, select, populate }
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { createdAt: -1 }, select = '', populate = '' } = options;

    let query = this.model.find(filters);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    const data = await query
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.model.countDocuments(filters);

    return {
      data,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Create new resource
   * @param {Object} data - Resource data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const resource = new this.model(data);
    await resource.save();
    return resource;
  }

  /**
   * Update resource
   * @param {String} id - Resource ID
   * @param {Object} data - Data to update
   * @param {Object} options - { new: true, runValidators: true }
   * @returns {Promise<Object>}
   */
  async update(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  /**
   * Delete resource
   * @param {String} id - Resource ID
   * @returns {Promise<Boolean>}
   */
  async delete(id) {
    const result = await this.model.findByIdAndDelete(id);
    return result ? true : false;
  }

  /**
   * Check if resource exists
   * @param {Object} query - Query criteria
   * @returns {Promise<Boolean>}
   */
  async exists(query) {
    const result = await this.model.findOne(query);
    return result ? true : false;
  }

  /**
   * Count resources
   * @param {Object} query - Query criteria
   * @returns {Promise<Number>}
   */
  async count(query = {}) {
    return await this.model.countDocuments(query);
  }

  /**
   * Find one resource
   * @param {Object} query - Query criteria
   * @returns {Promise<Object>}
   */
  async findOne(query) {
    return await this.model.findOne(query);
  }

  /**
   * Find many resources
   * @param {Object} query - Query criteria
   * @returns {Promise<Array>}
   */
  async findMany(query) {
    return await this.model.find(query);
  }

  /**
   * Delete many resources
   * @param {Object} query - Query criteria
   * @returns {Promise<Number>} - Number deleted
   */
  async deleteMany(query) {
    const result = await this.model.deleteMany(query);
    return result.deletedCount;
  }

  /**
   * Bulk update
   * @param {Object} query - Query criteria
   * @param {Object} data - Data to update
   * @returns {Promise<Number>} - Number updated
   */
  async updateMany(query, data) {
    const result = await this.model.updateMany(query, data);
    return result.modifiedCount;
  }
}

module.exports = BaseRepository;
