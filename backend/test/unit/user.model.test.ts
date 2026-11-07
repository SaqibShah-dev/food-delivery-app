import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import User from '../../src/models/User.model.js';

describe('user password behavior', () => {
  it('hashes plaintext passwords before saving and compares them through the model method', async () => {
    vi.spyOn(User.collection, 'insertOne').mockResolvedValue({
      acknowledged: true,
      insertedId: new mongoose.Types.ObjectId(),
    });

    const user = new User({
      name: 'Alex',
      email: 'alex@example.com',
      password: 'correct-horse',
      role: 'user',
    });

    await user.save();

    expect(user.password).not.toBe('correct-horse');
    await expect(user.comparePassword('correct-horse')).resolves.toBe(true);
    await expect(user.comparePassword('wrong-password')).resolves.toBe(false);
  });
});
