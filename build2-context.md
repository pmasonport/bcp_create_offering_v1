# Catalog Wizard — Build Context

> Updated: March 3, 2026
> Current file: `build2.jsx` (~895 lines, single React component)
> Data model reference: `docker_product_catalog_model_v0.6.1.md`

---

## What This Is

A progressive disclosure form for creating new offerings in the Docker product catalog. Internal operators (PM, Finance, Eng) use it to define products, plans, pricing, features, and entitlements. Each answer reveals the next question. Completed sections collapse to summaries.

The wizard writes to the data model in `docker_product_catalog_model_v0.6.1.md`. That file is the source of truth for all entity schemas, enums, validation rules, and populated catalog examples.

---

## What's Built (Phases 1–3)

### Step 0 — Entry Type
Two card selections:
1. **What are you creating?** → Product or Add-on (Add-on is a placeholder, not built)
2. **How is it structured?** (Product only) → Bundle (multiple plans) or Standalone (single plan)

Collapses to a small chip showing the selection with a "Change" link.

### Phase 1 — Identity
- **Name** → auto-generates slug (linked until manually edited, then shows unlink icon + Reset button)
- **Slug** — monospace, linked to name by default
- **Description** — collapsed behind "+ Add description" by default
- **Offering group** — dropdown with inline create: DSoP, DHI, Sandboxes, Support, AI + custom

Collapses to a summary card showing name, slug, and group with an edit pencil.

### Phase 2 — Plan Structure (Bundle only)
- **Flat draggable list** inside a single bordered container. Each row: grip dots, numbered badge (fills blue when named), name input, inheritance chip, delete button.
- **HTML5 drag-and-drop** — drag rows to reorder. Blue border indicates drop target. Input fields have `draggable={false}` and `stopPropagation` so text selection works.
- **Inheritance** — first plan shows "base" chip. Subsequent plans show a clickable "extends [Plan]" chip that toggles to "standalone" on click. Default is inherits=true for all plans after the first.
- **Placeholders** — "e.g. Personal", "e.g. Pro", "e.g. Team", "e.g. Business", "e.g. Enterprise"
- **Upgrade/downgrade paths** — appears when 2+ plans are named. "Auto-generate" button creates adjacent pairs. Visual plan chain highlights nodes on path hover. Each path row expands for timing (Immediate / End of cycle) and proration (Credit remaining / No refund / None). "+ Add custom path" for skip-level connections.

Collapses to "[N] plans: Personal → Pro → Team" summary.

### Phase 3 — Monetization
**Accordion-based, one plan open at a time.** Each plan is a collapsible card with:
- Numbered badge that turns green checkmark when configured
- Summary line when collapsed (e.g. "Free", "$16/seat/mo · $15/seat/yr", "Usage-based · Compute seconds, Storage (GB-hrs)")

**Per-plan config inside the accordion:**

1. **Account type** (Individual / Organization) + **Sales channel** (Self-serve / Sales-led / Both) — pills
2. **Single billing type question** — "How is this plan billed?"
   - **Free** → shows "Done" confirmation
   - **Subscription** → asks Sub Type (Flat / Per-unit)
   - **One-time** → asks Fixed / Per-unit
   - **Usage-based** → shows multi-meter builder

**Subscription → Flat:**
Billing cycles (Monthly/Annual checkboxes) → price per cycle with suffix "/month" or "/year"

**Subscription → Per-unit:**
Billing unit (FeaturePicker) → Pricing model (4 cards: Flat per-unit, Block, Graduated, Volume) → Block/Tiered/Volume config if applicable → Billing cycles → price per unit per cycle with suffix "/seat/mo"

**One-time → Fixed:**
Price input → Expiry? (Yes/No) → if Yes: duration + unit (Days/Months/Years)

**One-time → Per-unit:**
Unit picker → Pricing model → Config → Price → Expiry

**Usage-based (multi-meter):**
Repeatable "metered resource" cards. Each has:
- FeaturePicker (filtered to exclude already-selected resources)
- Its own pricing model picker
- Its own rate config (per-unit price, block config, or tier builder)
- "+ Add metered resource" button for additional meters

Auto-selects monthly billing and shows "Billed monthly in arrears" note.

**Annual discount banner** — appears when both Monthly and Annual cycles are selected with prices. Shows "Annual saves X% vs. paying monthly ($180 vs $192/yr)".

---

## What's NOT Built (Phases 4–6)

### Phase 4 — Features & Entitlements
From the original plan:
- Feature group selection
- Feature picker from scoped registry (billing units, metered, static)
- Entitlement matrix: card view (default, one card per plan) and matrix view (spreadsheet-style grid)
- Metered feature config: included amount, reset cadence, limit behavior
- Per-billing-unit scaling toggle (e.g. 10,000 tokens per seat)
- Overage rate card config when a metered feature has SOFT_CHARGE limit behavior

### Phase 5 — Availability & Lifecycle
- Visibility per plan (PUBLIC, UNLISTED, INTERNAL)
- Constraints (seat caps, repo caps — scoped to plans with billing units)
- Default plan toggle (which auto-grants on account creation)
- Trial config (duration, usage caps, monetary cap, on-expiry behavior, requires payment method)

### Phase 6 — Review
- Summary view: pricing table, entitlement matrix, upgrade paths, constraints
- System-generated warnings and suggestions (e.g. "This bundle has metered features with overage. Create prepaid credit packs?")
- Save as draft / Publish to staging

### Add-on Flow (separate, not built)
Entry point exists but shows placeholder. Needs: plan requirements, purchase constraints, AddOnFeature config, AddOnRateCard.

---

## Design System

- White `#FFFFFF` background, `#E5E7EB` borders, 1px solid
- No shadows, no gradients, border-radius max 4–6px
- Accent: `#2560FF` (blue) — selections, active states, primary buttons
- Semantic: `#10B981` (green/success), `#F59E0B` (amber/warnings), `#EF4444` (red/destructive)
- `Inter` font family (system fallbacks)
- `SF Mono` for slugs, pricing inputs, code
- Gray scale: 50 `#F9FAFB`, 100 `#F3F4F6`, 200 `#E5E7EB`, 300 `#D1D5DB`, 400 `#9CA3AF`, 500 `#6B7280`, 600 `#4B5563`, 700 `#374151`, 900 `#111827`
- Progressive disclosure via `Fade` component (fade-in + translateY with `cubic-bezier(.4,0,.2,1)`)
- `Fade` has a `skip` prop — set to true when switching tabs/accordions to render instantly without animation
- Completed phases collapse to compact summaries with edit buttons

---

## Component Inventory

| Component | Purpose |
|-----------|---------|
| `SelectCard` | Two-column card selection (Product/Add-on, Bundle/Standalone) |
| `RadioGroup` | Vertical radio list for branching questions with label + description |
| `FeaturePicker` | Dropdown for selecting features from registry; shows label + slug; has inline "+ Create new feature" |
| `Dropdown` | Standard dropdown with inline create; used for offering groups |
| `PricingModelPicker` | 2×2 grid of cards with micro-bar-chart illustrations (Flat, Block, Graduated, Volume) |
| `TierBuilder` | Inline table for graduated/volume tier configuration with live cost preview calculator |
| `Pills` | Horizontal pill selector for quick toggles (account type, channel, billing cycles, expiry unit) |
| `Fade` | Animation wrapper — configurable delay, `skip` prop for instant render |
| `Cont` | Continue button with disabled state and arrow icon |
| `Div` | Themed horizontal divider |
| `SectionQ` | Section question label with optional `sub` prop for helper text |
| `I` | SVG icon component — x, plus, check, arrowR, chevD, chevU, edit, link, unlink, pkg, puzzle, layers, file, grip |

---

## State Shape

### Top-level wizard state
```
entryType:    "product" | "addon" | null
structure:    "bundle" | "standalone" | null
step0Done:    boolean
```

### Phase 1 — Identity
```
bName, bSlug:       string
slugEd:             boolean (true = slug manually edited, unlinked from name)
showDesc:           boolean
desc:               string
grp:                string (selected group name)
customGrps:         string[]
p1Done, p1Edit:     boolean
```

### Phase 2 — Plans
```
plans: [{
  id:        string (uid)
  name:      string
  slug:      string
  slugEd:    boolean
  inherits:  boolean (true = extends plan above)
}]

paths: [{
  from:    plan.id
  to:      plan.id
  dir:     "UPGRADE" | "DOWNGRADE"
  timing:  "IMMEDIATE" | "END_OF_CYCLE"
  pro:     "CREDIT_REMAINING" | "NO_REFUND" | "NONE"
}]

showPaths, addPathMode:  boolean
editPath:                index | null
dragIdx, dropIdx:        index | null (for HTML5 drag-drop)
```

### Phase 3 — Pricing
```
p2Done:          boolean
expandedPlan:    plan.id | null (which accordion is open)

planConfig: {
  [plan.id]: {
    acctType:       "INDIVIDUAL" | "ORGANIZATION"
    channel:        "SELF_SERVE" | "SALES_ASSISTED" | "BOTH"
    billingType:    "FREE" | "SUBSCRIPTION" | "ONE_TIME" | "USAGE_BASED" | null
    isPaid:         boolean | null  (derived from billingType)
    recurrence:     "RECURRING" | "ONE_TIME" | null  (derived)
    recurModel:     "FLAT" | "PER_UNIT" | "PAYG" | null
    oneTimeModel:   "FIXED" | "PER_UNIT" | null
    pricingModel:   "PER_UNIT" | "BLOCK" | "TIERED" | "VOLUME" | null
    billingUnit:    feature.id | ""
    meteredFeature: feature.id | ""  (legacy, used for non-PAYG paths)
    flatPrice:      string
    unitPrice:      string
    blockSize:      string
    blockPrice:     string
    tiers:          [{from, to, unitAmt, fixedAmt}]
    cycles:         ["MONTHLY", "ANNUAL"]
    cyclePrices:    {MONTHLY: string, ANNUAL: string}
    previewQty:     string
    expires:        boolean | null
    expiryAmount:   string
    expiryUnit:     "DAYS" | "MONTHS" | "YEARS"
    meters: [{       // usage-based only
      featureId:     feature.id | ""
      pricingModel:  "PER_UNIT" | "BLOCK" | "TIERED" | "VOLUME" | null
      unitPrice:     string
      blockSize:     string
      blockPrice:    string
      tiers:         [{from, to, unitAmt, fixedAmt}]
      previewQty:    string
    }]
  }
}
```

---

## Feature Registry (hardcoded data)

### Billing Units (`is_billing_unit: true`)
| ID | Label |
|----|-------|
| `docker_core.seats` | Seats |
| `dhi.repos` | Repos |

### Metered Features (`is_metered: true`)
| ID | Label |
|----|-------|
| `build_cloud.build_minutes_small` | Build minutes (Small) |
| `build_cloud.build_minutes_medium` | Build minutes (Medium) |
| `build_cloud.build_minutes_large` | Build minutes (Large) |
| `tc_cloud.runtime_minutes_small` | Runtime minutes (Small) |
| `tc_cloud.runtime_minutes_medium` | Runtime minutes (Medium) |
| `tc_cloud.runtime_minutes_large` | Runtime minutes (Large) |
| `hub.pull_rate_per_hour` | Pull rate (per hr) |
| `sandboxes.compute_seconds` | Compute seconds |
| `sandboxes.storage_gb_hours` | Storage (GB-hrs) |
| `sandboxes.memory_gb_hours` | Memory (GB-hrs) |

Operators can create new features inline via the FeaturePicker dropdown. Custom billing units go in `customBillingUnits`, custom meters in `customMeters`.

### Static Entitlement Features (not yet used in the wizard — Phase 4)
| Category | Features |
|----------|----------|
| Hub | private_repos, organizations, org_access_tokens |
| Scout | enabled_repos, sdlc_integrations, policy_level |
| Build Cloud | max_parallel_builds, cache_gb |
| Desktop | synchronized_file_shares, docker_debug, hardened_desktop, enhanced_container_isolation, sso, scim, registry_access_management, image_access_management, vdi_support |
| DHI | hardened_images, sbom_provenance, cve_visibility_full, open_source_apache2, cve_remediation_sla, fips_stig_variants, compliance_frameworks, mirroring_customization, els |
| Support | sla_business_days, 24x7_response, priority_sla, technical_advisory_manager |

---

## Key Design Decisions

1. **Account type is exclusive** — Individual OR Organization, never both per plan.
2. **Billing type is one question** — Free / Subscription / One-time / Usage-based in a single radio group. Replaces the old three-step fork (free/paid → recurring/one-time → flat/per-unit/payg).
3. **Subscription per-unit flow: unit → model → cycles → prices.** Billing cycles come after the pricing model is chosen, so the operator knows whether they need per-cycle prices (PER_UNIT model) or just cycles for timing (BLOCK/TIERED/VOLUME).
4. **Feature selection uses dropdowns, not pills.** Features are real catalog entities with slugs. Dropdown shows label + slug. "+ Create new feature" at the bottom.
5. **Usage-based is multi-meter.** Each meter is a repeatable card with its own feature picker + pricing model + rates. Already-selected resources are filtered out of subsequent pickers.
6. **One-time purchases have an optional expiry** — duration + unit (Days/Months/Years) from purchase date.
7. **Plans are a flat draggable list** inside a single bordered container. Not individual floating cards. No tier badge timeline.
8. **Pricing uses accordion, not tabs.** Each plan is a collapsible card. One open at a time. Collapsed cards show a pricing summary and green checkmark when configured.
9. **Add-ons and credit products are separate flows** — not created inside the bundle wizard. Phase 6 review screen should prompt "Create prepaid credit packs?" as a suggested next action.
10. **Progressive disclosure via collapse** — completed phases compress to compact summaries.
11. **Alert thresholds default silently** — `[0.8, 0.95]` for all metered NUMERIC features. Not asked during creation.
12. **Expansion behavior is not asked** — it's derived from catalog relationships at query time.
13. **Account type + channel carry forward** from the previous plan when initializing new plan configs in a bundle.
14. **Dropdown z-index is 50** — high enough to escape any parent container. Accordion cards do NOT have `overflow:hidden` (that was a bug that clipped dropdowns).

---

## Offering Groups
- DSoP (Docker Subscription on Platform)
- DHI (Docker Hardened Images)
- Sandboxes
- Support
- AI

---

## Known Issues / Gaps

- **Drag-and-drop on plan rows** — works with HTML5 draggable but has no animated reorder feedback. Consider a library if polish needed.
- **No validation** — nothing prevents advancing with empty fields. Phase 6 review should catch this.
- **No data model output** — the wizard collects state but doesn't serialize to the catalog schema yet. The `console.log` on "Continue to features" dumps raw state.
- **Standalone product** pricing skips Phase 2 entirely — the plan auto-inherits the product name/slug. This works but the accordion shows a single card which feels odd.
- **Pricing model picker for block/tiered/volume on subscription per-unit** — shows the config (block size, tier builder) but billing cycles only show price inputs for `PER_UNIT` pricing model. For BLOCK/TIERED/VOLUME the cycles are just for timing — this is correct but might confuse operators.

---

## Files

| File | Description |
|------|-------------|
| `build2.jsx` | Current wizard build — single React component, ~895 lines |
| `docker_product_catalog_model_v0.6.1.md` | Canonical data model — all entity schemas, enums, validation rules, populated examples |
| `catalog-wizard-context.md` | Original project context (now superseded by this document) |
