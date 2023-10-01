import type { FriendshipInvitation } from '@prisma/client';

export type friendshipRequestInput = Pick<
  FriendshipInvitation,
  'receiverUsername' | 'senderUsername'
>;
