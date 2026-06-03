const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'articles');
const MEDIA_DIR = path.join(ROOT, 'content', 'media', 'images');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'generated');
const PUBLIC_MEDIA_DIR = path.join(ROOT, 'public', 'assets', 'media', 'images');

marked.setOptions({ gfm: true });

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function build() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Missing content directory: ${CONTENT_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort();

  const articles = files.map((file) => {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || path.basename(file, '.md');
    const publishedAt = data.publishedAt || new Date().toISOString();
    const updatedAt = data.updatedAt || publishedAt;
    const body = content.trim();
    const html = body ? marked.parse(body) : '';

    return {
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || '',
      html,
      publishedAt,
      updatedAt,
      tags: Array.isArray(data.tags) ? data.tags : [],
      period: typeof data.period === 'string' ? data.period : undefined,
      polity: typeof data.polity === 'string' ? data.polity : undefined,
      themes: Array.isArray(data.themes) ? data.themes : [],
    };
  });

  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const searchIndex = articles.map((article) => ({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    text: [article.title, article.excerpt, stripHtml(article.html)].join(' '),
  }));

  fs.writeFileSync(
    path.join(OUT_DIR, 'articles.json'),
    JSON.stringify(articles, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );

  copyMedia();

  console.log(`Built ${articles.length} article(s) → src/assets/generated/`);
}

function copyMedia() {
  if (!fs.existsSync(MEDIA_DIR)) {
    return;
  }

  fs.mkdirSync(PUBLIC_MEDIA_DIR, { recursive: true });
  const entries = fs.readdirSync(MEDIA_DIR);
  let copied = 0;

  for (const name of entries) {
    const src = path.join(MEDIA_DIR, name);
    if (!fs.statSync(src).isFile()) {
      continue;
    }
    fs.copyFileSync(src, path.join(PUBLIC_MEDIA_DIR, name));
    copied += 1;
  }

  if (copied > 0) {
    console.log(`Copied ${copied} media file(s) → public/assets/media/images/`);
  }
}

build();
