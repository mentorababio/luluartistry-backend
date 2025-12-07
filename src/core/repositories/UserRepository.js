/**
 * src/core/repositories/UserRepository.js
 * User repository for User model operations
 */

const BaseRepository = require('./BaseRepository');
const User = require('../../../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return await this.model.findOne({ email }).select('+password');
  }

  /**
   * Find user by email without password field
   * @param {String} email - User email
   * @returns {Promise<Object>}
   */
  async findByEmailPublic(email) {
    return await this.model.findOne({ email });
  }

  /**
   * Find user by reset password token
   * @param {String} token - Reset password token
   * @returns {Promise<Object>}
   */
  async findByResetToken(token) {
    return await this.model.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

  /**
   * Check if user exists by email
   * @param {String} email - User email
   * @returns {Promise<Boolean>}
   */
  async existsByEmail(email) {
    return await this.exists({ email });
  }

  /**
   * Get user profile with all details
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  async getUserProfile(userId) {
    return await this.model.findById(userId).select('-password');
  }

  /**
   * Get all users (admin only)
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>}
   */
  async getAllUsers(filters = {}, options = {}) {
    return await this.findAll(filters, {
      ...options,
      select: '-password'
    });
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updateData) {
    return await this.update(userId, updateData, {
      new: true,
      runValidators: true
    }).select('-password');
  }
}

module.exports = new UserRepository();
