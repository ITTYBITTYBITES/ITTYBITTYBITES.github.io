import fs from 'node:fs';
import path from 'node:path';

const games = JSON.parse(fs.readFileSync('website/games.json', 'utf8'));
const OUT = 'docs/qa-game-reward-hooks-results.json';
const results = [];

for (const game of games) {
  const gamePath = `website/${game.directory_path || `games/${game.id}/index.html`}`;
  const exists = fs.existsSync(gamePath);
  const html = exists ? fs.readFileSync(gamePath, 'utf8') : '';
  const dir = path.dirname(gamePath);
  const localFiles = exists ? fs.readdirSync(dir).filter(f => /\.(js|html)$/i.test(f)) : [];
  const joined = [html, ...localFiles.filter(f => f !== 'index.html').map(f => fs.readFileSync(path.join(dir, f), 'utf8'))].join('\n');

  const triggerCount = (joined.match(/ARCADE_TRIGGER_AD/g) || []).length;
  const completionListenerCount = (joined.match(/ARCADE_AD_COMPLETE/g) || []).length;
  const childCompletionCount = (joined.match(/ARCADE_CHILD_AD_COMPLETE/g) || []).length;
  const monetizationBridge = html.includes('../../assets/arcade-monetization.js') || html.includes('arcade-monetization.js');
  const parentPostMessage = /window\.parent\.postMessage\(\{\s*type:\s*["']ARCADE_TRIGGER_AD/.test(joined);
  const rewardTypeCount = (joined.match(/adType:\s*["']rewarded/g) || []).length;
  const interstitialTypeCount = (joined.match(/adType:\s*["']interstitial/g) || []).length;

  let status = 'N/A';
  const notes = [];
  if (!exists) {
    status = 'Fix Needed';
    notes.push('LOAD-404: direct game file missing');
  } else if (triggerCount === 0) {
    status = 'No Reward Hook';
    notes.push('No ARCADE_TRIGGER_AD event found; monetization bridge not exercised by this game yet.');
  } else if (!monetizationBridge) {
    status = 'Fix Needed';
    notes.push('AD-HANG risk: game can trigger ad but direct page lacks arcade-monetization bridge.');
  } else {
    status = 'Ready for Manual Reward QA';
    notes.push('Trigger hook and direct-page monetization bridge present.');
  }
  if (triggerCount > 0 && completionListenerCount === 0) notes.push('Game does not explicitly listen for ARCADE_AD_COMPLETE; likely fire-and-forget trigger.');
  if (rewardTypeCount) notes.push(`${rewardTypeCount} rewarded trigger(s)`);
  if (interstitialTypeCount) notes.push(`${interstitialTypeCount} interstitial trigger(s)`);
  if (childCompletionCount) notes.push('Listens for child completion message variant.');

  results.push({
    id: game.id,
    title: game.title,
    path: game.directory_path,
    exists,
    monetizationBridge,
    triggerCount,
    completionListenerCount,
    parentPostMessage,
    rewardTypeCount,
    interstitialTypeCount,
    status,
    notes,
  });
  console.log(`${game.id.padEnd(22)} ${status} triggers=${triggerCount} bridge=${monetizationBridge ? 'yes' : 'no'}`);
}

const summary = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), results, summary }, null, 2));
console.log('\nSummary:', summary);
console.log(`Wrote ${OUT}`);
