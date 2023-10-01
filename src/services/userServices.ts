import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import type { CreateUserInput, LoginUserInput } from '../types/userTypes';
import { generateHash } from '../utils/security';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

export const createUser = async (newUser: CreateUserInput): Promise<void> => {
  newUser.password = generateHash(newUser.password);
  const post = await prisma.user.create({
    data: newUser,
  });
  console.log(post);
};

export const retrieveUser = async (email: string): Promise<User> => {
  console.log(email);
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  console.log(user);
  if (user === null) {
    throw new Error('User does not exist');
  }
  return user;
};

export const authenticateUser = async (
  user: LoginUserInput,
): Promise<string> => {
  const hashedInputPassword = generateHash(user.password);
  const requestedUser = await retrieveUser(user.email);
  if (requestedUser.password === hashedInputPassword) {
    const secret = String(process.env.TOKEN_SECRET);
    const token = jwt.sign(
      {
        username: requestedUser.username,
      },
      secret,
      {
        expiresIn: process.env.TOKEN_LIFE_TIME,
      },
    );
    return token;
  } else {
    throw new Error('Wrong password');
  }
};
