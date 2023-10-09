import { getUserId } from './services/userServices';

interface SessionSchema {
  userId: string;
  username: string;
  connected: boolean;
}

class InMemorySessionStore {
  sessions: Map<string, SessionSchema>;
  constructor() {
    this.sessions = new Map();
  }

  findSession(id: string): SessionSchema | undefined {
    return this.sessions.get(id);
  }

  saveSession(id: string, session: SessionSchema): void {
    this.sessions.set(id, session);
  }

  findAllSessions(): SessionSchema[] {
    return [...this.sessions.values()];
  }

  async findOrSaveSession(
    sessionID: string,
    userName: string,
  ): Promise<SessionSchema> {
    const session = this.findSession(sessionID);
    if (session === undefined) {
      const userId = await getUserId(userName);
      const newSession: SessionSchema = {
        userId,
        username: userName,
        connected: true,
      };
      this.saveSession(sessionID, newSession);
      return newSession;
    } else {
      return session;
    }
  }
}

export default InMemorySessionStore;
