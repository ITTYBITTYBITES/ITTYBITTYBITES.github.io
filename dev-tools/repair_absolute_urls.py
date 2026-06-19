import os
import re

def clean_absolute_urls():
    for root, _, files in os.walk('.'):
        if '.git' in root or 'dev-tools' in root:
            continue
        for f in files:
            if f.endswith('.html'):
                fp = os.path.join(root, f)
                with open(fp, 'r', encoding='utf-8', errors='ignore') as file:
                    text = file.read()
                    
                # Replace href="../https://..." with href="https://..."
                cleaned = re.sub(r'href="\.\./(https?://[^"]+)"', r'href="\1"', text)
                # Replace href="./https://..." with href="https://..."
                cleaned = re.sub(r'href="\./(https?://[^"]+)"', r'href="\1"', cleaned)
                
                if cleaned != text:
                    with open(fp, 'w', encoding='utf-8', errors='ignore') as file:
                        file.write(cleaned)
                    print(f"Repaired absolute outbound URLs in {fp}")

if __name__ == '__main__':
    clean_absolute_urls()
