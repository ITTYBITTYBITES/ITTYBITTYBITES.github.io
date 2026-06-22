import { EventContract } from '../types/EventContract';
import { PlatformState, INITIAL_PLATFORM_STATE } from '../state/PlatformState';

export function reduce(
  state: PlatformState = INITIAL_PLATFORM_STATE,
  event: EventContract
): PlatformState {
  // Idempotency: Drop duplicate events
  if (state.processedEventIds.has(event.eventId)) {
    console.log(`[Reducer] DUPLICATE eventId dropped: ${event.eventId}`);
    return state;
  }

  // Temporal Safety: Enforce sequenceId per source
  const lastSeq = state.lastSequenceIds[event.source] ?? -1;
  if (event.sequenceId <= lastSeq) {
    // Out-of-order or duplicate sequence — reject
    return {
      ...state,
      system: {
        ...state.system,
        errors: [
          ...state.system.errors,
          { eventId: event.eventId, message: `Out-of-order sequenceId from ${event.source}` },
        ],
      },
    };
  }

  // Create new state (purity)
  const newState: PlatformState = {
    ...state,
    processedEventIds: new Set(state.processedEventIds).add(event.eventId),
    lastSequenceIds: {
      ...state.lastSequenceIds,
      [event.source]: event.sequenceId,
    },
    timestamp: event.timestamp,
    system: {
      ...state.system,
      eventCount: state.system.eventCount + 1,
    },
  };

  // Domain-specific handling (pure transformations)
  if (event.type === 'milestone.level_up') {
    const newLevel = event.payload.newLevel ?? state.player.level + 1;
    newState.player = {
      ...state.player,
      level: newLevel,
      xp: event.payload.xp ?? state.player.xp,
    };
  }

  if (event.type === 'economic.resource_gained') {
    const { resource, amount } = event.payload;
    newState.player.resources = {
      ...state.player.resources,
      [resource]: (state.player.resources[resource] || 0) + amount,
    };
  }

  if (event.type === 'economic.reward_claimed') {
    const rewardAmount = event.payload.amount ?? 25;
    newState.player.resources = {
      ...state.player.resources,
      gold: (state.player.resources.gold || 0) + rewardAmount,
    };
  }

  // Update world time
  if (state.world.time.lastEventTimestamp) {
    const prev = new Date(state.world.time.lastEventTimestamp).getTime();
    const curr = new Date(event.timestamp).getTime();
    newState.world.time.totalElapsedMs += Math.max(0, curr - prev);
  }
  newState.world.time.lastEventTimestamp = event.timestamp;

  return newState;
}
