# Comprehensive Audit: Pricing Builder vs. Reference Documentation

**Date**: 2026-03-06
**Last Updated**: 2026-03-06
**Status**: Updated with recent builder improvements
**Purpose**: Document alignment, gaps, and ambiguities between the Pricing Builder implementation, data-model.md schema, and Billing@Docker On-Rails v2026 PDF

---

## Executive Summary

This audit provides a comprehensive comparison of the Pricing Builder implementation against Docker's billing reference documentation. Key findings:

- **✅ Strong Alignment**: Core monetization strategies (subscription, PAYG, prepaid, one-time, MFC) are well-aligned
- **⚠️ 15 Significant Gaps**: Builder missing critical capabilities like fixed-plus-per-unit pricing, service/feature hierarchy, and entitlement configuration
- **🚀 Overreach Areas**: Builder implements sophisticated metered subscription features with unclear data model mapping
- **🔴 5 Critical Unknowns**: Must clarify MFC storage, metered subscription configuration, trial persistence, and multi-strategy offerings

---

## Context

The Pricing Builder has been built with various pricing strategies and combinations. We need to conduct a thorough audit to:
1. Document all pricing strategies and combinations supported by the builder
2. Compare against the data-model.md schema
3. Compare against the Billing@Docker On-Rails v2026 PDF
4. Identify gaps, overreach, and ambiguities between the docs themselves

This audit will ensure the builder aligns with the supported billing functionality and identify where we may have implemented features that aren't on-rails or missed important capabilities.

---

## Pricing Builder: Complete Inventory

### Supported Monetization Strategies

The builder supports **5 primary monetization strategies**:

#### 1. SUBSCRIPTION
- **Access-based**: Fixed unlimited access (whatGet='access')
- **Mutable Quantity**: Fixed quantity per period (whatGet='quantity', featureType='mutable')
- **Metered Quantity**: Usage-based with allowances (whatGet='quantity', featureType='metered')

**Configuration Options:**
- Timing: advance, arrears
- Billing Cycle: monthly, annual, both
- Pricing: per-cycle or per-unit
- **Metered-specific:**
  - Recurrence patterns: hourly, daily, weekly, monthly, annual (separate for monthly vs annual billing)
  - Included amounts: different per billing cycle
  - Overage behavior: hardstop, payg (with overage rate)
  - Rollover: yes/no, with cap options (multiplier, fixed amount, or unlimited)

#### 2. PAY-AS-YOU-GO (PAYG)
- **Timing**: Always monthly, in arrears (hardcoded)
- **Pricing Models**:
  - Per-unit: Fixed price per unit
  - Block: Price per block of N units
  - Graduated: Tiered pricing (each unit at tier rate)
  - Volume: Tiered pricing (all units at highest tier)
- **Features**:
  - Multiple resources per offering
  - Unlimited tiers for graduated/volume
  - Mixed models in single offering

#### 3. PREPAID WITH TOP-UPS
- **Configuration**:
  - Single resource
  - Multiple pack sizes (qty + price)
  - Expiry: yes/no (with months if yes)
  - Stackability: add to balance vs replace balance
- **Timing**: Always advance (hardcoded)

#### 4. ONE-TIME PAYMENT
- **Configuration**:
  - Timing: advance or arrears
  - Fixed amount
- Simplest strategy

#### 5. MINIMUM FEE COMMITMENT (MFC)
- **Configuration**:
  - Multiple offerings in scope
  - Optional per-offering discounts
  - Commitment details NOT in UI (negotiated per-customer)
- **Note**: Described as "special case PAYG"

### Free Offerings
- Not a pricing strategy but a separate path
- Options: automatic access or opt-in required
- No pricing components

### Trials (Overlays)
Three trial types that overlay on paid offerings:
- **Timed Trial**: Duration + (bill or downgrade after)
- **Reverse Trial**: Duration + auto-downgrade to offering
- **Monetary Cap Trial**: Dollar cap + (bill or suspend after)

### Combination Rules

**Supported Combinations:**
1. Base offering + Add-ons (unlimited add-ons)
2. Base offering + Trial overlay (one trial only)
3. Add-on must specify compatible base offerings
4. Each component can use ANY of the 5 strategies

**Prevented Combinations:**
- Free offerings cannot have pricing components
- Add-ons cannot have add-ons (only base offerings)
- Multiple trials per offering
- PAYG cannot be advance timing (always arrears)
- Prepaid cannot be arrears (always advance)

---

## Comparison: Builder vs. Data Model

### ✅ ALIGNED: What Matches

#### Offering Structure
| Builder | Data Model | Status |
|---------|------------|--------|
| Base offering | offering_package='bundle' or 'standalone' | ✅ MATCH |
| Add-on | offering_package='add_on' | ✅ MATCH |
| Compatible with | offering_dependencies table | ✅ MATCH |

#### Monetization Strategies
| Builder | Data Model | Status |
|---------|------------|--------|
| subscription | monetization_strategy='subscription' | ✅ MATCH |
| payg | monetization_strategy='payg' | ✅ MATCH |
| prepaid | monetization_strategy='prepaid' | ✅ MATCH |
| onetime | monetization_strategy='one_time' | ✅ MATCH |

#### Rate Card Pricing Models
| Builder | Data Model (pricing_type) | Status |
|---------|---------------------------|--------|
| Fixed (subscription access) | 'fixed' | ✅ MATCH |
| Per-unit (subscription mutable) | 'per_unit' | ✅ MATCH |
| Graduated tiers | 'graduated' | ✅ MATCH |
| Volume tiers | 'volume' | ✅ MATCH |
| Block pricing | 'block' | ✅ MATCH |

#### Billing Timing
| Builder | Data Model | Status |
|---------|------------|--------|
| advance | billing_timing='advance' | ✅ MATCH |
| arrears | billing_timing='arrears' | ✅ MATCH |

#### Billing Cycles
| Builder | Data Model | Status |
|---------|------------|--------|
| monthly | billing_cycle='monthly' | ✅ MATCH |
| annual | billing_cycle='annual' | ✅ MATCH |
| both (UI choice) | Separate rate_cards per cycle | ✅ LOGICAL |

### ⚠️ GAPS: Builder Missing Data Model Capabilities

#### 1. **CRITICAL: Fixed Plus Per-Unit Pricing**
- **Data Model**: pricing_type='fixed_plus_per_unit' with base_price + unit_price + included_units
- **Builder**: NOT SUPPORTED
- **Example**: $30/month base + $0.005/minute after 200 included minutes
- **Impact**: Cannot configure this common pricing pattern

#### 2. **Billing Cycles**
- **Data Model**: Supports 'multiyear' and 'one_time' billing_cycle
- **Builder**: Only supports monthly, annual
- **Gap**: Cannot configure multi-year contracts or true one-time billing cycles

#### 3. **Multi-Component Offerings as Single DB Row**
- **Data Model**: Each rate_card is a separate row with offering_id + service_id + feature_id
- **Builder**: Exports as components array (multiple strategies per offering)
- **Ambiguity**: How does builder's multi-component export map to multiple rate_card rows?
- **Question**: Does one offering with subscription + PAYG become 2 rate_cards or is there aggregation?

#### 4. **Service + Feature Hierarchy**
- **Data Model**: Requires service_id AND feature_id on rate_cards, with composite FK enforcement
- **Builder**: Only captures feature name as string (e.g., "seats", "Build Minutes")
- **Gap**: No service association, no validation that feature belongs to service
- **Impact**: Builder can create invalid configurations (feature from wrong service)

#### 5. **Offering Services (Layer 1)**
- **Data Model**: offering_services table declares which services are in offering
- **Builder**: Not captured at all
- **Gap**: Cannot declare service inclusion separately from pricing
- **Example**: Docker Team includes general, hub, admin, build, scout services (declared in offering_services before configuring features)

#### 6. **Offering Features (Layer 2 - Entitlements)**
- **Data Model**: offering_features table defines default values for each feature
- **Builder**: Not captured
- **What's Missing**: Default feature values separate from pricing (e.g., Docker Team gets 5 seats by default, even if they don't buy more)
- **Example**: Docker Team base includes 800 build minutes (offering_features), plus can buy more packs (rate_cards for prepaid)

#### 7. **Feature Metadata**
- **Data Model**: Features have mutable flag, metering_type, feature_aggregation, allowed_string_values
- **Builder**: Only captures feature name and distinguishes metered vs mutable
- **Gap**: No metering_type (static/simple/aggregated), no aggregation rules (sum/max/newest)

#### 8. **Recurrence Period on Entitlements**
- **Data Model**: offering_features.recurrence_period (daily/monthly/annual/one_time) - when entitlement refreshes
- **Builder**: Has recurrence for metered subscriptions but as billing configuration, not entitlement refresh
- **Ambiguity**: Builder's "recurrence" (hourly/daily/monthly) seems different from data model's entitlement refresh

#### 9. **Resource Meters**
- **Data Model**: metered_resources + meters + resource_meters (M:N) for usage tracking
- **Builder**: Only captures resource names as strings (e.g., "Sandbox compute (vCPU-hrs)")
- **Gap**: No meter association, no unit_type FK, no UBB meter ID

#### 10. **Account-Specific Pricing**
- **Data Model**: rate_cards.list_price (boolean) + account_id for custom pricing
- **Builder**: Not supported
- **Gap**: Cannot distinguish list price vs customer-specific pricing

#### 11. **External System Integration**
- **Data Model**: external_price_id, external_system, external_meter_id fields
- **Builder**: Not captured
- **Gap**: No Stripe price ID, no UBB meter mapping

#### 12. **Effective/Expiration Dates**
- **Data Model**: effective_date, expiration_date on rate_cards
- **Builder**: Not captured
- **Gap**: Cannot configure time-bound pricing

#### 13. **Offering Dependencies (requires/excludes/recommended)**
- **Data Model**: offering_dependencies with dependency_type enum
- **Builder**: Only supports "requires" (compatibleWith for add-ons)
- **Gap**: Cannot configure exclusions or recommendations

#### 14. **Offering Lifecycle Transitions**
- **Data Model**: offering_lifecycle_transitions table for upgrades/downgrades
- **Builder**: Not captured
- **Gap**: No upgrade/downgrade path configuration

#### 15. **Offering Groups**
- **Data Model**: offering_groups + offering_group_memberships for multi-group offerings
- **Builder**: Not captured
- **Gap**: Cannot assign offerings to product groups (e.g., DSoP)

### 🚀 OVERREACH: Builder Goes Beyond Data Model

#### 1. **Metered Quantity Subscriptions (Complex Configuration)**
- **Builder**: Full metered subscription config with:
  - Separate recurrence per billing cycle (monthly subscription can have daily allowance reset)
  - Separate included amounts per cycle
  - Overage behavior (hardstop vs payg with rate)
  - Rollover with cap options (multiplier, fixed amount, or unlimited)
- **Data Model**: Has offering_features with recurrence_period but NOT on rate_cards
- **Question**: How does builder's metered config map to data model?
- **Possible mapping**:
  - billing_cycle → rate_cards.billing_cycle
  - recurrence → offering_features.recurrence_period
  - includedAmount → offering_features.value
  - overage → separate rate_card with pricing_type='per_unit'?
  - rollover → NOT IN DATA MODEL

**CRITICAL UNKNOWN**: Rollover cap configuration (including unlimited option) has no data model equivalent. Where does this live?

#### 2. **"Both" Billing Cycle UI**
- **Builder**: Single component with cycle='both' exports as multiple rate_cards
- **Data Model**: No 'both' enum value, only monthly/annual/multiyear/one_time
- **Assumption**: Builder transforms 'both' into 2 separate rate_cards (one monthly, one annual)
- **Verified**: Transformation logic does create separate rateCards (pricingTransform.js lines 26-83)

#### 3. **Trials as Separate Overlay**
- **Builder**: Trial stored separately from components
- **Data Model**: No trial tables or fields on offerings
- **Gap**: Trials not in data model schema at all
- **Unknown**: How are trials persisted? offering_lifecycle_transitions? Separate table?

#### 4. **Free Offerings with Opt-In**
- **Builder**: Free offerings have freeOptIn (automatic vs optin)
- **Data Model**: No equivalent field
- **Gap**: Free offering access control not in data model

#### 5. **Session-Created Features**
- **Builder**: Can create new features/resources inline during configuration
- **Data Model**: Features must exist in service_features table first
- **Workflow gap**: Builder allows ad-hoc feature creation but data model requires pre-registration

#### 6. **Custom Offerings for Add-on Compatibility**
- **Builder**: Can create custom offerings inline when configuring add-on compatibleWith
- **Data Model**: Offerings must exist in offerings table first
- **Workflow gap**: Builder allows placeholder offerings but data model requires pre-registration

---

## Comparison: Builder vs. On-Rails Doc

### ✅ ALIGNED: What Matches

#### Monetization Strategies
| Builder | On-Rails Doc | Status |
|---------|--------------|--------|
| Subscription | Subscriptions (standalone) | ✅ MATCH |
| PAYG | Pay-As-You-Go (PAYG, standalone) | ✅ MATCH |
| Prepaid w/ Top-Ups | Prepaid w/ Top-Ups (standalone) | ✅ MATCH |
| One-time | One Time Payment (standalone) | ✅ MATCH |
| MFC | Minimum Fee Commitment (MFC) | ✅ MATCH |

#### Pricing Models
| Builder | On-Rails Doc | Status |
|---------|--------------|--------|
| Fixed | Fixed Pricing | ✅ MATCH |
| Per-unit | Per Unit Pricing | ✅ MATCH |
| Block | Block Pricing | ✅ MATCH |
| Graduated | Graduated Pricing | ✅ MATCH |
| Volume | Volume Pricing | ✅ MATCH |

#### Bundles & Add-Ons
| Builder | On-Rails Doc | Status |
|---------|--------------|--------|
| Base offering | Bundle/Standalone | ✅ MATCH |
| Add-on | Add-Ons (supplementary purchases) | ✅ MATCH |
| Multiple components | "All standalone strategies can be in bundle" | ✅ MATCH |

#### Trials (Overlays)
| Builder | On-Rails Doc | Status |
|---------|--------------|--------|
| Timed trial | Free Trial (Time-Based) | ✅ MATCH |
| Reverse trial | Reverse Trial (Time-Based) | ✅ MATCH |
| Monetary cap trial | Monetary Cap on Trials | ✅ MATCH |

### ⚠️ GAPS: Builder Missing On-Rails Capabilities

#### 1. **CRITICAL: Manual Billing**
- **On-Rails**: "Catch-all monetization strategy... should be discouraged... only when absolutely necessary"
- **Builder**: NOT SUPPORTED
- **Impact**: No escape hatch for one-off invoices or special billing scenarios
- **Note**: This is intentional per on-rails guidance (discouraged)

#### 2. **Entitlements (Beyond Pricing)**
| Entitlement Type | On-Rails | Builder |
|------------------|----------|---------|
| Static Entitlements | Boolean flags, config limits | ❌ NOT CAPTURED |
| Metered Entitlements | Usage tracking, reset patterns | ⚠️ PARTIAL (only for metered subs) |
| Hard Limits | Block usage at threshold | ⚠️ PARTIAL (hardstop for subscriptions, not PAYG) |
| Soft Limits | Notify but allow overage | ❌ NOT CAPTURED |

**Gap**: Builder focuses on pricing/billing but doesn't capture:
- Feature flags (boolean entitlements like "SSO enabled")
- Configuration limits (max file size, API rate limits)
- Threshold monitoring and notifications
- Grants (promotional credits)

#### 3. **Overlays Beyond Trials**
| Overlay Type | On-Rails | Builder |
|--------------|----------|---------|
| Free Trial | ✅ Supported | ✅ SUPPORTED |
| Reverse Trial | ✅ Supported | ✅ SUPPORTED |
| Monetary Cap Trial | ✅ Supported | ✅ SUPPORTED |
| Percentage Discounts | ✅ Supported (20% off annual) | ❌ NOT SUPPORTED |
| Monetary Credits | ✅ Supported ($100 credit) | ❌ NOT SUPPORTED |
| Usage Credits | ✅ Supported (1,000 bonus API calls) | ❌ NOT SUPPORTED |

**Impact**: Cannot configure discounts or credits in builder

#### 4. **Metering Strategies**
| Meter Type | On-Rails | Builder |
|------------|----------|---------|
| Count | Simple counter | ⚠️ IMPLICIT (resource name only) |
| Sum | Aggregate numeric values | ⚠️ IMPLICIT (resource name only) |
| Count Distinct | Unique values | ❌ NOT CAPTURED |
| Average | Mean value | ❌ NOT CAPTURED |
| Min/Max | Peak/minimum tracking | ❌ NOT CAPTURED |
| Precalculated | Pre-computed values | ❌ NOT CAPTURED |
| Unit Rounding | Unit conversion (seconds→minutes) | ❌ NOT CAPTURED |

**Gap**: Builder only captures resource names, not metering logic

#### 5. **Billing Behaviors**
| Behavior | On-Rails | Builder |
|----------|----------|---------|
| Billing Period | Monthly/annual/quarterly | ⚠️ PARTIAL (only monthly/annual) |
| Billing Lifecycles | Mid-cycle changes, proration | ❌ NOT CAPTURED |
| Usage Reports | Customer-facing usage dashboards | ❌ NOT CAPTURED |
| Self-Service Invoice Flows | Customer portal, payment methods | ❌ NOT CAPTURED |
| Enterprise Invoice Flows | PO, wire transfer, net terms | ❌ NOT CAPTURED |
| Multi-Org | Consolidated billing, shared entitlements | ❌ NOT CAPTURED |
| Automated Upgrades & Top-Ups | Auto-upgrade on threshold | ❌ NOT CAPTURED |
| Threshold Billing | Invoice when charges exceed $X | ❌ NOT CAPTURED |
| Tax Calculation (Anrok) | VAT, GST, sales tax | ❌ NOT CAPTURED |
| Merged/Split Invoices | Single vs multiple invoices | ❌ NOT CAPTURED |
| Proration | Partial period charges | ❌ NOT CAPTURED |
| Anchor Dates | Billing alignment | ❌ NOT CAPTURED |
| Grandfathering | Legacy pricing preservation | ❌ NOT CAPTURED |
| Paid In Advance | Upfront payment | ✅ SUPPORTED (timing) |
| Paid In Arrears | End-of-period payment | ✅ SUPPORTED (timing) |
| Dunning | Failed payment retry | ❌ NOT CAPTURED |

**Note**: Builder focuses on pricing/billing strategy configuration, not operational billing behaviors

#### 6. **Recurrence vs Billing Period (Ambiguity)**
- **On-Rails**:
  - Billing Period = when invoices generated (monthly/annual/quarterly)
  - Recurrence = when entitlements reset (daily/weekly/monthly/annual, independent of billing)
  - Example: "Daily API rate limit resets on annual subscription" OR "Monthly usage quota refresh on quarterly billing period"

- **Builder**:
  - Uses "billing cycle" for subscription payment frequency (monthly/annual)
  - Uses "recurrence" for metered subscription allowance reset (hourly/daily/monthly/annual)
  - Allows different recurrence per billing cycle

**Alignment**: Builder's model matches on-rails conceptually but terminology differs:
- Builder "billing cycle" = on-rails "billing period"
- Builder "recurrence" = on-rails "recurrence" ✅

**Question**: Can builder support quarterly billing period? No - only monthly/annual supported.

### 🚀 OVERREACH: Builder Features Not in On-Rails

#### 1. **Metered Subscription Complexity**
- **Builder**: Full configuration for metered subscriptions with overage behavior, rollover caps
- **On-Rails**: Mentions "subscriptions can be metered entitlements" but doesn't detail overage/rollover configuration
- **Gap in docs**: On-rails doesn't fully specify metered subscription configuration patterns
- **Ambiguity**: Is builder's metered subscription pattern on-rails or off-rails?

#### 2. **Rollover Configuration**
- **Builder**: Rollover with cap options (multiplier, fixed amount, or unlimited)
- **On-Rails**: Mentions "Rollovers" as entitlement concept (carry unused to next period with max)
- **Alignment**: ✅ Concept matches but on-rails doesn't detail UI/configuration
- **Unknown**: Are rollover caps part of rate_card or entitlement configuration?
- **Note**: Unlimited rollover allows indefinite accumulation (e.g., API credits that never expire)

#### 3. **"Both" Billing Cycle UI Pattern**
- **Builder**: Users can select "both" and configure monthly + annual pricing in one component
- **On-Rails**: No mention of "both" pattern
- **Overreach**: This is a UI convenience that transforms into separate pricing

---

## Ambiguities Between Data Model & On-Rails Doc

### 1. **MFC Implementation** 🔴 CRITICAL AMBIGUITY
- **Data Model**: No MFC-specific tables or fields
- **On-Rails**: MFC is "special case PAYG monetization strategy"
- **Builder**: Exports MFC as monetization_strategy='minimum_fee_commitment'
- **Questions**:
  - Where does MFC commitment amount live? (on-rails says "negotiated per customer")
  - How are MFC discounts stored? (builder captures in JSON, no data model field)
  - Is MFC a rate_card or a separate construct?

**CRITICAL**: MFC appears on-rails but has no clear data model mapping.

### 2. **Metered Subscriptions Configuration** 🔴 CRITICAL AMBIGUITY
- **Data Model**:
  - offering_features has recurrence_period (daily/monthly/annual/one_time)
  - rate_cards has billing_cycle (monthly/annual/multiyear/one_time)
  - No overage or rollover fields

- **On-Rails**:
  - Subscriptions can have metered entitlements
  - Example: "$20/month for 1,000 cloud minutes/month"
  - Mentions soft limits with overage charges
  - Mentions rollovers with caps

- **Builder**:
  - Captures billing_cycle, recurrence, includedAmount, overage (hardstop/payg), rollover (yes/no + cap)
  - Exports as meteredConfig object in component JSON

**Questions**:
- Where does meteredConfig data live in data model?
- Is overage rate a separate rate_card?
- Where is rollover cap stored?
- How does recurrence_period on offering_features relate to builder's recurrence on subscription?

**HYPOTHESIS**:
- Builder's "recurrence" → offering_features.recurrence_period
- Builder's "includedAmount" → offering_features.value
- Builder's overage rate → separate rate_card with pricing_type='per_unit'
- Builder's rollover cap → **NO DATA MODEL FIELD** (gap?)

### 3. **Trials Storage** 🔴 CRITICAL AMBIGUITY
- **Data Model**: No trial-related tables or fields
- **On-Rails**: Defines 3 trial types (time-based, reverse, monetary cap)
- **Builder**: Captures trials separately from pricing components
- **Questions**:
  - Where are trials stored?
  - Are they overlays in a separate table?
  - Are they offering_lifecycle_transitions with timing?

**MISSING**: No clear data model for trials

### 4. **Fixed Plus Per-Unit** 🟡 MODERATE AMBIGUITY
- **Data Model**: Has pricing_type='fixed_plus_per_unit' with base_price, unit_price, included_units
- **On-Rails**: No explicit mention of "fixed plus per-unit" as a pricing model
- **Builder**: Not supported
- **Questions**:
  - Is this on-rails or off-rails?
  - Example from data model: "$30/month + $0.005/min after 200 minutes" (looks like on-rails subscription pattern)
- **Likely**: This is on-rails (common SaaS pattern) but builder doesn't support yet

### 5. **Graduated Tiers: Fixed Price AND Per-Unit Price** 🟡 MODERATE AMBIGUITY
- **Data Model**: Graduated tiers can have BOTH fixed_price AND price_per_unit non-zero
  - Example: Tier 2 = $50 fixed + $0.008/unit
- **On-Rails**: Graduated pricing examples only show per-unit pricing, no fixed component
- **Builder**: Only captures per-unit price per tier (no fixed price option)
- **Question**: Is the fixed_price in graduated tiers on-rails?

**HYPOTHESIS**: Fixed price in tiers is for advanced configurations not commonly used

### 6. **Prepaid Stackability** 🟢 MINOR AMBIGUITY
- **Data Model**: No stackability field
- **On-Rails**: Describes prepaid stackability ("new purchase adds to balance" vs "replaces remaining")
- **Builder**: Captures stackability boolean
- **Question**: Where does stackability live in data model?
- **Likely**: Separate entitlement configuration, not in rate_cards

### 7. **Offering Package vs Monetization Strategy** 🟡 MODERATE AMBIGUITY
- **Data Model**:
  - offering_package: 'bundle', 'standalone', 'add_on'
  - monetization_strategy: 'subscription', 'payg', 'prepaid', 'one_time'
- **On-Rails**:
  - Bundles can include all standalone strategies
  - Add-ons are supplementary purchases
- **Builder**:
  - "Base offering" or "Add-on" (maps to offering_package)
  - Each component has a monetization strategy

**Clarity needed**:
- Is a "bundle" an offering with multiple rate_cards?
- Can a single offering have multiple monetization strategies? (Builder says yes, data model unclear)
- Example: Docker Team (bundle) = subscription (seats) + prepaid (build minutes)
  - One offering_id with 2 rate_cards with different monetization_strategy?
  - Or: One offering_id (subscription) + add-on offering_id (prepaid)?

**Builder assumption**: One offering can have multiple pricing components with different strategies (exports as components array)

### 8. **Recurrence Period Granularity** 🟢 MINOR AMBIGUITY
- **Data Model**: recurrence_period enum = daily, monthly, annual, one_time
- **On-Rails**: Mentions daily, weekly, monthly, annual
- **Builder**: hourly, daily, weekly, monthly, annual
- **Gap**: Data model missing hourly and weekly

### 9. **Free Offerings** 🟢 MINOR AMBIGUITY
- **Data Model**: Can offerings have isFree=true with offering_features.value but no rate_cards?
- **On-Rails**: Not explicitly mentioned
- **Builder**: Supports free offerings with opt-in choice (automatic vs optin)
- **Question**: How are free offerings represented in data model?

---

## Summary of Critical Unknowns

### 🔴 CRITICAL: Must Clarify

1. **MFC Data Model Mapping**: Where do commitment amount and discounts live?
2. **Metered Subscription Overage & Rollover**: Where are these stored? Separate rate_cards? Offering_features?
3. **Trial Storage**: No trials in data model - separate table? Overlays?
4. **Multi-Strategy Offerings**: Can one offering have multiple monetization strategies (subscription + PAYG) or are these separate offerings?
5. **Fixed Plus Per-Unit**: Is this on-rails? Should builder support it?

### 🟡 MODERATE: Should Clarify

6. **Graduated Tier Fixed Prices**: Is fixed_price + price_per_unit per tier on-rails?
7. **Offering Package Semantics**: What makes something a "bundle" vs "standalone"?
8. **Session-Created Features**: How do ad-hoc features in builder map to service_features table?
9. **Prepaid Stackability Storage**: Where does this live?

### 🟢 MINOR: Nice to Clarify

10. **Recurrence Period Enums**: Should data model add hourly and weekly?
11. **Free Offering Representation**: How are these in data model?
12. **Billing Cycle "Both"**: Confirmed this becomes 2 rate_cards, but document assumption

---

## Recommended Next Steps

### Phase 1: Clarify Critical Unknowns (PRIORITY)
Work with billing team to answer the 5 critical questions above. These affect core builder logic and data model alignment.

**Action Items:**
- [ ] Schedule meeting with BCP/billing team
- [ ] Prepare questions document
- [ ] Get answers to 5 critical unknowns
- [ ] Document decisions in this file

### Phase 2: Gap Assessment
Prioritize gaps to close:
- **High Priority**:
  - [ ] Fixed Plus Per-Unit (common SaaS pattern)
  - [ ] Service + Feature hierarchy (data integrity)
- **Medium Priority**:
  - [ ] Multiyear billing cycles
  - [ ] Offering features/entitlements layer
- **Low Priority**:
  - [ ] External system integration (can defer)
  - [ ] Offering groups

### Phase 3: Overreach Assessment
Evaluate builder features not in docs:
- [ ] Confirm metered subscription pattern is on-rails
- [ ] Confirm rollover configuration is on-rails
- [ ] Document assumptions in code

### Phase 4: Documentation Alignment
Create cross-reference document mapping:
- [ ] Builder terminology → Data model fields
- [ ] Builder configuration → Rate card structure
- [ ] Builder export JSON → Database inserts

---

## Critical Files

**Reference Docs**:
- `/Users/patrickmasonport/bcp_create_offering_v1/data-model.md` - Database schema
- `/Users/patrickmasonport/Downloads/Billing@Docker – On-Rails 2026 (5).pdf` - Supported billing functionality

**Builder Implementation**:
- `/Users/patrickmasonport/bcp_create_offering_v1/src/pages/PricingPlayground.jsx` - Main builder UI (2,400 lines)
- `/Users/patrickmasonport/bcp_create_offering_v1/src/utils/pricingTransform.js` - Export transformation logic
- `/Users/patrickmasonport/bcp_create_offering_v1/src/data/exampleOfferings.js` - Example configurations

---

## Verification Checklist

To use this audit:
1. [ ] Review critical unknowns with billing/BCP team
2. [ ] Prioritize gaps to address
3. [ ] Create issues for high-priority missing features
4. [ ] Document confirmed assumptions in code comments
5. [ ] Update builder UI to prevent unsupported configurations
6. [ ] Create mapping doc: Builder → Data Model → On-Rails

---

## Change Log

| Date | Changes | Author |
|------|---------|--------|
| 2026-03-06 | Initial audit complete | Claude |
| 2026-03-06 | Updated with builder improvements: unlimited rollover option, state reset fix, removed redundant banner, added 3 new examples | Claude |

---

This audit ensures the pricing builder aligns with the platform's capabilities and identifies where documentation needs clarification.
