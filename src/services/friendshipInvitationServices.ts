import { PrismaClient } from '@prisma/client';
import type { Friendship } from '@prisma/client';

import { checkIfUserExists } from './userServices';
import { checkIfUsersAreFriends } from './frienshipServices';

const prisma = new PrismaClient();

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

export const acceptFriendshipInvitation = async (
  receiverUsername: string,
  invitationId: string,
): Promise<Friendship> => {
  const invitation = await prisma.friendshipInvitation.findUnique({
    where: {
      id: invitationId,
      status: 'SENT',
      receiverUsername,
    },
  });
  if (invitation === null)
    throw new Error(
      'Invitation not found. You must be authenticated as the receiver and the invitiation must not be previously accepted or rejected.',
    );
  const [, resultFriendship] = await prisma.$transaction([
    prisma.friendshipInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: 'ACCEPTED',
      },
    }),
    prisma.friendship.create({
      data: {
        userName1: invitation.senderUsername,
        userName2: invitation.receiverUsername,
      },
    }),
  ]);
  return resultFriendship;
};

export const rejectFriendshipInvitation = async (
  receiverUsername: string,
  invitationId: string,
): Promise<void> => {
  try {
    console.log('UPDATING FRIENDSHIP');
    await prisma.friendshipInvitation.update({
      where: {
        id: invitationId,
        status: 'SENT',
        receiverUsername,
      },
      data: {
        status: 'REJECTED',
      },
    });
    console.log('FINISHED UPDATING');
  } catch (error) {
    throw new Error(
      'Invitation not found. You must be authenticated as the receiver and the invitiation must not be previously accepted or rejected.',
    );
  }
};

export const cancelFriendshipInvitation = async (
  senderUsername: string,
  invitationId: string,
): Promise<void> => {
  await prisma.friendshipInvitation.delete({
    where: {
      senderUsername,
      id: invitationId,
      status: 'SENT',
    },
  });
};
