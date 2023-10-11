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

interface authR {
  token: string;
  username: string;
}

export const authenticateUser = async (
  user: LoginUserInput,
): Promise<authR> => {
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
    return { token, username: requestedUser.username };
  } else {
    throw new Error('Wrong password');
  }
};

export const checkIfUserExists = async (username: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  return !(user === null);
};

export const getUserId = async (username: string): Promise<string> => {
  const id = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  return id === null ? '' : id.id;
};

export const searchUserByUsername = async (
  username: string,
  currentUsername: string,
): Promise<string[]> => {
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: username,
        mode: 'insensitive',
      },
    },
    select: {
      username: true,
    },
  });
  console.log(users);
  const bestMatches = users
    .map(u => u.username)
    .filter(u => u !== currentUsername);
  return bestMatches;
};
