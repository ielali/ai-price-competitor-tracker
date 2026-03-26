import { POSTS, POST_BY_SLUG, getPaginatedPosts } from '../content/blog.js';
import { META, FOOTER } from '../content/landing.js';
import {
  escapeHtml,
  safeJsonLd,
  applySecurityHeaders,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
} from '../lib/seo.js';

const BASE_URL = META.canonicalUrl;

// ---------------------------------------------------------------------------
// Shared nav fragment
// ---------------------------------------------------------------------------
function renderNav() {
  return `
<header class="site-header" role="banner">
  <nav class="nav-inner" aria-label="Main navigation">
    <a href="/" class="nav-brand" aria-label="${escapeHtml(FOOTER.brand)} home">${escapeHtml(FOOTER.brand)}</a>
    <ul class="nav-links" role="list">
      <li><a href="/#benefits" class="nav-link">Features</a></li>
      <li><a href="/#pricing" class="nav-link">Pricing</a></li>
      <li><a href="/blog" class="nav-link">Blog</a></li>
    </ul>
    <a href="/signup" class="btn btn-primary btn-sm nav-cta">Start Free Trial</a>
  </nav>
</header>`;
}

function renderFooter() {
  return `
<footer class="site-footer" id="footer" role="contentinfo">
  <div class="container footer-inner">
    <div class="footer-brand">
      <span class="footer-brand-name">${escapeHtml(FOOTER.brand)}</span>
      <p class="footer-tagline">${escapeHtml(FOOTER.tagline)}</p>
    </div>
    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="/privacy" class="footer-link">Privacy Policy</a>
      <a href="/terms" class="footer-link">Terms of Service</a>
      <a href="/blog" class="footer-link">Blog</a>
      <a href="mailto:${escapeHtml(FOOTER.contact)}" class="footer-link">Contact: ${escapeHtml(FOOTER.contact)}</a>
    </nav>
    <p class="footer-copy">${escapeHtml(FOOTER.copyright)}</p>
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------
// Blog index — GET /blog
// ---------------------------------------------------------------------------
export function blogIndexHandler(req, res) {
  applySecurityHeaders(res);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const { items, total, totalPages } = getPaginatedPosts(page, 10);

  const canonicalUrl = page === 1 ? `${BASE_URL}/blog` : `${BASE_URL}/blog?page=${page}`;
  const ogImage = `${BASE_URL}/og-image.png`;

  const breadcrumbSchema = buildBreadcrumbSchema(
    [{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }],
    BASE_URL,
  );
  const orgSchema = buildOrganizationSchema({
    name: 'PriceTracker',
    url: BASE_URL,
    description: 'Automated competitor price tracking for small e-commerce businesses.',
    email: FOOTER.contact,
    logo: `${BASE_URL}/logo.png`,
  });

  const postCards = items
    .map(
      (post) => `
    <article class="blog-card">
      <div class="blog-card-meta">
        <span class="blog-tag">${escapeHtml(post.category)}</span>
        <time datetime="${escapeHtml(post.datePublished)}" class="blog-date">
          ${escapeHtml(new Date(post.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
        </time>
        <span class="blog-reading-time">${escapeHtml(post.readingTime)}</span>
      </div>
      <h2 class="blog-card-title">
        <a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a>
      </h2>
      <p class="blog-card-description">${escapeHtml(post.description)}</p>
      <a href="/blog/${escapeHtml(post.slug)}" class="blog-read-more" aria-label="Read: ${escapeHtml(post.title)}">
        Read article &rarr;
      </a>
    </article>`,
    )
    .join('');

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const paginationHtml = (prevPage || nextPage)
    ? `
  <nav class="blog-pagination" aria-label="Blog pagination">
    ${prevPage ? `<a href="/blog${prevPage === 1 ? '' : `?page=${prevPage}`}" class="btn btn-ghost" rel="prev">&larr; Newer posts</a>` : '<span></span>'}
    <span class="blog-pagination-info">Page ${page} of ${totalPages}</span>
    ${nextPage ? `<a href="/blog?page=${nextPage}" class="btn btn-ghost" rel="next">Older posts &rarr;</a>` : ''}
  </nav>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page === 1 ? 'Blog — Competitor Pricing Tips & Guides | PriceTracker' : `Blog Page ${page} | PriceTracker`)}</title>
  <meta name="description" content="Competitor pricing guides, case studies, and strategies for e-commerce sellers. Learn how to monitor and respond to competitor price changes.">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="Blog — Competitor Pricing Tips &amp; Guides | PriceTracker">
  <meta property="og:description" content="Competitor pricing guides, case studies, and strategies for e-commerce sellers.">
  <meta property="og:image" content="${escapeHtml(ogImage)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Blog — Competitor Pricing Tips &amp; Guides | PriceTracker">
  <meta name="twitter:description" content="Competitor pricing guides, case studies, and strategies for e-commerce sellers.">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <link rel="alternate" type="application/rss+xml" title="PriceTracker Blog" href="/blog/feed.xml">
  <link rel="stylesheet" href="/assets/landing.css">
  <script type="application/ld+json">${safeJsonLd(orgSchema)}</script>
  <script type="application/ld+json">${safeJsonLd(breadcrumbSchema)}</script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${renderNav()}
  <main id="main-content">
    <div class="blog-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol role="list">
            <li><a href="/">Home</a></li>
            <li aria-current="page">Blog</li>
          </ol>
        </nav>
        <h1 class="blog-hero-heading">Competitor Pricing Guides &amp; Case Studies</h1>
        <p class="blog-hero-subheading">Practical strategies for e-commerce sellers who want to stay ahead on pricing.</p>
      </div>
    </div>
    <section class="blog-index" aria-labelledby="blog-index-heading">
      <div class="container">
        <h2 id="blog-index-heading" class="sr-only">All articles — ${total} total</h2>
        <div class="blog-grid">
          ${postCards}
        </div>
        ${paginationHtml}
      </div>
    </section>
  </main>
  ${renderFooter()}
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

// ---------------------------------------------------------------------------
// RSS 2.0 feed — GET /blog/feed.xml
// ---------------------------------------------------------------------------
export function blogFeedHandler(_req, res) {
  const sorted = [...POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));

  function xmlEscape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const items = sorted
    .map(
      (post) => `
    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(`${BASE_URL}/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${xmlEscape(`${BASE_URL}/blog/${post.slug}`)}</guid>
      <description>${xmlEscape(post.description)}</description>
      <author>${xmlEscape(post.author)}</author>
      <category>${xmlEscape(post.category)}</category>
      <pubDate>${new Date(post.datePublished).toUTCString()}</pubDate>
    </item>`,
    )
    .join('');

  const lastBuildDate = sorted.length > 0 ? new Date(sorted[0].datePublished).toUTCString() : new Date().toUTCString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PriceTracker Blog</title>
    <link>${xmlEscape(BASE_URL)}</link>
    <description>Competitor pricing guides, case studies, and strategies for e-commerce sellers.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${xmlEscape(`${BASE_URL}/blog/feed.xml`)}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(feed);
}

// ---------------------------------------------------------------------------
// Blog post — GET /blog/:slug
// ---------------------------------------------------------------------------
export function blogPostHandler(req, res) {
  const post = POST_BY_SLUG[req.params.slug];

  if (!post) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Post Not Found | PriceTracker</title>
  <link rel="stylesheet" href="/assets/landing.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${renderNav()}
  <main id="main-content">
    <div class="container" style="padding: 4rem 1rem; text-align: center;">
      <h1>Post Not Found</h1>
      <p>The article you're looking for doesn't exist or has been moved.</p>
      <a href="/blog" class="btn btn-primary" style="margin-top: 1.5rem;">Browse all articles</a>
    </div>
  </main>
  ${renderFooter()}
</body>
</html>`);
    return;
  }

  applySecurityHeaders(res);

  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
  const ogImage = `${BASE_URL}${post.image || '/og-image.png'}`;

  const articleSchema = buildArticleSchema(post, BASE_URL);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { name: 'Home', href: '/' },
      { name: 'Blog', href: '/blog' },
      { name: post.title, href: `/blog/${post.slug}` },
    ],
    BASE_URL,
  );
  const orgSchema = buildOrganizationSchema({
    name: 'PriceTracker',
    url: BASE_URL,
    description: 'Automated competitor price tracking for small e-commerce businesses.',
    email: FOOTER.contact,
    logo: `${BASE_URL}/logo.png`,
  });

  const publishedFormatted = new Date(post.datePublished).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)} | PriceTracker Blog</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <link rel="alternate" type="application/rss+xml" title="PriceTracker Blog" href="/blog/feed.xml">
  <link rel="stylesheet" href="/assets/landing.css">
  <script type="application/ld+json">${safeJsonLd(articleSchema)}</script>
  <script type="application/ld+json">${safeJsonLd(breadcrumbSchema)}</script>
  <script type="application/ld+json">${safeJsonLd(orgSchema)}</script>
</head>
<body class="blog-post-page">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${renderNav()}
  <main id="main-content">
    <article class="blog-post" aria-labelledby="post-heading">
      <header class="blog-post-header">
        <div class="container">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol role="list">
              <li><a href="/">Home</a></li>
              <li><a href="/blog">Blog</a></li>
              <li aria-current="page">${escapeHtml(post.title)}</li>
            </ol>
          </nav>
          <div class="blog-post-meta">
            <span class="blog-tag">${escapeHtml(post.category)}</span>
            <time datetime="${escapeHtml(post.datePublished)}" class="blog-date">${escapeHtml(publishedFormatted)}</time>
            <span class="blog-reading-time">${escapeHtml(post.readingTime)}</span>
          </div>
          <h1 id="post-heading" class="blog-post-title">${escapeHtml(post.title)}</h1>
          <p class="blog-post-description">${escapeHtml(post.description)}</p>
          <div class="blog-post-author">
            <span>By ${escapeHtml(post.author)}</span>
          </div>
        </div>
      </header>
      <div class="blog-post-body">
        <div class="container">
          <div class="blog-content">
            ${post.html}
          </div>
          <aside class="blog-post-cta" aria-label="Try PriceTracker">
            <h2 class="blog-cta-heading">Stop Checking Prices Manually</h2>
            <p class="blog-cta-text">PriceTracker monitors your competitors automatically and alerts you within 30 minutes of any price change.</p>
            <a href="/signup" class="btn btn-primary btn-lg">Start Free 14-Day Trial</a>
            <p class="blog-cta-note">No credit card required</p>
          </aside>
        </div>
      </div>
    </article>
  </main>
  ${renderFooter()}
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}
