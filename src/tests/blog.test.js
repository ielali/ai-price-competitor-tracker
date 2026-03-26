import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';

const { default: app } = await import('../app.js');

describe('Blog infrastructure', () => {
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
  // Blog index
  // -------------------------------------------------------------------------
  describe('GET /blog', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/blog`);
      body = await res.text();
    });

    it('returns 200', () => {
      assert.equal(res.status, 200);
    });

    it('returns HTML content type', () => {
      assert.match(res.headers.get('content-type'), /text\/html/);
    });

    it('has an <h1> heading', () => {
      assert.match(body, /<h1\b/i);
    });

    it('has meta description', () => {
      assert.match(body, /<meta\s+name="description"/i);
    });

    it('has canonical link', () => {
      assert.match(body, /<link\s+rel="canonical"/i);
    });

    it('has Open Graph tags', () => {
      assert.match(body, /property="og:title"/i);
      assert.match(body, /property="og:description"/i);
      assert.match(body, /property="og:image"/i);
    });

    it('has Twitter Card tags', () => {
      assert.match(body, /name="twitter:card"/i);
    });

    it('has RSS feed link', () => {
      assert.match(body, /type="application\/rss\+xml"/);
    });

    it('includes BreadcrumbList JSON-LD', () => {
      assert.match(body, /"@type"\s*:\s*"BreadcrumbList"/);
    });

    it('includes Organization JSON-LD', () => {
      assert.match(body, /"@type"\s*:\s*"Organization"/);
    });

    it('has breadcrumb nav element', () => {
      assert.match(body, /class="breadcrumb"/);
    });

    it('lists blog post cards', () => {
      const cardMatches = body.match(/class="blog-card"/g) || [];
      assert.ok(cardMatches.length >= 1, 'Expected at least one blog card');
    });

    it('blog cards link to /blog/:slug', () => {
      assert.match(body, /href="\/blog\/[^"]+"/);
    });

    it('has semantic <main> with id="main-content"', () => {
      assert.match(body, /<main\s[^>]*id="main-content"/);
    });

    it('has skip link', () => {
      assert.match(body, /class="skip-link"/);
    });

    it('has <header> with role="banner"', () => {
      assert.match(body, /<header\b[^>]*role="banner"/i);
    });

    it('has <footer> with role="contentinfo"', () => {
      assert.match(body, /<footer\b[^>]*role="contentinfo"/i);
    });

    it('sets security headers', () => {
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-frame-options'), 'DENY');
    });
  });

  // -------------------------------------------------------------------------
  // RSS feed
  // -------------------------------------------------------------------------
  describe('GET /blog/feed.xml', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/blog/feed.xml`);
      body = await res.text();
    });

    it('returns 200', () => {
      assert.equal(res.status, 200);
    });

    it('has RSS content type', () => {
      assert.match(res.headers.get('content-type'), /application\/rss\+xml|text\/xml/);
    });

    it('is valid RSS 2.0', () => {
      assert.match(body, /<rss version="2\.0"/);
    });

    it('has Atom namespace for self link', () => {
      assert.match(body, /xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/);
    });

    it('has channel title', () => {
      assert.match(body, /<title>PriceTracker Blog<\/title>/);
    });

    it('has channel link and description', () => {
      assert.match(body, /<link>/);
      assert.match(body, /<description>/);
    });

    it('has lastBuildDate', () => {
      assert.match(body, /<lastBuildDate>/);
    });

    it('has atom:link self reference', () => {
      assert.match(body, /<atom:link.*href="[^"]*\/blog\/feed\.xml"/);
    });

    it('contains at least one <item>', () => {
      const itemMatches = body.match(/<item>/g) || [];
      assert.ok(itemMatches.length >= 1, 'Expected at least one RSS item');
    });

    it('items have title, link, guid, description, pubDate', () => {
      assert.match(body, /<title>/);
      assert.match(body, /<link>/);
      assert.match(body, /<guid isPermaLink="true">/);
      assert.match(body, /<description>/);
      assert.match(body, /<pubDate>/);
    });
  });

  // -------------------------------------------------------------------------
  // Blog post
  // -------------------------------------------------------------------------
  describe('GET /blog/:slug (valid slug)', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/blog/how-to-track-competitor-prices-shopify`);
      body = await res.text();
    });

    it('returns 200', () => {
      assert.equal(res.status, 200);
    });

    it('returns HTML content type', () => {
      assert.match(res.headers.get('content-type'), /text\/html/);
    });

    it('has og:type="article"', () => {
      assert.match(body, /property="og:type"\s+content="article"/i);
    });

    it('has meta description', () => {
      assert.match(body, /<meta\s+name="description"/i);
    });

    it('has canonical link', () => {
      assert.match(body, /rel="canonical"/);
    });

    it('has Open Graph tags', () => {
      assert.match(body, /property="og:title"/i);
      assert.match(body, /property="og:image"/i);
    });

    it('has Twitter Card tag', () => {
      assert.match(body, /name="twitter:card"/i);
    });

    it('includes Article JSON-LD schema', () => {
      assert.match(body, /"@type"\s*:\s*"Article"/);
    });

    it('Article schema has datePublished', () => {
      assert.match(body, /"datePublished"/);
    });

    it('Article schema has author', () => {
      assert.match(body, /"author"/);
    });

    it('includes BreadcrumbList JSON-LD', () => {
      assert.match(body, /"@type"\s*:\s*"BreadcrumbList"/);
    });

    it('has single H1 with post title', () => {
      const h1Matches = body.match(/<h1\b/gi) || [];
      assert.equal(h1Matches.length, 1, 'Blog post should have exactly one H1');
    });

    it('has breadcrumb nav', () => {
      assert.match(body, /class="breadcrumb"/);
    });

    it('breadcrumb links back to /blog', () => {
      assert.match(body, /href="\/blog"/);
    });

    it('has semantic <main> with id="main-content"', () => {
      assert.match(body, /<main\s[^>]*id="main-content"/);
    });

    it('has skip link', () => {
      assert.match(body, /class="skip-link"/);
    });

    it('has in-article CTA linking to /signup', () => {
      assert.match(body, /href="\/signup"/);
    });

    it('post body contains heading hierarchy (H2)', () => {
      assert.match(body, /<h2\b/i);
    });

    it('sets security headers', () => {
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    });
  });

  describe('GET /blog/:slug (invalid slug)', () => {
    let res;

    before(async () => {
      res = await fetch(`${baseUrl}/blog/this-post-does-not-exist`);
    });

    it('returns 404', () => {
      assert.equal(res.status, 404);
    });

    it('returns HTML content type', () => {
      assert.match(res.headers.get('content-type'), /text\/html/);
    });
  });
});
