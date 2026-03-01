# SanHost Landing

Multi-language static landing page for sanhost.net.

## Stack
- Node.js build script (`build.js`) generates static HTML from template + language files
- Nginx serves the generated pages
- Docker for production deployment

## Languages
en, ru, de, es, fr, it, pt, uk — JSON files in `lang/`

## Build
```bash
node build.js  # Generates html/ directory from template.html + lang/*.json
```

## Deploy
```bash
rsync -avz sanhost-landing/ root@208.69.78.130:/var/www/traefik/sanhost-landing/ --exclude=node_modules --exclude=html
ssh root@208.69.78.130 "cd /var/www/traefik && docker compose up -d --build --no-deps sanhost-landing"
```

## Key Files
- `template.html` — HTML template with `{{placeholder}}` syntax
- `lang/*.json` — Translation strings per language
- `build.js` — Build script (generates html/ from template + lang)
- `nginx.conf` — Nginx config with language detection
- `Dockerfile` — Multi-stage build (node build → nginx serve)
