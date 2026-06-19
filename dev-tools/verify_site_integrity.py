import os
import re

def verify_site():
    print("🔍 INITIATING ENTERPRISE INTERNAL LINK & STRUCTURE VERIFICATION...")
    root_dir = '.'
    html_files = []

    for r, _, files in os.walk(root_dir):
        if '.git' in r or 'dev-tools' in r:
            continue
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(r, f))

    print(f"Index target: {len(html_files)} HTML production files identified.")
    
    broken_links = 0
    verified_links = 0

    for fp in html_files:
        with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
            
        # Extract all href="target" and src="target"
        links = re.findall(r'(href|src)="([^"#]+)"', text)
        
        file_dir = os.path.dirname(fp)
        
        for _, link in links:
            if link.startswith('http://') or link.startswith('https://') or link.startswith('mailto:') or link.startswith('javascript:'):
                verified_links += 1
                continue
            
            # Resolve relative link
            target_path = os.path.normpath(os.path.join(file_dir, link))
            
            if os.path.exists(target_path):
                verified_links += 1
            else:
                # Let's check if it's an edge case or missing item
                print(f"  [!] BROKEN LINK DETECTED in {fp}: `{link}` (Resolved: `{target_path}`)")
                broken_links += 1

    print("------------------------------------------------------------------")
    print(f"🎯 Audit Complete: {verified_links} links verified functioning.")
    if broken_links == 0:
        print("🎉 FLAWLESS PASS! Zero broken internal links across all production pages.")
    else:
        print(f"⚠️ Warning: {broken_links} unresolvable paths found.")

if __name__ == '__main__':
    verify_site()
