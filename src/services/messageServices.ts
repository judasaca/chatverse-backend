import { PrismaClient } from '@prisma/client';
import { checkIfUsersAreFriends } from './frienshipServices';

const prisma = new PrismaClient();

export const sendDirectMessage = async (
  from: string,
  to: string,
  content: string,
): Promise<void> => {
  const areFriends = await checkIfUsersAreFriends(from, to);
  if (!areFriends) throw new Error('Users are not friends');
  await prisma.directMessage.create({
    data: { senderUsername: from, receiverUsername: to, message: content },
  });
};
