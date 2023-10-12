import { PrismaClient } from '@prisma/client';
import type { Friendship } from '@prisma/client';

import { checkIfUserExists } from './userServices';
import { checkIfUsersAreFriends } from './frienshipServices';
import type { getAllOpenInvitationsResponse } from '../types/friendshipTypes';

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
  senderUsername: string,
): Promise<Friendship> => {
  const invitation = await prisma.friendshipInvitation.findMany({
    where: {
      status: 'SENT',
      receiverUsername,
      senderUsername,
    },
  });
  if (invitation.length === 0)
    throw new Error(
      'Invitation not found. You must be authenticated as the receiver and the invitiation must not be previously accepted or rejected.',
    );
  const [, resultFriendship] = await prisma.$transaction([
    prisma.friendshipInvitation.updateMany({
      where: {
        senderUsername,
        receiverUsername,
      },
      data: {
        status: 'ACCEPTED',
      },
    }),
    prisma.friendship.create({
      data: {
        userName1: senderUsername,
        userName2: receiverUsername,
      },
    }),
  ]);
  return resultFriendship;
};

export const rejectFriendshipInvitation = async (
  receiverUsername: string,
  senderUsername: string,
): Promise<void> => {
  try {
    console.log('UPDATING FRIENDSHIP');
    await prisma.friendshipInvitation.updateMany({
      where: {
        status: 'SENT',
        receiverUsername,
        senderUsername,
      },
      data: {
        status: 'REJECTED',
      },
    });
  } catch (error) {
    throw new Error(
      'Invitation not found. You must be authenticated as the receiver and the invitiation must not be previously accepted or rejected.',
    );
  }
};

export const cancelFriendshipInvitation = async (
  senderUsername: string,
  receiverUsername: string,
): Promise<void> => {
  await prisma.friendshipInvitation.deleteMany({
    where: {
      senderUsername,
      receiverUsername,
      status: 'SENT',
    },
  });
};

export const getAllOpenFriendshipInvitations = async (
  username: string,
): Promise<getAllOpenInvitationsResponse> => {
  const invitationsReceived = await prisma.friendshipInvitation.findMany({
    where: {
      receiverUsername: username,
      status: 'SENT',
    },
  });
  const invitationsSent = await prisma.friendshipInvitation.findMany({
    where: {
      senderUsername: username,
      status: 'SENT',
    },
  });
  return {
    invitationsReceived,
    invitationsSent,
  };
};
