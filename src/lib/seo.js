// ---------------------------------------------------------------------------
// Shared SEO utilities: HTML escaping, JSON-LD serialisation, schema builders
// ---------------------------------------------------------------------------

/**
 * Escape HTML special chars to prevent XSS in template interpolations.
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Safely serialize an object for embedding inside a <script> block.
 * JSON.stringify does not escape </script>, which would break the block.
 */
export function safeJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

// ---------------------------------------------------------------------------
// Schema builders — each returns a JSON-LD object ready for safeJsonLd()
// ---------------------------------------------------------------------------

/**
 * Organization schema — appears on all pages.
 */
export function buildOrganizationSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    description: config.description,
    email: config.email,
    logo: config.logo,
  };
}

/**
 * WebSite schema with SearchAction — appears on homepage.
 */
export function buildWebSiteSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.url}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Article schema — appears on blog post pages.
 * @param {{ title, description, slug, datePublished, dateModified, author, image, canonicalUrl }} post
 */
export function buildArticleSchema(post, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PriceTracker',
      url: baseUrl,
    },
    image: post.image ? `${baseUrl}${post.image}` : `${baseUrl}/og-image.png`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  };
}

/**
 * Product schema — appears on pricing section/page.
 */
export function buildProductSchema(plan, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.name,
    description: plan.description,
    url: baseUrl,
    offers: {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: plan.priceCurrency,
      priceValidUntil: plan.priceValidUntil,
      description: plan.trialDescription,
      availability: 'https://schema.org/InStock',
    },
  };
}

/**
 * FAQ schema — appears on landing pages.
 * @param {{ question, answer }[]} questions
 */
export function buildFAQSchema(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * BreadcrumbList schema — appears on all interior pages.
 * @param {{ name, href }[]} crumbs — ordered list from root to current
 */
export function buildBreadcrumbSchema(crumbs, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.href.startsWith('http') ? crumb.href : `${baseUrl}${crumb.href}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Shared security headers — applied on every marketing route response
// ---------------------------------------------------------------------------
export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export function applySecurityHeaders(res) {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
}

// ---------------------------------------------------------------------------
// Shared HTML head builder
// ---------------------------------------------------------------------------

/**
 * Render the full <head> block for a page.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   canonical: string,
 *   ogTitle?: string,
 *   ogDescription?: string,
 *   ogImage?: string,
 *   ogType?: string,
 *   twitterCard?: string,
 *   noindex?: boolean,
 *   structuredData?: object[],
 * }} opts
 */
export function renderHead(opts) {
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noindex = false,
    structuredData = [],
  } = opts;

  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;
  const resolvedOgImage = ogImage || '/og-image.png';

  const schemaBlocks = structuredData
    .map((sd) => `  <script type="application/ld+json">${safeJsonLd(sd)}</script>`)
    .join('\n');

  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <link rel="canonical" href="${escapeHtml(canonical)}">

  <!-- Open Graph -->
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(resolvedOgTitle)}">
  <meta property="og:description" content="${escapeHtml(resolvedOgDescription)}">
  <meta property="og:image" content="${escapeHtml(resolvedOgImage)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${escapeHtml(twitterCard)}">
  <meta name="twitter:title" content="${escapeHtml(resolvedOgTitle)}">
  <meta name="twitter:description" content="${escapeHtml(resolvedOgDescription)}">
  <meta name="twitter:image" content="${escapeHtml(resolvedOgImage)}">

  <link rel="alternate" type="application/rss+xml" title="PriceTracker Blog" href="/blog/feed.xml">
  <link rel="stylesheet" href="/assets/landing.css">
${schemaBlocks}`;
}
