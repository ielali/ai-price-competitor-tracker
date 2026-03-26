import { SEGMENTS, SEGMENT_BY_SLUG } from '../content/segments.js';
import { META, FOOTER, PRICING } from '../content/landing.js';
import {
  escapeHtml,
  safeJsonLd,
  applySecurityHeaders,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildProductSchema,
} from '../lib/seo.js';

const BASE_URL = META.canonicalUrl;

// ---------------------------------------------------------------------------
// Shared nav/footer for segment pages
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
// Render FAQ section with <details>/<summary> (accessible, no JS required)
// ---------------------------------------------------------------------------
function renderFAQ(faqs, slug) {
  const items = faqs
    .map(
      (faq, i) => `
    <details class="faq-item" id="faq-${escapeHtml(slug)}-${i + 1}">
      <summary class="faq-question">${escapeHtml(faq.question)}</summary>
      <div class="faq-answer">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </details>`,
    )
    .join('');

  return `
<section class="faq-section" id="faq" aria-labelledby="faq-heading">
  <div class="container">
    <h2 id="faq-heading" class="section-heading">Frequently Asked Questions</h2>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Render benefit cards for a segment
// ---------------------------------------------------------------------------
function renderBenefits(benefits) {
  const cards = benefits
    .map(
      (b) => `
    <article class="benefit-card">
      <h3 class="benefit-title">${escapeHtml(b.title)}</h3>
      <p class="benefit-description">${escapeHtml(b.description)}</p>
    </article>`,
    )
    .join('');

  return `
<section class="benefits segment-benefits" id="benefits" aria-labelledby="benefits-heading">
  <div class="container">
    <h2 id="benefits-heading" class="section-heading">Why PriceTracker Works for You</h2>
    <div class="benefits-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Segment landing page handler factory
// ---------------------------------------------------------------------------
function renderSegmentPage(segment) {
  const canonicalUrl = `${BASE_URL}${segment.path}`;
  const ogImage = `${BASE_URL}/og-image.png`;

  const faqSchema = buildFAQSchema(segment.faqs);
  const breadcrumbSchema = buildBreadcrumbSchema(segment.breadcrumbs, BASE_URL);
  const orgSchema = buildOrganizationSchema({
    name: 'PriceTracker',
    url: BASE_URL,
    description: 'Automated competitor price tracking for small e-commerce businesses.',
    email: FOOTER.contact,
    logo: `${BASE_URL}/logo.png`,
  });
  const productSchema = buildProductSchema(
    {
      name: `PriceTracker — ${PRICING.plan.name}`,
      description:
        'Monitor competitor prices 24/7. Get real-time alerts and actionable insights to protect your e-commerce margins.',
      price: '50',
      priceCurrency: 'USD',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      trialDescription: '14-day free trial, no credit card required',
    },
    BASE_URL,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(segment.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(segment.metaDescription)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(segment.metaTitle)}">
  <meta property="og:description" content="${escapeHtml(segment.metaDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(segment.metaTitle)}">
  <meta name="twitter:description" content="${escapeHtml(segment.metaDescription)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <link rel="alternate" type="application/rss+xml" title="PriceTracker Blog" href="/blog/feed.xml">
  <link rel="stylesheet" href="/assets/landing.css">
  <script type="application/ld+json">${safeJsonLd(faqSchema)}</script>
  <script type="application/ld+json">${safeJsonLd(breadcrumbSchema)}</script>
  <script type="application/ld+json">${safeJsonLd(orgSchema)}</script>
  <script type="application/ld+json">${safeJsonLd(productSchema)}</script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${renderNav()}
  <main id="main-content">
    <!-- Hero -->
    <section class="segment-hero" id="hero" aria-labelledby="hero-heading">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol role="list">
            ${segment.breadcrumbs.map((crumb, i) =>
              i < segment.breadcrumbs.length - 1
                ? `<li><a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.name)}</a></li>`
                : `<li aria-current="page">${escapeHtml(crumb.name)}</li>`,
            ).join('')}
          </ol>
        </nav>
        <h1 id="hero-heading" class="segment-hero-heading">${escapeHtml(segment.h1)}</h1>
        <p class="segment-hero-subheadline">${escapeHtml(segment.subheadline)}</p>
        <div class="hero-ctas">
          <a href="/signup" class="btn btn-primary btn-lg">Start Free 14-Day Trial</a>
          <a href="/#pricing" class="btn btn-ghost btn-lg">See Pricing</a>
        </div>
        <p class="hero-note">No credit card required &middot; 14-day free trial</p>
      </div>
    </section>

    <!-- Benefits -->
    ${renderBenefits(segment.benefits)}

    <!-- FAQ -->
    ${renderFAQ(segment.faqs, segment.slug)}

    <!-- CTA Section -->
    <section class="segment-final-cta" aria-labelledby="cta-heading">
      <div class="container">
        <h2 id="cta-heading" class="section-heading">Ready to Stop Guessing?</h2>
        <p class="section-subheading">Start monitoring your competitors today. 14-day free trial, no credit card required.</p>
        <a href="/signup" class="btn btn-primary btn-lg">Start Free Trial</a>
      </div>
    </section>
  </main>
  ${renderFooter()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Route handler — handles all segment slugs
// ---------------------------------------------------------------------------
export function segmentPageHandler(req, res) {
  const segment = SEGMENT_BY_SLUG[req.params.slug];

  if (!segment) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Not Found | PriceTracker</title>
  <link rel="stylesheet" href="/assets/landing.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${renderNav()}
  <main id="main-content">
    <div class="container" style="padding: 4rem 1rem; text-align: center;">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" class="btn btn-primary" style="margin-top: 1.5rem;">Back to home</a>
    </div>
  </main>
  ${renderFooter()}
</body>
</html>`);
    return;
  }

  applySecurityHeaders(res);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSegmentPage(segment));
}

// Export segment list for sitemap generation
export { SEGMENTS };
