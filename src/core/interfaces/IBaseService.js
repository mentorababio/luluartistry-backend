/**
 * src/core/interfaces/IBaseService.js
 * Base interface for all services
 * All services should extend this interface
 */

class IBaseService {
  /**
   * Create a new resource
   * @param {Object} data - Data to create resource
   * @returns {Promise<Object>} - Created resource
   */
  async create(data) {
    throw new Error('create() method not implemented');
  }

  /**
   * Get resource by ID
   * @param {String} id - Resource ID
   * @returns {Promise<Object>} - Found resource
   */
  async getById(id) {
    throw new Error('getById() method not implemented');
  }

  /**
   * Get all resources
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - Array of resources
   */
  async getAll(filters = {}, options = {}) {
    throw new Error('getAll() method not implemented');
  }

  /**
   * Update resource
   * @param {String} id - Resource ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Updated resource
   */
  async update(id, data) {
    throw new Error('update() method not implemented');
  }

  /**
   * Delete resource
   * @param {String} id - Resource ID
   * @returns {Promise<Boolean>} - Deletion status
   */
  async delete(id) {
    throw new Error('delete() method not implemented');
  }
}

module.exports = IBaseService;
