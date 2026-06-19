import os

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

os.makedirs('articles', exist_ok=True)

for art in articles:
    if os.path.exists(art):
        # Move the actual full article into articles/
        os.rename(art, os.path.join('articles', art))
        
        # Create a professional seamless SEO meta-redirect stub in the root
        stub_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./articles/{art}">
    <link rel="canonical" href="https://ittybittybites.github.io/articles/{art}">
    <title>Redirecting to Operational Briefing...</title>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-6P6NPFW4FZ');
    </script>
    <style>
        body {{ background-color: #05070A; color: #00F5FF; font-family: monospace; display: flex; justify-content: center; items-center: center; height: 100vh; margin: 0; }}
        .terminal {{ border: 1px solid #00F5FF; padding: 2rem; border-radius: 8px; background: #0A0D14; box-shadow: 0 0 20px rgba(0,245,255,0.2); }}
        a {{ color: #FFD700; text-decoration: none; font-weight: bold; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="terminal">
        <h3>SIGNAL REDIRECT // ARCHITECTURE UPGRADE</h3>
        <p>This operational briefing has been permanently relocated to our secured articles matrix.</p>
        <p>> <a href="./articles/{art}">CLICK HERE TO ACCESS BRIEFING</a></p>
    </div>
</body>
</html>
"""
        with open(art, 'w', encoding='utf-8') as f:
            f.write(stub_content)
        print(f"Relocated {art} and generated root redirect stub.")
