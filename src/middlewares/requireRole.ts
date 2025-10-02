import type { RequestHandler } from 'express';

// Only Admin
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) return res.sendStatus(401);
  if (req.user.role !== 'Admin') return res.sendStatus(403);
  next();
};

// Admin or owner (:id)
export const allowSelfOrAdmin: RequestHandler = (req, res, next) => {
  const user = req.user;
  if (!user) return res.sendStatus(401);
  if (user.role === 'Admin' || user.id === req.params.id) return next();
  return res.sendStatus(403);
};

// Single-role factory for Admins and Manager
export const requireRole = (role: 'Admin' | 'Manager'): RequestHandler => (req, res, next) => {
  if (!req.user) return res.sendStatus(401);
  if (req.user.role !== role) return res.sendStatus(403);
  next();
};
