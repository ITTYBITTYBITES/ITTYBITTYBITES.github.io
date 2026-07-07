export interface ExperienceSession { id: string; experienceId: string; startedAt: number; endedAt?: number; interactions: number; durationMs?: number; }
export interface ExperienceProgress { experienceId: string; totalSessions: number; totalInteractions: number; lastVisited: number; streakDays: number; personalArtifacts: number; lastArtifact?: string; }
const PROGRESS_KEY = 'platform-experience-progress'; const SESSIONS_KEY = 'platform-experience-sessions';
function loadProgress(): Record<string, ExperienceProgress> { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; } }
function saveProgress(p: Record<string, ExperienceProgress>) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {} }
function loadSessions(): any[] { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; } }
function saveSessions(s: any[]) { try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); } catch {} }
function getTodayStart() { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }
export function startSession(experienceId: string) { const s = { id: 'sess_'+Date.now(), experienceId, startedAt: Date.now(), interactions: 0 }; const all = loadSessions(); all.push(s); saveSessions(all); return s; }
export function recordInteraction(experienceId: string) { const all = loadSessions(); const open = all.filter((x:any)=>x.experienceId===experienceId&&!x.endedAt).sort((a:any,b:any)=>b.startedAt-a.startedAt)[0]; if(open){open.interactions=(open.interactions||0)+1; saveSessions(all);} }
export function endSession(experienceId: string) { const all = loadSessions(); const open = all.filter((x:any)=>x.experienceId===experienceId&&!x.endedAt).sort((a:any,b:any)=>b.startedAt-a.startedAt)[0]; if(!open) return null; open.endedAt=Date.now(); open.durationMs=open.endedAt-open.startedAt; saveSessions(all); return open; }
export function updateProgress(experienceId: string, updates: any) { const p = loadProgress(); const now=Date.now(); let rec = p[experienceId] || {experienceId, totalSessions:0,totalInteractions:0,lastVisited:now,streakDays:1,personalArtifacts:0}; rec.lastVisited=now; Object.assign(rec, updates); const today=getTodayStart(); const last = new Date(rec.lastVisited).setHours(0,0,0,0); if(last<today){ const y=today-86400000; rec.streakDays = (last===y)?(rec.streakDays||1)+1 : 1; } p[experienceId]=rec; saveProgress(p); return rec; }
export function getProgress(id:string){ return loadProgress()[id]||null; }
export function getAllProgress(){ return loadProgress(); }
export function getReturnSummary(id:string){ const p=getProgress(id); if(!p) return {hasReturned:false,streak:0,totalSessions:0,lastVisited:'never'}; return {hasReturned: p.totalSessions>1||p.streakDays>1, streak:p.streakDays||0, totalSessions:p.totalSessions||0, lastVisited:new Date(p.lastVisited).toLocaleDateString()}; }
