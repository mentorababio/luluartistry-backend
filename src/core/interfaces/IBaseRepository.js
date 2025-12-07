/**
 * src/core/interfaces/IBaseRepository.js
 * Base interface for all repositories
 * All repositories should extend this interface
 */

class IBaseRepository {
  /**
   * Find resource by ID
   * @param {String} id - Resource ID
   * @returns {Promise<Object>}
   */
  async findById(id) {
    throw new Error('findById() method not implemented');
  }

  /**
   * Find all resources
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('findAll() method not implemented');
  }

  /**
   * Create new resource
   * @param {Object} data - Resource data
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('create() method not implemented');
  }

  /**
   * Update resource
   * @param {String} id - Resource ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('update() method not implemented');
  }

  /**
   * Delete resource
   * @param {String} id - Resource ID
   * @returns {Promise<Boolean>}
   */
  async delete(id) {
    throw new Error('delete() method not implemented');
  }

  /**
   * Check if resource exists
   * @param {Object} query - Query criteria
   * @returns {Promise<Boolean>}
   */
  async exists(query) {
    throw new Error('exists() method not implemented');
  }

  /**
   * Count resources matching criteria
   * @param {Object} query - Query criteria
   * @returns {Promise<Number>}
   */
  async count(query = {}) {
    throw new Error('count() method not implemented');
  }
}

module.exports = IBaseRepository;
