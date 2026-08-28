import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authService } from '../services/auth.service.js';
import { apiResponse } from "../utils/apiResponse.js";
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const generateToken = (user: any) =>
  jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  );

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  };

  const user = await authService.register({ name, email, password, role });
  const token = generateToken(user);

  res.status(201).json(
    apiResponse(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      'User registered'
    )
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  const user = await authService.login(email, password);
  const token = generateToken(user);

  res.json(
    apiResponse(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      'User logged in'
    )
  );
});