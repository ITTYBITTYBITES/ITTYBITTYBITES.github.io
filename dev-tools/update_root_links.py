import re

files_to_update = ['index.html', 'library.html', 'sitemap.html', 'sitemap.xml', 'feed.html']

articles = [
    'behavioral-economics.html',
    'best-brain-games.html',
    'best-psychology-books.html',
    'brain-training-tips.html',
    'cognitive-biases.html',
    'cybersecurity-beginners.html',
    'decision-making.html',
    'dunning-kruger.html',
    'false-memory.html',
    'first-aid-basics.html',
    'flow-state.html',
    'food-safety.html',
    'how-doctors-think.html',
    'logical-fallacies.html',
    'pattern-recognition.html',
    'priming-effect.html',
    'rapid-thinking.html',
    'social-engineering.html',
    'stroop-effect.html',
    'survival-skills.html'
]

for fp in files_to_update:
    try:
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for art in articles:
            # Match href="art" or href="./art" and replace with href="./articles/art"
            content = re.sub(rf'href="(\./)?{art}"', f'href="./articles/{art}"', content)
            
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated direct internal navigation paths in {fp}")
    except Exception as e:
        print(f"Skipped {fp}: {e}")
