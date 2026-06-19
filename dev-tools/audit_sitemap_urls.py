import xml.etree.ElementTree as ET
import os

tree = ET.parse('sitemap.xml')
root = tree.getroot()

ns = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

urls = [elem.text for elem in root.findall('sitemap:url/sitemap:loc', ns)]
print(f"Total URLs in sitemap.xml: {len(urls)}")

missing_files = []
valid_files = []

for u in urls:
    # Remove base domain
    rel_path = u.replace('https://ittybittybites.github.io/', '')
    if rel_path == '' or rel_path == '/':
        rel_path = 'index.html'
    elif rel_path.endswith('/'):
        rel_path += 'index.html'
    
    if os.path.exists(rel_path):
        valid_files.append(rel_path)
    else:
        missing_files.append(rel_path)

print(f"Valid active files matched: {len(valid_files)}")
print(f"Missing or broken 404 URL targets in sitemap: {len(missing_files)}")
if len(missing_files) > 0:
    print("Sample broken sitemap targets:", missing_files[:15])

