export interface ExperienceSession {
  id: string;
  experienceId: string;
  startedAt: number;
  endedAt?: number;
  interactions: number;
  durationMs?: number;
}

export interface ExperienceProgress {
  experienceId: string;
  totalSessions: number;
  totalInteractions: number;
  lastVisited: number;
  streakDays: number;
  personalArtifacts: number;
  lastArtifact?: string;
  completed: boolean;
  completionDate?: number;
  isFavorite?: boolean;
}

export interface CollectionProgress {
  collectionId: string;
  experiencesCompleted: string[];
  lastVisitedExperienceId?: string;
  startedAt: number;
  completedAt?: number;
}

export interface PlatformProfile {
  version: number;
  experiences: Record<string, ExperienceProgress>;
  collections: Record<string, CollectionProgress>;
  lastActiveExperienceId?: string;
  recentlyVisited: string[];
  completedCollections: string[];
  preferredCategories: Record<string, number>;
  lastVisit: number;
  totalVisits: number;
}

const PROGRESS_KEY = 'platform-experience-progress-v3';
const SESSIONS_KEY = 'platform-experience-sessions';
const CURRENT_VERSION = 3;

function loadProfile(): PlatformProfile {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === CURRENT_VERSION) {
        return {
          version: CURRENT_VERSION,
          experiences: parsed.experiences || {},
          collections: parsed.collections || {},
          lastActiveExperienceId: parsed.lastActiveExperienceId,
          recentlyVisited: parsed.recentlyVisited || [],
          completedCollections: parsed.completedCollections || [],
          preferredCategories: parsed.preferredCategories || {},
          lastVisit: parsed.lastVisit || Date.now(),
          totalVisits: parsed.totalVisits || 0
        };
      }
    }
  } catch { /* ignore */ }
  return {
    version: CURRENT_VERSION,
    experiences: {},
    collections: {},
    recentlyVisited: [],
    completedCollections: [],
    preferredCategories: {},
    lastVisit: Date.now(),
    totalVisits: 0
  };
}

function saveProfile(p: PlatformProfile): void {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function loadSessions(): any[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; }
}

function saveSessions(s: any[]): void {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); } catch { }
}

function getTodayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startSession(experienceId: string): ExperienceSession {
  const s = { id: 'sess_' + Date.now(), experienceId, startedAt: Date.now(), interactions: 0 };
  const all = loadSessions();
  all.push(s);
  saveSessions(all);

  const prog = loadProfile();
  prog.lastActiveExperienceId = experienceId;
  prog.totalVisits += 1;
  prog.lastVisit = Date.now();

  if (!prog.recentlyVisited.includes(experienceId)) {
    prog.recentlyVisited.unshift(experienceId);
    if (prog.recentlyVisited.length > 10) prog.recentlyVisited.pop();
  } else {
    prog.recentlyVisited = [experienceId, ...prog.recentlyVisited.filter(id => id !== experienceId)];
  }
  saveProfile(prog);

  return s;
}

export function recordInteraction(experienceId: string): void {
  const all = loadSessions();
  const open = all.filter((x: any) => x.experienceId === experienceId && !x.endedAt)
    .sort((a: any, b: any) => b.startedAt - a.startedAt)[0];
  if (open) {
    open.interactions = (open.interactions || 0) + 1;
    saveSessions(all);
  }

  const prog = loadProfile();
  const rec = prog.experiences[experienceId];
  if (rec) {
    rec.totalInteractions = (rec.totalInteractions || 0) + 1;
    saveProfile(prog);
  }
}

export function endSession(experienceId: string): ExperienceSession | null {
  const all = loadSessions();
  const open = all.filter((x: any) => x.experienceId === experienceId && !x.endedAt)
    .sort((a: any, b: any) => b.startedAt - a.startedAt)[0];
  if (!open) return null;
  open.endedAt = Date.now();
  open.durationMs = open.endedAt - open.startedAt;
  saveSessions(all);

  const prog = loadProfile();
  let rec = prog.experiences[experienceId];
  const now = Date.now();
  if (!rec) {
    rec = {
      experienceId,
      totalSessions: 0,
      totalInteractions: 0,
      lastVisited: now,
      streakDays: 1,
      personalArtifacts: 0,
      completed: false
    };
  }
  rec.totalSessions += 1;
  rec.lastVisited = now;

  const today = getTodayStart();
  const last = new Date(rec.lastVisited).setHours(0, 0, 0, 0);
  if (last < today) {
    const y = today - 86400000;
    rec.streakDays = (last === y) ? (rec.streakDays || 1) + 1 : 1;
  }

  prog.experiences[experienceId] = rec;
  saveProfile(prog);

  return open;
}

export function markExperienceCompleted(experienceId: string): void {
  const prog = loadProfile();
  let rec = prog.experiences[experienceId];
  const now = Date.now();
  if (!rec) {
    rec = {
      experienceId,
      totalSessions: 1,
      totalInteractions: 0,
      lastVisited: now,
      streakDays: 1,
      personalArtifacts: 0,
      completed: true,
      completionDate: now
    };
  } else {
    rec.completed = true;
    rec.completionDate = now;
  }
  prog.experiences[experienceId] = rec;
  saveProfile(prog);
}

export function updateCollectionProgress(collectionId: string, experienceId: string, category?: string): void {
  const prog = loadProfile();
  let col = prog.collections[collectionId];
  if (!col) {
    col = { collectionId, experiencesCompleted: [], startedAt: Date.now() };
  }
  col.lastVisitedExperienceId = experienceId;
  const expRec = prog.experiences[experienceId];
  if (expRec?.completed && !col.experiencesCompleted.includes(experienceId)) {
    col.experiencesCompleted.push(experienceId);
  }

  // Track preferred categories
  if (category) {
    prog.preferredCategories[category] = (prog.preferredCategories[category] || 0) + 1;
  }

  prog.collections[collectionId] = col;
  saveProfile(prog);
}

export function checkCollectionCompletion(collectionId: string, experienceIds: string[]): boolean {
  const prog = loadProfile();
  const allCompleted = experienceIds.length > 0 && experienceIds.every(id =>
    prog.experiences[id]?.completed
  );
  if (allCompleted && !prog.completedCollections.includes(collectionId)) {
    prog.completedCollections.push(collectionId);
    const col = prog.collections[collectionId];
    if (col) col.completedAt = Date.now();
    saveProfile(prog);
    return true;
  }
  return false;
}

export function toggleFavorite(experienceId: string): boolean {
  const prog = loadProfile();
  const rec = prog.experiences[experienceId];
  if (!rec) {
    prog.experiences[experienceId] = {
      experienceId,
      totalSessions: 0,
      totalInteractions: 0,
      lastVisited: Date.now(),
      streakDays: 0,
      personalArtifacts: 0,
      completed: false,
      isFavorite: true
    };
    saveProfile(prog);
    return true;
  }
  rec.isFavorite = !rec.isFavorite;
  saveProfile(prog);
  return rec.isFavorite;
}

export function isFavorite(experienceId: string): boolean {
  return !!loadProfile().experiences[experienceId]?.isFavorite;
}

export function getFavorites(): string[] {
  const prog = loadProfile();
  return Object.keys(prog.experiences).filter(id => prog.experiences[id].isFavorite);
}

export function getCompletedCollections(): string[] {
  return loadProfile().completedCollections;
}

export function getPreferredCategories(): Record<string, number> {
  return loadProfile().preferredCategories;
}

export function getProfileSummary(): {
  totalExperiencesPlayed: number;
  totalCompleted: number;
  totalFavorites: number;
  totalCollectionsCompleted: number;
  currentStreak: number;
  lastVisit: string;
  totalVisits: number;
  topCategory: string | null;
} {
  const prog = loadProfile();
  const expIds = Object.keys(prog.experiences);
  const completed = expIds.filter(id => prog.experiences[id].completed);
  const favorites = expIds.filter(id => prog.experiences[id].isFavorite);

  let currentStreak = 0;
  expIds.forEach(id => {
    currentStreak = Math.max(currentStreak, prog.experiences[id].streakDays || 0);
  });

  const cats = prog.preferredCategories;
  const topCategory = Object.keys(cats).length > 0
    ? Object.keys(cats).sort((a, b) => cats[b] - cats[a])[0]
    : null;

  return {
    totalExperiencesPlayed: expIds.length,
    totalCompleted: completed.length,
    totalFavorites: favorites.length,
    totalCollectionsCompleted: prog.completedCollections.length,
    currentStreak,
    lastVisit: prog.lastVisit ? new Date(prog.lastVisit).toLocaleDateString() : 'never',
    totalVisits: prog.totalVisits,
    topCategory
  };
}

export function getProgress(id: string): ExperienceProgress | null {
  return loadProfile().experiences[id] || null;
}

export function getAllProgress(): Record<string, ExperienceProgress> {
  return loadProfile().experiences;
}

export function getCollectionProgress(collectionId: string): CollectionProgress | null {
  return loadProfile().collections[collectionId] || null;
}

export function getRecentlyVisited(): string[] {
  return loadProfile().recentlyVisited;
}

export function getLastActiveExperienceId(): string | undefined {
  return loadProfile().lastActiveExperienceId;
}

export function getReturnSummary(id: string): {
  hasReturned: boolean;
  streak: number;
  totalSessions: number;
  lastVisited: string;
  completed: boolean;
  isFavorite: boolean;
} {
  const p = getProgress(id);
  if (!p) {
    return { hasReturned: false, streak: 0, totalSessions: 0, lastVisited: 'never', completed: false, isFavorite: false };
  }
  return {
    hasReturned: p.totalSessions > 1 || p.streakDays > 1,
    streak: p.streakDays || 0,
    totalSessions: p.totalSessions || 0,
    lastVisited: new Date(p.lastVisited).toLocaleDateString(),
    completed: p.completed || false,
    isFavorite: p.isFavorite || false
  };
}

export function resetAllProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
  } catch { /* ignore */ }
}

export function resetExperienceProgress(experienceId: string): void {
  const prog = loadProfile();
  delete prog.experiences[experienceId];
  prog.recentlyVisited = prog.recentlyVisited.filter(id => id !== experienceId);
  if (prog.lastActiveExperienceId === experienceId) {
    prog.lastActiveExperienceId = undefined;
  }
  saveProfile(prog);
}
