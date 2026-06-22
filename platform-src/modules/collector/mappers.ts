import { EventContract } from '../../core/kernel/types/EventContract';

let sequenceCounter = 0;

export function createResourceGainedEvent(
  resource: string,
  amount: number
): EventContract {
  return {
    eventId: crypto.randomUUID(),
    sequenceId: ++sequenceCounter,
    timestamp: new Date().toISOString(),
    type: 'economic.resource_gained',
    payload: {
      resource,
      amount,
    },
    source: 'resource-collector',
    metadata: {
      version: '1.0.0',
    },
  };
}
