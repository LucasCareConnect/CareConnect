import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
