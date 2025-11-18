import { PayloadToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

export {};
