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

export const checkIfFriendshipInvitationExists = async (
  username1: string,
  username2: string,
): Promise<boolean> => {
  const count = await prisma.friendshipInvitation.count({
    where: {
      OR: [
        { senderUsername: username1, receiverUsername: username2 },
        { senderUsername: username2, receiverUsername: username1 },
      ],
      status: 'SENT',
    },
  });
  return count > 0;
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

  const invitationExists = await checkIfFriendshipInvitationExists(
    senderUsername,
    receiverUsername,
  );
  if (invitationExists)
    throw new Error(
      `You have an open friendship invitation with ${receiverUsername}`,
    );

  await prisma.friendshipInvitation.create({
    data: {
      receiverUsername,
      senderUsername,
    },
  });
};
