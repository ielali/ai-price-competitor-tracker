import { FOOTER, META } from '../content/landing.js';

function renderStaticLayout(title, heading, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — ${FOOTER.brand}</title>
  <meta name="description" content="${title} for ${FOOTER.brand}.">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${META.canonicalUrl}">
  <link rel="stylesheet" href="/landing.css">
</head>
<body class="static-page">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="site-header" role="banner">
    <nav class="nav-inner" aria-label="Main navigation">
      <a href="/" class="nav-brand" aria-label="${FOOTER.brand} home">${FOOTER.brand}</a>
    </nav>
  </header>
  <main id="main-content">
    <div class="container">
      <h1>${heading}</h1>
      ${bodyContent}
      <p><a href="/">← Back to home</a></p>
    </div>
  </main>
  <footer class="site-footer" role="contentinfo">
    <div class="container footer-inner">
      <p class="footer-copy">${FOOTER.copyright}</p>
    </div>
  </footer>
</body>
</html>`;
}

export function privacyPageHandler(_req, res) {
  const content = `
    <p>Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>
      This Privacy Policy describes how ${FOOTER.brand} ("we", "us", or "our") collects, uses,
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
      please contact us at <a href="mailto:${FOOTER.contact}">${FOOTER.contact}</a>.
    </p>
    <p><em>This is a placeholder page. Full privacy policy will be provided before launch.</em></p>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderStaticLayout('Privacy Policy', 'Privacy Policy', content));
}

export function termsPageHandler(_req, res) {
  const content = `
    <p>Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>
      By accessing and using ${FOOTER.brand} services, you agree to be bound by these
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
      please contact us at <a href="mailto:${FOOTER.contact}">${FOOTER.contact}</a>.
    </p>
    <p><em>This is a placeholder page. Full terms of service will be provided before launch.</em></p>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderStaticLayout('Terms of Service', 'Terms of Service', content));
}
