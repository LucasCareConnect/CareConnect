import { UserRole } from '../../user/enum/user-role.enum';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  userType: UserRole;
}
