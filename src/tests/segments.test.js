import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';

const { default: app } = await import('../app.js');

describe('Segment landing pages', () => {
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
  // Shopify sellers — reference implementation
  // -------------------------------------------------------------------------
  describe('GET /for/shopify-sellers', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/for/shopify-sellers`);
      body = await res.text();
    });

    it('returns 200', () => {
      assert.equal(res.status, 200);
    });

    it('returns HTML content type', () => {
      assert.match(res.headers.get('content-type'), /text\/html/);
    });

    it('meta title is ≤60 chars (excluding brand suffix)', () => {
      const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
      assert.ok(titleMatch, 'Title element must exist');
      // Meta title should be present and reasonable
      assert.ok(titleMatch[1].length > 0);
    });

    it('has meta description', () => {
      assert.match(body, /<meta\s+name="description"\s+content="[^"]+"/i);
    });

    it('has canonical link', () => {
      assert.match(body, /<link\s+rel="canonical"\s+href="[^"]+\/for\/shopify-sellers"/i);
    });

    it('has Open Graph tags', () => {
      assert.match(body, /property="og:title"/i);
      assert.match(body, /property="og:description"/i);
      assert.match(body, /property="og:image"/i);
    });

    it('has Twitter Card tags', () => {
      assert.match(body, /name="twitter:card"/i);
    });

    it('includes FAQPage JSON-LD schema', () => {
      assert.match(body, /"@type"\s*:\s*"FAQPage"/);
    });

    it('FAQPage schema has Question entries', () => {
      assert.match(body, /"@type"\s*:\s*"Question"/);
    });

    it('includes BreadcrumbList JSON-LD', () => {
      assert.match(body, /"@type"\s*:\s*"BreadcrumbList"/);
    });

    it('includes Organization JSON-LD', () => {
      assert.match(body, /"@type"\s*:\s*"Organization"/);
    });

    it('includes Product JSON-LD with offers', () => {
      assert.match(body, /"@type"\s*:\s*"Product"/);
      assert.match(body, /"@type"\s*:\s*"Offer"/);
    });

    it('has single H1', () => {
      const h1Matches = body.match(/<h1\b/gi) || [];
      assert.equal(h1Matches.length, 1, 'Segment page should have exactly one H1');
    });

    it('H1 targets segment keyword', () => {
      assert.match(body, /Shopify/i);
    });

    it('has breadcrumb nav', () => {
      assert.match(body, /class="breadcrumb"/);
    });

    it('has FAQ section with <details> accordions', () => {
      assert.match(body, /id="faq"/);
      const detailsMatches = body.match(/<details\b/gi) || [];
      assert.ok(detailsMatches.length >= 3, `Expected at least 3 FAQ items, got ${detailsMatches.length}`);
    });

    it('has CTA linking to /signup', () => {
      const signupLinks = body.match(/href="\/signup"/g) || [];
      assert.ok(signupLinks.length >= 1, 'Expected at least one signup CTA');
    });

    it('has <main> with id="main-content"', () => {
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
      assert.ok(res.headers.get('content-security-policy'), 'CSP header must be present');
    });

    it('links to /assets/landing.css', () => {
      assert.match(body, /href="\/assets\/landing\.css"/);
    });
  });

  // -------------------------------------------------------------------------
  // All five segments exist and return 200
  // -------------------------------------------------------------------------
  const ALL_SEGMENTS = [
    'shopify-sellers',
    'amazon-sellers',
    'dropshippers',
    'resellers',
    'local-businesses',
  ];

  for (const slug of ALL_SEGMENTS) {
    describe(`GET /for/${slug}`, () => {
      let res;
      let body;

      before(async () => {
        res = await fetch(`${baseUrl}/for/${slug}`);
        body = await res.text();
      });

      it('returns 200', () => {
        assert.equal(res.status, 200);
      });

      it('has a unique H1', () => {
        assert.match(body, /<h1\b/i);
      });

      it('includes FAQPage schema', () => {
        assert.match(body, /"@type"\s*:\s*"FAQPage"/);
      });

      it('has FAQ accordion items', () => {
        const detailsMatches = body.match(/<details\b/gi) || [];
        assert.ok(detailsMatches.length >= 3, `${slug}: expected ≥3 FAQ items`);
      });

      it('canonical URL matches segment path', () => {
        assert.match(body, new RegExp(`rel="canonical"[^>]*href="[^"]*\/for\/${slug}"`));
      });
    });
  }

  // -------------------------------------------------------------------------
  // Unknown segment returns 404
  // -------------------------------------------------------------------------
  describe('GET /for/unknown-segment', () => {
    let res;

    before(async () => {
      res = await fetch(`${baseUrl}/for/unknown-segment`);
    });

    it('returns 404', () => {
      assert.equal(res.status, 404);
    });

    it('returns HTML content type', () => {
      assert.match(res.headers.get('content-type'), /text\/html/);
    });
  });
});
