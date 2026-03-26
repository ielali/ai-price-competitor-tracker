import { FOOTER, META } from '../content/landing.js';

// ---------------------------------------------------------------------------
// CR-1: HTML escaping utility
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ---------------------------------------------------------------------------
// CR-3: Security headers
// ---------------------------------------------------------------------------
const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// CR-7 fix: use static date constants instead of new Date() so the "Last
// updated" date only changes when the policy actually changes.
const PRIVACY_LAST_UPDATED = 'January 1, 2025';
const TERMS_LAST_UPDATED = 'January 1, 2025';

function renderStaticLayout(title, heading, bodyContent, canonicalUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — ${escapeHtml(FOOTER.brand)}</title>
  <meta name="description" content="${escapeHtml(title)} for ${escapeHtml(FOOTER.brand)}.">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="stylesheet" href="/assets/landing.css">
</head>
<body class="static-page">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="site-header" role="banner">
    <nav class="nav-inner" aria-label="Main navigation">
      <a href="/" class="nav-brand" aria-label="${escapeHtml(FOOTER.brand)} home">${escapeHtml(FOOTER.brand)}</a>
    </nav>
  </header>
  <main id="main-content">
    <div class="container">
      <h1>${escapeHtml(heading)}</h1>
      ${bodyContent}
      <p><a href="/">&#x2190; Back to home</a></p>
    </div>
  </main>
  <footer class="site-footer" role="contentinfo">
    <div class="container footer-inner">
      <p class="footer-copy">${escapeHtml(FOOTER.copyright)}</p>
    </div>
  </footer>
</body>
</html>`;
}

export function privacyPageHandler(_req, res) {
  // CR-3: security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  const content = `
    <p>Last updated: ${escapeHtml(PRIVACY_LAST_UPDATED)}</p>
    <p>
      This Privacy Policy describes how ${escapeHtml(FOOTER.brand)} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses,
      and shares information about you when you use our services.
    </p>
    <p>
      <strong>Information We Collect:</strong> We collect information you provide directly to us,
      such as when you create an account, and information we collect automatically when you use
      our services, such as log data and usage information.
    </p>
    <p>
      <strong>How We Use Your Information:</strong> We use the information we collect to provide,
      maintain, and improve our services, process transactions, and communicate with you.
    </p>
    <p>
      <strong>Contact Us:</strong> If you have any questions about this Privacy Policy,
      please contact us at <a href="mailto:${escapeHtml(FOOTER.contact)}">${escapeHtml(FOOTER.contact)}</a>.
    </p>
    <p><em>This is a placeholder page. Full privacy policy will be provided before launch.</em></p>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // CR-8 fix: canonical URL points to /privacy, not the homepage
  res.send(renderStaticLayout('Privacy Policy', 'Privacy Policy', content, `${META.canonicalUrl}/privacy`));
}

export function termsPageHandler(_req, res) {
  // CR-3: security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  const content = `
    <p>Last updated: ${escapeHtml(TERMS_LAST_UPDATED)}</p>
    <p>
      By accessing and using ${escapeHtml(FOOTER.brand)} services, you agree to be bound by these
      Terms of Service. Please read these terms carefully before using our platform.
    </p>
    <p>
      <strong>Use of Service:</strong> You may use our services only as permitted by these
      terms and any applicable laws. You may not misuse our services.
    </p>
    <p>
      <strong>Account Responsibility:</strong> You are responsible for safeguarding your
      account credentials and for all activity that occurs under your account.
    </p>
    <p>
      <strong>Contact Us:</strong> If you have any questions about these Terms,
      please contact us at <a href="mailto:${escapeHtml(FOOTER.contact)}">${escapeHtml(FOOTER.contact)}</a>.
    </p>
    <p><em>This is a placeholder page. Full terms of service will be provided before launch.</em></p>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // CR-8 fix: canonical URL points to /terms, not the homepage
  res.send(renderStaticLayout('Terms of Service', 'Terms of Service', content, `${META.canonicalUrl}/terms`));
}
