export interface FeedMessage {
  id: string;
  body: string;
  created_at: string;
  mine: boolean;
  pending?: boolean;
}

/** A cursor represents a fetched prefix, never just our latest sent message. */
export class MessageFeed {
  cursor = "";
  private messages = new Map<string, FeedMessage>();
  constructor(readonly threadId: string) {}

  receive(messages: FeedMessage[]) {
    for (const message of messages) {
      this.messages.set(message.id, message);
      if (/^\d+$/.test(message.id) && (!this.cursor || BigInt(message.id) > BigInt(this.cursor)))
        this.cursor = message.id;
    }
  }

  addPending(message: FeedMessage) { this.messages.set(message.id, message); }

  acknowledge(tempId: string, message: FeedMessage) {
    this.messages.delete(tempId);
    this.messages.set(message.id, { ...message, pending: false });
    // Do not advance cursor: another participant may have sent earlier IDs.
  }

  reject(tempId: string) { this.messages.delete(tempId); }

  snapshot(): FeedMessage[] {
    return [...this.messages.values()].sort((a, b) => {
      if (a.pending || b.pending) return Number(Boolean(a.pending)) - Number(Boolean(b.pending));
      return BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0;
    });
  }
}
