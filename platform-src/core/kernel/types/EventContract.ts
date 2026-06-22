export interface EventContract {
  eventId: string;
  sequenceId: number;
  timestamp: string;
  type: string;
  payload: Record<string, any>;
  source: string;
  metadata?: {
    version: string;
    correlationId?: string;
  };
}
