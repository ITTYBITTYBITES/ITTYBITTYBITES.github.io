# Security and Publication Policy

This is a public GitHub Pages repository. Treat every committed file as public.

## Secrets

Never commit:

- GitHub personal access tokens
- API keys
- Private keys
- Passwords
- Unpublished account identifiers that should remain private
- Private build/deployment notes

If a secret is accidentally pasted into an issue, chat, commit, or workflow log, revoke and rotate it immediately.

## Public/static boundary

GitHub Pages can serve static files from this repository, and repository contents are visible publicly. Files that are not required for the public website should not live in this repo.

The public site intentionally includes:

- Public HTML/CSS/JS
- Public games and media assets
- Public content matrices used by the static build engine
- Public analytics/ad client identifiers

The public site should not include:

- Internal-only dev tools
- Local migration scripts
- Release certification artifacts
- Backend architecture notes not intended for publication
- Credentials or private configuration

## Current monetization notes

The public pages use Google AdSense. The arcade shell also supports game-triggered Adsterra sponsor/reward breaks through visible, user-initiated sponsor controls.
