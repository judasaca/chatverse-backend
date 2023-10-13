import { PrismaClient } from '@prisma/client';

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

export const getAllCurrentFriends = async (
  username: string,
): Promise<string[]> => {
  const friendsRelations = await prisma.friendship.findMany({
    where: {
      OR: [{ userName1: username }, { userName2: username }],
    },
  });
  const friendsUsernames = friendsRelations.map(f => {
    if (f.userName1 === username) {
      return f.userName2;
    } else {
      return f.userName1;
    }
  });
  return friendsUsernames;
};

export const deleteFriend = async (
  username: string,
  friendUsername: string,
): Promise<void> => {
  const results = await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userName1: username, userName2: friendUsername },
        { userName1: friendUsername, userName2: username },
      ],
    },
  });
  if (results.count === 0)
    throw new Error(`${friendUsername} is not a friend yours.`);
};

export const searchFriend = async (
  currentUsername: string,
  friendUsername: string,
): Promise<string[]> => {
  const friends = await prisma.friendship.findMany({
    where: {
      OR: [
        {
          userName1: currentUsername,
          userName2: {
            contains: friendUsername,
            mode: 'insensitive',
          },
        },
        {
          userName2: currentUsername,
          userName1: {
            contains: friendUsername,
            mode: 'insensitive',
          },
        },
      ],
    },
  });
  const bestMatches = friends.map(f => {
    if (f.userName1 === currentUsername) {
      return f.userName2;
    } else {
      return f.userName1;
    }
  });
  return bestMatches;
};
