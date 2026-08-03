export const SAVE_VERSION = 2;
export const CURRENT_APP_VERSION = 1;

export interface Capsule {
  magic: string;
  app: string;
  version: number;
  exportedAt: string;
  world: any;
  photos: any[];
  daysOld: number;
}
