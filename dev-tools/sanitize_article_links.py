import os
import re

articles_dir = 'articles'

replacements = {
    r'"index\.html"': '"../index.html"',
    r'"arcade\.html"': '"../arcade.html"',
    r'"intel/index\.html"': '"../intel/index.html"',
    r'"feed\.html"': '"../feed.html"',
    r'"library\.html"': '"../library.html"',
    r'"privacy_policy\.html"': '"../privacy_policy.html"',
    r'"terms_of_service\.html"': '"../terms_of_service.html"',
    r'"about\.html"': '"../about.html"',
    r'"contact\.html"': '"../contact.html"',
    r'"sitemap\.html"': '"../sitemap.html"',
    r'"sitemap\.xml"': '"../sitemap.xml"'
}

for root, _, files in os.walk(articles_dir):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            for old_p, new_p in replacements.items():
                content = re.sub(old_p, new_p, content)
                
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Sanitized navigation URLs in {filepath}")
