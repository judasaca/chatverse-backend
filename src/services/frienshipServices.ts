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
