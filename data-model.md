# BCP Data Model

This document describes the complete BCP database schema and table relationships.

## Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│  SERVICE CATALOG (What capabilities exist)                  │
│  ├─ services (general, hub, admin, build, scout)            │
│  └─ service_features (seats, sso_enabled, build_minutes)    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  OFFERINGS (What customers can buy)                         │
│  ├─ offering_groups (DSoP, Scout, Build Cloud)              │
│  ├─ offerings (Personal, Pro, Team, Business)               │
│  ├─ offering_services (M:N - services in offering)          │
│  ├─ offering_features (default values)                      │
│  ├─ offering_group_memberships (M:N - multi-group)          │
│  ├─ offering_dependencies (addon eligibility rules)         │
│  └─ offering_lifecycle_transitions (upgrade/downgrade)      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  METERED RESOURCES (Billable resource definitions)          │
│  ├─ supported_unit_types (seconds, gb, requests)            │
│  ├─ meters (usage aggregation definitions)                  │
│  ├─ metered_resources (billable resource catalog)           │
│  └─ resource_meters (M:N - meters to resources)             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  RATE CARDS (What customers pay)                            │
│  └─ rate_cards (Type+JSONB: pricing_type + pricing_details) │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  CUSTOMER ENTITLEMENTS (What customers have)                │
│  ├─ offering_entitlements (offering-level access)           │
│  └─ account_purchases (feature-level purchases)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Service Catalog

### services

Defines groups of related features (product capabilities).

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| slug | VARCHAR(63) | Human-readable identifier |
| service_name | VARCHAR(255) | Display name |
| description | TEXT | Description |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Current services**: `general`, `hub`, `admin`, `build`, `scout`

### service_features

Individual capabilities within a service.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| service_id | docker_id | FK to services |
| slug | VARCHAR(63) | Feature identifier |
| feature_name | VARCHAR(255) | Display name |
| description | TEXT | Description |
| feature_type | ENUM | `boolean`, `integer`, `string` |
| mutable | BOOLEAN | Can customers change via purchase? |
| metering_type | ENUM | `static`, `pre_calculated`, `simple`, `aggregated`, `unit_conversion` |
| feature_aggregation | ENUM | `sum`, `max`, `newest` |
| allowed_string_values | TEXT[] | Optional array of allowed string values (for string-type features only) |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Key concepts**:
- `mutable=true`: Customers can buy more (e.g., seats)
- `mutable=false`: Fixed per plan (e.g., SSO enabled)
- `feature_aggregation`: Defined at feature level to ensure consistency when customer has multiple offerings with the same feature
- `allowed_string_values`: For string-type features, optionally defines the allowed enum values. NULL = any string allowed, non-empty array = value must be one of these (enum-like behavior). See [String Enum Proposal](./string-enum-proposal.md) for details.

**Default values**:
- `mutable`: Defaults to `false` when not specified
- `metering_type`: Optional (nullable)
- `feature_aggregation`: Optional (nullable)
- `allowed_string_values`: Defaults to `NULL` (any string allowed)

---

## 2. Offerings

### offering_groups

Product lines that group related offerings.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| slug | VARCHAR(63) | Group identifier |
| group_name | VARCHAR(255) | Display name |
| display_name | TEXT | UI display name |
| description | TEXT | Description |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Example**: DSoP (Docker Suite of Products)

### offerings

Purchasable products.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| slug | VARCHAR(63) | Offering identifier |
| group_id | docker_id | FK to offering_groups |
| offering_name | VARCHAR(255) | Display name |
| description | TEXT | Description |
| offering_package | ENUM | `bundle`, `standalone`, `add_on` |
| monetization_strategy | ENUM | `subscription`, `payg`, `prepaid`, `one_time` |
| account_type | ENUM | `user`, `organization` |
| requires_offering_id | docker_id | FK to required offering |
| external_id | TEXT | Stripe product ID |
| external_system | VARCHAR(50) | External system name |
| status | ENUM | `draft`, `active`, `archived` |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Offering packages**:
- `bundle`: Combined package of services (e.g., Docker Team)
- `standalone`: Single product (e.g., Build Cloud Starter)
- `add_on`: Requires a base subscription

**Monetization strategies**:
- `subscription`: Recurring subscription billing
- `payg`: Pay-as-you-go based on usage
- `prepaid`: Buy credits upfront
- `one_time`: Single-point monetization

### offering_services

**Layer 1: Service Inclusion Declaration**

Declares which services are included in each offering.

| Column | Type | Description |
|--------|------|-------------|
| offering_id | docker_id | FK to offerings |
| service_id | docker_id | FK to services |

**Purpose**: Defines **WHAT services** you get with an offering.

**Example**: Docker Team includes General, Hub, Admin, Build, and Scout services.

### offering_features

**Layer 2: Feature Value Configuration**

Defines the specific values for features within the included services.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| offering_id | docker_id | FK to offerings |
| service_id | docker_id | FK to services |
| feature_id | docker_id | FK to service_features |
| value | TEXT | Default value (use `"-1"` to represent unlimited) |
| recurrence_period | ENUM | How often entitlement refreshes (`daily`, `monthly`, `annual`, `one_time`) |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Purpose**: Defines **WHAT values** each feature has for an offering.

**Example**: Docker Team gets 5 seats, unlimited repos, 800 build minutes.

**Recurrence Period Values**:
- `daily`: Entitlement refreshes every day (e.g., daily API rate limits)
- `monthly`: Entitlement refreshes every month (e.g., monthly build minutes)
- `annual`: Entitlement refreshes every year (e.g., annual storage quota)
- `one_time`: No recurrence, granted once and doesn't reset (e.g., perpetual seats)

**Note**: The proto API includes a computed `is_unlimited` boolean field (true when `value = "-1"`) for client convenience, but this is not stored in the database.

**Two-Layer Enforcement**: The composite FK `(offering_id, service_id)` references `offering_services`, ensuring you can only configure features for services that were explicitly declared in Layer 1.

```sql
-- Must declare service inclusion first
INSERT INTO offering_services VALUES ('docker_team', 'build');

-- Then can configure features for that service
INSERT INTO offering_features VALUES ('docker_team', 'build', 'build_minutes', '800');
```

### offering_constraints **[TBD - Not Implemented]**

**Status**: This table is not currently implemented. Implementation is TBD (To Be Determined).

**Original Purpose**: Business rules for mutable features (min/max by sales channel).

**Note**: Constraints can be enforced through other mechanisms. This table may be added in a future iteration if needed.

### offering_group_memberships

M:N: Offerings can belong to multiple groups.

| Column | Type | Description |
|--------|------|-------------|
| offering_id | docker_id | FK to offerings |
| group_id | docker_id | FK to offering_groups |

### offering_dependencies

Eligibility rules (requires/excludes/recommended).

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| dependent_offering_id | docker_id | The offering with the dependency |
| required_offering_id | docker_id | Specific offering required (XOR) |
| required_group_id | docker_id | Any offering from group required (XOR) |
| dependency_type | ENUM | `requires`, `excludes`, `recommended` |
| constraint_message | TEXT | User-facing message |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Check constraint**: Exactly one of `required_offering_id` or `required_group_id` must be set.

### offering_lifecycle_transitions

Allowed upgrade/downgrade paths.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| from_offering_id | docker_id | Source offering |
| to_offering_id | docker_id | Target offering |
| transition_type | ENUM | `upgrade`, `downgrade`, `renewal`, `migration` |
| timing | ENUM | `immediate`, `end_of_period` |
| allowed | BOOLEAN | Is transition allowed? |
| expires_at | TIMESTAMPTZ | Transition expiration |
| effective_date | TIMESTAMPTZ | When transition becomes available |
| constraints | JSONB | Additional constraints |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

---

## 3. Metered Resources

### supported_unit_types

Reference data for valid measurement units.

| Column | Type | Description |
|--------|------|-------------|
| unit_type | VARCHAR(50) | Primary key |
| display_name | VARCHAR(100) | Display name |
| description | TEXT | Description |
| category | VARCHAR(50) | `time`, `data`, `compute`, `requests` |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |

### meters

Measurable usage dimensions.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| service_id | docker_id | FK to services |
| feature_id | docker_id | FK to service_features |
| slug | VARCHAR(63) | Meter identifier |
| meter_name | VARCHAR(255) | Display name |
| unit_type | VARCHAR(50) | FK to supported_unit_types |
| status | VARCHAR(20) | `active`, `provisioning`, `archived` |
| external_meter_id | TEXT | UBB meter ID |
| external_status | VARCHAR(50) | `provisioned`, `failed`, `pending` |
| external_provisioned_at | TIMESTAMPTZ | When provisioned |
| archived_at | TIMESTAMPTZ | `NULL` = active |
| archived_reason | TEXT | Why archived |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

### metered_resources

Billable resource configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| service_id | docker_id | FK to services |
| resource_slug | VARCHAR(63) | Resource identifier |
| resource_name | VARCHAR(255) | Display name |
| description | TEXT | Description |
| status | VARCHAR(20) | `active`, `archived` |
| archived_at | TIMESTAMPTZ | `NULL` = active |
| archived_reason | TEXT | Why archived |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Examples**: `seat`, `2cpu_8gb`, `standard_build`

### resource_meters

M:N join: meters to resources.

| Column | Type | Description |
|--------|------|-------------|
| meter_id | docker_id | FK to meters |
| resource_id | docker_id | FK to metered_resources |
| service_id | docker_id | FK to services (consistency enforcement) |

---

## 4. Rate Cards

### rate_cards

**Consolidated pricing table using Type+JSONB pattern**. Instead of maintaining seven separate tables for different pricing models, rate cards use a type discriminator (`pricing_type`) and a JSONB blob (`pricing_details`) that stores the pricing model-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| offering_id | docker_id | FK to offerings |
| service_id | docker_id | FK to services |
| feature_id | docker_id | FK to service_features |
| list_price | BOOLEAN | `true` = standard, `false` = customer-specific |
| account_id | docker_id | Customer ID for custom pricing |
| pricing_type | ENUM (pricing_model) | Type discriminator: `fixed`, `per_unit`, `graduated`, `volume`, `block`, `fixed_plus_per_unit` |
| pricing_details | JSONB | Proto-marshaled pricing configuration (structure varies by `pricing_type`) |
| billing_timing | ENUM | `advance`, `arrears`, `immediate` |
| billing_cycle | ENUM | `monthly`, `annual`, `multiyear`, `one_time` |
| currency | VARCHAR(3) | ISO 4217 code (default `USD`) |
| external_price_id | TEXT | Stripe price ID |
| external_system | VARCHAR(50) | External system name |
| effective_date | TIMESTAMPTZ | When pricing takes effect |
| expiration_date | TIMESTAMPTZ | When pricing expires |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Architecture Note**: This consolidation eliminates the complexity of maintaining separate child tables (`rate_card_per_unit`, `rate_card_graduated_tiers`, etc.) and simplifies queries by avoiding 7-way LEFT JOINs. The `pricing_details` JSONB column stores proto-marshaled pricing configurations, making it easy to add new pricing models by simply adding new enum values.

**CRITICAL: NO DECIMALS**. All monetary values use `google.type.Money` (stored as `{"currency_code": "USD", "units": "5", "nanos": 80000000}` for $5.08). Meters store input/output unit metadata only (e.g., "record in millis, calculate in seconds") — actual conversions are performed by UBB, not this service.

### Pricing Details JSONB Structure

The structure of `pricing_details` depends on the `pricing_type`:

#### Per-Unit Pricing

```json
{
  "resource_id": "res_1zSlAC5QvmV054mB6oSajONG2L1A",
  "unit_price": {
    "currency_code": "USD",
    "units": "16",
    "nanos": 0
  }
}
```

**Example**: Docker Team at $16/seat/month

#### Graduated Tiers Pricing

```json
{
  "resource_id": "res_build_minutes",
  "tiers": [
    {
      "tier_number": 1,
      "min_units": 0,
      "max_units": 400,
      "fixed_price": {
        "currency_code": "USD",
        "units": "0",
        "nanos": 0
      },
      "price_per_unit": {
        "currency_code": "USD",
        "units": "0",
        "nanos": 0
      }
    },
    {
      "tier_number": 2,
      "min_units": 401,
      "max_units": null,
      "fixed_price": {
        "currency_code": "USD",
        "units": "50",
        "nanos": 0
      },
      "price_per_unit": {
        "currency_code": "USD",
        "units": "0",
        "nanos": 8000000
      }
    }
  ]
}
```

**Example**: First 400 minutes free (tier 1), then $50 fixed + $0.008/minute (tier 2)

**Note**: Both `fixed_price` and `price_per_unit` can be non-zero simultaneously, allowing for flexible pricing like "$50 base fee + $0.008 per unit".

#### Volume Tiers Pricing

Same structure as graduated tiers, but all units are charged at the tier rate reached (not incremental).

#### Block Pricing

```json
{
  "resource_id": "res_build_minutes",
  "blocks": [
    {
      "block_number": 1,
      "min_units": 0,
      "max_units": 5000,
      "block_price": {
        "currency_code": "USD",
        "units": "25",
        "nanos": 0
      }
    }
  ]
}
```

**Example**: 5,000 build minutes for $25

#### Fixed Pricing

```json
{
  "resource_id": "res_1zSlAC5QvmV054mB6oSajONG2L1A",
  "fixed_price": {
    "currency_code": "USD",
    "units": "0",
    "nanos": 0
  }
}
```

**Example**: Docker Personal (free tier) at $0.00/month

#### Fixed Plus Per-Unit Pricing

```json
{
  "resource_id": "res_build_minutes",
  "base_price": {
    "currency_code": "USD",
    "units": "30",
    "nanos": 0
  },
  "unit_price": {
    "currency_code": "USD",
    "units": "0",
    "nanos": 5000000
  },
  "included_units": 200
}
```

**Example**: $30/month base fee + $0.005/minute after 200 included minutes

### docker_money Type

PostgreSQL composite type for precise monetary values (Google Proto Money compatible).

```sql
CREATE TYPE docker_money AS (
    currency_code VARCHAR(3),  -- ISO 4217 (e.g., 'USD')
    units BIGINT,              -- Whole currency units
    nanos INTEGER              -- Fractional amount (0-999,999,999)
);
```

**Example**: $5.08 = `('USD', 5, 80000000)`

---

## 5. Customer Entitlements

### offering_entitlements

Offering-level membership (which offering the account has).

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| account_id | docker_id | Customer account ID |
| offering_id | docker_id | FK to offerings |
| origin | ENUM | `self-serve`, `inside-sales` |
| expired_at | TIMESTAMPTZ | `NULL` = active |
| expiration_reason | ENUM | `downgrade`, `upgrade`, `cancellation`, `non_renewal` |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Unique constraint**: Only one active entitlement per account/offering pair.

### account_purchases

Individual feature purchases.

| Column | Type | Description |
|--------|------|-------------|
| id | docker_id | Primary key (prefixed unique identifier) |
| account_id | docker_id | Customer account ID |
| offering_id | docker_id | FK to offerings |
| rate_card_id | docker_id | FK to rate_cards |
| service_id | docker_id | FK to services |
| feature_id | docker_id | FK to service_features |
| value | TEXT | Purchased quantity (use `"-1"` to represent unlimited) |
| purchase_date | TIMESTAMPTZ | When purchased |
| expires_at | TIMESTAMPTZ | When prepaid expires |
| expired_at | TIMESTAMPTZ | `NULL` = active |
| expiration_reason | ENUM | Why expired |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |
| version | INTEGER | Optimistic locking version (starts at 1, incremented on each update) |

**Note**: The proto API includes a computed `is_unlimited` boolean field (true when `value = "-1"`) for client convenience, but this is not stored in the database.

---

## Optimistic Locking

All BCP tables with update operations include a `version INTEGER NOT NULL DEFAULT 1` column for optimistic locking. This prevents lost updates when multiple clients attempt concurrent modifications.

**How it works**:
1. Client reads an entity, receiving its current `version`
2. Client sends an update request including the `version` it read
3. Server executes: `UPDATE ... SET version = version + 1 ... WHERE id = :id AND version = :expected_version`
4. If rows affected = 0, the server distinguishes between not-found and version conflict
5. On version conflict, the server returns an appropriate error and the client must re-read and retry

**Tables with version column**: `services`, `service_features`, `offering_groups`, `offerings`, `offering_features`, `offering_dependencies`, `offering_lifecycle_transitions`, `meters`, `metered_resources`, `rate_cards`, `offering_entitlements`, `account_purchases`

**Tables without version column** (M:N join tables and read-only reference data): `offering_services`, `offering_group_memberships`, `resource_meters`, `supported_unit_types`

---

## Composite Foreign Keys

The schema uses composite foreign keys to enforce referential integrity:

```sql
-- offering_features must reference a service included in the offering
FOREIGN KEY (offering_id, service_id)
  REFERENCES offering_services(offering_id, service_id)

-- Feature must belong to the specified service
FOREIGN KEY (service_id, feature_id)
  REFERENCES service_features(service_id, id)
```

This prevents invalid configurations like adding a feature from `hub` service to an offering that doesn't include `hub`.
