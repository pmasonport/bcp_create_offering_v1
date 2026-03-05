# Minimal Admin Design System

> Version 1.0 · Extracted from Catalog Wizard · Reusable across projects
>
> **Philosophy:** Great admin UI removes things. No shadows, no gradients, no decoration. White space is the primary design material. Every pixel earns its place.

---

## Foundations

### Color — Single Accent + Neutral Scale

One accent color. Everything else is grayscale. Semantic colors appear only in context-specific moments (path badges, destructive actions) — never as persistent UI chrome.

#### Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `blue` | `#2560FF` | Primary actions, active states, selections, focus rings, links |
| `blue-light` | `#EEF2FF` | Selected pill backgrounds, active tab indicators |
| `blue-bg` | `#F8FAFF` | Selected card backgrounds, active panel tint |
| `blue-40` | `#2560FF40` | Active card borders (40% opacity) |

#### Semantic (contextual only)

| Token | Hex | Usage |
|-------|-----|-------|
| `green` | `#10B981` | Upgrade paths, success indicators, completion dots |
| `amber` | `#F59E0B` | Downgrade paths, warning states |
| `red` | `#EF4444` | Destructive actions (remove, delete), hover-to-reveal only |

#### Neutral Scale

The neutral palette is the backbone. Most of the interface lives in these values.

| Token | Hex | Role |
|-------|-----|------|
| `g.50` | `#F9FAFB` | Subtle backgrounds (collapsed summaries, preview panels, table zebra) |
| `g.100` | `#F3F4F6` | Hover backgrounds, lighter separators, tier builder alternating rows |
| `g.200` | `#E5E7EB` | **Primary border color.** Inputs, cards, dividers, table headers |
| `g.300` | `#D1D5DB` | Hover border escalation, dashed add-buttons, secondary separators |
| `g.400` | `#9CA3AF` | Placeholder text, muted icons, disabled text, auto-generated slugs |
| `g.500` | `#6B7280` | Secondary body text, descriptions, section labels |
| `g.600` | `#4B5563` | Label text, cycle labels in pricing |
| `g.700` | `#374151` | Primary label text, section headers |
| `g.900` | `#111827` | Headings, primary body text, input values |

**Note:** `g.800` is intentionally absent — the jump from 700 to 900 is deliberate. Admin interfaces need high contrast for scannability, not a smooth gradient.

#### Surface

| Token | Value | Role |
|-------|-------|------|
| `surface` | `#FFFFFF` | Page background, card backgrounds, input backgrounds |
| `surface-raised` | `#F9FAFB` | Collapsed summaries, preview panels |
| `surface-selected` | `#F8FAFF` | Selected cards, active panels |
| `surface-warning` | `#FFFBEB` | Discount banners, informational alerts |

---

### Typography

Two font stacks. No third.

#### Font Families

| Token | Stack | Usage |
|-------|-------|-------|
| `font` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | All UI text |
| `mono` | `'SF Mono', 'Fira Code', Menlo, monospace` | Slugs, prices, tier values, code-adjacent inputs |

#### Type Scale

The scale is deliberately tight. Admin UI is dense by nature — keep type small and let weight and color do the hierarchy work.

| Role | Size | Weight | Color | Font |
|------|------|--------|-------|------|
| Page title (h1) | 20px | 600 | `g.900` | sans | 
| Section title (h2) | 16px | 600 | `g.900` | sans |
| Section label (uppercase) | 13px | 600 | `g.700` | sans |
| Section sublabel | 11px | 600 | `g.500` | sans |
| Body / inputs | 13px | 400 | `g.900` | sans |
| Label | 13px | 500 | `g.700` | sans |
| Description | 13px | 400 | `g.400`–`g.500` | sans |
| Slug / code | 12px | 400 | `g.400`–`g.500` | mono |
| Pill / badge | 12px | 500 | varies | sans |
| Table header | 11px | 600 | `g.500` | sans |
| Micro label | 11px | 600 | `g.500` | sans |
| Tier preview | 11px | 400 | `g.500` | mono |

#### Letter Spacing

| Context | Value |
|---------|-------|
| Page title | `-0.02em` |
| Section title | `-0.01em` |
| Uppercase labels | `0.04em`–`0.06em` |
| All other text | `normal` |

---

### Spacing

No 8pt grid rigidity. Spacing is relationship-driven — tighter within groups, more generous between sections.

#### Component-level spacing

| Context | Value |
|---------|-------|
| Input padding | `8px 10px` |
| Card padding | `14px 16px` |
| Button padding (primary) | `9px 18px` |
| Button padding (secondary) | `6px 14px` |
| Pill padding | `5px 12px` |
| Summary card padding | `12px 16px` |
| Table cell padding | `6px 10px` |
| Tier builder row padding | `6px 10px` |

#### Section-level spacing

| Context | Value |
|---------|-------|
| Label to input | `6px` |
| Between form fields | `20px` |
| Section divider top margin | `32px` |
| Section divider bottom margin | `28px` |
| Phase continue button top margin | `28px` |
| Collapsed phase bottom margin | `32px` |
| Page top padding | `48px` |
| Page bottom padding | `160px` (breathing room for scroll) |

#### Layout constraints

| Context | Value |
|---------|-------|
| Max content width | `600px` |
| Horizontal page padding | `24px` |
| Card grid gap | `10px` |
| Pill group gap | `4px` |
| Radio group gap | `5px` |
| Plan ladder inter-card gap | `6px` |

---

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border-default` | `1px solid #E5E7EB` | Cards, inputs, tables, dividers |
| `border-hover` | `1px solid #D1D5DB` | Hover state escalation |
| `border-selected` | `1.5px solid #2560FF` | Selected cards, active inputs |
| `border-active-soft` | `1px solid #2560FF40` | Active plan cards (blue at 40% opacity) |
| `border-dashed` | `1px dashed #D1D5DB` | "Add" placeholder buttons |
| `border-subtle` | `1px solid #F3F4F6` | Inner separators, preview panel borders |

#### Border Radius

| Context | Value |
|---------|-------|
| Inputs, buttons, badges | `4px` |
| Cards, panels, dropdowns | `4px`–`6px` |
| Toggle track | `9px` |
| Circular indicators | `50%` |
| Pill shape | `9999px` (full) |

**Rule:** Never exceed `6px` on rectangular elements. Circles use `50%`. That's it.

---

### Shadows

Shadows are almost entirely absent. The one exception is dropdown menus, which need to float above content.

| Context | Value |
|---------|-------|
| Dropdown menu | `0 4px 12px rgba(0,0,0,0.08)` |
| Toggle thumb | `0 1px 3px rgba(0,0,0,0.1)` |
| Everything else | `none` |

---

### Motion

Transitions are functional, not decorative. They exist to reduce cognitive load during state changes, not to delight.

#### Transitions

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| Border color | `0.15s` | `ease` (default) | Input focus, card hover |
| Background, color | `0.15s` | `ease` | Button states, pill selection |
| All properties | `0.12s` | `ease` | Pill selection |
| Toggle position | `0.2s` | `ease` | Toggle slide |
| Background color | `0.2s` | `ease` | Icon color changes |

#### Entrance Animation (Fade component)

Used for progressive disclosure — new sections appearing as the user advances through the wizard.

| Property | Value |
|----------|-------|
| Opacity | `0 → 1` |
| Transform | `translateY(8px) → translateY(0)` |
| Duration | `0.35s` |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Stagger delay | `30ms`–`60ms` per item |

**Rule:** Fade-in on appear only. No exit animations. No hover animations beyond color/border transitions.

---

## Components

### SelectCard

Two-column choice card for binary decisions. Used at entry points (Product/Add-on, Bundle/Standalone).

**Anatomy:**
```
┌──────────────────────────────────┐
│  [Icon]                    (●)   │  ← check badge, top-right, only when selected
│                                  │
│  Title                           │
│  Description text                │
└──────────────────────────────────┘
```

**States:**

| State | Border | Background | Icon Color |
|-------|--------|------------|------------|
| Default | `1px solid g.200` | `#fff` | `g.400` |
| Hover | `1px solid g.300` | `g.50` | `g.400` |
| Selected | `1.5px solid blue` | `#F8FAFF` | `blue` |

**Selected indicator:** 18×18px circle, `blue` background, white check icon, positioned `top: 10px; right: 10px`.

**Spacing:** `16px` padding on all sides, `8px` gap between icon and text block.

**Type:** Title is 14px/600, description is 13px/`g.500`.

---

### RadioGroup

Vertical list of mutually exclusive options. Used for branching questions (free/paid, one-time/recurring).

**Anatomy:**
```
┌─────────────────────────────────────────┐
│  ( )  Title                             │
│       Description text                  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  (●)  Title                             │
│       Description text                  │
└─────────────────────────────────────────┘
```

**States:**

| State | Border | Background | Radio |
|-------|--------|------------|-------|
| Default | `1px solid g.200` | `#fff` | `2px solid g.300` |
| Selected | `1.5px solid blue` | `#F8FAFF` | `5px solid blue` (inset fill) |

**Spacing:** `10px 14px` padding, `12px` gap between radio and text, `5px` vertical gap between items.

**Radio indicator:** 18×18px circle. Default: 2px gray border on white. Selected: 5px blue border (creates filled appearance via thick inset border).

---

### Pills

Horizontal inline selector for quick, low-stakes choices (account type, sales channel, billing cycle, timing, proration).

**Anatomy:**
```
[ Option A ]  [ Option B ]  [ Option C ]
     ↑              ↑
  selected       default
```

**States:**

| State | Border | Background | Color |
|-------|--------|------------|-------|
| Default | `1px solid g.200` | `#fff` | `g.600` |
| Selected | `1px solid blue` | `#EEF2FF` | `blue` |

**Spacing:** `5px 12px` padding, `4px` gap between pills.

**Type:** 12px/500.

**When to use Pills vs RadioGroup:** Pills for 2–3 simple options where the choice is lightweight (account type, channel). RadioGroup for 2–4 options where each needs a description to be understood.

---

### Dropdown

Standard select-style dropdown with optional "Create new" action at the bottom.

**Anatomy:**
```
┌────────────────────────────────┐
│  Selected value            ▾   │  ← trigger button
└────────────────────────────────┘
┌────────────────────────────────┐  ← flyout menu
│  Option A                      │
│  Option B                      │
│  ─────────────────────────     │  ← 1px divider
│  + Create new group            │  ← blue text, 500 weight
└────────────────────────────────┘
```

**Menu styling:** White background, `1px solid g.200` border, `4px` border-radius, `0 4px 12px rgba(0,0,0,0.08)` shadow. Positioned `4px` below trigger.

**Item states:** Default white, hover `g.50`, selected `g.100`.

**Item type:** 13px, `g.900`, left-aligned.

**Create action:** 13px, `blue`, 500 weight, separated by 1px `g.200` divider.

---

### FeaturePicker

Extended dropdown for selecting catalog features. Shows label + slug, supports inline creation.

**Anatomy:**
```
┌────────────────────────────────┐
│  Build minutes             ▾   │
└────────────────────────────────┘
┌────────────────────────────────────────┐
│  Build minutes    build_cloud.build_m… │  ← label left, slug right in mono
│  Runtime minutes  tc_cloud.runtime_m…  │
│  ───────────────────────────────────── │
│  + Create new feature                  │
│  ┌──────────────────────────────────┐  │  ← inline input mode
│  │ Feature name          [Add]      │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Slug display:** 11px, `g.400`, mono font, right-aligned in each row.

**Create mode:** Toggled by clicking "+ Create new feature". Shows inline input with "Add" button in blue. Supports Enter to confirm, Escape to cancel.

**Max height:** `240px` with `overflow-y: auto`.

---

### PricingModelPicker

2×2 card grid where each option has a micro bar-chart illustration communicating the pricing shape.

**Anatomy:**
```
┌──────────────────┐  ┌──────────────────┐
│  ▌▌▌▌▌           │  │  ▌▌  ▌▌          │
│                   │  │                   │
│  Flat per-unit    │  │  Block            │
│  Same price for…  │  │  Fixed price per… │
└──────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│  ▌ ▌ ▌ ▌         │  │  ▌▌  ▌▌          │
│  (ascending)      │  │  (two-level)     │
│  Graduated        │  │  Volume           │
│  Each unit at…    │  │  All units at…    │
└──────────────────┘  └──────────────────┘
```

**Bar specifications:**

| Model | Bar widths | Bar heights | Color when selected |
|-------|-----------|-------------|---------------------|
| Flat per-unit | 5 bars × 8px wide | All 16px | Solid `blue` |
| Block | 4 bars × 10px wide | [14, 14, 22, 22] | Solid `blue` |
| Graduated | 4 bars × 10px wide | [8, 14, 20, 26] | Gradient: `blue`, `#60A5FA`, `#93C5FD`, `#BFDBFE` |
| Volume | 4 bars × 10px wide | [12, 12, 20, 20] | Solid `blue` |

**Unselected bar color:** `g.300`.

**Card states:** Same as SelectCard. Selected indicator is 16×16px (slightly smaller than SelectCard's 18px).

**Type:** Title 12px/600, description 11px/`g.500`.

---

### TierBuilder

Inline table for configuring graduated/volume pricing tiers. Includes live cost preview.

**Anatomy:**
```
┌──────┬──────┬──────────┬──────────┬───┐
│ From │ To   │ Per unit │ Fixed fee│   │  ← header row, g.50 bg
├──────┼──────┼──────────┼──────────┼───┤
│ 0    │ 1000 │ $ 0.00   │ $ -      │   │  ← alternating white/g.50
│ 1001 │ ∞    │ $ 0.10   │ $ -      │ × │  ← last row always ∞
└──────┴──────┴──────────┴──────────┴───┘
+ Add tier

┌─ Preview ─────────────────────────────┐
│  Preview:  [ 3000    ]    $650.00     │
│  1,000 units @ $0/unit = $0.00        │  ← per-tier breakdown (mono)
│  2,000 units @ $0.30/unit + $50 = …   │
└───────────────────────────────────────┘
```

**Table header:** 11px/600, `g.500`, uppercase, `0.04em` letter-spacing, `g.50` background.

**Row values:** `From` is display-only in `g.400` mono. `To` is editable (except last row = ∞). Price inputs use `$` prefix in `g.400`.

**Alternating rows:** Even rows `#fff`, odd rows `g.50`.

**Remove button:** Only on middle rows (not first, not last). `g.300` default, `red` on hover. Hidden when ≤ 2 rows.

**Preview panel:** `g.50` background, `1px solid g.100` border, `6px` radius, `12px 14px` padding. Quantity input has white background. Total in `blue`, 13px/700. Breakdown lines in 11px mono, `g.500`, with amounts in `g.900`/600.

---

### TierBadge

Numbered circle with connecting vertical lines. Forms the visual "plan ladder" in Phase 2.

**Anatomy:**
```
     │  ← 2px wide connector line
    (2)  ← 28×28px circle
     │
```

**States:**

| State | Circle | Number | Connector |
|-------|--------|--------|-----------|
| Inactive | `2px solid g.200`, white fill | `g.400`, 12px/700 | `g.200` |
| Active (plan named) | `2px solid blue`, `blue` fill | `#fff`, 12px/700 | `blue` |

**Connector lines:** 2px wide, 12px tall, above and below the circle (omitted for first/last).

**Transition:** `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` — the plan ladder animates as users type names.

---

### Toggle

Binary switch used for feature inheritance ("Extends Parent Plan" / "Standalone features").

**Anatomy:**
```
[●───]  Extends Plan 1     ← on state
[───●]  Standalone features ← off state
```

**Track:** 32×18px, `9px` border-radius. On: `blue` background. Off: `g.200` background.

**Thumb:** 14×14px circle, white, `0 1px 3px rgba(0,0,0,0.1)` shadow, positioned `top: 2px`. On: `left: 16px`. Off: `left: 2px`.

**Label:** 12px, `g.900` when on (with parent name in `blue`/600), `g.400` when off.

**Transition:** Background `0.2s`, thumb position `0.2s`.

---

### Input

Standard text input used everywhere.

**Base styles:**

```
width:        100%
padding:      8px 10px
font-size:    13px
font-family:  sans (or mono for slugs/prices)
color:        g.900
border:       1px solid g.200
border-radius: 4px
outline:      none
transition:   border-color 0.15s
```

**States:**

| State | Border |
|-------|--------|
| Default | `g.200` |
| Focus | `blue` |
| Blur | `g.200` (returns) |

**Variants:**

| Variant | Differences |
|---------|-------------|
| Slug input | `mono` font, 12px, `g.500` color |
| Price input | `mono` font, `$` prefix outside input in `g.400` 14px, `width: 100px`–`120px` |
| Inline table input | `4px 6px` padding, 12px, `mono` font |
| Textarea | Same base + `resize: vertical`, `min-height: 56px`, `line-height: 1.5` |

---

### Label

```
display:       block
font-size:     13px
font-weight:   500
color:         g.700
margin-bottom: 6px
```

**With suffix:** Append hint text in 400 weight, `g.400` color. Example: "Slug `auto-generated`"

---

### Cont (Continue Button)

Primary action button positioned at the bottom of each phase, right-aligned, above a `1px solid g.200` top border.

**Anatomy:**
```
────────────────────────────────────────  ← 1px divider
                            [ Continue → ]
```

**Styles:**

| State | Background | Color | Cursor |
|-------|------------|-------|--------|
| Default | `blue` | `#fff` | `pointer` |
| Disabled | `g.200` | `g.400` | `default` |

**Spacing:** `9px 18px` padding, `6px` gap between label and arrow icon. Container has `28px` top margin, `24px` top padding (above the divider).

---

### Div (Divider)

Horizontal rule between sections.

```
height:      1px
background:  g.200
margin-top:  32px (default)
margin-bottom: 28px (default)
```

Accepts `mt` and `mb` overrides.

---

### SectionQ (Section Question)

Uppercase label for progressive disclosure questions.

```
font-size:       12px
font-weight:     600
color:           g.500
text-transform:  uppercase
letter-spacing:  0.05em
margin-bottom:   10px
```

---

### CollapsedSummary

When a phase is completed, it collapses into a compact summary card with an edit action.

**Anatomy:**
```
┌─────────────────────────────────────────────────────────┐
│  [Icon]  Title                                    [✎]   │
│          Subtitle / metadata in mono                     │
└─────────────────────────────────────────────────────────┘
```

**Styles:** `1px solid g.200` border, `g.50` background, `4px` radius, full-width button element. Hover escalates border to `g.300`.

**Icon:** `blue` color, left-aligned.

**Title:** 14px/600 (Phase 1) or 13px/600 (Phase 2), `g.900`.

**Subtitle:** 12px, `g.400`, mono for slugs. Uses `·` separator between metadata items.

**Edit icon:** `g.400`, 13px, right-aligned.

---

### Breadcrumb

Top navigation bar showing hierarchy.

```
Catalog / New bundle
  ↑         ↑
g.400     g.900

Separator: " / " in g.300
```

**Container:** Full-width, `12px 32px` padding, `1px solid g.200` bottom border. 13px/500.

---

### UpgradeDowngradePaths

Path visualization for plan transitions.

**Plan chain:** Horizontal row of plan names in `g.50` panel with `1px solid g.100` border, `12px 16px` padding, `6px` radius. Each plan is a mini badge: `6px 14px` padding, `1px solid g.200` border, `4px` radius, 12px/600. Connected by `↔` in `g.300`.

**Hover highlight:** When hovering a path row, the from/to plan badges in the chain get `#EEF2FF` background, `blue` text, `1px solid blue` border.

**Path groups:** Upgrades headed by `green` label with 8×8px green dot at 40% opacity. Downgrades headed by `amber` label with amber dot.

**Path row:** Full-width button, `8px 12px` padding. Shows "From → To" in 13px/600 `g.900`, with timing and proration badges (`g.400` text, `g.100` background, `2px 8px` padding, `3px` radius, 11px). Expandable on click.

**Expanded state:** `#FAFBFF` background, `1px solid blue` border, contains Pills for timing/proration and a "Remove this path" link in `red`.

---

## Patterns

### Progressive Disclosure

The core interaction pattern. Completed phases collapse, new phases fade in. The form never feels like it's growing.

**Rules:**
1. Each phase has a continue button that validates and collapses
2. Collapsed phases show a summary card with edit action
3. New phases enter with the Fade animation (8px translateY, 0.35s)
4. Stagger delays increase by 30–60ms per sequential element
5. The `k` prop on Fade resets animation when the key changes (re-triggers on content switch)

### Selection → Consequence

When a user selects an option, the next question appears immediately below via Fade. The selection remains visible as context.

**Example flow:**
```
Is this plan free or paid?
  (●) Paid                          ← user selects

How is it billed?                   ← fades in at +30ms delay
  ( ) Recurring
  ( ) One-time

What type of subscription?          ← fades in at +30ms delay
  ( ) Flat subscription
  ( ) Per-unit subscription
  ( ) Usage-based
```

### Tab Navigation

For bundles with multiple plans, Phase 3 uses a tab bar to switch between per-plan configurations.

**Tab anatomy:** `8px 16px` padding, 13px, bottom border `2px solid blue` (active) or `2px solid transparent` (inactive), `margin-bottom: -1px` to overlap the container's bottom border. Active tabs show 600 weight in `blue`, inactive show 500 weight in `g.500`. Completion dot: 6×6px `green` circle next to the plan name.

### Linked Fields

Name → slug auto-generation pattern. The slug field auto-populates from the name until manually edited.

**Visual indicators:** Link icon (`blue`, 12px) when synced. Unlink icon (`g.400`, 12px) + "Reset" button (`blue`, 11px/500) when manually edited. Reset re-syncs the slug to the current name.

---

## Iconography

All icons are inline SVGs on a 24×24 viewBox, rendered at specific sizes. Stroke-based, no fills. Default stroke properties:

```
fill:           none
stroke:         currentColor
stroke-width:   1.5 (contextual: 2 for action icons, 3 for check)
stroke-linecap: round
stroke-linejoin: round
```

### Icon Registry

| Name | Size | Stroke | Usage |
|------|------|--------|-------|
| `x` | 14×14 | 2 | Close, remove, dismiss |
| `plus` | 15×15 | 2 | Add actions |
| `check` | 13×13 | 3 | Selection confirmation (inside circles) |
| `arrowR` | 15×15 | 2 | Continue / forward navigation |
| `chevD` | 14×14 | 2 | Dropdown trigger, expand |
| `chevU` | 14×14 | 2 | Collapse |
| `edit` | 13×13 | 2 | Edit / pencil |
| `link` | 12×12 | 2 | Linked/synced field |
| `unlink` | 12×12 | 2 | Manually edited field |
| `arrowDn` | 12×12 | 2 | Move down in list |
| `pkg` | 18×18 | 1.5 | Product (package box) |
| `puzzle` | 18×18 | 1.5 | Add-on (puzzle piece) |
| `layers` | 18×18 | 1.5 | Bundle (stacked layers) |
| `file` | 18×18 | 1.5 | Standalone (single document) |

**Sizing rule:** 18px for entry-type icons (primary navigation choices), 14–15px for action icons, 12–13px for inline/field indicators.

---

## Anti-Patterns

Things this system explicitly rejects. Refer to this list during code review.

| Never | Why |
|-------|-----|
| Box shadows on cards | Borders are sufficient. Shadows add visual noise. |
| Gradients anywhere | Flat color only. Gradients signal marketing, not tooling. |
| Border radius > 6px | Keeps everything rectilinear and tool-like. |
| Multiple accent colors in the same view | One blue. Semantic colors (green/amber/red) are contextual. |
| Colored section backgrounds | White or `g.50`. Nothing else. |
| Decorative illustrations | Icons only, stroke-based only. |
| Hover animations (scale, rotate) | Color and border transitions only. |
| Exit animations | Elements disappear instantly. Only entrances are animated. |
| Floating labels | Static labels above inputs. Always visible. |
| Toast notifications | Inline feedback only. |
| Modals for simple choices | Progressive disclosure in the flow. |
| Zebra striping on tables | Alternating `#fff`/`g.50` is acceptable only in the tier builder. |

---

## Reference Points

Interfaces whose design sensibility aligns with this system:

- **Linear** — speed as a design value, sparse chrome, keyboard-first
- **Stripe Dashboard** — settings pages specifically, not the marketing site
- **Ramp** — dense financial data, no decoration
- **Retool** — default admin theme, functional first
- **Vercel Dashboard** — black/white/blue, extreme restraint

The test: *"Does this look like the tool your finance team uses daily — or the landing page selling it?"* Always the former.
