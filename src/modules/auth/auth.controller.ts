import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';  
import type { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../users/user.model.js';


// helpers
const { sign } = jwt;
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const publicUser = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || typeof email !== 'string' || !isEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'Manager',
    });

    const payload = { sub: user.id, role: user.role as 'Admin' | 'Manager' };
    const accessToken = sign(
    payload,
    env.JWT_ACCESS_SECRET as Secret,
    { expiresIn: env.JWT_ACCESS_EXPIRES } as SignOptions
    );

    const refreshToken = sign(
    payload,
    env.JWT_REFRESH_SECRET as Secret,
    { expiresIn: env.JWT_REFRESH_EXPIRES } as SignOptions
    );


    return res.status(201).json({
      user: publicUser(user),
      accessToken,
      refreshToken,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || typeof email !== 'string' || !isEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { sub: user.id, role: user.role as 'Admin' | 'Manager' };
    const accessToken = sign(
    payload,
    env.JWT_ACCESS_SECRET as Secret,
    { expiresIn: env.JWT_ACCESS_EXPIRES } as SignOptions
    );

    const refreshToken = sign(
    payload,
    env.JWT_REFRESH_SECRET as Secret,
    { expiresIn: env.JWT_REFRESH_EXPIRES } as SignOptions
    );


    return res.json({
      user: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
