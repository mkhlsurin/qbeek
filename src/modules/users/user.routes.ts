import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import { list, getById, create, update, remove } from './user.controller.js';
import { requireAdmin, allowSelfOrAdmin  } from '../../middlewares/requireRole.js';

const router = Router();

// All user routes require a valid access token
router.use(authJwt);

// Admin-only: list users
router.get('/', requireAdmin, list);

// Admin or owner: get user by id
router.get('/:id', allowSelfOrAdmin, getById);

// Admin-only: create user
router.post('/', requireAdmin, create);

// Admin or owner (controller enforces field-level rules)
router.put('/:id', update);

// Admin-only: delete user
router.delete('/:id', requireAdmin, remove);

export default router;
