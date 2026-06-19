# WEBSITE SETUP GUIDE
# Free website with Adsterra ads + Amazon Affiliate links
# Hosted on GitHub Pages -- $0/month forever

---

## WHAT YOU'RE BUILDING

A free website that does 4 things:
1. Hosts your privacy policy (Play Console requirement)
2. Earns ad revenue from Adsterra (you already have the key)
3. Earns affiliate commissions from Amazon book links
4. Drives downloads to your Play Store listing

---

## STEP 1: Sign Up for Amazon Associates (10 minutes)

1. Go to: https://affiliate-program.amazon.com/
2. Click "Sign up"
3. Log in with your Amazon account (or create one)
4. Fill in your account info:
   - Name: your name
   - Address: your address
   - Phone: your phone
5. Website list:
   - Enter: YOUR_USERNAME.github.io (your GitHub Pages URL)
   - You'll set this up in the next step
6. Profile:
   - Preferred Associates Store ID: pick something like "ittybittybites-20"
   - What are your websites about: "Mobile games, brain training, cognitive science"
   - Topics: Education, Games, Science
   - Type of items: Books, Games, Electronics
   - How do you drive traffic: Content/niche website
   - How do you build links: Editorial recommendations
   - Monthly visitors: Under 500 (be honest, it's new)
7. Payment and tax info:
   - Enter bank account for deposits
   - Complete tax interview (W-9 for US)
8. Click "Finish"

### IMPORTANT:
- Amazon gives you 180 days to make your first 3 qualifying sales
- If you don't, the account closes (but you can re-apply)
- This is why we pair it with the game -- game traffic feeds the website

---

## STEP 2: Get Your Amazon Affiliate Links (5 minutes)

After approval, go to Amazon and find each book:

### Book 1: Thinking, Fast and Slow
1. Go to amazon.com
2. Search "Thinking Fast and Slow Daniel Kahneman"
3. Click on the book
4. At the TOP of the page, you'll see the "Amazon Associates SiteStripe" bar
5. Click "Text" to get your affiliate link
6. Copy the link (it will look like: https://amzn.to/XXXXXXX)
7. Save this link

### Book 2: The Art of Thinking Clearly
1. Search "Art of Thinking Clearly Rolf Dobelli"
2. Same process -- click "Text" in SiteStripe
3. Copy and save the link

### Book 3: Blink by Malcolm Gladwell
1. Search "Blink Malcolm Gladwell"
2. Same process
3. Copy and save the link

### You can add MORE books later:
- Predictably Irrational (Dan Ariely)
- Nudge (Thaler & Sunstein)
- The Invisible Gorilla (Chabris & Simons)
- Brain Rules (John Medina)

---

## STEP 3: Create GitHub Repository (5 minutes)

1. Go to https://github.com
2. Sign in (or create free account)
3. Click green "New" button
4. Repository name: `2sw-content`
5. Set to PUBLIC
6. Check "Add a README file"
7. Click "Create repository"

---

## STEP 4: Upload Website Files (5 minutes)

1. In your new repo, click "Add file" > "Upload files"
2. Upload these files from your workspace:
   - `website/index.html`
   - `privacy_policy.html`
3. Click "Commit changes"

---

## STEP 5: Add Your Amazon Links to index.html (3 minutes)

1. In your repo, click on `index.html`
2. Click the pencil icon (edit)
3. Find and replace these 3 placeholders with your real Amazon links:
   - REPLACE_WITH_YOUR_AMAZON_AFFILIATE_LINK_1
   - REPLACE_WITH_YOUR_AMAZON_AFFILIATE_LINK_2
   - REPLACE_WITH_YOUR_AMAZON_AFFILIATE_LINK_3
4. Click "Commit changes"

---

## STEP 6: Enable GitHub Pages (2 minutes)

1. In your repo, click "Settings" (top tab)
2. Left sidebar: click "Pages"
3. Source: "Deploy from a branch"
4. Branch: select "main"
5. Folder: select "/ (root)"
6. Click "Save"
7. Wait 2-3 minutes
8. Your site is now live at:
   `https://YOUR_USERNAME.github.io/2sw-content/`

---

## STEP 7: Test Everything (2 minutes)

1. Visit your site: `https://YOUR_USERNAME.github.io/2sw-content/`
2. Check:
   - Page loads with dark theme
   - Adsterra ads appear (3 banner spots)
   - Amazon links go to the right books with your affiliate tag
   - "GET IT ON GOOGLE PLAY" links to your Play Store listing
   - "PLAY WEB DEMO" links to your itch.io page
   - Privacy policy link works
3. Visit: `https://YOUR_USERNAME.github.io/2sw-content/privacy_policy.html`
4. Check the privacy policy page loads correctly

---

## STEP 8: Update Play Console Privacy Policy (1 minute)

1. Go to Play Console > your app
2. Store presence > Main store listing
3. Privacy policy URL: paste
   `https://YOUR_USERNAME.github.io/2sw-content/privacy_policy.html`
4. Save

---

## STEP 9: Add Website Link to Play Store Listing (1 minute)

1. In Play Console > Store presence > Main store listing
2. Find "Website" field
3. Enter: `https://YOUR_USERNAME.github.io/2sw-content/`
4. Save

---

## HOW THE MONEY FLOWS

### Adsterra (already set up):
- Your key: 92610d8b982621e3b955565af9a0e78c
- 3 banner ad placements on the website
- Revenue: depends on traffic, roughly $1-5 per 1000 views
- Payment: Adsterra pays out at $5 minimum (PayPal, Bitcoin, wire)
- Already active on your itch.io web demo too

### Amazon Associates:
- You earn 1-10% commission on qualifying purchases
- Books category: 4.5% commission
- A $15 book = ~$0.68 commission
- Cookie duration: 24 hours (if someone clicks your link and buys within 24h)
- Payment: direct deposit, monthly, $10 minimum
- BONUS: you earn on EVERYTHING they buy, not just the book you linked

### Combined potential:
| Traffic | Adsterra/month | Amazon/month | Total |
|---------|---------------|-------------|-------|
| 100/day | $3-5 | $2-5 | $5-10 |
| 500/day | $15-25 | $10-25 | $25-50 |
| 1000/day | $30-50 | $20-50 | $50-100 |

Not huge on its own, but it's $0 effort after setup and it compounds with game traffic.

---

## DRIVING TRAFFIC TO THE WEBSITE

### From inside the game:
- Share cards include the Play Store link (people land on Play Store)
- Play Store listing has "Website" link (people visit your site)

### From outside:
- Link your website in your itch.io page
- Link in any social media bios
- If you make YouTube content about the game, link in descriptions

### SEO (free long-term traffic):
- The blog content about Stroop Effect and brain training will rank in Google over time
- People searching "what is the stroop effect" or "brain training games" may find your site
- This is slow but free and compounds over years

---

## ADDING MORE CONTENT LATER

To add more blog posts or affiliate links:

1. Go to your GitHub repo
2. Edit `index.html`
3. Copy an existing `<div class="blog-card">` block
4. Change the title and text
5. Copy an existing `<div class="product">` block for new affiliate products
6. Commit changes
7. GitHub Pages auto-updates within minutes

### Good affiliate products to add:
- Brain training books (4.5% commission)
- Puzzle games and board games (varies)
- Nootropic supplements (varies, higher commission)
- Productivity tools and apps
- Educational courses (can use other affiliate programs too)

---

## AMAZON ASSOCIATES DISCLOSURE

The website already includes the required disclosure:
"As an Amazon Associate I earn from qualifying purchases."

This is REQUIRED by Amazon and FTC rules. Don't remove it.

---

## TOTAL COST: $0

| Item | Cost |
|------|------|
| GitHub Pages hosting | FREE |
| Adsterra account | FREE (already have) |
| Amazon Associates account | FREE |
| Custom domain (optional, later) | ~$12/year if you want one |

---

## FILES TO DOWNLOAD FROM WORKSPACE

1. `website/index.html` -- main website page
2. `privacy_policy.html` -- privacy policy (already created)

Both go into your GitHub repo root.
