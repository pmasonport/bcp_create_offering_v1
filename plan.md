# BCP Product Catalog — Plan

## Overview

The BCP Console is an internal admin tool for managing Docker's product catalog, pricing, and entitlements. This document captures all information architecture, design decisions, and structural decisions made during prototype development.


---

## Information Architecture

### Sidebar Navigation

```
┌──────────────────────┐
│ [● Staging       ▾]  │  ← Environment switcher (orange=staging, green=production)
│                      │
│ 📦 Catalog        ▾  │  ← Collapsible section, box icon
│    Offerings         │
│    Features          │
│    Meters            │
│                      │
│ 📊 Reporting         │  ← Disabled placeholder
└──────────────────────┘
```

### Page hierarchy

```
Offerings (index)
  ├── Offering Group detail
  │     ├── Offering detail
  │     └── Add-on detail
  ├── Create offering group
  ├── Create offering (3-step wizard)
  └── Create add-on (3-step wizard)

Features (index)
  └── Service detail (feature list)

Meters (index, tabbed)
  ├── Tab: Meters
  └── Tab: Metered Resources
```


---

## Offerings Index Page

### Layout
- Title "Offerings" with subtitle showing group count
- **"+ Create" dropdown** (top-right, primary blue button with chevron) containing:
  - New offering group — creates a group, lands in empty group workspace
  - New offering — straight into 3-step wizard
  - New add-on — straight into wizard, add-on mode
- **List/Graph toggle** below title, left-aligned, inline-block
- **Connected list** of offering groups (white cards, shared borders, rounded container)

### Offering group cards
- Group name (14px bold), description, standalone indicator
- Right side: split counts — "4 offerings · 12 add-ons" (includes external add-ons that depend on this group)
- Chevron arrow
- Click → group detail page

### Graph view
- D3 layout, 160×52px white rounded rect nodes
- Nodes show: short name + "X off. · Y add-ons"
- Edges show dependency arrows (dependent → required)
- White background


---

## Offering Group Detail Page

### Header
- Back breadcrumb: "← Offerings / DSoP"
- Group name + description
- **"+ Add offering" (primary) and "+ Add add-on" (secondary)** buttons top-right
- **Filter pills**: "Filter · All accounts / User / Organization"

### Offerings section
- Section label "OFFERINGS"
- Connected list of offering cards
- Empty state if no offerings: "No base offerings yet."

### Add-ons section
- Section label "ADD-ONS" (48px top margin for clear separation)
- **Single connected list** with **inline group dividers** (gray background rows with uppercase group labels: BUILD CLOUD, TC CLOUD, GORDON, PREMIUM SUPPORT)
- Each add-on card shows "requires X" inline
- Empty state if no add-ons

### Empty state (no offerings AND no add-ons)
- Centered: "No offerings yet" + description + both action buttons
- Returns early, doesn't show sections

### Offering / Add-on cards
- **Left side**: Name (14px bold) + monetization badge inline on same line, description below, "requires X" for add-ons
- **Right side**: Price (14px bold mono) + alt price below, chevron SVG — all vertically centered as a unit
- White background, hover = `#F9FAFB`
- No slug, no account type badge, no package type badge on cards
- Draft offerings show at 55% opacity with dashed amber "draft" badge
- `free` badge (green) for $0 offerings instead of "subscription"


---

## Offering Detail Page

### Header (white card with padding and border)
- Left: Title (24px) + draft badge, description (13px gray) below
- Right: Price (20px bold mono), alt price below (13px gray)
- Below, separated by thin border-top: badges (package + monetization + account type) · slug (mono) · dependency ("requires X") — all on one inline row

### Entitlements section
- Section label "ENTITLEMENTS"
- Per-service cards with:
  - Gray header bar: service name + feature count
  - Table rows: **feature names** (not slugs), value right-aligned
  - Tags: blue "mutable", amber "aggregated" (no tag for static metering)
  - No table header row (Feature/Value headers removed)
  - Clickable rows → feature drawer
  - 14px bottom margin between service cards

### Rate Cards section
- Table inside a service-style card
- Columns: Description, Model, Timing, Cycle, Price
- Description column shows resource name + Stripe external ID below
- Clickable rows → rate card drawer

### Lifecycle section
- Table: Type (green "upgrade" / amber "downgrade" badge), Target, Timing (Immediate / End of period)

### Constraints section
- Mono text in a bordered card

### Available Add-Ons (base offerings only)
- Connected list of clickable add-on cards
- Only shows add-ons that list this offering in their dependency map

### Required Offerings (add-ons only)
- Explainer text if multiple: "Customer must have an active subscription to **at least one** of these offerings to purchase this add-on."
- Connected list with **OR dividers** (gray background row, centered "OR" text) between each offering card


---

## Features Page

### Index
- Title "Features" + service count
- Connected list of services (name, description, feature count, chevron)

### Service detail
- Back breadcrumb
- Service name + slug + description
- Connected list of features, each row showing:
  - Feature name + inline tags (blue "mutable", amber "aggregated/count_distinct")
  - Slug below (mono, gray)
  - Description
  - Type badge on right (boolean=green, integer=amber, string=gray)
  - Clickable → feature drawer


---

## Meters Page

### Tabs
- "Meters (9)" and "Metered Resources (7)" — tab bar with underline active state

### Meters tab
- Connected list, each row: name, slug, service → feature · unit type, status badge, external system ID
- Click → meter drawer (shows config + linked resources)

### Metered Resources tab
- Connected list, each row: name, slug, description, status badge, meter count
- Click → resource drawer (shows config + linked meters)


---

## Drawer

- 440px wide, slides from right
- Overlay behind (15% black)
- Close button top-right
- Used for: feature detail, rate card detail, meter detail, resource detail
- Closes on: close button, overlay click, navigation


---

## Visual Design Decisions

### GitHub-inspired patterns
- **Connected lists** — single bordered container, items share borders via `border-bottom`, rounded outer container
- **Gray canvas, white panels** — main content `#F9FAFB`, all content in white bordered cards
- **Hover = background only** — `#F9FAFB` on hover, no border changes
- **All-white backgrounds** — add-on cards are white (not gray), differentiated by "requires" line and section labels

### Typography
- Page titles: 24px / 600 weight
- Card names: 14px / 600 weight
- Body / descriptions: 13px / 400 weight
- Slugs / prices: mono font, 12-14px
- Section labels: 12px / 600 weight, uppercase, gray, 36px top margin

### Spacing
- Content area: 960px max-width, 40px horizontal padding
- Card padding: 16px 20px
- Section dividers: 36px margin
- Add-ons section: 48px top margin from offerings section

### Badges
| Type | Style |
|------|-------|
| free | Green bg, dark green text |
| subscription | Green bg, green text |
| payg | Amber bg, amber text |
| prepaid | Orange bg, orange text |
| bundle | Blue bg, blue text |
| add-on | Gray bg, gray text |
| standalone | Gray bg, gray text |
| draft | Dashed amber border, amber text |
| user/org | White bg, gray text, gray border |
| mutable (tag) | Blue bg (#DBEAFE), blue text |
| metered (tag) | Amber bg (#FEF3C7), amber text |

### Form elements
- Inputs: 10px 12px padding, 1px gray border, 4px radius, blue focus border
- Dropdowns: same as inputs + custom chevron SVG
- Disabled buttons: blue at 35% opacity (not gray)
- Button row: right-aligned, 20px top padding, 1px border-top separator
- Form groups: 16px top margin between fields


---

## Create Flow Design Decisions

1. **One offering = one monetization strategy.** Base + overage = two offerings (subscription base + PAYG add-on). Keeps catalog clean and billing simple.

2. **Context-driven entry points.** From the index, use the "+ Create" dropdown. From a group page, use the "+ Add offering" / "+ Add add-on" buttons. The wizard adapts to context.

3. **Offering group is the first field in Step 1.** Always visible, always editable. Pre-selected from context, changeable via dropdown + inline creation.

4. **Pricing before entitlements.** Step 2 (Pricing) comes before Step 3 (Entitlements) because pricing model determines required features. Step 3 pre-populates based on Step 2 selections.

5. **Feature dropdown shows full catalog.** Grouped by service. Not filtered by offering group. If feature doesn't exist, create inline via drawer.

6. **Duplicate from workspace.** Each offering card's ⋯ menu has "Duplicate." Pre-fills wizard with source data (name/slug blanked, feature values carried over). "from X" labels show what was inherited.

7. **Per-offering publishing with "Publish all" shortcut.** Each offering can be published independently from its ⋯ menu. Top-level button publishes all drafts at once. Supports phased launches.

8. **Active offerings can be edited.** Role-based permissions control who can touch live offerings. Version field provides audit trail.

9. **All-addon product lines are fine.** Build Cloud has no base offerings, only add-ons. Empty offerings zone shows explanatory note. Layout stays consistent.

10. **Inline service/feature creation.** New services and features can be created inline in the wizard. Keeps PMs in flow.

### Constraints
- Docker Team & Business: seats self-serve 1–100, sales-led 25+
- Docker Personal & Pro: seats self-serve 1–1


---

## Data Notes

### Offering group counts include external add-ons
DSoP shows "4 offerings · 12 add-ons" because Build Cloud (1), TC (2), Gordon (7), and Premium Support (2) all depend on DSoP offerings.

### Explicit dependency mapping
`OFFERING_DEPS` maps each add-on to its required offering IDs. Used for:
- "Available Add-Ons" section on base offerings
- "Required Offerings" section on add-ons
- OR dividers when multiple offerings satisfy the dependency

### External add-ons display
`EXTERNAL_ADDONS` maps which groups' add-ons appear on another group's detail page. Used for the inline group dividers in the add-ons section.

### Docker Pro is fixed, not per-seat
Pro is a single-user plan. $11/mo or $108/yr flat. No per-unit pricing.
