import User from '../models/User.model.js';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      const err: any = new Error('User already exists');
      err.status = 400;
      throw err;
    }

    const user = await User.create(data);
    return user;
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    return user;
  },
};