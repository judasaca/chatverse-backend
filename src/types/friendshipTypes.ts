import type { FriendshipInvitation } from '@prisma/client';

export type friendshipRequestInput = Pick<
  FriendshipInvitation,
  'receiverUsername' | 'senderUsername'
>;

export interface getAllOpenInvitationsResponse {
  invitationsSent: FriendshipInvitation[];
  invitationsReceived: FriendshipInvitation[];
}
