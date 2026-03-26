// Landing page content constants — all copy lives here for CMS-readiness.
// Placeholder testimonials are marked with PLACEHOLDER: and should be replaced
// with real customer quotes before production launch.

export const META = {
  title: 'PriceTracker — Automated Competitor Price Monitoring for E-Commerce',
  description:
    'Stop losing sales to competitors with lower prices. PriceTracker monitors competitor prices 24/7 and alerts you within minutes of any change. Starting at $50/month — a fraction of enterprise tools.',
  ogTitle: 'PriceTracker — Know Before You Lose the Sale',
  ogDescription:
    'Automated competitor price tracking for small e-commerce. Real-time alerts, actionable insights, and affordable pricing starting at $50/month.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: 'https://pricetracker.io',
};

export const NAV = {
  brand: 'PriceTracker',
  links: [
    { label: 'Features', href: '#benefits' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#social-proof' },
  ],
  cta: { label: 'Start Free Trial', href: '/signup' },
};

export const HERO = {
  headline: 'Competitor Price Monitoring for Small Businesses',
  subheadline:
    'PriceTracker monitors your competitors 24/7 and alerts you within minutes when they change their prices — so you can react before you lose a customer. Starting at $50/month instead of $500+ for enterprise tools.',
  primaryCta: { label: 'Start Free Trial', href: '/signup' },
  secondaryCta: { label: 'See How It Works', href: '#how-it-works' },
  visualAlt: 'PriceTracker dashboard showing competitor price trends and alerts',
};

export const BENEFITS = {
  heading: 'Everything You Need to Stay Competitive',
  subheading: 'Stop guessing. Start knowing.',
  items: [
    {
      icon: 'chart',
      title: 'Automated Price Tracking',
      description:
        'Monitor competitor prices across Shopify, Amazon, eBay, and more — 24/7 without manual checks. We watch hundreds of products so you can focus on running your business.',
    },
    {
      icon: 'bell',
      title: 'Real-Time Alerts',
      description:
        'Get notified within minutes when a competitor changes their price. React before you lose a sale, not days later after the damage is done.',
    },
    {
      icon: 'insight',
      title: 'Actionable Insights',
      description:
        'See pricing trends, identify competitor patterns, and make data-driven decisions to protect and grow your margins with weekly intelligence reports.',
    },
    {
      icon: 'dollar',
      title: 'Affordable Pricing',
      description:
        'Enterprise-level intelligence at small business prices. Starting at $50/month — a fraction of the $500+/month tools your bigger competitors are already using.',
    },
  ],
};

export const HOW_IT_WORKS = {
  heading: 'Up and Running in Minutes',
  subheading: 'No technical setup required.',
  steps: [
    {
      number: '01',
      title: 'Add Competitors & Products',
      description:
        'Enter the products you sell and your competitors\' store URLs. We support Shopify, Amazon, eBay, WooCommerce, and any public website.',
    },
    {
      number: '02',
      title: 'We Monitor Automatically',
      description:
        'Our system checks competitor prices every hour across all your tracked products and storefronts — no manual work required.',
    },
    {
      number: '03',
      title: 'Get Alerts & Insights',
      description:
        'Receive instant email alerts the moment prices change, plus weekly reports with trends and recommendations to protect your margins.',
    },
  ],
};

export const SOCIAL_PROOF = {
  heading: 'Trusted by E-Commerce Sellers',
  subheading: 'Join hundreds of businesses that have stopped guessing and started winning.',
  // PLACEHOLDER: Replace with verified customer testimonials before launch
  testimonials: [
    {
      quote:
        'PriceTracker saved us from getting undercut by our biggest competitor. We found out about their flash sale within 20 minutes and adjusted our prices the same day. We kept sales that would have gone elsewhere.',
      name: 'Sarah K.',
      role: 'Shopify Store Owner',
      // PLACEHOLDER: Replace with real customer avatar
      avatarInitials: 'SK',
    },
    {
      quote:
        'I used to spend 2 hours every Monday manually checking competitor prices on five different sites. Now it\'s done automatically, and I get more accurate data than I ever could collect by hand.',
      name: 'Marcus T.',
      role: 'Amazon Reseller',
      // PLACEHOLDER: Replace with real customer avatar
      avatarInitials: 'MT',
    },
    {
      quote:
        'The ROI was immediate. In the first month, we retained three customers who would have switched to a cheaper competitor. The tool paid for itself five times over.',
      name: 'Jennifer L.',
      role: 'E-Commerce Director',
      // PLACEHOLDER: Replace with real customer avatar
      avatarInitials: 'JL',
    },
  ],
  metrics: [
    { value: '1,000+', label: 'Products Tracked Per Account' },
    { value: '<30 min', label: 'Average Alert Response Time' },
    { value: '10 hrs', label: 'Saved Per Week Per User' },
    { value: '5×', label: 'Average First-Month ROI' },
  ],
  // PLACEHOLDER: Replace with actual supported platform logos
  platforms: ['Shopify', 'Amazon', 'eBay', 'WooCommerce', 'Etsy'],
};

export const PRICING = {
  heading: 'Simple, Transparent Pricing',
  subheading: 'No hidden fees. Cancel anytime.',
  plan: {
    name: 'Growth',
    priceMonthly: '$50',
    priceSuffix: '/month',
    trial: '14-day free trial',
    noCreditCard: 'No credit card required',
    features: [
      'Track up to 100 products',
      '5 competitor storefronts',
      'Email alerts within 30 minutes',
      'Weekly intelligence reports',
      'CSV data export',
      'Email support',
    ],
    cta: { label: 'Start Free Trial', href: '/signup' },
    note: 'Need to track more? Contact us for custom pricing.',
  },
};

export const FOOTER = {
  brand: 'PriceTracker',
  tagline: 'Automated competitor price monitoring for e-commerce businesses.',
  links: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  contact: 'support@pricetracker.io',
  copyright: `© ${new Date().getFullYear()} PriceTracker. All rights reserved.`,
};

export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PriceTracker',
    url: 'https://pricetracker.io',
    description:
      'Automated competitor price tracking for small e-commerce businesses.',
    email: 'support@pricetracker.io',
    logo: 'https://pricetracker.io/logo.png',
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PriceTracker',
    url: 'https://pricetracker.io',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://pricetracker.io/blog?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  product: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PriceTracker',
    applicationCategory: 'BusinessApplication',
    description:
      'Monitor competitor prices 24/7. Get real-time alerts and actionable insights to protect your e-commerce margins.',
    offers: {
      '@type': 'Offer',
      price: '50',
      priceCurrency: 'USD',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      description: '14-day free trial, no credit card required',
    },
  },
};

export const FAQ = {
  heading: 'Frequently Asked Questions',
  items: [
    {
      question: 'How quickly will I get alerts when a competitor changes their price?',
      answer:
        'PriceTracker checks competitor prices every hour and sends email alerts within 30 minutes of detecting a change. You can set thresholds (e.g., only alert me if the change is more than $5) to filter out noise.',
    },
    {
      question: 'Which platforms does PriceTracker monitor?',
      answer:
        'PriceTracker monitors any public product page, including Shopify stores, Amazon listings, eBay, WooCommerce, Etsy, and any website that displays prices publicly. No API access or partnerships required.',
    },
    {
      question: 'Do I need to install anything or have technical skills?',
      answer:
        'No installation required on your end. Simply sign up, paste the competitor product URLs you want to track, and we start monitoring immediately. Setup takes about 10 minutes.',
    },
    {
      question: 'How is PriceTracker different from enterprise tools like Prisync or Wiser?',
      answer:
        'Enterprise tools cost $500–$2,000/month and are built for large retail teams. PriceTracker delivers the same core capability — automated monitoring and real-time alerts — starting at $50/month, designed specifically for small businesses and individual sellers.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Yes. Every new account gets a 14-day free trial with full access to all features. No credit card required to start.',
    },
  ],
};
