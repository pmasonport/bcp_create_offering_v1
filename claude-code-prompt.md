# BCP Product Catalog Prototype — Claude Code Handoff

## Context

Docker is building a **Billing Control Plane (BCP)** — an internal admin console for managing their product catalog, pricing, and entitlements. Currently, every time a product team needs to introduce a new SKU, update a price, or change entitlements, they coordinate manual updates across Stripe, NetSuite, and internal systems with no central source of truth.

This prototype is a **clickable demo** being built to drive a conversation with engineering leadership (Mark Cavage, Dave Ward, Roberta Carraro) about the types of "on rails" pricing/monetization patterns they should support. It needs to feel real enough that executives can interact with it and think through different scenarios.

## What exists

There's a working single-file HTML prototype (`reference-prototype.html`) that implements:
- **Catalog browser** — Offering groups → Offerings → Offering detail with entitlements, rate cards, lifecycle, constraints
- **Features browser** — Services → Features with type/metering metadata
- **Meters page** — Meters and metered resources with M:N relationships
- **Create offering flow** — 3-step wizard (Basics → Pricing → Entitlements & Review)
- **Right-side drawer** for feature/rate card/meter detail
- **Staging/Production environment switcher**

The HTML prototype works but has hit a ceiling — vanilla JS string template rendering causes form state issues (DOM rebuild on every change, lost focus, flickering). The pricing step in particular needs proper React state management.

## What to build

Rebuild this as a **React app** (Vite + React). Can use Tailwind CSS or keep the existing inline style approach — match the visual design of the existing prototype exactly. The app should be a single-page app with client-side routing (no backend needed, all data is in-memory).

### Tech stack
- React 18+ with hooks (useState, useReducer for form state)
- Vite for dev/build
- Tailwind CSS (or the existing CSS token system — your call)
- No backend — all data is JS constants
- D3 for the graph view (already in the prototype)

### Key requirement: Form state must work properly
The main reason for the React rewrite is forms. Every form input needs to:
- Update state without re-rendering the entire page
- Maintain focus while typing
- Support progressive disclosure (selecting options reveals new fields)
- Not scroll to top on every interaction

## Architecture

### Pages / Routes

```
/                          → Offering Groups index (list + graph toggle)
/groups/:groupId           → Offering Group detail (offerings + add-ons)
/offerings/:offeringId     → Offering detail (header, entitlements, rate cards, lifecycle, constraints, available add-ons / required offerings)
/features                  → Features index (services list)
/features/:serviceId       → Service detail (feature list)
/meters                    → Meters index (tabs: Meters / Metered Resources)
/create/group              → New offering group form
/create/offering           → New offering wizard (3-step)
/create/addon              → New add-on wizard (3-step, same as offering but with dependency config)
```

### Layout

- **Topbar** (48px, fixed) — Docker Console logo (inline SVG, see prototype)
- **Sidebar** (200px, fixed) — Environment dropdown (Staging/Production with colored dot indicator), Catalog section (Offerings, Features, Meters), Reporting (disabled placeholder)
- **Main content** — gray background (`#F9FAFB`), white cards/panels for content
- **Drawer** — slides in from right (440px), overlay behind it, for feature/rate card/meter detail

### Data model

All data lives as JS constants. The prototype already has complete data for:
- 7 offering groups (DSoP, Build Cloud, TC Cloud, DHI, Premium Support, Gordon, Sandboxes)
- 24 offerings with full pricing, dependencies, entitlements
- 10 services with 80+ features
- 9 meters and 7 metered resources
- Rate cards, lifecycle transitions, constraints for all DSoP and DHI offerings

See `reference-prototype.html` for the complete data. Port it directly.

## Design system

See `design-system.md` for the complete token system. Key principles:

- **GitHub-inspired connected lists** — items share borders within a single container (`border-radius: 6px`, `overflow: hidden`). No floating cards with gaps.
- **Gray canvas, white panels** — main content area is `#F9FAFB`, all content sits in white bordered containers
- **Minimal badges** — `free` (green), `subscription` (green), `payg` (amber), `prepaid` (orange), `add-on` (gray), `draft` (dashed amber)
- **Typography** — page titles 24px/600, card names 14px/600, body 13px, mono for slugs/prices
- **No shadows** — borders only. 1px `#E5E7EB` borders everywhere.
- **Hover = `#F9FAFB`** — only background color, no border changes

## Create Offering Flow

See `create-offering-structure.md` for the full IA and flow documentation.

### Entry points

| From | Action | Result |
|------|--------|--------|
| Offering groups index | "+ Create" dropdown → "New offering group" | Group creation form → empty group workspace |
| Offering groups index | "+ Create" dropdown → "New offering" | Straight into 3-step wizard, no group pre-selected |
| Offering groups index | "+ Create" dropdown → "New add-on" | Straight into 3-step wizard, add-on mode |
| Group detail page | "+ Add offering" button | Wizard with group pre-selected |
| Group detail page | "+ Add add-on" button | Wizard with group pre-selected, add-on mode |

### Step 1: Basics

Fields in order:
1. **Offering group** — dropdown of all groups + "+ Create new offering group" option. Pre-selected if launched from a group page. Selecting "+ Create new" reveals inline name field.
2. **Name** — text input, auto-generates slug (not shown)
3. **Which accounts can buy this?** — dropdown: User / Organization / Both
4. **Sales channel** — dropdown: Self-serve / Sales-led / Both
5. **Description** — optional textarea, last field
6. **Dependency** (add-ons only) — radio group: any in this group / specific offerings / different group, with sub-pickers

Account type and sales channel sit side by side in a 2-column grid.

### Step 2: Pricing

See `pricing-step-plan.md` for the complete specification. Key decisions:

**One offering = one monetization strategy.** If you need subscription + PAYG overage (like Gordon), create two offerings. The overage is a PAYG add-on.

**Flow:**
1. Free or Paid? (two side-by-side SelectCards)
2. Monetization strategy dropdown (subscription / PAYG / prepaid / one-time)
3. "What is being charged for?" — varies by strategy:
   - **Subscription/Prepaid/One-time:** Feature dropdown (all mutable + metered features, grouped by service). If metered → resource sub-picker.
   - **PAYG:** Meter dropdown → then resource picker
4. Strategy-specific pricing config:
   - **Subscription:** Pricing model (fixed/per-unit) + Billing period + Price inputs + Billing timing
   - **PAYG:** Pricing model cards (per-unit/block/graduated/volume) → batch resource pricing table OR TierBuilder
   - **Prepaid:** Block size + block price + expiration
   - **One-time:** Price + billing timing

**Batch pricing for PAYG:** When a meter has multiple resources, show all resources in a table. PM prices each one (empty = skip). Creates one rate card per priced resource.

**TierBuilder:** Table with columns: From, To, Per-unit ($), Fixed ($). Add/remove rows. Used for graduated and volume pricing.

**Multiple rate cards:** Saved cards show as summary cards at top of step. "+ Add another price" stays within same strategy. Strategy never re-asked.

### Step 3: Entitlements & Review

1. Services to include (checkboxes)
2. Per-service feature configuration (toggles for booleans, number inputs for integers)
3. Features required by pricing are pre-populated with a "required by pricing" note
4. Review card at bottom showing complete offering summary
5. "Save & return" or "Save & add another"

### Stepper

White card container below title. 28px circles (blue active, green done with ✓, gray+border pending). Labels with state colors. Connecting lines that turn green when step is complete.

## Offering Group Detail Page

- Header with group name, description
- "+ Add offering" (primary blue) and "+ Add add-on" (secondary) buttons top-right
- Account type filter pills: "Filter · All accounts / User / Organization"
- **Offerings section** — connected list of offering cards
- **Add-ons section** — single connected list with inline group divider rows (gray `#F9FAFB` background, uppercase label). Groups like BUILD CLOUD, TC CLOUD, GORDON each get a divider.
- Empty state with centered message and action buttons if no offerings

## Offering Detail Page

- **Header** — white card with: title + draft badge on left, price (20px bold mono) on right with alt price below. Below that, a thin border-top line with badges (package, monetization, account type) + slug + dependency all inline.
- **Entitlements** — service cards with gray header bar (service name + feature count), table rows with feature names (not slugs), value right-aligned. Tags: blue "mutable", amber "aggregated". No table header row. Clickable rows open feature drawer.
- **Rate Cards** — table inside a service card (Description, Model, Timing, Cycle, Price columns). Gray header row. Clickable rows open rate card drawer.
- **Lifecycle** — table (Type badge, Target, Timing). Green "upgrade" / amber "downgrade" badges.
- **Constraints** — simple mono text in a bordered card
- **Available Add-Ons** (base offerings) — connected list of add-on cards, clickable
- **Required Offerings** (add-ons) — connected list with "at least one" explainer text and OR dividers between cards

## Offering / Add-on Cards

Inside connected lists. Each card shows:
- Left: Name (14px bold) + monetization badge inline, description below, "requires X" for add-ons
- Right: Price (14px bold mono) + alt price below, chevron SVG. All vertically centered as a group.

## Features Page

Connected list of services. Click through to service detail with connected list of features. Each feature row shows: name + mutable/metered tags, slug below, description, type badge (boolean/integer/string) on right. Clickable → opens feature drawer.

## Meters Page

Two tabs: Meters / Metered Resources. Connected lists. Each row clickable → opens drawer showing config and M:N linked resources/meters.

## Graph View

D3 force-directed-ish layout showing offering group dependencies. Nodes are 160×52px white rounded rects. Edges show dependency arrows. Node labels: group short name + "X off. · Y add-ons" count.

## Key interaction patterns

- **Progressive disclosure** in forms — selecting options reveals new fields with fade-in
- **Drawer** for detail views (features, rate cards, meters, resources) — 440px, slides from right
- **Connected lists** — single bordered container, items share borders, hover bg only
- **Inline group dividers** in add-on lists — gray bg row with uppercase label
- **OR dividers** in required offerings — gray bg row with centered "OR" text
- **Environment dropdown** in sidebar — orange dot for staging, green for production

## Files included

| File | What it is |
|------|-----------|
| `reference-prototype.html` | Current working prototype — port all data and visual design from here |
| `plan.md` | **Master plan** — complete IA, visual design decisions, create flow decisions, data notes. Single source of truth for what the prototype should do. |
| `catalog-structure.md` | Catalog browsing IA — three-view navigation (index → group → offering), wireframes, scope filter, graph topology |
| `create-offering-structure.md` | Complete IA and flow documentation for the create offering wizard |
| `pricing-step-plan.md` | Detailed specification for the pricing step including all monetization strategies, pricing models, feature/meter pickers, batch pricing, TierBuilder |
| `design-system.md` | Full design token system (colors, typography, spacing, component patterns) |
| `data-model.md` | Complete BCP database schema documentation |
| `bcp-schema.sql` | SQL schema with all table definitions |
| `docker-catalog.sql` | Seed data for the Docker product catalog |
| `team-product.md` | Virtual product team skill — invoke @pm, @designer, @engineer, @analyst, @growth, @content, @cs for expert review |
| `product-designer.md` | Product designer skill for UI/UX review |
| `design-system-lead.md` | Design system lead skill for component/token review |

## How to use the team skills

Put the skill files in your project. When you want expert review, invoke a role:

- `@designer` — UI/UX review, layout feedback, interaction patterns
- `@pm` — feature prioritization, flow logic, user story validation
- `@engineer` — architecture review, state management, data model questions
- `@content` — copy review, label wording, error messages
- `@cs` — customer-facing implications, sales workflow impact

Example: "@ designer review this form layout" or "@pm does this flow make sense for the DHI use case"

The skills make Claude respond in character as a senior specialist with deep domain expertise. They reference real company patterns (GitHub, Linear, Stripe, etc.) and push back when something isn't right.
