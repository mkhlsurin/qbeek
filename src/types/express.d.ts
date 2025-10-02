import type { JwtUser } from '../middlewares/authJwt';

declare global {
  namespace Express {
    interface Request {
        // this one set by JWT middleware
        user?: JwtUser; 
    }
  }
}

export {};