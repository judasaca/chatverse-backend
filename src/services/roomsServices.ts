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
  const userId = await getUserId(username);
  const rooms = await prisma.room.findMany({
    where: {
      NOT: {
        usersIds: {
          has: userId,
        },
      },
    },
  });
  return rooms;
};
export const retrieveJoinedRooms = async (
  username: string,
): Promise<Room[]> => {
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

export const searchNoJoinedRooms = async (
  username: string,
  roomName: string,
): Promise<string[]> => {
  const userId = await getUserId(username);
  const rooms = await prisma.room.findMany({
    where: {
      name: {
        contains: roomName,
        mode: 'insensitive',
      },
      NOT: {
        usersIds: {
          has: userId,
        },
      },
    },
    select: {
      name: true,
    },
  });
  return rooms.map(r => r.name);
};

export const checkIfUserInRoom = async (
  roomName: string,
  username: string,
): Promise<boolean> => {
  const userId = await getUserId(username);
  const count = await prisma.room.count({
    where: {
      name: roomName,
      usersIds: {
        has: userId,
      },
    },
  });
  return count > 0;
};

export const deleteRoom = async (
  roomName: string,
  username: string,
): Promise<Room> => {
  try {
    const [, room] = await prisma.$transaction([
      prisma.roomMessage.deleteMany({ where: { roomName } }),
      prisma.room.delete({
        where: {
          name: roomName,
          admins: {
            has: username,
          },
        },
      }),
    ]);
    return room;
  } catch (error) {
    throw new Error('You are not allowed to remove the room');
  }
};

export const joinRoom = async (
  roomName: string,
  username: string,
): Promise<Room> => {
  const userExistsInRoom = await checkIfUserInRoom(roomName, username);
  if (userExistsInRoom) throw new Error('User already exists in the room');
  const userId = await getUserId(username);
  try {
    const result = await prisma.room.update({
      where: { name: roomName },
      data: {
        usersIds: {
          push: userId,
        },
      },
    });
    return result;
  } catch {
    throw new Error('You can not join that room');
  }
};
