import {
  META,
  NAV,
  HERO,
  BENEFITS,
  HOW_IT_WORKS,
  SOCIAL_PROOF,
  PRICING,
  FOOTER,
  STRUCTURED_DATA,
} from '../content/landing.js';

// SVG icons used in the benefits section
const ICONS = {
  chart: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  insight: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>`,
};

// Hero dashboard illustration (inline SVG placeholder — flag for design iteration)
const HERO_ILLUSTRATION = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" role="img" aria-label="${HERO.visualAlt}" class="hero-illustration">
  <title>${HERO.visualAlt}</title>
  <!-- Dashboard frame -->
  <rect width="600" height="380" rx="12" fill="#1e293b"/>
  <!-- Top bar -->
  <rect width="600" height="48" rx="12" fill="#0f172a"/>
  <rect y="36" width="600" height="12" fill="#0f172a"/>
  <!-- Traffic lights -->
  <circle cx="24" cy="24" r="6" fill="#ef4444"/>
  <circle cx="44" cy="24" r="6" fill="#f59e0b"/>
  <circle cx="64" cy="24" r="6" fill="#10b981"/>
  <!-- URL bar -->
  <rect x="96" y="14" width="380" height="20" rx="4" fill="#1e293b"/>
  <text x="110" y="28" font-family="monospace" font-size="11" fill="#64748b">app.pricetracker.io/dashboard</text>
  <!-- Sidebar -->
  <rect x="0" y="48" width="160" height="332" fill="#0f172a"/>
  <text x="20" y="80" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563eb">PriceTracker</text>
  <rect x="12" y="96" width="136" height="32" rx="6" fill="#2563eb" opacity="0.2"/>
  <text x="28" y="117" font-family="sans-serif" font-size="12" fill="#60a5fa">Dashboard</text>
  <text x="28" y="150" font-family="sans-serif" font-size="12" fill="#64748b">Competitors</text>
  <text x="28" y="183" font-family="sans-serif" font-size="12" fill="#64748b">Products</text>
  <text x="28" y="216" font-family="sans-serif" font-size="12" fill="#64748b">Alerts</text>
  <text x="28" y="249" font-family="sans-serif" font-size="12" fill="#64748b">Reports</text>
  <!-- Main content area -->
  <rect x="172" y="60" width="412" height="308" rx="8" fill="#1e293b"/>
  <!-- Stats row -->
  <rect x="184" y="72" width="92" height="64" rx="6" fill="#0f172a"/>
  <text x="196" y="94" font-family="sans-serif" font-size="10" fill="#64748b">Products Tracked</text>
  <text x="196" y="120" font-family="sans-serif" font-size="22" font-weight="700" fill="#f1f5f9">247</text>
  <rect x="288" y="72" width="92" height="64" rx="6" fill="#0f172a"/>
  <text x="300" y="94" font-family="sans-serif" font-size="10" fill="#64748b">Price Changes</text>
  <text x="300" y="120" font-family="sans-serif" font-size="22" font-weight="700" fill="#f59e0b">12</text>
  <rect x="392" y="72" width="92" height="64" rx="6" fill="#0f172a"/>
  <text x="404" y="94" font-family="sans-serif" font-size="10" fill="#64748b">Savings Protected</text>
  <text x="404" y="120" font-family="sans-serif" font-size="22" font-weight="700" fill="#10b981">$840</text>
  <!-- Alert cards -->
  <rect x="184" y="148" width="190" height="200" rx="6" fill="#0f172a"/>
  <text x="196" y="170" font-family="sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">Recent Alerts</text>
  <!-- Alert 1 -->
  <rect x="196" y="180" width="166" height="44" rx="4" fill="#1e293b"/>
  <rect x="196" y="180" width="4" height="44" rx="2" fill="#ef4444"/>
  <text x="208" y="198" font-family="sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Nike Air Max — Amazon</text>
  <text x="208" y="214" font-family="sans-serif" font-size="9" fill="#64748b">Price dropped $12 · 4 min ago</text>
  <!-- Alert 2 -->
  <rect x="196" y="232" width="166" height="44" rx="4" fill="#1e293b"/>
  <rect x="196" y="232" width="4" height="44" rx="2" fill="#f59e0b"/>
  <text x="208" y="250" font-family="sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Sony WH-1000XM5</text>
  <text x="208" y="266" font-family="sans-serif" font-size="9" fill="#64748b">Now $8 below your price · 1 hr ago</text>
  <!-- Alert 3 -->
  <rect x="196" y="284" width="166" height="44" rx="4" fill="#1e293b"/>
  <rect x="196" y="284" width="4" height="44" rx="2" fill="#10b981"/>
  <text x="208" y="302" font-family="sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Logitech MX Keys</text>
  <text x="208" y="318" font-family="sans-serif" font-size="9" fill="#64748b">Competitor raised price · 2 hrs ago</text>
  <!-- Price chart -->
  <rect x="386" y="148" width="186" height="200" rx="6" fill="#0f172a"/>
  <text x="398" y="170" font-family="sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">Price Trend — 30 Days</text>
  <!-- Chart lines -->
  <polyline points="398,320 420,305 445,310 468,295 492,285 516,290 540,278 560,268" fill="none" stroke="#2563eb" stroke-width="2"/>
  <polyline points="398,330 420,325 445,330 468,322 492,335 516,320 540,325 560,315" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2"/>
  <!-- Chart legend -->
  <rect x="398" y="335" width="10" height="3" fill="#2563eb"/>
  <text x="412" y="339" font-family="sans-serif" font-size="9" fill="#64748b">Your Price</text>
  <rect x="460" y="335" width="10" height="3" fill="#ef4444"/>
  <text x="474" y="339" font-family="sans-serif" font-size="9" fill="#64748b">Competitor</text>
</svg>`;

function renderNav() {
  const links = NAV.links
    .map(({ label, href }) => `<li><a href="${href}" class="nav-link">${label}</a></li>`)
    .join('');
  return `
<header class="site-header" role="banner">
  <nav class="nav-inner" aria-label="Main navigation">
    <a href="/" class="nav-brand" aria-label="${NAV.brand} home">${NAV.brand}</a>
    <button class="nav-toggle" aria-controls="nav-menu" aria-expanded="false" aria-label="Toggle navigation menu">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
    <ul id="nav-menu" class="nav-links" role="list">${links}</ul>
    <a href="${NAV.cta.href}" class="btn btn-primary btn-sm nav-cta">${NAV.cta.label}</a>
  </nav>
</header>`;
}

function renderHero() {
  return `
<section class="hero" id="hero" aria-labelledby="hero-heading">
  <div class="container hero-inner">
    <div class="hero-content">
      <h1 id="hero-heading" class="hero-heading">${HERO.headline}</h1>
      <p class="hero-subheadline">${HERO.subheadline}</p>
      <div class="hero-ctas">
        <a href="${HERO.primaryCta.href}" class="btn btn-primary btn-lg">${HERO.primaryCta.label}</a>
        <a href="${HERO.secondaryCta.href}" class="btn btn-ghost btn-lg">${HERO.secondaryCta.label}</a>
      </div>
      <p class="hero-note">No credit card required &middot; 14-day free trial</p>
    </div>
    <div class="hero-visual" aria-hidden="true">
      ${HERO_ILLUSTRATION}
    </div>
  </div>
</section>`;
}

function renderBenefits() {
  const cards = BENEFITS.items
    .map(({ icon, title, description }) => `
    <article class="benefit-card">
      <div class="benefit-icon" aria-hidden="true">${ICONS[icon] || ''}</div>
      <h3 class="benefit-title">${title}</h3>
      <p class="benefit-description">${description}</p>
    </article>`)
    .join('');
  return `
<section class="benefits" id="benefits" aria-labelledby="benefits-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="benefits-heading" class="section-heading">${BENEFITS.heading}</h2>
      <p class="section-subheading">${BENEFITS.subheading}</p>
    </div>
    <div class="benefits-grid">${cards}
    </div>
  </div>
</section>`;
}

function renderHowItWorks() {
  const steps = HOW_IT_WORKS.steps
    .map(({ number, title, description }) => `
    <div class="step">
      <div class="step-number" aria-hidden="true">${number}</div>
      <div class="step-content">
        <h3 class="step-title">${title}</h3>
        <p class="step-description">${description}</p>
      </div>
    </div>`)
    .join('');
  return `
<section class="how-it-works" id="how-it-works" aria-labelledby="how-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="how-heading" class="section-heading">${HOW_IT_WORKS.heading}</h2>
      <p class="section-subheading">${HOW_IT_WORKS.subheading}</p>
    </div>
    <div class="steps">${steps}
    </div>
  </div>
</section>`;
}

function renderSocialProof() {
  const testimonials = SOCIAL_PROOF.testimonials
    .map(({ quote, name, role, avatarInitials }) => `
    <article class="testimonial-card">
      <blockquote class="testimonial-quote">
        <p>&ldquo;${quote}&rdquo;</p>
      </blockquote>
      <footer class="testimonial-author">
        <div class="testimonial-avatar" aria-hidden="true">${avatarInitials}</div>
        <div>
          <cite class="testimonial-name">${name}</cite>
          <span class="testimonial-role">${role}</span>
        </div>
      </footer>
    </article>`)
    .join('');

  const metrics = SOCIAL_PROOF.metrics
    .map(({ value, label }) => `
    <div class="metric">
      <span class="metric-value">${value}</span>
      <span class="metric-label">${label}</span>
    </div>`)
    .join('');

  const platforms = SOCIAL_PROOF.platforms
    .map((name) => `<span class="platform-badge">${name}</span>`)
    .join('');

  return `
<section class="social-proof" id="social-proof" aria-labelledby="proof-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="proof-heading" class="section-heading">${SOCIAL_PROOF.heading}</h2>
      <p class="section-subheading">${SOCIAL_PROOF.subheading}</p>
    </div>
    <div class="metrics-row" role="list" aria-label="Key metrics">${metrics}
    </div>
    <div class="testimonials-grid">${testimonials}
    </div>
    <div class="platforms" aria-label="Supported platforms">
      <p class="platforms-label">Monitors prices across:</p>
      <div class="platforms-list">${platforms}</div>
    </div>
  </div>
</section>`;
}

function renderPricing() {
  const { plan } = PRICING;
  const features = plan.features
    .map((f) => `
      <li class="pricing-feature">
        <span class="pricing-check" aria-hidden="true">${ICONS.check}</span>
        <span>${f}</span>
      </li>`)
    .join('');

  return `
<section class="pricing" id="pricing" aria-labelledby="pricing-heading">
  <div class="container">
    <div class="section-header">
      <h2 id="pricing-heading" class="section-heading">${PRICING.heading}</h2>
      <p class="section-subheading">${PRICING.subheading}</p>
    </div>
    <div class="pricing-card-wrapper">
      <article class="pricing-card" aria-label="${plan.name} plan">
        <div class="pricing-card-header">
          <h3 class="pricing-plan-name">${plan.name}</h3>
          <div class="pricing-price">
            <span class="pricing-amount">${plan.priceMonthly}</span>
            <span class="pricing-suffix">${plan.priceSuffix}</span>
          </div>
          <p class="pricing-trial">${plan.trial}</p>
        </div>
        <ul class="pricing-features" role="list" aria-label="Plan features">${features}
        </ul>
        <div class="pricing-cta">
          <a href="${plan.cta.href}" class="btn btn-primary btn-lg pricing-btn">${plan.cta.label}</a>
          <p class="pricing-no-card">${plan.noCreditCard}</p>
        </div>
      </article>
      <p class="pricing-note">${plan.note}</p>
    </div>
  </div>
</section>`;
}

function renderFooter() {
  const links = FOOTER.links
    .map(({ label, href }) => `<a href="${href}" class="footer-link">${label}</a>`)
    .join('');
  return `
<footer class="site-footer" id="footer" role="contentinfo">
  <div class="container footer-inner">
    <div class="footer-brand">
      <span class="footer-brand-name">${FOOTER.brand}</span>
      <p class="footer-tagline">${FOOTER.tagline}</p>
    </div>
    <nav class="footer-nav" aria-label="Footer navigation">
      ${links}
      <a href="mailto:${FOOTER.contact}" class="footer-link">Contact: ${FOOTER.contact}</a>
    </nav>
    <p class="footer-copy">${FOOTER.copyright}</p>
  </div>
</footer>`;
}

function renderStructuredData() {
  return `
<script type="application/ld+json">${JSON.stringify(STRUCTURED_DATA.organization)}</script>
<script type="application/ld+json">${JSON.stringify(STRUCTURED_DATA.product)}</script>`;
}

// Minimal inline JS for mobile nav toggle — keeps page near-zero JS
const NAV_SCRIPT = `
<script>
(function(){
  var btn = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (btn && menu) {
    btn.addEventListener('click', function() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open');
    });
    // Close menu on link click
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        btn.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }
})();
</script>`;

export function renderLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${META.title}</title>
  <meta name="description" content="${META.description}">
  <link rel="canonical" href="${META.canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${META.canonicalUrl}">
  <meta property="og:title" content="${META.ogTitle}">
  <meta property="og:description" content="${META.ogDescription}">
  <meta property="og:image" content="${META.canonicalUrl}${META.ogImage}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${META.twitterCard}">
  <meta name="twitter:title" content="${META.ogTitle}">
  <meta name="twitter:description" content="${META.ogDescription}">
  <meta name="twitter:image" content="${META.canonicalUrl}${META.ogImage}">

  <link rel="stylesheet" href="/landing.css">

  ${renderStructuredData()}
</head>
<body>
  <!-- Skip to main content (accessibility) -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${renderNav()}

  <main id="main-content">
    ${renderHero()}
    ${renderBenefits()}
    ${renderHowItWorks()}
    ${renderSocialProof()}
    ${renderPricing()}
  </main>

  ${renderFooter()}

  ${NAV_SCRIPT}
</body>
</html>`;
}

export function landingPageHandler(_req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderLandingPage());
}
