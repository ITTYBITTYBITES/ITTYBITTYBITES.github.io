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
}

export interface CollectionProgress {
  collectionId: string;
  experiencesCompleted: string[];
  lastVisitedExperienceId?: string;
  startedAt: number;
  completedAt?: number;
}

export interface PlatformProgress {
  version: number;
  experiences: Record<string, ExperienceProgress>;
  collections: Record<string, CollectionProgress>;
  lastActiveExperienceId?: string;
  recentlyVisited: string[];
}

const PROGRESS_KEY = 'platform-experience-progress-v2';
const SESSIONS_KEY = 'platform-experience-sessions';
const CURRENT_VERSION = 2;

function loadProgress(): PlatformProgress {
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
          recentlyVisited: parsed.recentlyVisited || []
        };
      }
    }
  } catch { /* ignore */ }
  return {
    version: CURRENT_VERSION,
    experiences: {},
    collections: {},
    recentlyVisited: []
  };
}

function saveProgress(p: PlatformProgress): void {
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

  const prog = loadProgress();
  prog.lastActiveExperienceId = experienceId;
  if (!prog.recentlyVisited.includes(experienceId)) {
    prog.recentlyVisited.unshift(experienceId);
    if (prog.recentlyVisited.length > 10) prog.recentlyVisited.pop();
  } else {
    prog.recentlyVisited = [experienceId, ...prog.recentlyVisited.filter(id => id !== experienceId)];
  }
  saveProgress(prog);

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

  const prog = loadProgress();
  const rec = prog.experiences[experienceId];
  if (rec) {
    rec.totalInteractions = (rec.totalInteractions || 0) + 1;
    saveProgress(prog);
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

  const prog = loadProgress();
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
  saveProgress(prog);

  return open;
}

export function markExperienceCompleted(experienceId: string): void {
  const prog = loadProgress();
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
  saveProgress(prog);
}

export function updateCollectionProgress(collectionId: string, experienceId: string): void {
  const prog = loadProgress();
  let col = prog.collections[collectionId];
  if (!col) {
    col = { collectionId, experiencesCompleted: [], startedAt: Date.now() };
  }
  col.lastVisitedExperienceId = experienceId;
  const expRec = prog.experiences[experienceId];
  if (expRec?.completed && !col.experiencesCompleted.includes(experienceId)) {
    col.experiencesCompleted.push(experienceId);
  }
  prog.collections[collectionId] = col;
  saveProgress(prog);
}

export function getProgress(id: string): ExperienceProgress | null {
  return loadProgress().experiences[id] || null;
}

export function getAllProgress(): Record<string, ExperienceProgress> {
  return loadProgress().experiences;
}

export function getCollectionProgress(collectionId: string): CollectionProgress | null {
  return loadProgress().collections[collectionId] || null;
}

export function getRecentlyVisited(): string[] {
  return loadProgress().recentlyVisited;
}

export function getLastActiveExperienceId(): string | undefined {
  return loadProgress().lastActiveExperienceId;
}

export function getReturnSummary(id: string): {
  hasReturned: boolean;
  streak: number;
  totalSessions: number;
  lastVisited: string;
  completed: boolean;
} {
  const p = getProgress(id);
  if (!p) {
    return { hasReturned: false, streak: 0, totalSessions: 0, lastVisited: 'never', completed: false };
  }
  return {
    hasReturned: p.totalSessions > 1 || p.streakDays > 1,
    streak: p.streakDays || 0,
    totalSessions: p.totalSessions || 0,
    lastVisited: new Date(p.lastVisited).toLocaleDateString(),
    completed: p.completed || false
  };
}

export function resetAllProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
  } catch { /* ignore */ }
}

export function resetExperienceProgress(experienceId: string): void {
  const prog = loadProgress();
  delete prog.experiences[experienceId];
  prog.recentlyVisited = prog.recentlyVisited.filter(id => id !== experienceId);
  if (prog.lastActiveExperienceId === experienceId) {
    prog.lastActiveExperienceId = undefined;
  }
  saveProgress(prog);
}
