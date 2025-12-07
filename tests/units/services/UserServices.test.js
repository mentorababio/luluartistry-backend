const UserService = require('../../../services/UserService');
const User = require('../../../models/User');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        firstName: 'fortunatexian',
        lastName: 'joy',
        email: 'fortunateokpata@gmail.com',
        phone: '08160786077',
        password: 'Xianjurist@3577'
      };

      const user = await UserService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        firstName: 'fortunatexian',
        lastName: 'joy',
        email: 'fortunateokpata@gmail.com',
        phone: '08160786077',
        password: 'Xianjurist@3577'
      };

      await UserService.createUser(userData);
      
      await expect(UserService.createUser(userData))
        .rejects.toThrow('User with this email already exists');
    });
  });
});