import os
import shutil

def relocate_all():
    print("🚀 INITIATING TOTAL MIGRATION INTO `/website` DIRECTORY...")
    
    os.makedirs('website', exist_ok=True)
    
    # 1. Move primary directories
    dirs_to_move = ['articles', 'assets', 'core-data', 'data', 'games', 'intel', 'library', 'pipeline-data', 'uploads']
    
    for d in dirs_to_move:
        if os.path.exists(d):
            dest = os.path.join('website', d)
            if os.path.exists(dest):
                shutil.rmtree(dest)
            shutil.move(d, 'website/')
            print(f"Relocated directory: `{d}` -> `/website/{d}`")

    # 2. Move root web files
    files_to_move = [
        'index.html', 'arcade.html', 'library.html', 'feed.html', 'about.html', 
        'contact.html', 'sitemap.html', 'sitemap.xml', 'privacy_policy.html', 
        'terms_of_service.html', 'ads.txt', 'games.json', 'portal.js'
    ]
    
    for f in files_to_move:
        if os.path.exists(f):
            dest = os.path.join('website', f)
            if os.path.exists(dest):
                os.remove(dest)
            shutil.move(f, 'website/')
            print(f"Relocated web production file: `{f}` -> `/website/{f}`")

    # 3. Create Enterprise Root Routers (index.html & 404.html)
    root_index = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./website/index.html">
    <link rel="canonical" href="https://ittybittybites.github.io/website/index.html">
    <title>The 2-Second Witness // System OS</title>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6P6NPFW4FZ');
    </script>
    <style>
        body { background-color: #05070A; color: #00F5FF; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .terminal { border: 1px solid #00F5FF; padding: 2.5rem; border-radius: 12px; background: #0A0D14; box-shadow: 0 0 30px rgba(0,245,255,0.2); text-align: center; }
        a { color: #FFD700; text-decoration: none; font-weight: bold; font-size: 1.2rem; padding: 1rem 2rem; border: 1px solid #FFD700; border-radius: 8px; display: inline-block; margin-top: 1rem; transition: all 0.2s; }
        a:hover { background: #FFD700; color: #000; box-shadow: 0 0 15px #FFD700; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    </style>
</head>
<body>
    <div class="terminal">
        <h2 class="pulse">GRID OS // SECURE PROTOCOL</h2>
        <p>INITIALIZING SECURED WEB SIMULATION & INTELLIGENCE MATRIX...</p>
        <a href="./website/index.html">ENTER THE GRID >></a>
    </div>
</body>
</html>
"""
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(root_index)
        
    with open('404.html', 'w', encoding='utf-8') as f:
        f.write(root_index.replace("INITIALIZING SECURED WEB SIMULATION", "404 BREACH // REDIRECTING TO SECURED WEB SIMULATION"))
    print("Authored Enterprise root routing stubs (index.html & 404.html).")

    # 4. Create new Root robots.txt
    robots_txt = """User-agent: *
Allow: /
Sitemap: https://ittybittybites.github.io/website/sitemap.xml
"""
    with open('robots.txt', 'w', encoding='utf-8') as f:
        f.write(robots_txt)
    print("Authored new Root robots.txt pointing to /website/sitemap.xml.")

    # 5. Update root redirect stubs for legacy research articles
    articles = [
        'behavioral-economics.html', 'best-brain-games.html', 'best-psychology-books.html',
        'brain-training-tips.html', 'cognitive-biases.html', 'cybersecurity-beginners.html',
        'decision-making.html', 'dunning-kruger.html', 'false-memory.html', 'first-aid-basics.html',
        'flow-state.html', 'food-safety.html', 'how-doctors-think.html', 'logical-fallacies.html',
        'pattern-recognition.html', 'priming-effect.html', 'rapid-thinking.html', 
        'social-engineering.html', 'stroop-effect.html', 'survival-skills.html'
    ]
    
    for art in articles:
        if os.path.exists(art):
            stub = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./website/articles/{art}">
    <link rel="canonical" href="https://ittybittybites.github.io/website/articles/{art}">
    <title>Redirecting to Operational Briefing...</title>
    <style>body {{ background: #05070A; color: #00F5FF; font-family: monospace; text-align: center; margin-top: 20%; }} a {{ color: #FFD700; }}</style>
</head>
<body>
    <h3>SIGNAL REDIRECT</h3>
    <p>Briefing relocated to: <a href="./website/articles/{art}">./website/articles/{art}</a></p>
</body>
</html>
"""
            with open(art, 'w', encoding='utf-8') as f:
                f.write(stub)
    print("Sanitized 20 legacy root SEO redirect stubs to route to /website/articles/.")

if __name__ == '__main__':
    relocate_all()
