/**
 * src/core/services/BaseService.js
 * Base service class with common operations
 * All services should extend this class
 */

const IBaseService = require('../interfaces/IBaseService');

class BaseService extends IBaseService {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  /**
   * Create a new resource
   * @param {Object} data - Resource data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return await this.repository.create(data);
  }

  /**
   * Get resource by ID
   * @param {String} id - Resource ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const NotFoundError = require('../errors/NotFoundError');
    
    const resource = await this.repository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    return resource;
  }

  /**
   * Get all resources
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}, options = {}) {
    return await this.repository.findAll(filters, options);
  }

  /**
   * Update resource
   * @param {String} id - Resource ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const NotFoundError = require('../errors/NotFoundError');
    
    const resource = await this.repository.update(id, data);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    return resource;
  }

  /**
   * Delete resource
   * @param {String} id - Resource ID
   * @returns {Promise<Boolean>}
   */
  async delete(id) {
    const NotFoundError = require('../errors/NotFoundError');
    
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Resource not found');
    }
    return true;
  }

  /**
   * Check if resource exists
   * @param {Object} query - Query criteria
   * @returns {Promise<Boolean>}
   */
  async exists(query) {
    return await this.repository.exists(query);
  }

  /**
   * Count resources
   * @param {Object} query - Query criteria
   * @returns {Promise<Number>}
   */
  async count(query = {}) {
    return await this.repository.count(query);
  }
}

module.exports = BaseService;
