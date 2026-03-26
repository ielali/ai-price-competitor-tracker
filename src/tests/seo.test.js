import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';

const { default: app } = await import('../app.js');

describe('Technical SEO infrastructure', () => {
  let server;
  let baseUrl;

  before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  }));

  after(() => new Promise((resolve) => server.close(resolve)));

  // -------------------------------------------------------------------------
  // robots.txt
  // -------------------------------------------------------------------------
  describe('GET /robots.txt', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/robots.txt`);
      body = await res.text();
    });

    it('returns 200', () => {
      assert.equal(res.status, 200);
    });

    it('has text/plain content type', () => {
      assert.match(res.headers.get('content-type'), /text\/plain/);
    });

    it('contains User-agent: *', () => {
      assert.match(body, /User-agent: \*/);
    });

    it('allows root path', () => {
      assert.match(body, /Allow: \//);
    });

    it('disallows /app/', () => {
      assert.match(body, /Disallow: \/app\//);
    });

    it('disallows /api/', () => {
      assert.match(body, /Disallow: \/api\//);
    });

    it('references the sitemap URL', () => {
      assert.match(body, /Sitemap:.*sitemap\.xml/);
    });
  });

  // -------------------------------------------------------------------------
  // sitemap.xml
  // -------------------------------------------------------------------------
  describe('GET /sitemap.xml', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/sitemap.xml`);
      body = await res.text();
    });

    it('returns 200', () => {
      assert.equal(res.status, 200);
    });

    it('has XML content type', () => {
      assert.match(res.headers.get('content-type'), /application\/xml|text\/xml/);
    });

    it('starts with XML declaration', () => {
      assert.match(body, /<\?xml version="1\.0"/);
    });

    it('has urlset root element with sitemaps.org namespace', () => {
      assert.match(body, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
    });

    it('includes homepage with priority 1.0', () => {
      assert.match(body, /<priority>1\.0<\/priority>/);
    });

    it('includes /blog URL', () => {
      assert.match(body, /\/blog<\/loc>/);
    });

    it('includes segment landing pages', () => {
      assert.match(body, /\/for\/shopify-sellers/);
      assert.match(body, /\/for\/amazon-sellers/);
      assert.match(body, /\/for\/dropshippers/);
      assert.match(body, /\/for\/resellers/);
      assert.match(body, /\/for\/local-businesses/);
    });

    it('includes blog post URLs', () => {
      assert.match(body, /\/blog\//);
    });

    it('includes lastmod, changefreq, and priority elements', () => {
      assert.match(body, /<lastmod>/);
      assert.match(body, /<changefreq>/);
      assert.match(body, /<priority>/);
    });

    it('segment pages have priority 0.9', () => {
      assert.match(body, /<priority>0\.9<\/priority>/);
    });

    it('blog posts have priority 0.7', () => {
      assert.match(body, /<priority>0\.7<\/priority>/);
    });
  });

  // -------------------------------------------------------------------------
  // Homepage — WebSite schema and FAQ schema
  // -------------------------------------------------------------------------
  describe('GET / — WebSite and FAQ structured data', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/`);
      body = await res.text();
    });

    it('includes WebSite JSON-LD schema', () => {
      assert.match(body, /"@type"\s*:\s*"WebSite"/);
    });

    it('WebSite schema includes SearchAction', () => {
      assert.match(body, /"SearchAction"/);
    });

    it('includes FAQPage JSON-LD schema', () => {
      assert.match(body, /"@type"\s*:\s*"FAQPage"/);
    });

    it('FAQ schema has Question entries', () => {
      assert.match(body, /"@type"\s*:\s*"Question"/);
    });

    it('includes RSS feed link in head', () => {
      assert.match(body, /type="application\/rss\+xml"/);
      assert.match(body, /href="\/blog\/feed\.xml"/);
    });

    it('FAQ section renders in HTML body', () => {
      assert.match(body, /id="faq"/);
    });

    it('FAQ section has at least one <details> element', () => {
      const detailsMatches = body.match(/<details\b/gi) || [];
      assert.ok(detailsMatches.length >= 1, 'Expected at least one <details> FAQ item');
    });

    it('homepage H1 targets primary keyword', () => {
      assert.match(body, /Competitor Price Monitoring for Small Businesses/i);
    });
  });
});
