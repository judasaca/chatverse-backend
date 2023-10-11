import { PrismaClient } from '@prisma/client';
import {
  checkIfUsersAreFriends,
  getAllCurrentFriends,
} from './frienshipServices';
import type { DirectMessage } from '@prisma/client';

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

interface HomeDirectMessages {
  friend: string;
  message: DirectMessage;
}
export const getLatestMessagesHome = async (
  username: string,
): Promise<HomeDirectMessages[]> => {
  const friends = await getAllCurrentFriends(username);

  const results: HomeDirectMessages[] = [];
  for (let i = 0; i < friends.length; i++) {
    const friendUsername = friends[i];

    const latestMessages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { receiverUsername: friendUsername, senderUsername: username },
          { receiverUsername: username, senderUsername: friendUsername },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    if (latestMessages.length > 0) {
      results.push({
        friend: friendUsername,
        message: latestMessages[0],
      });
    }
  }
  return results;
};

export const retrieveLatestDirectMessages = async (
  afterTimestamp: string | null,
  username1: string,
  username2: string,
): Promise<DirectMessage[]> => {
  let messages: DirectMessage[];
  if (afterTimestamp === null) {
    messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          {
            senderUsername: username1,
            receiverUsername: username2,
          },
          {
            receiverUsername: username1,
            senderUsername: username2,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 15,
    });
  } else {
    messages = await prisma.directMessage.findMany({
      where: {
        createdAt: {
          lt: afterTimestamp,
        },
        OR: [
          {
            senderUsername: username1,
            receiverUsername: username2,
          },
          {
            receiverUsername: username1,
            senderUsername: username2,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 15,
    });
  }
  return messages;
};
