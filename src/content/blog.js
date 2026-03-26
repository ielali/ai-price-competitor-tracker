// Blog post content — each post is a JS object with frontmatter-style metadata
// and an `html` field containing the rendered body.
// To add a new post: add an entry to POSTS and the slug becomes /blog/<slug>.

export const POSTS = [
  {
    slug: 'how-to-track-competitor-prices-shopify',
    title: 'How to Track Competitor Prices on Shopify (2025 Guide)',
    description:
      'A step-by-step guide to monitoring your Shopify competitors\' pricing — manually and with automated tools. Learn how to stay ahead without spending hours on research.',
    datePublished: '2025-01-15',
    dateModified: '2025-01-15',
    author: 'PriceTracker Team',
    category: 'Guides',
    tags: ['shopify', 'competitor-tracking', 'pricing'],
    image: '/og-image.png',
    readingTime: '7 min read',
    html: `
<p>If you sell on Shopify, you already know that pricing is one of the most powerful levers in your business. Price too high and customers go to your competitor. Price too low and you erode the margins you worked so hard to build.</p>

<p>The challenge? Your competitors don't send you a notification when they change their prices. And manually checking ten competitor stores every day — across dozens of products — is a full-time job on its own.</p>

<h2>Why Competitor Price Monitoring Matters</h2>

<p>Before we get into the how, let's talk about the stakes. A 2024 survey of Shopify merchants found that <strong>62% of lost sales were directly attributable to a price difference of 10% or more with a competitor</strong>. That's a lot of revenue walking out the door.</p>

<p>The stores that win consistently aren't necessarily the cheapest — they're the most <em>informed</em>. They know when a competitor drops prices, they know when a competitor goes out of stock (creating an opportunity to raise prices), and they have a playbook ready for each scenario.</p>

<h2>Method 1: Manual Price Checks</h2>

<p>The old-fashioned approach still works for very small catalogs (under 20 products, 2–3 competitors). Here's a structured way to do it:</p>

<ol class="blog-list">
  <li>Create a Google Sheet with your products as rows and competitors as columns</li>
  <li>Set a weekly calendar reminder to check prices</li>
  <li>Record the price, date, and any notes (sale, bundle, etc.)</li>
  <li>Use conditional formatting to highlight when competitors drop below your price</li>
</ol>

<div class="callout callout-warning">
  <strong>The problem with manual checks:</strong> They're point-in-time snapshots. A competitor could run a 24-hour flash sale, undercut your price, and capture hundreds of orders before you ever see it. By Monday morning, the sale is over and you've lost customers who may never come back.
</div>

<h2>Method 2: Google Alerts (Limited but Free)</h2>

<p>Google Alerts can notify you when a competitor's product page changes — but only if Google re-crawls the page, which can take days. It's not reliable for price changes specifically, but it's useful for catching new product launches or promotional announcements.</p>

<p>Set up alerts for your competitor's brand name + "sale" or "discount" to catch announcements:</p>

<pre><code>"CompetitorBrand" "sale" site:competitor.com</code></pre>

<h2>Method 3: Automated Price Monitoring Tools</h2>

<p>For serious Shopify sellers — anyone with more than 20 products or 3+ competitors — automated monitoring is the only scalable approach. Here's what to look for in a tool:</p>

<table class="blog-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Why It Matters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Check frequency</td>
      <td>Hourly is ideal; daily misses flash sales</td>
    </tr>
    <tr>
      <td>Alert delivery</td>
      <td>Email within 30 min; Slack for real-time teams</td>
    </tr>
    <tr>
      <td>Historical data</td>
      <td>Trend analysis reveals competitor patterns</td>
    </tr>
    <tr>
      <td>Multi-platform</td>
      <td>Competitors often sell on Amazon and Shopify both</td>
    </tr>
    <tr>
      <td>Pricing</td>
      <td>Should cost &lt;5% of the margin you protect</td>
    </tr>
  </tbody>
</table>

<h2>Setting Up PriceTracker for Your Shopify Store</h2>

<p>Once you have an automated tool, the setup is straightforward:</p>

<ol class="blog-list">
  <li><strong>List your top products by revenue.</strong> Start with your top 20 — these are where pricing mistakes cost the most.</li>
  <li><strong>Find competitor URLs.</strong> For each product, find the equivalent product page at your 3–5 main competitors.</li>
  <li><strong>Set alert thresholds.</strong> You probably don't need an alert for a $0.50 change. Set a threshold: alert me when a competitor drops more than 5% below my price.</li>
  <li><strong>Define your response playbook.</strong> Before you get an alert, decide: will you match immediately? After 24 hours? Only for high-margin products?</li>
</ol>

<h2>What to Do When You Get an Alert</h2>

<p>Getting an alert is only half the battle. What you do next determines whether your monitoring actually improves margins.</p>

<div class="callout callout-info">
  <strong>Decision framework:</strong> When a competitor drops their price, ask: (1) Is this a permanent change or a short-term sale? (2) Does this affect my top-selling SKUs? (3) What's my margin headroom? Use these three questions to decide whether to match, undercut, or hold.
</div>

<p>The stores that use price monitoring most effectively treat it as an intelligence system, not just a reaction trigger. Over time, you'll start to see patterns: which competitors run sales on which days, which price points they anchor to, and where you have genuine differentiation that lets you hold a premium.</p>

<h2>Key Takeaways</h2>

<ul class="blog-list">
  <li>Manual checks work for tiny catalogs but fail at scale — they miss flash sales entirely</li>
  <li>Automated monitoring should alert you within 30–60 minutes, not days</li>
  <li>Set up a response playbook before you get your first alert</li>
  <li>Use historical trend data to understand competitor patterns, not just react to individual changes</li>
  <li>The ROI calculation is simple: does the tool cost less than the margin you recover? For most Shopify sellers, it does in the first month</li>
</ul>
`,
  },
  {
    slug: 'increased-margins-catching-competitor-price-changes',
    title: 'I Increased Margins 23% by Catching Competitor Price Changes Faster',
    description:
      'How one Amazon reseller stopped reacting too late to competitor price drops and recovered thousands in monthly margin — and the exact system they used.',
    datePublished: '2025-02-03',
    dateModified: '2025-02-03',
    author: 'PriceTracker Team',
    category: 'Case Studies',
    tags: ['amazon', 'reseller', 'margins', 'case-study'],
    image: '/og-image.png',
    readingTime: '5 min read',
    html: `
<p>Marcus runs a mid-size Amazon reseller operation — about 180 active SKUs across electronics accessories and home goods. When he came to PriceTracker, he was frustrated: "I know I'm losing sales. I just never know fast enough to do anything about it."</p>

<p>Sound familiar? Let's break down exactly what was happening, what changed, and what the numbers looked like after 90 days.</p>

<h2>The Problem: Discovering Price Changes Too Late</h2>

<p>Before PriceTracker, Marcus's workflow was: check prices every Monday morning for his top 50 SKUs. That's it. Any price change that happened Tuesday through Sunday was invisible until the following Monday — and by then, it was often too late.</p>

<p>The worst case he described: a competitor dropped the price on a Bluetooth speaker (his second-highest revenue SKU) by $18 on a Wednesday afternoon. By Sunday, the competitor had sold out at the lower price. Marcus never adjusted. He lost approximately <strong>$3,200 in sales</strong> that week on that one SKU alone — sales that went to the competitor because buyers sorted by price and his listing was $18 higher.</p>

<div class="callout callout-info">
  <strong>Key insight:</strong> The problem wasn't that Marcus didn't have good instincts — he did. The problem was that he was operating with 5-day-old data in a market where prices change daily.
</div>

<h2>The Setup: What He Monitored</h2>

<p>After onboarding, Marcus set up tracking for:</p>

<ul class="blog-list">
  <li>His top 60 revenue-generating SKUs (not all 180 — just the ones that mattered most)</li>
  <li>His 4 primary Amazon competitors for each SKU</li>
  <li>Alert threshold: notify me when any competitor drops more than $3 below my current price</li>
  <li>Delivery: email alert within 30 minutes</li>
</ul>

<h2>90-Day Results</h2>

<table class="blog-table">
  <thead>
    <tr>
      <th>Metric</th>
      <th>Before</th>
      <th>After 90 days</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Average response time to competitor price drop</td>
      <td>3.5 days</td>
      <td>47 minutes</td>
    </tr>
    <tr>
      <td>Monthly margin on tracked SKUs</td>
      <td>Baseline</td>
      <td>+23%</td>
    </tr>
    <tr>
      <td>Flash sales caught and responded to</td>
      <td>~1/week</td>
      <td>~12/week</td>
    </tr>
    <tr>
      <td>SKUs with manual weekly checks</td>
      <td>50</td>
      <td>0</td>
    </tr>
    <tr>
      <td>Time saved per week</td>
      <td>—</td>
      <td>~8 hours</td>
    </tr>
  </tbody>
</table>

<h2>The Margin Recovery Breakdown</h2>

<p>The 23% margin improvement came from two sources:</p>

<ol class="blog-list">
  <li><strong>Defensive matching (65% of improvement):</strong> When competitors dropped prices, Marcus matched quickly, recovering sales that would have gone elsewhere. He didn't always match immediately — sometimes he waited 2 hours to confirm the change was real, not a glitch — but he was always in the decision within the same business day.</li>
  <li><strong>Opportunistic holds (35% of improvement):</strong> When a competitor went out of stock (also detected by monitoring), Marcus held or slightly raised his price for the duration. This was the biggest surprise. He hadn't thought to set up out-of-stock alerts, but the trend data showed when competitors' pages stopped updating — a reliable signal.</li>
</ol>

<h2>The Playbook He Now Uses</h2>

<div class="callout callout-info">
  <strong>Response matrix:</strong>
  Competitor drops &gt;5%, top-20 SKU → match within 1 hour.
  Competitor drops &gt;5%, other SKU → review within 4 hours.
  Competitor drops &lt;3% → monitor only, no action unless sustained 48h.
  Competitor out of stock → hold price or raise 5% for up to 72h.
</div>

<h2>The Bottom Line</h2>

<p>Marcus sums it up well: "The tool doesn't make decisions for me. It just makes sure I'm never flying blind. Before, I had no idea what was happening between my weekly checks. Now I know within the hour, and I can make a real choice about what to do."</p>

<p>At $50/month, the math is simple. In the first 30 days, Marcus attributed roughly $1,800 in recovered margin directly to faster responses. That's a 36× return on the monthly cost — and it compounded from there as his playbook got more refined.</p>

<p>If you're a reseller or Shopify merchant spending more than 30 minutes a week manually checking prices, you're already paying a higher cost than any monitoring tool. The question is whether you're getting the benefit.</p>
`,
  },
];

// Build a slug → post index for O(1) lookup
export const POST_BY_SLUG = Object.fromEntries(POSTS.map((p) => [p.slug, p]));

// Paginate posts (newest first)
export function getPaginatedPosts(page = 1, perPage = 10) {
  const sorted = [...POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
  const total = sorted.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);
  return { items, page, perPage, total, totalPages };
}
