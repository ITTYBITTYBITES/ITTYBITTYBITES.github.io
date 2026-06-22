import { PlatformState } from '../../core/kernel/state/PlatformState';

export const selectPlayerLevel = (state: PlatformState): number => state.player.level;
export const selectPlayerXP = (state: PlatformState): number => state.player.xp;
