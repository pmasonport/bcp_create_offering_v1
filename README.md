# Billing & Catalog Pricing Builder

An interactive tool for designing and configuring Docker's billing offerings, pricing strategies, and monetization models.

## What is this?

The Pricing Builder is a visual configuration tool that helps product and billing teams design complex pricing strategies for Docker's product catalog. It supports:

- **5 Monetization Strategies**: Subscription, Pay-as-you-go, Prepaid with Top-ups, One-time Payment, and Minimum Fee Commitment
- **Multiple Pricing Models**: Fixed, per-unit, graduated tiers, volume tiers, and block pricing
- **Advanced Features**: Metered subscriptions with rollover caps, trials, add-ons, and bundled offerings
- **Export to Data Model**: Generates structured JSON that maps to the billing database schema

## ⚠️ Important Notice

**This tool is illustrative and experimental.** For a complete list of supported monetization strategies and capabilities, check the [on-rails billing definitions](https://docs.google.com/document/d/1UbLv9W8jCThbO7Ly13zrcFAYujRghpka0nLgMhwnkT8/edit?tab=t.f4cd87mzobtj).

The builder may not support all billing platform capabilities, and some configured options may not map directly to the production billing system.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Example Offerings

The builder includes 9 pre-configured examples:
- **Docker Team** - Subscription with seats + Build Minutes add-on
- **Build Minutes** - Prepaid packs with expiry
- **Gordon Pro** - Fixed monthly subscription
- **Gordon AI Tokens** - Prepaid AI credits (no expiry)
- **API Pro** - Metered subscription with unlimited rollover
- **Sandboxes** - PAYG with multiple resources
- **Prepaid Sandbox Credits** - Non-expiring compute credits
- **DHI Select** - Annual subscription
- **DHI Enterprise** - Subscription with reverse trial

## Documentation

- **[PRICING_BUILDER_AUDIT.md](./PRICING_BUILDER_AUDIT.md)** - Comprehensive comparison of builder capabilities vs data model and on-rails documentation
- **[data-model.md](./data-model.md)** - Database schema reference for the billing platform

## Tech Stack

- React + Vite
- Tailwind CSS
- Deployed on Vercel

---
