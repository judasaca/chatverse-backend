import { PrismaClient } from '@prisma/client';
import { checkIfUserExists } from './userServices';

const prisma = new PrismaClient();

export const checkIfUsersAreFriends = async (
  userName1: string,
  userName2: string,
): Promise<boolean> => {
  const friendship = await prisma.friendship.count({
    where: {
      OR: [
        {
          userName1,
          userName2,
        },
        {
          userName1: userName2,
          userName2: userName1,
        },
      ],
    },
  });
  return friendship > 0;
};

export const sendFriendshipInvitation = async (
  senderUsername: string,
  receiverUsername: string,
): Promise<void> => {
  if (senderUsername === receiverUsername)
    throw new Error('You can not send an invitation to yoursef.');
  const usersExists = await checkIfUserExists(receiverUsername);
  if (!usersExists) throw new Error('Receiver user does not exists');
  const usersAreFriends = await checkIfUsersAreFriends(
    senderUsername,
    receiverUsername,
  );
  if (usersAreFriends)
    throw new Error(`You are already friend of ${receiverUsername}`);

  await prisma.friendshipInvitation.create({
    data: {
      receiverUsername,
      senderUsername,
    },
  });
};
