import type { User } from '@prisma/client';
export type CreateUserInput = Pick<User, 'username' | 'password' | 'email'>;
export type LoginUserInput = Pick<User, 'email' | 'password'>;
