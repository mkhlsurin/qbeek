import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/user.routes.js';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);


export default app;
