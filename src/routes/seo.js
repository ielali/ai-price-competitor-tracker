import { POSTS } from '../content/blog.js';
import { SEGMENTS } from '../content/segments.js';
import { META } from '../content/landing.js';

const BASE_URL = META.canonicalUrl;

// ---------------------------------------------------------------------------
// robots.txt — GET /robots.txt
// ---------------------------------------------------------------------------
export function robotsTxtHandler(_req, res) {
  const content = `User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(content);
}

// ---------------------------------------------------------------------------
// sitemap.xml — GET /sitemap.xml
// ---------------------------------------------------------------------------
export function sitemapHandler(_req, res) {
  function xmlEscape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function url(loc, { lastmod, changefreq, priority }) {
    return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
    ${lastmod ? `<lastmod>${xmlEscape(lastmod)}</lastmod>` : ''}
    <changefreq>${xmlEscape(changefreq)}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  const today = new Date().toISOString().slice(0, 10);

  // Static pages
  const staticUrls = [
    url(`${BASE_URL}/`, { lastmod: today, changefreq: 'weekly', priority: '1.0' }),
    url(`${BASE_URL}/blog`, { lastmod: today, changefreq: 'weekly', priority: '0.8' }),
    url(`${BASE_URL}/privacy`, { lastmod: '2025-01-01', changefreq: 'yearly', priority: '0.3' }),
    url(`${BASE_URL}/terms`, { lastmod: '2025-01-01', changefreq: 'yearly', priority: '0.3' }),
  ];

  // Segment landing pages — priority 0.9, monthly
  const segmentUrls = SEGMENTS.map((seg) =>
    url(`${BASE_URL}${seg.path}`, { lastmod: today, changefreq: 'monthly', priority: '0.9' }),
  );

  // Blog posts — priority 0.7, weekly
  const blogUrls = POSTS.map((post) =>
    url(`${BASE_URL}/blog/${post.slug}`, {
      lastmod: post.dateModified || post.datePublished,
      changefreq: 'weekly',
      priority: '0.7',
    }),
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('')}
${segmentUrls.join('')}
${blogUrls.join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(sitemap);
}
