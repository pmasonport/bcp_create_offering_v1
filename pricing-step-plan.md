# Pricing Step — Planning Doc

## Context

Step 2 of the Create Offering wizard. The user has already provided: offering group, name, account type, sales channel, and optional description. Now they need to define how customers pay.

This step writes to the `rate_cards` table. Each rate card has a `pricing_type`, a `pricing_details` JSONB blob, `billing_timing`, `billing_cycle`, and links to a `service_id` and `feature_id`.


---

## What the On-Rails doc tells us

### Monetization strategies (how customers buy)

| Strategy | Description | Billing timing | Compatible pricing models |
|----------|-------------|---------------|--------------------------|
| Subscription | Recurring charge, can be flat or per-unit | Advance or arrears | Fixed, per-unit |
| PAYG | Usage-based, customer pays for what they use | Arrears only | Per-unit, block, graduated, volume |
| Prepaid (top-ups) | Customer buys blocks upfront, draws down over time | Advance (immediate) | Fixed only |
| One-time payment | Single charge, no recurrence | Advance or arrears | Fixed only |

**Key insight:** Monetization strategy constrains which pricing models are available. The form should enforce this — don't show graduated pricing for a subscription.

**Key insight #2:** The "what are you charging for?" question comes AFTER strategy selection but BEFORE pricing model. What you're charging for determines whether the pricing model options make sense.

### Pricing models (how charges are calculated)

| Model | Description | Use cases |
|-------|-------------|-----------|
| Fixed | Flat amount, no metering | Subscriptions ($10/mo), one-time fees |
| Per-unit | Price × quantity from meter | PAYG ($0.01/token), per-seat ($20/seat/mo) |
| Block | Fixed price per chunk of units | Prepaid minutes ($25/500-min), storage ($10/TB) |
| Graduated | Each unit priced by the tier it falls into | PAYG with free tier (first 1000 free, then $0.01/unit) |
| Volume | All units priced at highest achieved tier | Bulk seat discounts (1-10 seats: $20, 11-50: $15) |
| Fixed + per-unit | Base fee + per-unit overage | Base subscription + overage ($10/mo + $0.01/min over 1000) |

### Billing timing

| Timing | When charged | Used by |
|--------|-------------|---------|
| Advance | Start of period | Subscriptions, prepaid |
| Arrears | End of period | PAYG, some subscriptions |
| Immediate | On purchase | Prepaid top-ups |

### Billing cycle

| Cycle | Used by |
|-------|---------|
| Monthly | Subscriptions, PAYG |
| Annual | Subscriptions |
| Multiyear | Enterprise contracts |
| One-time | Prepaid, one-time payments |


---

## What the schema tells us

Each rate card row includes:

```
offering_id     → which offering this price belongs to
service_id      → which service this price is for
feature_id      → which feature is being priced (the "what")
pricing_type    → fixed, per_unit, block, graduated, volume, fixed_plus_per_unit
pricing_details → JSONB blob with model-specific config
billing_timing  → advance, arrears, immediate
billing_cycle   → monthly, annual, multiyear, one_time
currency        → USD (default)
list_price      → true for standard pricing, false for customer-specific
```

**An offering can have multiple rate cards.** Examples:
- Docker Pro: 2 rate cards (monthly fixed $11, annual fixed $108)
- Gordon Pro: 2 rate cards (monthly fixed $20, monthly per-unit overage $0.000001/credit)
- Sandboxes: 3 rate cards (CPU per-unit, memory per-unit, storage per-unit)

The `pricing_details` JSONB structure varies by type:

```
fixed:            { amount: { units: 11, nanos: 0 } }
per_unit:         { unit_amount: { units: 0, nanos: 35000000 }, unit: "vCPU-hour" }
block:            { block_size: 500, block_amount: { units: 25, nanos: 0 } }
graduated:        { tiers: [{ first: 0, last: 1000, per_unit: 0, fixed: 0 }, ...] }
volume:           { tiers: [{ first: 0, last: 1000, per_unit: 0, fixed: 0 }, ...] }
fixed_plus_per_unit: { fixed_amount: {...}, unit_amount: {...}, included_units: 1000 }
```


---

## Form flow

### Question 1: Free or paid?

```
┌─────────────────┐  ┌─────────────────┐
│  Free            │  │  Paid            │
│  No charge       │  │  Customers pay   │
└─────────────────┘  └─────────────────┘
```

- **Free** → auto-creates a single rate card (fixed, $0, advance, monthly). Skip to Step 3.
- **Paid** → show Question 2.

### Question 2: Monetization strategy

Dropdown with 4 options. Each option constrains what appears next.

```
[ Recurring subscription — charged monthly, annually, or both     ▾ ]
  Pay-as-you-go — charged based on actual usage
  Prepaid — customer buys blocks upfront
  One-time payment — single charge
```

### Question 3: What is being charged for?

This is the critical question. It appears right after strategy, before any pricing model or price inputs. What's shown depends on the strategy:

**Subscription / Prepaid / One-time:**
- Shows a combined list of mutable features AND metered features from the offering's services
- If the user picks a metered feature → a second dropdown appears asking "Which resource?" showing metered resources linked to that feature's meter(s)
- If the user picks a mutable (non-metered) feature → no resource picker needed, go straight to pricing model

**PAYG:**
- Shows a list of meters (not features — PAYG starts from what's being measured)
- After picking a meter → a second dropdown appears asking "Which resource?" showing metered resources linked to that meter
- This is the inverse of the subscription path: PAYG thinks in meters → resources, subscription thinks in features → (optionally) resources

**Why the difference:** Subscriptions sell access to a feature ("you get 5 seats"). The feature is the thing. PAYG sells usage of a metered dimension ("you pay per vCPU-hour"). The meter is the thing.

### Question 4+: Strategy-specific pricing configuration

With the "what" established, now configure "how much."


---

## Strategy: Subscription

The most common path. Produces 1–2 rate cards (monthly, annual, or both).

### Flow

1. **What is being charged for?** → dropdown of mutable + metered features
   - If metered feature selected → "Which resource?" sub-dropdown
2. **Pricing model** → Fixed or Per-unit
   - If the selected feature is something with quantity (seats, repos) → per-unit makes sense
   - If the offering is a flat access fee → fixed makes sense
   - Both are always available; the feature selection just guides the default
3. **Billing period** → Monthly / Annual / Both
4. **Price inputs** → depends on billing period (1 or 2 fields)
5. **Billing timing** → defaults to In advance, changeable

### Fields

| Field | Input | Notes |
|-------|-------|-------|
| What is being charged for? | Dropdown | Mutable + metered features. If metered → resource sub-picker. If fixed pricing → this can be skipped ("the offering as a whole") |
| Pricing model | Dropdown: Fixed / Per-unit | Fixed = flat fee. Per-unit = per seat, per repo, etc. |
| Billing period | Dropdown: Monthly / Annual / Both | Determines how many rate cards are created |
| Monthly price | Currency input | Shows if billing period includes monthly |
| Annual price | Currency input | Shows if billing period includes annual |
| Billing timing | Dropdown: In advance / In arrears | Defaults to "In advance" for subscriptions |

### Special case: Fixed pricing

When the user selects "Fixed" as pricing model, the "What is being charged for?" dropdown becomes optional — a fixed subscription is just "pay this amount for access to the offering." No specific feature is being priced. The rate card's `feature_id` can be null.

### Rate cards created

| Billing period | Rate cards |
|---------------|-----------|
| Monthly only | 1 card: monthly, advance |
| Annual only | 1 card: annual, advance |
| Both | 2 cards: monthly + annual, both advance |

### Form layout

```
┌─ Subscription ──────────────────────────────────────┐
│                                                      │
│  What is being charged for?                          │
│  [ Seats (General)                           ▾ ]    │
│  ↳ only mutable + metered features from services     │
│                                                      │
│  (if metered feature selected:)                      │
│  Which resource?                                     │
│  [ Docker Seat                               ▾ ]    │
│                                                      │
│  Pricing model          Billing period               │
│  [ Per unit        ▾ ]  [ Monthly & annual   ▾ ]    │
│                                                      │
│  Monthly price          Annual price                 │
│  [ $ 20    ] /unit/mo   [ $ 180   ] /unit/yr        │
│                                                      │
│  Billing timing                                      │
│  [ In advance                                ▾ ]    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Docker examples

| Offering | Feature | Model | Prices |
|----------|---------|-------|--------|
| Docker Personal | (none — fixed) | Fixed | $0/mo |
| Docker Pro | (none — fixed) | Fixed | $11/mo, $108/yr |
| Docker Team | Seats | Per-unit | $16/seat/mo, $180/seat/yr |
| Docker Business | Seats | Per-unit | $24/seat/yr |
| DHI Select | DHI repos | Per-unit | $5,000/repo/yr |
| Gordon Pro | (none — fixed) | Fixed | $20/mo |
| Gordon Pro Overage | Gordon credits (via PAYG add-on) | — | See PAYG path |


---

## Strategy: Pay-As-You-Go (PAYG)

Usage-based. Always billed in arrears. Produces 1 rate card per metered resource.

### Flow

1. **Which meter?** → dropdown of meters (not features — PAYG starts from what's being measured)
2. **Which resource?** → dropdown of metered resources linked to that meter
3. **Pricing model** → SelectCards: Per-unit / Block / Graduated / Volume
4. **Price inputs** → depends on model (simple input, or TierBuilder for graduated/volume)

### Fields

| Field | Input | Notes |
|-------|-------|-------|
| Which meter? | Dropdown | Shows all active meters. Each shows: name, service, unit type |
| Which resource? | Dropdown | Shows metered resources linked to the selected meter |
| Pricing model | SelectCards: Per-unit / Block / Graduated / Volume | Visual cards with bar chart illustrations |
| Price | Currency input (per-unit, block) or TierBuilder (graduated, volume) | Input format changes based on model |
| Block size | Number input (block only) | How many units per block |
| Billing cycle | Locked to Monthly | PAYG is always monthly arrears |

### Why meters first?

PAYG is fundamentally about metering. The PM is thinking "I want to charge for compute usage" — that's a meter. The meter tells you what unit type you're working with (vCPU-hours, minutes, requests), which constrains the pricing model. The resource is the specific billable configuration (Small vs Medium vs Large sandbox).

This is the inverse of the subscription path where you think in features ("I want to sell seats") and optionally connect to metering.

### Model-specific inputs

**Per-unit:**
```
  Price per unit    [ $ 0.035  ] / vCPU-hour
```

**Block:**
```
  Block size        [ 500      ] minutes
  Price per block   [ $ 25     ]
```

**Graduated / Volume — TierBuilder:**
```
  ┌──────────┬──────────┬──────────────┬──────────────┐
  │ From     │ To       │ Per-unit ($) │ Fixed ($)    │
  ├──────────┼──────────┼──────────────┼──────────────┤
  │ 0        │ 1,000    │ 0.00         │ 0.00         │
  │ 1,001    │ 5,000    │ 0.30         │ 50.00        │
  │ 5,001    │ ∞        │ 0.10         │ 0.00         │
  └──────────┴──────────┴──────────────┴──────────────┘
  [ + Add tier ]
```

### Form layout

```
┌─ PAYG ──────────────────────────────────────────────┐
│                                                      │
│  Which meter?                                        │
│  [ Sandbox CPU Usage (vCPU-hours)            ▾ ]    │
│                                                      │
│  Which resource?                                     │
│  [ Sandbox — Small (2 vCPU, 4 GB)           ▾ ]    │
│                                                      │
│  Pricing model                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │ Per  │  │Block │  │Grad. │  │Volume│            │
│  │ unit │  │      │  │      │  │      │            │
│  └──────┘  └──────┘  └──────┘  └──────┘            │
│                                                      │
│  Price per unit                                      │
│  [ $ 0.035  ] / vCPU-hour                           │
│                                                      │
│  Billing: Monthly · In arrears (locked)              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Docker examples

| Offering | Meter | Resource | Model | Price |
|----------|-------|----------|-------|-------|
| Sandboxes | Sandbox CPU | Small (2cpu/4gb) | Per-unit | $0.035/vCPU-hr |
| Sandboxes | Sandbox Memory | Small (2cpu/4gb) | Per-unit | $0.005/GB-hr |
| Gordon Enterprise | Gordon Request Count | Gordon Token | Per-unit | $0.01/request |
| TC On-Demand | TC Runtime Minutes | TC Worker | Per-unit | $0.04/min |

### Rate cards created

1 rate card per configuration. The pricing model determines the `pricing_type` and `pricing_details` structure.


---

## Strategy: Prepaid (top-ups)

Customer buys blocks upfront. Always billed immediately. Produces 1 rate card.

### Flow

1. **What is being sold?** → dropdown of mutable + metered features
   - If metered feature → "Which resource?" sub-dropdown
2. **Block size** → how many units per block
3. **Block price** → price per block
4. **Expiration** → when unused blocks expire

### Fields

| Field | Input | Notes |
|-------|-------|-------|
| What is being sold? | Dropdown | Mutable + metered features (same list as subscription) |
| Which resource? | Dropdown (if metered) | Metered resources linked to the feature's meter |
| Block size | Number input | How many units per block |
| Block price | Currency input | Price per block |
| Expiration | Dropdown | End of billing period / End of subscription / Custom |

### Form layout

```
┌─ Prepaid ────────────────────────────────────────────┐
│                                                      │
│  What is being sold?                                 │
│  [ Build minutes (Docker Build)              ▾ ]    │
│                                                      │
│  Which resource?                                     │
│  [ Standard Build (4 CPU / 8 GB)             ▾ ]    │
│                                                      │
│  Block size             Block price                  │
│  [ 500      ] minutes   [ $ 25     ]                │
│                                                      │
│  Expiration                                          │
│  [ End of subscription period                ▾ ]    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Docker examples

| Offering | Feature | Resource | Block | Price |
|----------|---------|----------|-------|-------|
| Build Cloud Minutes | Build minutes | Standard Build | 500 min | $25 |
| TC Prepaid | TC runtime minutes | TC Worker | 100 min | $3 |

### Rate cards created

1 rate card: block pricing, immediate timing, one_time cycle.


---

## Strategy: One-time payment

Single charge. Produces 1 rate card.

### Fields

| Field | Input | Notes |
|-------|-------|-------|
| Price | Currency input | The amount |
| Billing timing | Dropdown: Immediate / In advance | When to charge |

### Form layout

```
┌─ One-time ───────────────────────────────────────────┐
│                                                      │
│  Price                  Billing timing               │
│  [ $ 500   ]            [ Immediate          ▾ ]    │
│                                                      │
└──────────────────────────────────────────────────────┘
```


---

## Multiple rate cards

An offering can have more than one rate card, but **all rate cards within an offering share the same monetization strategy**. If you need a different strategy, create a separate offering (typically an add-on).

### Rule: One offering = one strategy

| Want this? | Do this |
|-----------|---------|
| Monthly + annual subscription | One offering, two rate cards (same strategy, different billing cycles) |
| Base fee + usage overage | Two offerings — subscription base + PAYG add-on (different strategies = separate offerings) |
| Multiple metered resources | One offering, batch rate cards per meter (same PAYG strategy) |
| Subscription + prepaid top-ups | Two offerings — subscription base + prepaid add-on |

### Why?

Mixing strategies in one offering creates confusion in both the catalog ("is Gordon Pro a subscription or PAYG?") and the billing system (advance + arrears on the same offering). Keeping them separate means:
- Each offering card in the catalog shows one clear price and one strategy badge
- The billing system processes each offering independently
- Lifecycle transitions (upgrade/downgrade) are clean — you upgrade the subscription, the PAYG add-on follows via its dependency

### Gordon example (correct model)

| Offering | Strategy | Price | Requires |
|----------|----------|-------|----------|
| Gordon Pro | Subscription (fixed) | $20/mo | Any DSoP |
| Gordon Pro Overage | PAYG (per-unit) | $0.000001/credit | Gordon Pro |
| Gordon Max | Subscription (fixed) | $50/mo | Any DSoP |
| Gordon Max Overage | PAYG (per-unit) | $0.000001/credit | Gordon Max |

The overage is an add-on with a dependency on the base offering. Clean separation.

### Valid reasons for multiple rate cards within one offering

| Pattern | Example | Cards created |
|---------|---------|--------------|
| Monthly + annual | Docker Team: $16/seat/mo + $180/seat/yr | 2 cards (same per-unit strategy, different cycles) |
| Batch resources | Sandboxes CPU: Small $0.035, Medium $0.07, Large $0.14 | 3 cards (same PAYG strategy, different resources) |
| Monthly + annual (fixed) | Docker Pro: $11/mo + $108/yr | 2 cards (same fixed strategy, different cycles) |

### UX for multiple rate cards

After configuring the first rate card, show a summary and offer "+ Add another price." The strategy is locked — the new card inherits it. Only the feature/meter, resource, pricing model, billing cycle, and price can differ.

```
  RATE CARDS

  ┌───────────────────────────────────────────────────┐
  │  Price #1                                    [🗑] │
  │  Per unit · $16/seat/mo · In advance · Monthly    │
  └───────────────────────────────────────────────────┘
  ┌───────────────────────────────────────────────────┐
  │  Price #2                                    [🗑] │
  │  Per unit · $180/seat/yr · In advance · Annual    │
  └───────────────────────────────────────────────────┘

  + Add another price
```

For subscriptions with "Both" billing period selected, auto-create two cards (monthly + annual). For PAYG with batch resources, create one card per priced resource.


---

## The feature/meter link (critical)

The "what is being charged for?" question is the bridge between pricing and entitlements. It determines which `feature_id` and optionally which `metered_resource` the rate card connects to.

### Two paths based on strategy

```
SUBSCRIPTION / PREPAID / ONE-TIME          PAYG
─────────────────────────────              ─────────────────────────
Start from FEATURES                        Start from METERS
   ↓                                          ↓
List of mutable + metered features         List of meters
(seats, build_minutes, repos, etc.)        (Sandbox CPU, Build Minutes, etc.)
   ↓                                          ↓
If metered feature selected:               Pick a metered resource
  → pick metered RESOURCE                  (Small sandbox, Standard Build, etc.)
(Standard Build, TC Worker, etc.)
```

### Why the split?

**Subscriptions** sell access to a feature. "You get seats." "You get repos." The feature is the commercial concept. Metering is an implementation detail — seats are tracked, but the PM thinks in features.

**PAYG** sells metered usage. "You pay per vCPU-hour." The meter is the commercial concept. The PM is thinking about the unit of measurement, not the feature that gates it. The resource is the specific billable config (which sandbox size).

### Dropdown contents by strategy

| Strategy | First dropdown | Shows | Second dropdown | Shows |
|----------|---------------|-------|----------------|-------|
| Subscription (fixed) | Optional: feature | Mutable + metered features, or "Offering as a whole" | Resource (if metered) | Resources linked to feature's meter |
| Subscription (per-unit) | Required: feature | Mutable + metered features | Resource (if metered) | Resources linked to feature's meter |
| PAYG | Required: meter | All active meters | Required: resource | Resources linked to selected meter |
| Prepaid | Required: feature | Mutable + metered features | Resource (if metered) | Resources linked to feature's meter |
| One-time | Optional: feature | Mutable + metered features, or "Offering as a whole" | Resource (if metered) | Resources linked to feature's meter |

### What this writes

The selection maps to rate card fields:
- `feature_id` → the selected feature (subscription/prepaid/one-time) or the meter's linked feature (PAYG)
- `service_id` → inferred from the feature or meter
- The metered resource selection doesn't write to the rate card directly — it informs the `pricing_details` JSONB (what unit label to show) and helps pre-populate Step 3's entitlements

### Pre-populating Step 3

Whatever feature/meter the PM selects here becomes a **required entitlement** in Step 3. If they're charging per seat, Step 3 will show "seats" as a required feature with a note "required by pricing — this feature supports your rate card." The PM just sets the default value.


---

## Validation rules

| Rule | Applies to |
|------|-----------|
| At least 1 rate card for paid offerings | All paid |
| Price > 0 for paid offerings | All paid |
| Feature must be selected for per-unit pricing | Subscription (per-unit), prepaid |
| Meter must be selected | PAYG |
| Resource must be selected when meter/metered feature is chosen | PAYG, subscription/prepaid with metered feature |
| Block size > 0 | Block pricing |
| At least 2 tiers for graduated/volume | Tiered models |
| Tiers must be contiguous (no gaps) | Tiered models |
| Last tier must end at ∞ | Tiered models |
| Billing timing locked to arrears for PAYG | PAYG |
| Billing timing locked to immediate for prepaid | Prepaid |
| Feature is optional for fixed pricing | Subscription (fixed), one-time |


---

## What we should build for the prototype

For the demo conversation with Mark, Dave, and Roberta, we need to show:

1. **The free/paid fork** — already built
2. **Subscription path** — the most common case (DSoP, DHI). Show feature picker, pricing model (fixed/per-unit), billing period, price inputs. The "which feature" dropdown is critical for the On-Rails conversation.
3. **PAYG path** — show meter picker, resource picker, the 4 pricing model cards (per-unit, block, graduated, volume). The TierBuilder for graduated/volume is the most impressive thing to demo. Batch pricing per meter for multi-resource offerings.
4. **Prepaid path** — feature picker, block size + price.
5. **One-time** — trivial, just price input.
6. **Multiple rate cards** — show the summary + "+ Add another" pattern. Docker Team (monthly + annual) and Sandboxes (batch resources) are the demo scenarios. Strategy is locked per offering.

### What we can skip for the prototype

- Currency selection (everything is USD)
- Custom pricing (list_price = false, account-specific)
- Effective/expiration dates
- External price ID fields (those are system-generated)
- Multiyear billing cycle


---

## Design decisions (resolved)

1. **One offering = one monetization strategy.** If you need a different strategy (e.g. base subscription + PAYG overage), create separate offerings. Gordon Pro ($20/mo subscription) and Gordon Pro Overage ($0.000001/credit PAYG) are two offerings, with the overage as an add-on that depends on the base. This keeps the catalog clean (one badge, one price per card), the billing system simple (no advance + arrears on the same offering), and the form straightforward ("+ Add another price" never re-asks strategy).

2. **Feature creation inline via drawer.** If the PM needs a new feature that doesn't exist yet, they click "+ Create new feature" at the bottom of the dropdown. A drawer slides in with the full feature form (name, slug, type, mutable, metering, service, description). Save it, it appears selected. Keeps the PM in context without cramming a form into an inline panel.

3. **TierBuilder has both columns.** Graduated and volume tiers support both per-unit price AND fixed fee per tier — matches the On-Rails spec exactly. The audience wrote the spec, they'll expect to see it. The TierBuilder table has four columns: From, To, Per-unit ($), Fixed ($).

4. **No free tier shortcut.** PM builds a $0 first row in the TierBuilder manually. Simple enough — it's just an empty row.

5. **Batch pricing per meter for PAYG.** When a meter has multiple resources (like Sandboxes), the form shows all resources in a table and the PM prices each one. Empty price = skip. Creates one rate card per priced resource. Sandboxes goes from 9 clicks to 3 steps.

6. **Feature dropdown shows full catalog.** Grouped by service for scannability. Not filtered by offering group — the PM knows what they're looking for. If the feature doesn't exist, drawer creation.

7. **"+ Add another price" inherits strategy.** The strategy is set once per offering. Additional rate cards can only change the feature/meter, resource, pricing model, billing cycle, and price. Never the strategy. If you need a different strategy, create a different offering.


---

## Sales-led strategies (out of scope for self-serve form)

The On-Rails doc defines two additional monetization strategies that are sales-led only:

### Minimum Fee Commitment (MFC)

Customer commits to a minimum annual spend, gets discounted rates, overage at discounted rates. The doc calls it "a special case PAYG with additional minimum spend mechanics."

- Always sales-led / contract-based
- Requires: commitment amount, term length, discounted rate schedule
- Not something a PM configures through the self-serve create form

### Manual Billing

Catch-all for one-off cases — custom invoices with arbitrary line items. The On-Rails doc explicitly says this "should be discouraged" and "should only be used in the event that it is absolutely necessary."

### How to handle in the form

Don't show these in the monetization strategy dropdown. If a user needs MFC or manual billing, they're working with sales operations, not the BCP console. We could add a subtle note: "Need custom pricing? Sales-led strategies like Minimum Fee Commitments are configured through Sales Operations."


---

## Overlays (future — not in pricing step)

The On-Rails doc defines "overlays" — temporary or conditional modifications to standard pricing. These are NOT part of the rate card configuration. They're applied on top of existing pricing. Eventually they'd live in their own section of BCP (maybe under "Promotions" or "Pricing Rules").

| Overlay | Description | Example |
|---------|-------------|---------|
| Free trial (time-based) | Full access for X days, then billing starts | 14-day free trial |
| Reverse trial | Premium access, auto-downgrade after trial | Start on Pro, downgrade to Free after 30 days |
| Monetary cap on trial | Limit spend during trial | Free trial up to $100 in usage |
| Percentage discounts | Reduce price by X% | 20% off annual commitments |
| Monetary credits | Dollar-value credit on account | $100 credit for new customers |
| Usage credits | Free usage grant | 1000 bonus API calls |
| Grandfathering | Existing customers keep old pricing | Maintain $10/mo when new price is $15/mo |

### Why they don't belong in the pricing step

Overlays are applied at the account/purchase level, not the offering level. A rate card says "seats cost $20/mo." An overlay says "this specific customer gets 20% off for 6 months." Different layers.

For the prototype demo, we should mention overlays exist ("here's where promotions would be configured — separate from the base pricing") but not build the UI.


---

## Schema fields we skip for MVP

| Field | Reason |
|-------|--------|
| `currency` | Locked to USD |
| `list_price` | Always `true` (standard pricing). Customer-specific pricing is a sales ops flow |
| `account_id` | Only used for custom pricing |
| `external_price_id` | Auto-generated when syncing to Stripe post-publish |
| `external_system` | Auto-set to "stripe" on sync |
| `effective_date` | No scheduled pricing for MVP — prices are effective on publish |
| `expiration_date` | No price expiration for MVP |

These fields exist in the schema and matter for production, but the create form doesn't need to surface them. They're either auto-populated or only relevant for sales-led flows.
