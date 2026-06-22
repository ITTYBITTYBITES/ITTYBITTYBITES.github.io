export interface RewardPayload {
  trigger: 'milestone' | 'spending';
  value: number;
  rewardType: 'premium_currency' | 'bonus_pack';
}
