const authService = require('../../services/authService');
const prisma = require('../../config/database');
const bcrypt = require('bcryptjs');

jest.mock('../../config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('bcryptjs');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue({
        id: '123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'READER'
      });

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      prisma.user.findUnique.mockResolvedValue({ id: '123' });

      await expect(authService.register(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      prisma.user.findUnique.mockResolvedValue({
        id: '123',
        email,
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'READER'
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(email);
    });

    it('should throw error with invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});