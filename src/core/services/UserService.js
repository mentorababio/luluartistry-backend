const BaseService = require('./BaseService');
const UserRepository = require('../repositories/UserRepository');
const AuthenticationError = require('../errors/AuthenticationError');
const ConflictError = require('../errors/ConflictError');

class UserService extends BaseService {
  constructor() {
    super(UserRepository);
  }

  async createUser(userData) {
    try {
      const user = await this.repository.create(userData);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictError('User with this email already exists');
      }
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await this.repository.findByEmail(email);
      
      if (!user || !(await user.matchPassword(password))) {
        throw new AuthenticationError('Invalid credentials');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.getById(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const user = await this.update(userId, updateData);
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();