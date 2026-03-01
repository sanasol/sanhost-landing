#!/usr/bin/env node
/**
 * Multi-language static site generator for sanhost.net landing page.
 * Reads index.html template + lang/*.json → generates html/{lang}/index.html
 */

const fs = require('fs');
const path = require('path');

const LANG_DIR = path.join(__dirname, 'lang');
const HTML_DIR = path.join(__dirname, 'html');
const TEMPLATE = path.join(__dirname, 'template.html');

const SUPPORTED_LANGS = ['en', 'ru', 'uk', 'de', 'fr', 'es', 'pt', 'it'];
const BASE_URL = 'https://sanhost.net';

function loadTranslations(lang) {
  const file = path.join(LANG_DIR, `${lang}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function replaceAll(html, translations) {
  let result = html;
  for (const [key, value] of Object.entries(translations)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function generateHreflangTags(currentLang) {
  const tags = SUPPORTED_LANGS.map(lang => {
    const href = lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
    return `<link rel="alternate" hreflang="${lang}" href="${href}">`;
  });
  tags.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/">`);
  return tags.join('\n');
}

function generateLanguageSwitcher(currentLang) {
  const langNames = {
    en: { name: 'English', flag: '🇬🇧' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    uk: { name: 'Українська', flag: '🇺🇦' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    fr: { name: 'Français', flag: '🇫🇷' },
    es: { name: 'Español', flag: '🇪🇸' },
    pt: { name: 'Português', flag: '🇵🇹' },
    it: { name: 'Italiano', flag: '🇮🇹' },
  };

  const current = langNames[currentLang];
  const options = SUPPORTED_LANGS.map(lang => {
    const info = langNames[lang];
    const href = lang === 'en' ? '/' : `/${lang}/`;
    const selected = lang === currentLang ? ' class="lang-active"' : '';
    return `<a href="${href}" onclick="document.cookie='sanhost_lang=${lang};path=/;max-age=31536000;SameSite=Lax'"${selected}>${info.flag} ${info.name}</a>`;
  }).join('\n          ');

  return `<div class="lang-switcher">
        <button class="lang-btn" onclick="this.parentElement.classList.toggle('open')">${current.flag} ${currentLang.toUpperCase()}</button>
        <div class="lang-dropdown">
          ${options}
        </div>
      </div>`;
}

function generateCanonical(lang) {
  return lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
}

function generateOgUrl(lang) {
  return lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
}

function build() {
  const template = fs.readFileSync(TEMPLATE, 'utf8');

  for (const lang of SUPPORTED_LANGS) {
    const translations = loadTranslations(lang);

    // Add generated values
    translations.hreflang_tags = generateHreflangTags(lang);
    translations.language_switcher = generateLanguageSwitcher(lang);
    translations.canonical_url = generateCanonical(lang);
    translations.og_url = generateOgUrl(lang);

    const html = replaceAll(template, translations);

    if (lang === 'en') {
      // English is the default — no prefix
      fs.writeFileSync(path.join(HTML_DIR, 'index.html'), html);
      console.log(`Generated: html/index.html (${lang})`);
    } else {
      const outDir = path.join(HTML_DIR, lang);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
      console.log(`Generated: html/${lang}/index.html`);
    }
  }

  console.log(`\nDone! Generated ${SUPPORTED_LANGS.length} language versions.`);
}

build();
