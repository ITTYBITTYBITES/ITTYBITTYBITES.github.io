import xml.etree.ElementTree as ET
import os
import re
from collections import deque

# Master Structural Crawl Simulator & Link/Sitemap Validator

# 1. Parse sitemap.xml
tree = ET.parse('sitemap.xml')
root = tree.getroot()
ns = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_urls = set(elem.text.strip() for elem in root.findall('sitemap:url/sitemap:loc', ns))
print(f"Total Entries Declared in sitemap.xml: {len(sitemap_urls)}")

# 2. Enumerate entire actual HTML repository filesystem
all_html_files = set()
for root_dir, dirs, files in os.walk('.'):
    if '.git' in root_dir or 'node_modules' in root_dir or '.cache' in root_dir or '.npm' in root_dir:
        continue
    for f in files:
        if f.endswith('.html'):
            p = os.path.normpath(os.path.join(root_dir, f))
            all_html_files.add(p)

print(f"Total Actual HTML Assets Existing on Filesystem: {len(all_html_files)}")

# 3. Simulate Directed Link Crawl from Homepage, Arcade Hub, and Primary Nav
# We will construct an adjacency graph of all internal links across the filesystem
adj_graph = {f: set() for f in all_html_files}

base_url = 'https://ittybittybites.github.io'

def normalize_link(source_file, link_href):
    link_href = link_href.split('#')[0].split('?')[0].strip()
    if link_href.startswith(base_url):
        link_href = link_href.replace(base_url, '')
    
    if link_href == '' or link_href == '/':
        return 'index.html'
    
    if link_href.startswith('/'):
        link_href = link_href[1:]
    else:
        # Resolve relative to source_file
        source_dir = os.path.dirname(source_file)
        link_href = os.path.normpath(os.path.join(source_dir, link_href))
    
    if os.path.isdir(link_href):
        link_href = os.path.normpath(os.path.join(link_href, 'index.html'))
    elif not link_href.endswith('.html') and not os.path.exists(link_href):
        # Try adding index.html or .html
        if os.path.exists(link_href + '.html'):
            link_href += '.html'
        elif os.path.exists(os.path.join(link_href, 'index.html')):
            link_href = os.path.normpath(os.path.join(link_href, 'index.html'))
            
    return link_href

# Populate Adjacency Graph
for src_file in all_html_files:
    with open(src_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Find all <a href="..."> links
    links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\']', content, re.I)
    for l in links:
        norm_l = normalize_link(src_file, l)
        if norm_l in all_html_files:
            adj_graph[src_file].add(norm_l)

# 4. Perform Directed Crawl Traversal (BFS) starting from target entry points
start_nodes = ['index.html', 'arcade.html', 'feed.html', 'library.html', 'intel/index.html']
start_nodes = [os.path.normpath(n) for n in start_nodes if os.path.normpath(n) in all_html_files]

hop_distances = {f: float('inf') for f in all_html_files}
for n in start_nodes:
    hop_distances[n] = 0

queue = deque([(n, 0) for n in start_nodes])

while queue:
    curr_node, current_hop = queue.popleft()
    for neighbor in adj_graph[curr_node]:
        if current_hop + 1 < hop_distances[neighbor]:
            hop_distances[neighbor] = current_hop + 1
            queue.append((neighbor, current_hop + 1))

# Classify Crawl Graph Outcomes
crawl_reachable = set(f for f, hops in hop_distances.items() if hops <= 3)
deep_crawl_reachable = set(f for f, hops in hop_distances.items() if hops > 3 and hops != float('inf'))
link_unreachable = set(f for f, hops in hop_distances.items() if hops == float('inf'))

# Cross-reference with sitemap.xml
sitemap_file_map = set()
for u in sitemap_urls:
    norm_u = normalize_link('index.html', u)
    if norm_u in all_html_files:
        sitemap_file_map.add(norm_u)

sitemap_omissions = all_html_files - sitemap_file_map
sitemap_only = link_unreachable & sitemap_file_map
true_orphans = link_unreachable - sitemap_file_map

print(f"\n--- Crawl Traversal Simulation Results ---")
print(f"Crawl-Reachable Assets within ≤3 Hops: {len(crawl_reachable)}")
print(f"Deep Crawl-Reachable Assets (>3 Hops): {len(deep_crawl_reachable)}")
print(f"Link-Unreachable Assets (Zero Hops from Primary Hubs): {len(link_unreachable)}")

print(f"\n--- Sitemap Cross-Authentication ---")
print(f"Confirmed Absolute Sitemap Omissions (Active files not in sitemap.xml): {len(sitemap_omissions)}")
print(f"Sitemap-Dependent Assets (Reachable only via sitemap.xml, no links): {len(sitemap_only)}")
print(f"Absolute True Orphan Assets (Unreachable via links and missing from sitemap.xml): {len(true_orphans)}")

if len(sitemap_omissions) > 0:
    print("\nSample Confirmed Sitemap Omissions:")
    for item in sorted(list(sitemap_omissions))[:15]:
        print(f"  → {item}")

if len(true_orphans) > 0:
    print("\nSample True Orphan Assets:")
    for item in sorted(list(true_orphans))[:15]:
        print(f"  → {item}")

