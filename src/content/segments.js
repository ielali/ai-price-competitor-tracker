// Segment landing page content — one entry per target audience.
// Each segment has a unique slug, meta tags, hero copy, benefit highlights, and FAQs.

export const SEGMENTS = [
  {
    slug: 'shopify-sellers',
    path: '/for/shopify-sellers',
    metaTitle: 'Price Monitoring for Shopify Sellers | PriceTracker',
    metaDescription:
      'Monitor your Shopify competitors\' prices automatically. Get alerts within 30 minutes when rivals change their prices. Start free — no credit card required.',
    h1: 'Competitor Price Monitoring for Shopify Sellers',
    subheadline:
      'Know the moment any competitor changes their price — and react before you lose a single sale. PriceTracker monitors Shopify stores, Amazon, and eBay 24/7 so you never fly blind.',
    benefits: [
      {
        title: 'Monitors Any Public Shopify Store',
        description:
          'Add any Shopify competitor URL and we\'ll track every product page you care about — no API keys, no technical setup required.',
      },
      {
        title: 'Alerts Within 30 Minutes',
        description:
          'Flash sales and same-day price cuts are invisible to weekly manual checks. PriceTracker checks every hour and emails you within 30 minutes of any change.',
      },
      {
        title: 'Works Across All Channels',
        description:
          'Your competitors sell on Amazon and eBay too. Track the same SKU across multiple platforms so you always have the full picture.',
      },
    ],
    faqs: [
      {
        question: 'Can I track any Shopify store, not just direct competitors?',
        answer:
          'Yes. PriceTracker can monitor any publicly accessible Shopify store, as well as WooCommerce, Magento, and other e-commerce platforms. You add a product URL and we handle the rest.',
      },
      {
        question: 'How quickly will I know when a competitor changes their price?',
        answer:
          'We check prices every hour and send email alerts within 30 minutes of detecting a change. You can set a threshold (e.g., alert me only if the change is more than $5 or 10%) to avoid noise.',
      },
      {
        question: 'Do I need to install anything on my Shopify store?',
        answer:
          'No installation is required on your store. PriceTracker monitors competitor stores, not yours. Simply sign up, add competitor product URLs, and we start tracking immediately.',
      },
      {
        question: 'How many products and competitors can I track?',
        answer:
          'The Growth plan supports up to 100 products and 5 competitor storefronts at $50/month. Need more? Contact us for custom pricing that scales with your catalog.',
      },
      {
        question: 'What happens if I want to cancel?',
        answer:
          'Cancel anytime with one click — no contracts, no cancellation fees. We offer a 14-day free trial so you can see the value before you pay.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'For Shopify Sellers', href: '/for/shopify-sellers' },
    ],
  },
  {
    slug: 'amazon-sellers',
    path: '/for/amazon-sellers',
    metaTitle: 'Amazon Seller Price Monitoring Tool | PriceTracker',
    metaDescription:
      'Track competitor prices on Amazon automatically. Real-time alerts when rivals undercut you. Protect your Buy Box with hourly price monitoring. Start free.',
    h1: 'Competitor Price Monitoring for Amazon Sellers',
    subheadline:
      'Losing the Buy Box to a competitor who dropped their price $2? PriceTracker monitors Amazon listings hourly and alerts you the moment a competitor moves — so you keep the Buy Box and protect your margins.',
    benefits: [
      {
        title: 'Buy Box Intelligence',
        description:
          'Track the competitors fighting for the same Buy Box. Know when they drop prices, go out of stock, or change their fulfillment type — all factors that affect your Buy Box eligibility.',
      },
      {
        title: 'Hourly Amazon Monitoring',
        description:
          'Amazon price wars move fast. We check every hour — not every day — so you can respond to competitor changes before they capture significant volume.',
      },
      {
        title: 'Out-of-Stock Opportunity Alerts',
        description:
          'When a competitor runs out of stock, prices rise and so do your margins. PriceTracker detects out-of-stock status so you can adjust your pricing before the demand surge.',
      },
    ],
    faqs: [
      {
        question: 'Does PriceTracker work with Amazon FBA sellers?',
        answer:
          'Yes. PriceTracker monitors Amazon product pages regardless of fulfillment type. You can track FBA competitors, FBM competitors, and third-party sellers on the same listing.',
      },
      {
        question: 'Can PriceTracker help me win the Buy Box more often?',
        answer:
          'PriceTracker gives you the pricing intelligence to make faster, better decisions — but it doesn\'t reprice automatically. Use the data alongside your repricing tool, or manually adjust based on our alerts. Many sellers find the alerts alone are enough for their catalog size.',
      },
      {
        question: 'Will Amazon penalize me for monitoring competitor prices?',
        answer:
          'No. PriceTracker only observes publicly visible pricing information — the same data any shopper can see. This is standard competitive intelligence and does not violate Amazon\'s Terms of Service.',
      },
      {
        question: 'How is this different from Amazon\'s built-in pricing tools?',
        answer:
          'Amazon\'s tools show you aggregate marketplace data. PriceTracker lets you track specific competitors — the ones actually competing for the same customers as you — and get alerted to their specific price changes.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'For Amazon Sellers', href: '/for/amazon-sellers' },
    ],
  },
  {
    slug: 'dropshippers',
    path: '/for/dropshippers',
    metaTitle: 'Price Monitoring for Dropshippers | PriceTracker',
    metaDescription:
      'Dropshipper price monitoring: track competitors across Shopify, Amazon & eBay. Get alerts when rivals discount. Protect thin margins automatically.',
    h1: 'Competitor Price Monitoring for Dropshippers',
    subheadline:
      'Dropshipping margins are already thin. Losing a customer to a competitor who is $3 cheaper is the difference between profit and loss. PriceTracker monitors all your competitors automatically so you can react in minutes, not days.',
    benefits: [
      {
        title: 'Protect Razor-Thin Margins',
        description:
          'Dropshipping margin is often 15–25%. A competitor undercutting you by just $5 can flip a profitable SKU to a loss. Know immediately when your margins are under threat.',
      },
      {
        title: 'Multi-Platform Coverage',
        description:
          'Your competitors might sell the same products on Shopify, Amazon, eBay, and Etsy simultaneously. PriceTracker monitors all channels in one dashboard.',
      },
      {
        title: 'Spot Supplier Price Changes Early',
        description:
          'When your supplier raises wholesale prices, savvy competitors often reflect that in retail first. Monitor competitor prices to get early warning of supply cost changes.',
      },
    ],
    faqs: [
      {
        question: 'I have hundreds of products — can PriceTracker scale with my catalog?',
        answer:
          'The Growth plan covers 100 products. For larger dropshipping catalogs, contact us for a custom plan. We can track thousands of SKUs across multiple platforms.',
      },
      {
        question: 'How do I know which products to prioritize for monitoring?',
        answer:
          'Start with your top 20–30 revenue drivers and your highest-margin products. These are where pricing mistakes cost the most. You can always expand tracking as you see value.',
      },
      {
        question: 'Can I monitor overseas competitors selling the same products?',
        answer:
          'If the competitor has a publicly accessible product page in any language, PriceTracker can monitor it. We support monitoring across different domains and regions.',
      },
      {
        question: 'What if a competitor runs a one-day flash sale?',
        answer:
          'That\'s exactly what hourly monitoring catches. A daily check would miss a 24-hour sale entirely. PriceTracker checks every hour so you see flash sales when they happen, not after.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'For Dropshippers', href: '/for/dropshippers' },
    ],
  },
  {
    slug: 'resellers',
    path: '/for/resellers',
    metaTitle: 'Price Tracking Tool for Resellers | PriceTracker',
    metaDescription:
      'Reseller price intelligence: monitor competitor listings on Amazon, eBay & Shopify. Real-time alerts, trend data, weekly reports. Try free for 14 days.',
    h1: 'Competitor Price Intelligence for Resellers',
    subheadline:
      'Successful resellers win on speed and information. PriceTracker gives you both: real-time competitor price data across every platform you sell on, delivered before your competitors even know you\'re watching.',
    benefits: [
      {
        title: 'Track Prices Across Every Platform',
        description:
          'Resellers operate on Amazon, eBay, Facebook Marketplace, and dozens of specialty sites. Track competitors wherever they list — from one dashboard.',
      },
      {
        title: 'Historical Trend Data',
        description:
          'Don\'t just see what competitors charge today — see what they charged over the past 90 days. Identify seasonal patterns, pricing floors, and the moments they\'re most vulnerable.',
      },
      {
        title: 'Weekly Intelligence Reports',
        description:
          'Every week, get a digest of competitor price movements, who dropped, who raised, and what market trends look like for your key product categories.',
      },
    ],
    faqs: [
      {
        question: 'Can I track private-label products that don\'t have standard identifiers?',
        answer:
          'Yes. PriceTracker tracks by URL, not by product identifier (UPC, ASIN, etc.). If there\'s a public product page, we can monitor it — regardless of whether the product has a standard identifier.',
      },
      {
        question: 'How does historical data help me make better pricing decisions?',
        answer:
          'Historical data reveals competitor pricing patterns. For example, a competitor might consistently discount every Friday or raise prices in Q4. Knowing this lets you anticipate their moves and position your pricing proactively.',
      },
      {
        question: 'I sell on multiple platforms — do I need separate accounts?',
        answer:
          'No. One PriceTracker account covers monitoring across Shopify, Amazon, eBay, WooCommerce, and more. All your competitive data lives in one dashboard.',
      },
      {
        question: 'Can I export pricing data to use in my own spreadsheets?',
        answer:
          'Yes. The Growth plan includes CSV data export. You can pull competitor price history into your own tools or combine it with your sales data for deeper analysis.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'For Resellers', href: '/for/resellers' },
    ],
  },
  {
    slug: 'local-businesses',
    path: '/for/local-businesses',
    metaTitle: 'Competitor Pricing Tool for Local Businesses | PriceTracker',
    metaDescription:
      'Local businesses: monitor online competitors\' prices and stay competitive. Automated alerts when rivals change pricing. Affordable at $50/month.',
    h1: 'Competitor Price Monitoring for Local Businesses',
    subheadline:
      'Your local competitors have websites now — and they update prices constantly. PriceTracker monitors your online and local competition automatically, so you always know if your pricing is in line with the market.',
    benefits: [
      {
        title: 'Monitor Local & Online Competitors Together',
        description:
          'Whether your competition is across the street or across the internet, if they have a website with prices, PriceTracker can track it.',
      },
      {
        title: 'Simple Setup, No Technical Skills Needed',
        description:
          'Enter a product URL, set your alert preferences, and you\'re done. No API, no code, no ongoing maintenance. Designed for busy business owners.',
      },
      {
        title: 'Affordable for Small Businesses',
        description:
          'Enterprise pricing tools cost $500+/month — built for Fortune 500 companies, not local businesses. PriceTracker starts at $50/month with the same core capabilities.',
      },
    ],
    faqs: [
      {
        question: 'My competitor doesn\'t have an e-commerce store — can I still track them?',
        answer:
          'If your competitor doesn\'t list prices on a public webpage, there\'s no pricing page to track. PriceTracker works with any business that shows prices on their website.',
      },
      {
        question: 'I\'m not tech-savvy. Is this tool easy to set up?',
        answer:
          'Very. Setup takes about 10 minutes: create an account, add your competitor\'s product page URLs, choose your alert preferences, and you\'re done. No technical knowledge required.',
      },
      {
        question: 'How much does it cost and is there a trial?',
        answer:
          'PriceTracker starts at $50/month for the Growth plan, which covers up to 100 products and 5 competitor storefronts. Every new account gets a 14-day free trial — no credit card required.',
      },
      {
        question: 'Can I track service prices, not just physical products?',
        answer:
          'If a competitor lists service prices on a public webpage (e.g., a pricing page or a service menu), yes — PriceTracker can monitor those pages for changes.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'For Local Businesses', href: '/for/local-businesses' },
    ],
  },
];

// Build a slug → segment index for O(1) lookup
export const SEGMENT_BY_SLUG = Object.fromEntries(SEGMENTS.map((s) => [s.slug, s]));
