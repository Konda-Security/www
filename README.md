# Konda Security — Website

Hugo-based static site for [kondasecurity.com](https://kondasecurity.com), deployed via GitHub Pages with Cloudflare DNS.

## Local Development

```bash
# Install Hugo (macOS)
brew install hugo

# Clone with submodules
git clone --recurse-submodules https://github.com/mkonda/kondasecurity-www.git
cd kondasecurity-www

# Run dev server
hugo server -D
```

Visit `http://localhost:1313` to preview. The `-D` flag includes draft posts.

## Writing Content

### New insight / blog post

```bash
hugo new content blog/my-post-title/index.md
```

Edit the generated file in `content/blog/my-post-title/index.md`. Set `draft: false` when ready to publish. Posts appear under the "Insights" nav item and in the "Latest Insights" section on the homepage.

### Front matter

```yaml
---
title: "Post Title"
date: 2026-05-26
summary: "One-line summary for listing pages and SEO."
tags: ["quantum security", "PQC"]
draft: false
---
```

### Static pages

Edit files in `content/about/`, `content/services/`, or `content/contact/`.

## Deployment

### Step 1: Push to GitHub

The site auto-deploys on every push to `main` via the GitHub Actions workflow in `.github/workflows/deploy.yml`.

```bash
git add .
git commit -m "Update site content"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will run automatically on the next push

### Step 3: Configure Cloudflare DNS for custom domain

1. In your GitHub repo → **Settings** → **Pages** → **Custom domain**, enter `kondasecurity.com`
2. In Cloudflare DNS, add these records:

   | Type  | Name | Content              |
   |-------|------|----------------------|
   | CNAME | www  | mkonda.github.io     |
   | A     | @    | 185.199.108.153      |
   | A     | @    | 185.199.109.153      |
   | A     | @    | 185.199.110.153      |
   | A     | @    | 185.199.111.153      |

3. In Cloudflare SSL/TLS settings, set encryption mode to **Full** (not Full Strict, since GitHub Pages provides its own certificate)
4. Wait for DNS propagation (usually minutes, up to 48 hours)
5. Back in GitHub Pages settings, check **Enforce HTTPS**

### Step 4: Cloudflare page rules (optional)

- Redirect `www.kondasecurity.com/*` → `https://kondasecurity.com/$1` (or vice versa) using a Cloudflare redirect rule

### Step 5: Email setup

The site uses `matt@kondasecurity.com`. Configure email routing in Cloudflare:
1. Go to **Email** → **Email Routing** in Cloudflare dashboard
2. Add a route: `matt@kondasecurity.com` → your personal email
3. Cloudflare will add the necessary MX and TXT records automatically

## Site Structure

```
content/
├── about/index.md          # About / bio page
├── services/index.md       # Advisory services
├── contact/index.md        # Contact page
├── search/index.md         # Full-text search
└── blog/
    ├── _index.md           # Insights listing page
    └── post-name/
        └── index.md        # Individual post

layouts/
├── list.html               # Homepage override (adds "Latest Insights" heading)
└── _partials/
    ├── home_info.html       # Custom hero with headshot, outcomes, services grid
    ├── footer.html          # Custom footer (no theme credits)
    ├── extend_head.html     # Favicon, OG image, Twitter card meta
    └── templates/
        └── schema_json.html # Schema.org overrides (ProfessionalService, proper dates)

assets/css/extended/
└── custom.css              # Dark + gold theme, self-hosted Inter font

static/
├── images/headshot.png     # Headshot
├── fonts/inter-latin-*.woff2  # Self-hosted Inter font (4 weights)
├── favicon.svg             # SVG favicon
└── apple-touch-icon.png    # iOS icon
```

## Theme

Uses [PaperMod](https://github.com/adityatelange/hugo-PaperMod) as a git submodule with extensive customization via layout overrides and extended CSS. To update the base theme:

```bash
git submodule update --remote themes/PaperMod
```

## Configuration

Site configuration is in `hugo.toml`. Key settings:

- `baseURL` — Production domain
- `params.label.text` — Header brand text
- `menu.main` — Navigation menu items
- `params.socialIcons` — Social links on homepage
- `params.schema` — Schema.org structured data settings
- `defaultTheme = "dark"` — Forced dark mode (no toggle)
