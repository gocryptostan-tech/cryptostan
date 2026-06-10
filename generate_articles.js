const fs = require('fs');

// Читаем news.json
let news = [];
try {
  news = JSON.parse(fs.readFileSync('news.json', 'utf8'));
} catch(e) {
  console.log('news.json пустой или не найден');
  process.exit(0);
}

if (!Array.isArray(news) || news.length === 0) {
  console.log('Нет статей для генерации');
  process.exit(0);
}

// Создаём папку articles если нет
if (!fs.existsSync('articles')) fs.mkdirSync('articles');

// Транслитерация для URL-slug
function slugify(text) {
  const map = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
    'щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  };
  return text.toLowerCase()
    .replace(/[а-яё]/g, c => map[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function generateHTML(article, slug) {
  const titleRu  = esc(article.title_ru  || '');
  const titleEn  = esc(article.title_en  || '');
  const textRu   = esc(article.text_ru   || '');
  const textEn   = esc(article.text_en   || '');
  const kickerRu = esc(article.kicker_ru || '');
  const kickerEn = esc(article.kicker_en || '');
  const dateRu   = esc(article.date_ru   || article.date || '');
  const dateEn   = esc(article.date_en   || article.date || '');
  const source   = esc(article.source    || 'Cryptostan');
  const link     = article.link && article.link !== '#' ? article.link : null;
  const dateIso  = article.date_iso || new Date().toISOString();
  const url      = `https://cryptostan.org/articles/${slug}.html`;
  const desc     = esc((article.text_ru || '').substring(0, 160));

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleRu} — Cryptostan</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="ru" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
  <meta property="og:type"        content="article" />
  <meta property="og:url"         content="${url}" />
  <meta property="og:site_name"   content="Cryptostan" />
  <meta property="og:title"       content="${titleRu} — Cryptostan" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image"       content="https://cryptostan.org/og-image.png" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:site"        content="@cryptostan_org" />
  <meta name="twitter:title"       content="${titleRu}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image"       content="https://cryptostan.org/og-image.png" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${titleRu}",
    "description": "${desc}",
    "url": "${url}",
    "datePublished": "${dateIso}",
    "dateModified": "${dateIso}",
    "image": { "@type": "ImageObject", "url": "https://cryptostan.org/og-image.png", "width": 1200, "height": 630 },
    "publisher": {
      "@type": "Organization",
      "name": "Cryptostan",
      "url": "https://cryptostan.org/",
      "logo": { "@type": "ImageObject", "url": "https://cryptostan.org/og-image.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" }
  }
  </script>
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg:#fff; --text:#0a0a0a; --text2:#2a2a2a; --text3:#666; --border:#d8d8d4; --surface:#f7f7f5; --orange:#F7931A; --teal:#49EACB; }
    body.dark { --bg:#111; --text:#f0ede8; --text2:#c8c4be; --text3:#888; --border:#2e2e2e; --surface:#1a1a1a; }
    body { background:var(--bg); color:var(--text); font-family:'Source Serif 4',Georgia,serif; font-size:17px; line-height:1.6; transition:background .2s,color .2s; min-height:100vh; display:flex; flex-direction:column; }
    a { color:inherit; text-decoration:none; }
    .header { background:linear-gradient(to bottom,#49EACB 0%,#1a3a35 40%,#2a1a08 60%,#F7931A 100%); padding:22px 0 18px; }
    .header-inner { max-width:860px; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between; }
    .logo { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; text-decoration:none; line-height:1; }
    .logo-crypto { color:#F7931A; } .logo-stan { color:#49EACB; }
    .header-controls { display:flex; gap:6px; align-items:center; }
    .ctrl-btn { background:none; border:1px solid rgba(255,255,255,.4); color:rgba(255,255,255,.7); font-family:'Inter',sans-serif; font-size:11px; font-weight:600; padding:3px 9px; cursor:pointer; transition:.15s; }
    .ctrl-btn:hover, .ctrl-btn.active { color:#fff; border-color:#fff; }
    .header-sep { height:2px; background:linear-gradient(to right,#49EACB,#F7931A); }
    .container { max-width:860px; margin:0 auto; padding:32px 24px 64px; flex:1; }
    .breadcrumb { font-family:'Inter',sans-serif; font-size:12px; color:var(--text3); margin-bottom:20px; display:flex; gap:6px; flex-wrap:wrap; }
    .breadcrumb a { color:var(--text3); transition:color .15s; } .breadcrumb a:hover { color:var(--orange); }
    .back-link { display:inline-flex; align-items:center; gap:5px; font-family:'Inter',sans-serif; font-size:12px; font-weight:600; color:var(--text3); margin-bottom:24px; transition:color .15s; }
    .back-link:hover { color:var(--orange); }
    .kicker { font-family:'Inter',sans-serif; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--orange); margin-bottom:12px; }
    h1 { font-family:'Playfair Display',serif; font-size:36px; font-weight:700; line-height:1.15; margin-bottom:16px; color:var(--text); }
    .meta { font-family:'Inter',sans-serif; font-size:12px; color:var(--text3); padding-bottom:16px; border-bottom:1px solid var(--border); margin-bottom:24px; display:flex; gap:8px; flex-wrap:wrap; }
    .body { font-size:17px; line-height:1.75; color:var(--text2); }
    .body p { margin-bottom:20px; }
    .source-btn { display:inline-block; font-family:'Inter',sans-serif; font-size:11px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:var(--text3); background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 14px; margin-top:28px; transition:all .15s; }
    .source-btn:hover { color:var(--orange); border-color:var(--orange); }
    footer { border-top:1px solid var(--border); padding:20px 24px; text-align:center; font-family:'Inter',sans-serif; font-size:11px; color:var(--text3); margin-top:auto; }
    footer a { color:var(--orange); }
    [data-lang="en"] { display:none; }
    body.lang-en [data-lang="ru"] { display:none; }
    body.lang-en [data-lang="en"] { display:revert; }
    @media(max-width:600px){ h1{font-size:26px;} }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-inner">
      <a href="../index.html" class="logo"><span class="logo-crypto">Crypto</span><span class="logo-stan">stan</span></a>
      <div class="header-controls">
        <button class="ctrl-btn active" id="btn-ru" onclick="setLang('ru')">RU</button>
        <button class="ctrl-btn" id="btn-en" onclick="setLang('en')">EN</button>
        <button class="ctrl-btn" onclick="toggleDark()">☽</button>
      </div>
    </div>
  </div>
  <div class="header-sep"></div>
  <div class="container">
    <div class="breadcrumb">
      <a href="../index.html" data-lang="ru">Главная</a>
      <a href="../index.html" data-lang="en">Home</a>
      <span>›</span>
      <span data-lang="ru">${kickerRu}</span>
      <span data-lang="en">${kickerEn}</span>
    </div>
    <a href="../index.html" class="back-link">← <span data-lang="ru">Все новости</span><span data-lang="en">All news</span></a>
    <div class="kicker" data-lang="ru">${kickerRu}</div>
    <div class="kicker" data-lang="en">${kickerEn}</div>
    <h1 data-lang="ru">${titleRu}</h1>
    <h1 data-lang="en">${titleEn}</h1>
    <div class="meta">
      <span data-lang="ru">${dateRu}</span>
      <span data-lang="en">${dateEn}</span>
      <span>·</span>
      <span>Cryptostan</span>
    </div>
    <div class="body">
      <p data-lang="ru">${textRu}</p>
      <p data-lang="en">${textEn}</p>
    </div>
    ${link ? `<a href="${link}" target="_blank" rel="noopener" class="source-btn">Источник: ${source} →</a>` : ''}
  </div>
  <footer>© 2026 <a href="../index.html">Cryptostan</a> &nbsp;·&nbsp; <a href="https://t.me/cryptostan_ru" data-lang="ru">Telegram</a><a href="https://t.me/cryptostan_en" data-lang="en">Telegram</a></footer>
  <script>
    function setLang(l) {
      document.body.classList.toggle('lang-en', l==='en');
      document.getElementById('btn-ru').classList.toggle('active', l==='ru');
      document.getElementById('btn-en').classList.toggle('active', l==='en');
      localStorage.setItem('fp-lang', l);
    }
    function toggleDark() {
      document.body.classList.toggle('dark');
      localStorage.setItem('fp-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    }
    (function(){
      if (localStorage.getItem('fp-lang')==='en') setLang('en');
      if (localStorage.getItem('fp-theme')==='dark') document.body.classList.add('dark');
    })();
  </script>
</body>
</html>`;
}

// Генерируем страницы
const generated = [];
const seen = new Set();

news.forEach(article => {
  const base = article.title_ru || article.title_en || 'article';
  let slug = slugify(base);
  if (!slug) return;
  // Если slug уже есть — добавляем суффикс
  let finalSlug = slug;
  let i = 2;
  while (seen.has(finalSlug)) finalSlug = `${slug}-${i++}`;
  seen.add(finalSlug);

  fs.writeFileSync(`articles/${finalSlug}.html`, generateHTML(article, finalSlug), 'utf8');
  generated.push({ slug: finalSlug, article });
  console.log(`✓ articles/${finalSlug}.html`);
});

// Обновляем sitemap-news.xml
const today = new Date().toISOString().split('T')[0];
const newsEntries = generated.map(({ slug, article }) => `  <url>
    <loc>https://cryptostan.org/articles/${slug}.html</loc>
    <news:news>
      <news:publication>
        <news:name>Cryptostan</news:name>
        <news:language>ru</news:language>
      </news:publication>
      <news:publication_date>${article.date_iso || today}</news:publication_date>
      <news:title>${esc(article.title_ru || '')}</news:title>
    </news:news>
  </url>`).join('\n');

fs.writeFileSync('sitemap-news.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsEntries}
</urlset>`, 'utf8');

// Обновляем sitemap.xml
const mainEntries = generated.map(({ slug }) => `  <url>
    <loc>https://cryptostan.org/articles/${slug}.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cryptostan.org/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cryptostan.org/article.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
${mainEntries}
</urlset>`, 'utf8');

console.log(`\nГотово: ${generated.length} статей, sitemap-news.xml и sitemap.xml обновлены.`);
