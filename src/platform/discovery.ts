import { getExperienceById, getExperiencesInCollection, getCollectionById } from './registry';
import { getAllProgress, getProgress, getReturnSummary } from './lifecycle';
import type { ExperienceEntry } from './registry-types';
export interface DiscoverySuggestion { experience: ExperienceEntry; reason: string; priority: number; }
export function getRelatedExperiences(experienceId: string, limit=3): ExperienceEntry[] {
  const exp = getExperienceById(experienceId); if(!exp||!exp.collection) return [];
  return getExperiencesInCollection(exp.collection).filter(e=>e.id!==experienceId).slice(0,limit);
}
export function getContinueExploringSuggestions(limit=4): DiscoverySuggestion[] {
  const allP = getAllProgress(); const sug: any[]=[];
  Object.keys(allP).forEach(id=>{ const e=getExperienceById(id); if(!e)return; const s=getReturnSummary(id);
    if(s.totalSessions>=1 && s.streak<2) sug.push({experience:e, reason:'You started this — come back and build on it', priority:90-s.totalSessions});
  });
  const cols = new Set<string>(); Object.keys(allP).forEach(id=>{const e=getExperienceById(id);if(e?.collection)cols.add(e.collection);});
  cols.forEach(c=>{ getExperiencesInCollection(c).forEach((e:any)=>{if(!allP[e.id])sug.push({experience:e,reason:`Part of ${getCollectionById(c)?.title||'collection'} you explored`,priority:70});}); });
  getExperiencesInCollection('foundations').forEach((e:any)=>{if(!allP[e.id])sug.push({experience:e,reason:'Part of the Foundations collection',priority:50});});
  const seen=new Set(); return sug.filter((s:any)=>{if(seen.has(s.experience.id))return false;seen.add(s.experience.id);return true;}).sort((a:any,b:any)=>b.priority-a.priority).slice(0,limit);
}
export function getNextSteps(experienceId:string){ const exp=getExperienceById(experienceId); const collection=exp?.collection?getCollectionById(exp.collection):undefined; const related=getRelatedExperiences(experienceId); const hasProgress=!!getProgress(experienceId); return {collection,related,hasProgress}; }
