import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from './user.model.js';
import { env } from '../../config/env.js';

// tiny helpers
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const publicUser = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// GET /api/users  (Admin only)
export const list = async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map(publicUser));
};

// GET /api/users/:id  (Admin or owner)
export const getById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(user));
};

// POST /api/users  (Admin only)
export const create = async (req: Request, res: Response) => {
  const { name, email, role, password } = req.body ?? {};

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!email || typeof email !== 'string' || !isEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  if (role !== 'Admin' && role !== 'Manager') {
    return res.status(400).json({ message: 'Role must be Admin or Manager' });
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
  const user = await User.create({ name, email: normalizedEmail, passwordHash, role });
  return res.status(201).json(publicUser(user));
};

// PUT /api/users/:id  (Admin or owner)
export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user!; // set by authJwt
  const isAdmin = actor.role === 'Admin';
  const isSelf = actor.id === id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { name, email, role, password } = req.body ?? {};
  const update: any = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Invalid name' });
    update.name = name;
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    update.email = email.toLowerCase();
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!isAdmin) {
      // Managers cannot change password
      return res.status(403).json({ message: 'Only Admin can change password here' });
    }
    update.passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  }

  if (role !== undefined) {
    if (!isAdmin) return res.status(403).json({ message: 'Only Admin can change role' });
    if (role !== 'Admin' && role !== 'Manager') {
      return res.status(400).json({ message: 'Role must be Admin or Manager' });
    }
    update.role = role;
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(user));
};

// DELETE /api/users/:id  (Admin only)
export const remove = async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(204).send();
};
