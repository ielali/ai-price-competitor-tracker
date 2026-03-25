import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';

const { default: app } = await import('../app.js');

describe('Landing page', () => {
  let server;
  let baseUrl;

  before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  }));

  after(() => new Promise((resolve) => server.close(resolve)));

  describe('GET /', () => {
    let res;
    let body;

    before(async () => {
      res = await fetch(`${baseUrl}/`);
      body = await res.text();
    });

    it('returns 200 status', () => {
      assert.equal(res.status, 200);
    });

    it('returns HTML content type', () => {
      assert.match(res.headers.get('content-type'), /text\/html/);
    });

    // AC7: SEO — meta tags
    it('includes <title> tag with product name', () => {
      assert.match(body, /<title>[^<]*PriceTracker[^<]*<\/title>/i);
    });

    it('includes meta description', () => {
      assert.match(body, /<meta\s+name="description"\s+content="[^"]+"/i);
    });

    it('includes Open Graph og:title', () => {
      assert.match(body, /property="og:title"/i);
    });

    it('includes Open Graph og:description', () => {
      assert.match(body, /property="og:description"/i);
    });

    it('includes Open Graph og:image', () => {
      assert.match(body, /property="og:image"/i);
    });

    it('includes Twitter Card meta tag', () => {
      assert.match(body, /name="twitter:card"/i);
    });

    it('includes canonical link', () => {
      assert.match(body, /<link\s+rel="canonical"/i);
    });

    it('includes JSON-LD Organization structured data', () => {
      assert.match(body, /"@type"\s*:\s*"Organization"/);
    });

    it('includes JSON-LD SoftwareApplication structured data', () => {
      assert.match(body, /"@type"\s*:\s*"SoftwareApplication"/);
    });

    // AC9: Accessibility — skip link
    it('includes skip-to-content link', () => {
      assert.match(body, /class="skip-link"/);
      assert.match(body, /href="#main-content"/);
    });

    // AC7: Semantic HTML
    it('has semantic <main> element with id="main-content"', () => {
      assert.match(body, /<main\s[^>]*id="main-content"/);
    });

    it('has <nav> element', () => {
      assert.match(body, /<nav\b/i);
    });

    it('has <footer> element with role="contentinfo"', () => {
      assert.match(body, /<footer\b[^>]*role="contentinfo"/i);
    });

    it('has <header> element with role="banner"', () => {
      assert.match(body, /<header\b[^>]*role="banner"/i);
    });

    // AC1: Hero section
    it('contains hero section', () => {
      assert.match(body, /id="hero"/);
    });

    it('has an <h1> headline in the hero', () => {
      assert.match(body, /<h1\b/i);
    });

    it('hero has primary CTA "Start Free Trial" linking to /signup', () => {
      assert.match(body, /Start Free Trial/);
      assert.match(body, /href="\/signup"/);
    });

    it('hero has secondary CTA linking to #how-it-works', () => {
      assert.match(body, /href="#how-it-works"/);
    });

    it('hero visual has alt text', () => {
      assert.match(body, /<title>[^<]*dashboard[^<]*<\/title>/i);
    });

    // AC2: Benefits section
    it('contains benefits section with id="benefits"', () => {
      assert.match(body, /id="benefits"/);
    });

    it('benefits section has multiple <h3> cards', () => {
      const h3Matches = body.match(/<h3\b/gi) || [];
      assert.ok(h3Matches.length >= 3, `Expected at least 3 h3 elements, got ${h3Matches.length}`);
    });

    it('benefits section mentions automated tracking', () => {
      assert.match(body, /Automated Price Tracking/i);
    });

    it('benefits section mentions real-time alerts', () => {
      assert.match(body, /Real-Time Alerts/i);
    });

    it('benefits section mentions actionable insights', () => {
      assert.match(body, /Actionable Insights/i);
    });

    it('benefits section mentions affordable pricing', () => {
      assert.match(body, /Affordable Pricing/i);
    });

    // AC3: How It Works section
    it('contains how-it-works section', () => {
      assert.match(body, /id="how-it-works"/);
    });

    it('how-it-works has 3 steps', () => {
      const stepMatches = body.match(/class="step"/g) || [];
      assert.equal(stepMatches.length, 3);
    });

    it('step 1 mentions adding competitors/products', () => {
      assert.match(body, /Add Competitors/i);
    });

    it('step 2 mentions automatic monitoring', () => {
      assert.match(body, /Monitor Automatically/i);
    });

    it('step 3 mentions alerts and insights', () => {
      assert.match(body, /Alerts.*Insights/i);
    });

    // AC4: Social Proof section
    it('contains social-proof section', () => {
      assert.match(body, /id="social-proof"/);
    });

    it('social proof has at least 2 testimonials', () => {
      const testimonialMatches = body.match(/class="testimonial-card"/g) || [];
      assert.ok(testimonialMatches.length >= 2, `Expected at least 2 testimonials, got ${testimonialMatches.length}`);
    });

    it('social proof has metric callouts', () => {
      assert.match(body, /class="metric"/);
    });

    // AC5: Pricing section
    it('contains pricing section', () => {
      assert.match(body, /id="pricing"/);
    });

    it('pricing shows monthly price', () => {
      assert.match(body, /\$50/);
    });

    it('pricing mentions free trial', () => {
      assert.match(body, /free trial/i);
    });

    it('pricing has a CTA linking to signup', () => {
      const signupLinks = body.match(/href="\/signup"/g) || [];
      assert.ok(signupLinks.length >= 2, 'Expected at least 2 signup links (hero + pricing)');
    });

    it('pricing mentions no credit card', () => {
      assert.match(body, /no credit card/i);
    });

    // AC6: Footer
    it('contains footer', () => {
      assert.match(body, /<footer\b/i);
    });

    it('footer has Privacy Policy link', () => {
      assert.match(body, /href="\/privacy"/i);
      assert.match(body, /Privacy Policy/i);
    });

    it('footer has Terms of Service link', () => {
      assert.match(body, /href="\/terms"/i);
      assert.match(body, /Terms of Service/i);
    });

    it('footer has contact email', () => {
      assert.match(body, /support@pricetracker\.io/i);
    });

    it('footer has copyright notice', () => {
      assert.match(body, /©.*PriceTracker/);
    });

    // CSS
    it('links to landing.css stylesheet', () => {
      assert.match(body, /href="\/landing\.css"/);
    });
  });

  describe('GET /privacy', () => {
    it('returns 200 with HTML', async () => {
      const res = await fetch(`${baseUrl}/privacy`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), /text\/html/);
      const body = await res.text();
      assert.match(body, /Privacy Policy/i);
      assert.match(body, /PriceTracker/);
    });
  });

  describe('GET /terms', () => {
    it('returns 200 with HTML', async () => {
      const res = await fetch(`${baseUrl}/terms`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), /text\/html/);
      const body = await res.text();
      assert.match(body, /Terms of Service/i);
      assert.match(body, /PriceTracker/);
    });
  });

  describe('renderLandingPage (unit)', () => {
    let html;

    before(async () => {
      const { renderLandingPage } = await import('../routes/landing.js');
      html = renderLandingPage();
    });

    it('returns a non-empty string', () => {
      assert.ok(typeof html === 'string' && html.length > 0);
    });

    it('starts with <!DOCTYPE html>', () => {
      assert.match(html, /^<!DOCTYPE html>/i);
    });

    it('has lang="en" on html element', () => {
      assert.match(html, /<html\s+lang="en"/i);
    });

    it('has UTF-8 charset meta', () => {
      assert.match(html, /<meta\s+charset="UTF-8"/i);
    });

    it('has viewport meta for responsive design', () => {
      assert.match(html, /name="viewport"/i);
      assert.match(html, /width=device-width/);
    });

    it('all section aria-labelledby attributes reference existing ids', () => {
      const labelledByRefs = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
      for (const ref of labelledByRefs) {
        assert.match(html, new RegExp(`id="${ref}"`), `Missing id="${ref}" referenced by aria-labelledby`);
      }
    });

    it('nav toggle button has aria-controls and aria-expanded', () => {
      assert.match(html, /aria-controls="nav-menu"/);
      assert.match(html, /aria-expanded="false"/);
    });

    it('ul#nav-menu has role="list"', () => {
      assert.match(html, /id="nav-menu"[^>]*role="list"/);
    });
  });
});
