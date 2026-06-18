import xml.etree.ElementTree as ET
import os
import re

# Master script to evaluate Phase 3 Sitemap, XML, and Canonical Tag Consistency

tree = ET.parse('sitemap.xml')
root = tree.getroot()

ns = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_urls = [elem.text.strip() for elem in root.findall('sitemap:url/sitemap:loc', ns)]
print(f"Total entries declared in sitemap.xml: {len(sitemap_urls)}")

# Check duplicates in sitemap
url_counts = {}
for u in sitemap_urls:
    url_counts[u] = url_counts.get(u, 0) + 1
duplicates = [u for u, c in url_counts.items() if c > 1]
print(f"Duplicate <loc> entries in sitemap: {len(duplicates)}")

# Scan all HTML assets across the repo to compare with sitemap
html_canonical_map = {}
total_html_files = 0
missing_canonicals = []
canonical_mismatches = []

base_url = 'https://ittybittybites.github.io'

for root_dir, dirs, files in os.walk('.'):
    if '.git' in root_dir or 'node_modules' in root_dir or '.cache' in root_dir or '.npm' in root_dir:
        continue
    for f in files:
        if f.endswith('.html'):
            total_html_files += 1
            file_path = os.path.join(root_dir, f)
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
            
            can_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', content, re.I)
            if can_match:
                canonical_url = can_match.group(1).strip()
                html_canonical_map[file_path] = canonical_url
                
                # Check if this exact canonical URL exists in sitemap
                if canonical_url not in sitemap_urls:
                    canonical_mismatches.append((file_path, canonical_url))
            else:
                missing_canonicals.append(file_path)

print(f"Total HTML files scanned across repository: {total_html_files}")
print(f"HTML assets missing a canonical tag entirely: {len(missing_canonicals)}")
print(f"Canonical URL vs sitemap.xml mismatches (HTML declares URL not listed in sitemap): {len(canonical_mismatches)}")

if len(canonical_mismatches) > 0:
    print("\nSample Canonical Mismatches (File path -> HTML Canonical Tag):")
    for item in canonical_mismatches[:15]:
        print(f"  → {item[0]}: declared {item[1]}")

