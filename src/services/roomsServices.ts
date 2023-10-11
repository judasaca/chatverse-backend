import { PrismaClient } from '@prisma/client';
import type { Room } from '@prisma/client';

import { getUserId } from './userServices';

const prisma = new PrismaClient();

export const createRoom = async (
  name: string,
  createdBy: string,
): Promise<Room> => {
  const userId = await getUserId(createdBy);
  const room = await prisma.room.create({
    data: {
      name,
      admins: [createdBy],
      usersIds: [userId],
    },
  });
  return room;
};

export const retrieveNoJoinedRooms = async (
  username: string,
): Promise<Room[]> => {
  const rooms = await prisma.room.findMany({
    where: {
      users: {
        none: {
          username,
        },
      },
    },
  });
  return rooms;
};
export const retrieveJoinedRooms = async (
  username: string,
): Promise<Room[]> => {
  console.log('REQUESING ', username);
  const userId = await getUserId(username);
  const rooms = await prisma.room.findMany({
    where: {
      usersIds: {
        has: userId,
      },
    },
  });
  return rooms;
};
