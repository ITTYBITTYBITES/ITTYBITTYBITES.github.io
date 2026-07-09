import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Artifact {
  id: number;
  description: string;
  eraOptions: string[];
  purposeOptions: string[];
  originOptions: string[];
  correctEra: number;
  correctPurpose: number;
  correctOrigin: number;
  revealContext: string;
}

const ARTIFACTS: Artifact[] = [
  {
    id: 1,
    description: 'A small bronze object, roughly the size of a fist, with a narrow spout and a handle shaped like a curled animal. The surface is worn smooth where hands have gripped it for generations. Green patina covers most of the body, but the rim is polished bare from repeated pouring. A residue inside smells faintly of fermented grain.',
    eraOptions: ['Stone Age', 'Bronze Age', 'Industrial Age', 'Digital Age'],
    purposeOptions: ['Weapon', 'Cooking vessel', 'Ceremonial pouring vessel', 'Musical instrument'],
    originOptions: ['Northern plains', 'River valley civilization', 'Coastal trading settlement', 'Mountain fortress'],
    correctEra: 1,
    correctPurpose: 2,
    correctOrigin: 1,
    revealContext: 'This is a Bronze Age ritual pouring vessel from a river valley civilization, used in communal feasting. The animal-shaped handle suggests spiritual significance — the creature may have been a clan symbol.'
  },
  {
    id: 2,
    description: 'A flat wooden board, about the length of a forearm, covered in rows of small, uniform beads that slide along wires. The wood is dark and oiled, with finger-worn grooves at the edges. Some beads are stained with ink. The back of the board has a handwritten label in a script no longer commonly taught.',
    eraOptions: ['Ancient empires', 'Medieval period', 'Early modern era', 'Contemporary'],
    purposeOptions: ['Musical instrument', 'Calculating tool', 'Game board', 'Weaving loom component'],
    originOptions: ['East Asian port city', 'Mediterranean trading hub', 'Northern European monastery', 'Sub-Saharan market town'],
    correctEra: 1,
    correctPurpose: 1,
    correctOrigin: 0,
    revealContext: 'This is an abacus — a calculating tool used across East Asian port cities for centuries before written arithmetic became dominant. The ink stains suggest it was used by merchants who also kept written ledgers.'
  }
];

const STORAGE_KEY = 'unlabeled-progress';

function loadProgress(): { artifactIndex: number; correct: number; total: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { artifactIndex: 0, correct: 0, total: 0 };
}

function saveProgress(p: { artifactIndex: number; correct: number; total: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const unlabeled: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'unlabeled';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentArtifact = ARTIFACTS[progress.artifactIndex % ARTIFACTS.length];
    let selections = { era: -1, purpose: -1, origin: -1 };

    const title = document.createElement('h2');
    title.textContent = 'Unlabeled';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'An object arrives with no date, no name, no explanation. What can you infer?';

    const stats = document.createElement('div');
    stats.className = 'unlabeled-stats';
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    updateStats();

    const artifactCard = document.createElement('div');
    artifactCard.className = 'artifact-card';
    artifactCard.style.cssText = 'padding: 1.5rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const artifactDesc = document.createElement('p');
    artifactDesc.style.cssText = 'line-height: 1.7; font-size: 0.95rem; margin: 0;';
    artifactDesc.textContent = currentArtifact.description;

    artifactCard.appendChild(artifactDesc);

    const questions = document.createElement('div');
    questions.className = 'artifact-questions';
    questions.style.cssText = 'display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0;';

    const eraQuestion = renderQuestion('What era does this likely belong to?', currentArtifact.eraOptions, 'era');
    const purposeQuestion = renderQuestion('What was its most likely purpose?', currentArtifact.purposeOptions, 'purpose');
    const originQuestion = renderQuestion('Where might this have originated?', currentArtifact.originOptions, 'origin');

    questions.append(eraQuestion, purposeQuestion, originQuestion);

    const revealArea = document.createElement('div');
    revealArea.className = 'reveal-area';
    revealArea.style.cssText = 'margin-top: 1rem;';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn primary';
    submitBtn.textContent = 'Submit Inference';
    submitBtn.addEventListener('click', handleSubmit);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn';
    nextBtn.textContent = 'Next Artifact';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      progress.artifactIndex = (progress.artifactIndex + 1) % ARTIFACTS.length;
      saveProgress(progress);
      // Remount with new artifact
      unlabeled.mount(container, context);
    });

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap;';
    controls.append(submitBtn, nextBtn);

    wrapper.append(title, desc, stats, artifactCard, questions, controls, revealArea);
    container.appendChild(wrapper);

    function renderQuestion(label: string, options: string[], key: 'era' | 'purpose' | 'origin') {
      const box = document.createElement('fieldset');
      box.style.cssText = 'border: 1px solid ButtonBorder; border-radius: 0.5rem; padding: 1rem; margin: 0;';

      const legend = document.createElement('legend');
      legend.textContent = label;
      legend.style.fontWeight = '600';
      box.appendChild(legend);

      const opts = document.createElement('div');
      opts.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

      options.forEach((opt, idx) => {
        const row = document.createElement('label');
        row.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.25rem;';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = key;
        radio.value = String(idx);
        radio.addEventListener('change', () => {
          selections[key] = idx;
        });

        row.append(radio, document.createTextNode(opt));
        opts.appendChild(row);
      });

      box.appendChild(opts);
      return box;
    }

    function handleSubmit() {
      if (selections.era === -1 || selections.purpose === -1 || selections.origin === -1) {
        revealArea.textContent = 'Please answer all three questions before submitting.';
        return;
      }

      const correct =
        (selections.era === currentArtifact.correctEra ? 1 : 0) +
        (selections.purpose === currentArtifact.correctPurpose ? 1 : 0) +
        (selections.origin === currentArtifact.correctOrigin ? 1 : 0);

      progress.correct += correct;
      progress.total += 3;
      saveProgress(progress);
      updateStats();

      revealArea.innerHTML = `
        <div style="padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ${correct >= 2 ? '#22c55e11' : '#eab30811'};">
          <h4 style="margin-top:0;">Result: ${correct}/3 correct</h4>
          <p style="margin-bottom:0.5rem;"><strong>Context:</strong> ${currentArtifact.revealContext}</p>
          <p style="margin-bottom:0; font-size:0.85rem; color:GrayText;">The answers were not about memorizing facts. They were about weighing evidence. Return to try another artifact.</p>
        </div>
      `;

      submitBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'inference_submitted',
        correct,
        total: 3,
        artifact_id: currentArtifact.id
      });
    }

    function updateStats() {
      const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
      stats.textContent = `Artifacts examined: ${progress.artifactIndex + 1} • Inference accuracy: ${accuracy}%`;
    }

    return () => {
      // persistence handled in handlers
    };
  }
};

export default unlabeled;
