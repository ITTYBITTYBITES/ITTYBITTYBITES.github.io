import os
import re

def repair_website_folder_links():
    print("🔍 REPAIRING RELATIVE ARTICLE PATHS INSIDE `/website`...")
    
    articles = [
        'behavioral-economics.html', 'best-brain-games.html', 'best-psychology-books.html',
        'brain-training-tips.html', 'cognitive-biases.html', 'cybersecurity-beginners.html',
        'decision-making.html', 'dunning-kruger.html', 'false-memory.html', 'first-aid-basics.html',
        'flow-state.html', 'food-safety.html', 'how-doctors-think.html', 'logical-fallacies.html',
        'pattern-recognition.html', 'priming-effect.html', 'rapid-thinking.html', 
        'social-engineering.html', 'stroop-effect.html', 'survival-skills.html'
    ]

    # 1. Repair root files inside website/ (about.html, contact.html, terms_of_service.html, etc.)
    root_files = ['about.html', 'contact.html', 'terms_of_service.html', 'privacy_policy.html', 'index.html', 'arcade.html', 'library.html', 'feed.html', 'sitemap.html']
    
    for rf in root_files:
        fp = os.path.join('website', rf)
        if os.path.exists(fp):
            with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
            for art in articles:
                # Replace href="art" or href="./art" or href="../art" with href="./articles/art"
                text = re.sub(rf'href="(\.\.?/)?{art}"', f'href="./articles/{art}"', text)
            with open(fp, 'w', encoding='utf-8', errors='ignore') as f:
                f.write(text)
            print(f"Repaired links in root web file: `{fp}`")

    # 2. Repair files inside website/library/ and website/intel/
    subdirs = ['library', 'intel']
    for sd in subdirs:
        sd_path = os.path.join('website', sd)
        if not os.path.exists(sd_path):
            continue
        for root, _, files in os.walk(sd_path):
            for f in files:
                if f.endswith('.html'):
                    fp = os.path.join(root, f)
                    with open(fp, 'r', encoding='utf-8', errors='ignore') as file:
                        text = file.read()
                    for art in articles:
                        # Replace href="../art" or href="../../art" with href="../articles/art"
                        text = re.sub(rf'href="\.\./\.\.?/{art}"', f'href="../articles/{art}"', text)
                        text = re.sub(rf'href="\.\./{art}"', f'href="../articles/{art}"', text)
                    with open(fp, 'w', encoding='utf-8', errors='ignore') as file:
                        file.write(text)
    print("Repaired all internal article paths inside `/website/library` and `/website/intel`.")

if __name__ == '__main__':
    repair_website_folder_links()
