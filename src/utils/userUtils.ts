import type { CreateUserInput, LoginUserInput } from '../types/userTypes';

export const toNewUser = (obj: any): CreateUserInput => {
  const newUser: CreateUserInput = {
    username: obj.username,
    password: obj.password,
    email: obj.email,
  };
  return newUser;
};

export const toLoginUserInput = (obj: any): LoginUserInput => {
  const newUser: LoginUserInput = {
    password: obj.password,
    email: obj.email,
  };
  return newUser;
};
