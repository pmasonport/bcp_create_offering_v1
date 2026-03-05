# Create Offering — Flow Structure (v2)

## Context

The Create Offering flow is for product managers and execs who want to add new purchasable products to the Docker catalog. Per the PRD, the MVP is structured step-by-step forms with clear guidance.

The flow lives inside the BCP Console. Entry point: "Create offering" button on the Offerings index page.


---

## The upfront question

Before any offering wizard starts, the user needs to answer one question that determines the entire flow shape:

```
┌─────────────────────────────────────────────────────────────────┐
│  What are you setting up?                                       │
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │  📦                         │  │  ＋                      │  │
│  │                             │  │                          │  │
│  │  A new product line         │  │  Add to an existing      │  │
│  │  Launch a new product with  │  │  product line             │  │
│  │  one or more offerings      │  │  Add an offering or      │  │
│  │                             │  │  add-on to a product     │  │
│  │                             │  │  line already in the     │  │
│  │                             │  │  catalog                 │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Choice | What happens |
|--------|-------------|
| **New product line** | User creates an offering group (name, slug, description), then lands in the **Group Workspace** — an empty canvas that mirrors the catalog group detail view. |
| **Add to existing product line** | Dropdown to pick an existing group, then lands in the **Group Workspace** pre-populated with that group's existing offerings. |


---

## The Group Workspace

This is the heart of the creation experience. It looks like the catalog group detail view (View 2) but in edit mode. Two zones:

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Offerings                                                    │
│                                                                 │
│  Docker Hardened Images                          [Publish all]  │
│  Secure container images product line                           │
│  dhi                                                            │
│                                                                 │
│  OFFERINGS                                                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Free                          $0  [active]    ⋯   │  │
│  │  dhi-free · standalone · subscription                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Select                   $5,000/repo [draft]  ⋯   │  │
│  │  dhi-select · standalone · subscription                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Enterprise (Per-Repo)    $8,000/repo [draft]  ⋯   │  │
│  │  dhi-enterprise-per-repo · standalone · subscription     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Enterprise (Full Catalog)  $200,000  [draft]  ⋯   │  │
│  │  dhi-enterprise-full-catalog · standalone · subscription │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  + Add offering                                          │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
│  ADD-ONS                                                        │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — ELS (Per-Repo)           $8,000/repo [draft]  ⋯   │  │
│  │  dhi-els-per-repo · add-on · requires Enterprise (PR)   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — ELS (Full Catalog)         $200,000  [draft]  ⋯   │  │
│  │  dhi-els-full-catalog · add-on · requires Enterprise (FC)│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  + Add add-on                                            │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
│  ⋯ menu per card: Edit · Duplicate · Publish · Delete           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key behaviors

- Starts empty for new product lines. Pre-populated for existing ones.
- Each offering card shows its current state (name, price, status). Click → to edit.
- "+ Add offering" launches the offering wizard with `offering_package` pre-set to `bundle` or `standalone` (user chooses which).
- "+ Add add-on" launches the offering wizard with `offering_package` pre-set to `add_on` and the dependency picker pre-scoped to this group's offerings.
- The whole product line stays in draft until the top-level "Publish" action is taken.
- Offerings are built one at a time. You finish one, it appears in the workspace, you start the next.

### Duplicate / build on top of

Each offering card in the workspace has a `⋯` menu with a **"Duplicate"** action. This is the primary way to build tiered product lines efficiently.

```
┌───────────────────────────────────────────────────────────┐
│  DHI — Free                                   $0     ⋯   │
│  dhi-free · standalone · subscription          ┌─────────┐│
│                                                │ Edit    ││
│                                                │Duplicate││
│                                                │ Publish ││
│                                                │ Delete  ││
│                                                └─────────┘│
└───────────────────────────────────────────────────────────┘
```

Clicking "Duplicate" launches the offering wizard pre-populated with:
- **Step 1 (Basics):** Same package type, account type, sales channel. Name and slug blanked (user must provide new ones). Description copied.
- **Step 2 (Pricing):** Same monetization strategy and pricing model structure. Prices blanked — user must set new values. Billing cycle and timing carried over.
- **Step 3 (Features):** Same services selected, same features checked, same recurrence periods. **All feature values copied** — user adjusts the ones that differ.

The key UX detail: in Step 3, features that have values carried over from the source offering are shown with a subtle "from DHI Free" label so the user knows what they're inheriting. Changed values lose the label.

```
  FEATURES (from DHI — Free)

  ┌───────────────────────────────────────────────────────────┐
  │  Docker Hardened Images · 13 features                      │
  │                                                           │
  │  dhi_enabled                  ✓                           │
  │  dhi_sbom_enabled             ✓                           │
  │  dhi_slsa_provenance          ✓                           │
  │  dhi_cve_visibility           ✓                           │
  │  dhi_cve_remediation_sla      ✗  ← change to ✓ for Select│
  │  dhi_fips_stig                ✗  ← change to ✓ for Select│
  │  dhi_compliance_support       ✗  ← change to ✓ for Select│
  │  dhi_mirroring                ✗                           │
  │  dhi_els_enabled              ✗                           │
  │  dhi_select_enabled           ✗  ← change to ✓ for Select│
  │  dhi_customizations_limit     0  ← change to 5 for Select│
  │  dhi_hardened_sys_pkg_repo    ✗                           │
  │  dhi_full_catalog_access      ✗                           │
  └───────────────────────────────────────────────────────────┘
```

This turns building a 4-tier product line from "configure 13 features × 4 offerings = 52 decisions" into "configure 13 features once, then flip 4–6 toggles per subsequent tier."

### The "+ Add" buttons also offer duplicate

When clicking "+ Add offering" or "+ Add add-on," the first question is:

```
┌───────────────────────────────────────────────────────────┐
│  Start from                                                │
│                                                           │
│  ○  Blank — configure everything from scratch             │
│                                                           │
│  ○  Duplicate an existing offering                         │
│     [ DHI — Free                    ▾ ]                   │
│     ← dropdown of offerings in this workspace              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

This is especially useful for the add-on case. Creating DHI ELS (Per-Repo)? Duplicate Enterprise (Per-Repo), change the name/slug, flip `dhi_els_enabled` to ✓, and set the dependency to "requires Enterprise (Per-Repo)."

### Why this works for the DHI case

Sarah wants to launch DHI. She:
1. Clicks "Create offering" → "New product line"
2. Names it "Docker Hardened Images," adds a description
3. Lands in the empty workspace
4. Clicks "+ Add offering" → creates DHI Free (standalone, subscription, $0)
5. It appears in the workspace. Clicks "+ Add offering" → creates DHI Select
6. Repeats for Enterprise (Per-Repo) and Enterprise (Full Catalog)
7. Clicks "+ Add add-on" → creates ELS (Per-Repo), selects "requires Enterprise (Per-Repo)"
8. Repeats for ELS (Full Catalog)
9. Sees the whole product line laid out. Clicks "Publish."

### Why this works for the Build Cloud case

Build Cloud is its own product line, but everything in it is an add-on to DSoP. The PM:
1. "Create offering" → "New product line"
2. Names it "Build Cloud"
3. Lands in empty workspace — the Offerings zone is empty (and that's fine)
4. Clicks "+ Add add-on" → creates Build Cloud Minutes
5. In the dependency picker, selects "requires any offering in: Docker Suite of Products"
6. Publishes.

The workspace naturally handles "all-addon" product lines by just having an empty offerings zone.

### Why this works for adding Gordon Enterprise to an existing group

1. "Create offering" → "Add to existing product line" → selects "Gordon"
2. Lands in Gordon workspace, sees Pro/Max/Ultra already there
3. Clicks "+ Add add-on" → creates Gordon Enterprise (PAYG)
4. Publishes.


---

## New product line setup (before the workspace)

If the user chose "New product line," they answer a few quick fields before landing in the workspace:

| Field | Input type | Source | Required |
|-------|-----------|--------|----------|
| Product line name | Text input | `offering_groups.group_name` | Yes |
| Slug | Auto-generated, editable | `offering_groups.slug` | Yes |
| Description | Textarea | `offering_groups.description` | No |

That's it. This creates the `offering_groups` row and drops them into the workspace.


---

## The Offering Wizard (per offering)

Launched from "+ Add offering" or "+ Add add-on" in the workspace. Three steps, with pricing BEFORE features.

```
① Basics  →  ② Pricing  →  ③ Features & Review
```

### Why pricing before features

The pricing model drives what features you need. Examples:
- Choosing per-unit pricing on "seats" means you need a `seats` feature (integer, mutable, static metering).
- Choosing PAYG on compute hours means you need a `compute_hours` feature (integer, metered, aggregated).
- Choosing block pricing means you need a feature to track the block resource.

By configuring pricing first, Step 3 can say: "Based on your pricing, you'll need these features. Configure their values and add any additional features."


---

## Step 1: Basics

**Goal:** Identity and structural positioning of this offering.

### Fields for offerings (bundle/standalone)

| Field | Input type | Required | Notes |
|-------|-----------|----------|-------|
| Name | Text input | Yes | e.g. "DHI — Enterprise (Per-Repo)" |
| Slug | Auto-generated, editable | Yes | Linked field pattern |
| Description | Textarea | No | |
| Package type | SelectCard (bundle / standalone) | Yes | Pre-selected if context is clear |
| Account type | Pills (Individual / Organization) | Yes | |
| Sales channel | Pills (Self-serve / Sales-led / Both) | Yes | |

### Fields for add-ons

Same as above, but:
- Package type is locked to `add_on` (no SelectCard shown)
- Dependency picker appears:

```
  What does this add-on require?

  ○ Any offering in this product line
     (requires any Docker Hardened Images offering)

  ○ Specific offerings in this product line
     [ DHI Enterprise (Per-Repo) × ]  [ + Add ]

  ○ An offering in a different product line
     [ Docker Suite of Products ▾ ]
     [ ] Any offering in this group
     [ ] Specific: [ Docker Business × ]  [ + Add ]
```

This maps to `offering_dependencies`:
- "Any offering in this product line" → `required_group_id` = current group
- "Specific offerings" → one `required_offering_id` per selection
- "Different product line" → `required_group_id` or `required_offering_id` from another group

### Step 1 → Continue

Creates the `offerings` row (status: draft), `offering_dependencies` if add-on. Collapses. Step 2 fades in.

### Collapsed summary

```
┌───────────────────────────────────────────────────────────┐
│  ☐  DHI — ELS (Per-Repo) · add-on · org              [✎] │
│     dhi-els-per-repo · requires Enterprise (Per-Repo)     │
└───────────────────────────────────────────────────────────┘
```


---

## Step 2: Pricing

**Goal:** Define how customers pay for this offering.

### First question: free or paid?

| Answer | What happens |
|--------|-------------|
| Free | Rate card = fixed $0. Auto-creates the rate card. Skip to Step 3. |
| Paid | Monetization strategy question appears. |

### Monetization strategy (if paid)

RadioGroup with descriptions:

```
  How will customers pay?

  ○ Recurring subscription
    Charged on a recurring basis (monthly, annual, or both)

  ○ Pay-as-you-go
    Charged based on actual usage at end of billing period

  ○ Prepaid top-ups
    Customer purchases credits/blocks upfront, draws down over time

  ○ One-time payment
    Single charge, no recurrence
```

### Rate card configuration

Based on strategy, the appropriate inputs appear:

**Subscription:**

```
  Pricing model:    ( ) Fixed amount    ( ) Per unit

  (if per-unit):
  What is being charged for?   [ Seats ▾ ]  ← dropdown, or type to create new
  
  Billing period:   [ Monthly only ]  [ Annual only ]  [ Both (monthly & annual) ]
  
  Monthly price:    [ $ 20      ] per unit / month
  Annual price:     [ $ 180     ] per unit / year

  Billing timing:   [ In advance ▾ ]
```

**PAYG:**

```
  Pricing model:
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ ▌▌▌▌▌    │  │ ▌▌  ▌▌   │  │ ▌ ▌ ▌ ▌  │  │ ▌▌  ▌▌   │
  │ Per unit  │  │ Block    │  │ Graduated│  │ Volume   │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
  
  What is being metered?  [ Compute hours ▾ ]  ← existing meter or create new
  
  (per-unit):   [ $ 0.035 ] per hour
  (block):      Block size [ 500 ]  Price [ $ 25 ]
  (graduated):  TierBuilder table
  (volume):     TierBuilder table

  Billing timing:   In arrears (locked for PAYG)
  Billing cycle:    [ Monthly ▾ ]
```

**Prepaid:**

```
  What is being sold?     [ Build minutes ▾ ]
  Block size:             [ 500 ] minutes
  Block price:            [ $ 25 ]
  Billing timing:         Immediate (locked)
  Expiration:             [ End of subscription period ▾ ]
```

### "What is being charged for?" — the resource/feature link

This dropdown is critical. It shows:
1. Existing mutable features from the service catalog (e.g. seats, build_minutes)
2. Existing metered resources (e.g. compute_hours, storage_gb)
3. "+ Create new" option for genuinely new things

When the user selects or creates something here, it becomes a **required feature** that will be pre-populated in Step 3. This is the bridge between pricing and features.

### Multiple rate cards

```
  Price #1                                              [🗑]
  Per unit · $20/seat/mo · In advance · Monthly

  Price #2                                              [🗑]
  Per unit · $180/seat/yr · In advance · Annual

  + Add another price
```

Common patterns:
- Monthly + annual (two rate cards, same resource, different cycles)
- Base subscription + overage (fixed card + per-unit PAYG card)

### Step 2 → Continue

Creates `rate_cards` row(s). Collapses. Step 3 fades in.

### Collapsed summary

```
┌───────────────────────────────────────────────────────────┐
│  ☐  Subscription · per unit · $8,000/repo/yr          [✎] │
│     In advance · Annual                                   │
└───────────────────────────────────────────────────────────┘
```


---

## Step 3: Features & Review

**Goal:** Configure entitlements, review everything, and finish.

This step combines what was previously Steps 2 and 4. Pricing drove the must-have features; now the user fills in the rest and reviews.

### Required features (from pricing)

Based on Step 2, some features are already identified as required. They appear at the top, pre-selected, with a note:

```
  REQUIRED BY PRICING
  These features are needed to support your rate card configuration.

  ┌───────────────────────────────────────────────────────────┐
  │  seats (General)                         required by pricing│
  │  Number of user seats in the organization                  │
  │  Value: [ 5 ]  Recurrence: [ one_time ▾ ]                 │
  └───────────────────────────────────────────────────────────┘
```

### Service & feature selection

Below the required features, show the full service catalog for additional configuration:

```
  ADDITIONAL SERVICES & FEATURES
  Select any additional services and configure their entitlements.

  ☑  General                    1 feature    (1 required by pricing)
  ☐  Docker Hub                15 features
  ☑  Docker Build               5 features
  ☐  Docker Scout              11 features
  ...
```

Selected services expand to show feature configuration (same as the previous v1 Step 2 — toggle for booleans, number input for integers, dropdowns for strings, recurrence picker).

### Review section

Below the feature configuration, show a read-only preview of the complete offering:

```
  ─────────────────────────────────────────────────────────────

  REVIEW

  ┌───────────────────────────────────────────────────────────┐
  │  DHI — ELS (Per-Repo)                                     │
  │  dhi-els-per-repo                                         │
  │  +5 yrs hardened updates for EOL software                 │
  │                                                           │
  │  [add-on] [subscription] [org]                            │
  │  $8,000/repo · annual · in advance                        │
  │  requires: DHI Enterprise (Per-Repo)                      │
  │                                                           │
  │  Services: Docker Hardened Images                          │
  │    dhi_els_enabled           ✓                            │
  │                                                           │
  │  Rate cards:                                               │
  │    Per-repo · per_unit · advance · annual                  │
  │    $8,000 / repo                                          │
  └───────────────────────────────────────────────────────────┘
```

### Finish actions

Two buttons:

| Action | What it does |
|--------|-------------|
| **Save & return to workspace** | Saves all data. Offering appears in the workspace as a card. Status stays draft. |
| **Save & add another** | Saves, then immediately starts a new offering wizard in the same workspace. Useful when building out a product line. |

Publishing happens at the workspace level, not per-offering.


---

## Publishing (workspace level + per-offering)

Publishing works at two levels:
- **Per-offering:** Each offering card's `⋯` menu has a "Publish" action. Useful for phased launches.
- **Publish all:** A top-level button on the workspace publishes all draft offerings at once.

### Per-offering publish

When publishing a single offering from the `⋯` menu, run validation for just that offering:

```
  ┌───────────────────────────────────────────────────────────┐
  │  Publish DHI — Select?                                     │
  │                                                           │
  │  ✓  Rate card configured ($5,000/repo/yr)                 │
  │  ✓  13 features configured                                │
  │  ⚠  No lifecycle transitions to other offerings (optional)│
  │                                                           │
  │  [ Cancel ]    [ Publish ]                                │
  └───────────────────────────────────────────────────────────┘
```

### Publish all

### Publish all pre-checks

Before publishing all draft offerings, validate the product line:

```
  ┌───────────────────────────────────────────────────────────┐
  │  Ready to publish Docker Hardened Images?                  │
  │                                                           │
  │  ✓  6 offerings configured                                │
  │  ✓  All offerings have at least one rate card             │
  │  ✓  All add-on dependencies reference valid offerings     │
  │  ⚠  No lifecycle transitions configured (optional)        │
  │                                                           │
  │  [ Configure transitions ]    [ Publish anyway ]          │
  └───────────────────────────────────────────────────────────┘
```

### Lifecycle transitions (optional, at publish time)

If the product line has multiple offerings of the same package type (like a good-better-best ladder), suggest transitions:

```
  Suggested transitions for Docker Hardened Images

  UPGRADES (immediate)
  ✓  DHI Free → DHI Select
  ✓  DHI Free → DHI Enterprise (Per-Repo)
  ✓  DHI Free → DHI Enterprise (Full Catalog)
  ✓  DHI Select → DHI Enterprise (Per-Repo)
  ✓  DHI Select → DHI Enterprise (Full Catalog)

  DOWNGRADES (end of period)
  ✓  DHI Select → DHI Free
  ✓  DHI Enterprise (Per-Repo) → DHI Select
  ✓  DHI Enterprise (Per-Repo) → DHI Free
  ...

  [ Edit ]  [ Accept all & publish ]
```

### Post-publish

```
  ┌───────────────────────────────────────────────────────────┐
  │  ✓  Docker Hardened Images has been published             │
  │     6 offerings are now active in the catalog             │
  │                                                           │
  │  Downstream systems that may need updating:               │
  │                                                           │
  │  ○  Stripe — product and price sync                       │
  │  ○  Salesforce — catalog update                           │
  │  ○  Metering service — meter configuration                │
  │  ○  Product UI (App, Desktop) — feature flags             │
  │  ○  docker.com (marketing) — pricing page                 │
  │  ○  Anrok (tax) — tax configuration                       │
  │                                                           │
  │  [ View in catalog ]   [ Create another product line ]    │
  └───────────────────────────────────────────────────────────┘
```


---

## Flow summary

```
"Create offering" button
        │
        ▼
┌─ What are you setting up? ─────────────────────────────┐
│                                                         │
│  [ New product line ]     [ Add to existing ]           │
│        │                        │                       │
│        ▼                        ▼                       │
│  Name/slug/desc           Pick group                    │
│        │                        │                       │
│        └───────────┬────────────┘                       │
│                    ▼                                    │
│         ┌─ Group Workspace ──────────────────────┐     │
│         │                                         │     │
│         │  OFFERINGS                              │     │
│         │  [ card ⋯ ] [ card ⋯ ] [+ Add offering]│     │
│         │                                         │     │
│         │  ADD-ONS                                 │     │
│         │  [ card ⋯ ] [ card ⋯ ] [+ Add add-on]  │     │
│         │                                         │     │
│         │              [ Publish ]                 │     │
│         └─────────────────────────────────────────┘     │
│                                                         │
│         "+ Add" or "Duplicate" launches:                 │
│                                                         │
│         ┌─ Start from ────────────────────────┐         │
│         │  ○ Blank                             │         │
│         │  ○ Duplicate [ existing offering ▾ ] │         │
│         └──────────────────────────────────────┘         │
│                    ▼                                    │
│         ① Basics (name, slug, account, deps)            │
│                    ▼                                    │
│         ② Pricing (monetization, rate cards)             │
│              prices blanked if duplicating               │
│                    ▼                                    │
│         ③ Features & Review (entitlements, preview)      │
│              values pre-filled if duplicating            │
│                    ▼                                    │
│         Save → back to workspace                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```


---

## Tables written per step

| Step | Tables affected |
|------|----------------|
| Product line setup | `offering_groups`, `offering_group_memberships` |
| Wizard Step 1 | `offerings` (draft), `offering_dependencies` (if add-on) |
| Wizard Step 2 | `rate_cards`, `metered_resources` (if new resource) |
| Wizard Step 3 | `offering_services`, `offering_features` |
| Publish | `offerings.status` → active, `offering_lifecycle_transitions` |


---

## Entry points

| From | Action | Result |
|------|--------|--------|
| Offerings index | "Create offering" button | Upfront question (new vs existing product line) |
| Group detail (View 2) | "Add offering" or "Add add-on" | Straight into wizard, group pre-selected |
| Group workspace | "+ Add offering" / "+ Add add-on" | Wizard with "blank or duplicate?" prompt |
| Group workspace | Offering card ⋯ → "Duplicate" | Wizard pre-populated from source offering |
| Offering detail (View 3) | "Duplicate" action (future) | Wizard pre-populated, lands in source group's workspace |


---

## Interaction patterns used

| Pattern | Where |
|---------|-------|
| SelectCard | Upfront question (new vs existing), package type |
| Progressive disclosure | Wizard steps collapse on continue |
| Linked fields | Name → slug auto-generation |
| RadioGroup | Free/paid, monetization strategy |
| Pills | Account type, sales channel, billing cycle, billing timing |
| PricingModelPicker | PAYG pricing model selection |
| TierBuilder | Graduated/volume tier config |
| Dropdown + create | Offering group, feature/resource picker |
| Tab navigation | Not needed — one offering at a time in the workspace |


---

## Design Decisions (resolved)

1. **Service creation inline.** New services and features can be created inline in the wizard (Step 3). The FeaturePicker's "+ Create new" pattern extends to services. Keeps PMs in flow rather than bouncing to the Features page.
2. **Editing after publish.** Active offerings can be edited directly, controlled by role-based permissions. The `version` field on every table provides optimistic locking and an audit trail of changes.
3. **Partial publish.** Per-offering publishing — each offering card in the workspace gets a "Publish" action in its `⋯` menu. A top-level "Publish all" button covers the common case of shipping a whole product line at once. Supports phased launches (ship Free and Select while Enterprise is still draft).
4. **All-addon product lines.** Keep the Offerings zone visible but empty, with an explanatory note: "No base offerings — this product line contains add-ons that attach to other product lines." Consistent layout across all workspaces.
5. **Diff view on duplicate.** Skip for MVP. The "from DHI Free" labels shown during editing in Step 3 are sufficient to track what's inherited vs what's been changed. Side-by-side diff can be added later if users request it.
