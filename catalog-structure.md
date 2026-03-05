# Product Catalog — Information Architecture

## View 1: Group Index

Top-level view. Two modes toggled in the top-right: **List** (default) / **Graph**.

### List mode

Each offering group is a row you can click into. Shows the group name, a short description, and counts.

```
┌─────────────────────────────────────────────────────────────────┐
│  Product Catalog                            [ ☰ List ] [ ◈ Graph ]
│  7 offering groups                                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Suite of Products (DSoP)                          │  │
│  │  Core subscription tiers                    4 offerings → │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Build Cloud                                              │  │
│  │  Additional build minutes                   1 offering  → │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Testcontainers Cloud                                     │  │
│  │  Cloud runtime minutes                      2 offerings → │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Hardened Images                                   │  │
│  │  Secure container images product line       6 offerings → │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Premium Support                                   │  │
│  │  Premium support and TAM services           2 offerings → │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Gordon                                                   │  │
│  │  Docker AI assistant                        4 offerings → │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Sandboxes                                         │  │
│  │  On-demand ephemeral compute environments   1 offering  → │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```


### Graph mode

Network diagram showing offering groups as nodes and dependency relationships as directed edges. Reveals the topology of the catalog at a glance — what connects to what, what stands alone.

Click any node → navigates to View 2 (same as clicking a list row).

```
┌─────────────────────────────────────────────────────────────────┐
│  Product Catalog                            [ ☰ List ] [◈ Graph]│
│  7 offering groups · 5 dependency chains                        │
│                                                                 │
│                                                                 │
│                     ┌─────────────┐                             │
│                     │    DSoP     │                              │
│                     │ 4 offerings │                              │
│                     └──────┬──────┘                              │
│               ┌────────┬───┴───┬────────┐                       │
│               │        │       │        │                       │
│               ▼        ▼       ▼        │                       │
│     ┌─────────────┐ ┌──────┐ ┌──────┐   │                      │
│     │ Build Cloud │ │  TC  │ │Gordon│   │                      │
│     │ 1 offering  │ │ 2 off│ │4 off │   │                      │
│     └─────────────┘ └──────┘ └──────┘   │                      │
│                                         │                       │
│                                         ▼                       │
│  ┌───────────────┐              ┌──────────────┐                │
│  │   Sandboxes   │              │   Premium    │                │
│  │  1 offering   │              │   Support    │                │
│  │  (standalone) │              │  2 offerings │                │
│  └───────────────┘              └──────┬───────┘                │
│                                        │                        │
│                            ┌───────────┘                        │
│                            │                                    │
│                            ▼                                    │
│                     ┌─────────────┐                             │
│                     │     DHI     │                              │
│                     │ 6 offerings │                              │
│                     └─────────────┘                              │
│                                                                 │
│  ── requires (dependency)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Graph layout rules

| Element | Visual |
|---------|--------|
| Group node | Card with group name + offering count. White bg, `1px solid g.200`, `4px` radius. Clickable. |
| Group node hover | Border → `blue`, cursor pointer |
| Standalone node | Dimmer border (`g.100`), "(standalone)" label — no edges |
| Dependency edge | Thin line (`1.5px`, `g.300`) with arrowhead pointing FROM the dependent TO the required group |
| Edge label | None by default. On hover over an edge, show "requires" tooltip |
| Layout | Hierarchical top-down. DSoP and DHI as parent clusters. Sandboxes off to the side. |

#### What the graph reveals

- **DSoP is the hub.** Build Cloud, TC, Gordon, and Premium Support all depend on it.
- **DHI is a secondary hub.** Premium Support bridges DSoP and DHI (OR dependency).
- **Premium Support chains.** DSoP/DHI → Premium Support → TAM (visible as a two-hop path).
- **Sandboxes is independent.** No edges — stands alone.
- **Future products** just add new nodes and edges to the graph.

### Counts logic

Counts show **deduplicated, product-concept offerings**. User/org variants collapse into one row. Pack sizes that are really just block pricing on a single offering collapse too.

| Group | Raw offerings (SQL) | Displayed | Rationale |
|-------|--------------------:|----------:|-----------|
| DSoP | 4 | 4 | Personal, Pro, Team, Business |
| Build Cloud | 10 (5 sizes × u+o) | 1 | One offering, block pricing at $0.05/min, blocks of 500 min |
| Testcontainers Cloud | 4 (prepaid+OD × u+o) | 2 | Prepaid (block, $3/100 min) + On-demand (PAYG, $0.04/min) |
| Docker Hardened Images | 5 (Free u+o, Sel, Ent, ELS) | 6 | Free, Select, Enterprise Per-Repo, Enterprise Full Catalog, ELS Per-Repo, ELS Full Catalog |
| Premium Support | 2 | 2 | Premium Support, TAM |
| Gordon | 7 (Pro/Max/Ultra × u+o + Ent) | 4 | Pro, Max, Ultra, Enterprise |
| Sandboxes | 2 (u+o) | 1 | Sandboxes PAYG |

### Why Build Cloud is 1 offering, not 5

All five pack sizes price at a flat $0.05/minute with no volume discount. This is textbook block pricing from the On-Rails definition: one offering, one rate card, one block size (500 min / $25). The storefront can present friendly pack sizes (500 / 1K / 5K / etc.) as a quantity selector — that's a purchase UX concern, not a catalog concern.

Same applies to TC prepaid packs: one offering with block pricing at $3 per 100-minute block.


---

## View 2: Group Detail

Click a group → see its offerings. Two zones:

1. **Offerings** — the group's own offerings (bundles and standalones)
2. **Add-Ons** — offerings from this group AND from other groups that depend on this group's offerings, grouped by source

Back link at top returns to group index.

### Account scope toggle

Top of the detail page has a pill toggle: **Individual** / **Organization** / **All**

This filters which offerings are visible based on `offerings.account_type`. Some offerings exist in both scopes (user + org variants with identical entitlements) — those show in both. Default to **All**.

The toggle is important because it answers different questions for different audiences: "what can an individual user buy?" vs "what can an org admin provision?"


### Placement rules

| Source | offering_package | Zone | Visual treatment |
|--------|-----------------|------|------------------|
| This group | `bundle` or `standalone` | Offerings | Full card — white bg, solid border |
| This group | `add_on` | Add-Ons | Lighter card — gray bg, subtle border |
| Other group, depends on this group | `add_on` | Add-Ons | Lighter card — gray bg, with source group label |

Add-ons from other groups are sub-grouped by their source group name so you can see the product line they belong to.


### Example: DSoP detail

The DSoP page shows its 4 base plans, then ALL add-ons that require a DSoP offering — from Build Cloud, Testcontainers, Gordon, and Premium Support. Each sub-group shows the dependency scope. The account scope toggle filters what's visible.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Product Catalog / DSoP                                       │
│                                                                 │
│  Docker Suite of Products                                       │
│  Core subscription tiers                                        │
│                                                                 │
│  [ All ]  [ Individual ]  [ Organization ]                      │
│                                                                 │
│  OFFERINGS                                                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Personal                              $0     →   │  │
│  │  docker-personal                              free       │  │
│  │  Free tier for individual developers                     │  │
│  │  [bundle] [subscription] [user]                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Pro                                   $11    →   │  │
│  │  docker-pro                             per seat · mo    │  │
│  │  Professional tier for individual developers             │  │
│  │  [bundle] [subscription] [user]                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Team                                  $16    →   │  │
│  │  docker-team                            per seat · mo    │  │
│  │  Collaboration tier for small teams                      │  │
│  │  [bundle] [subscription] [organization]                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Business                              $24    →   │  │
│  │  docker-business                   per seat · annual     │  │
│  │  Enterprise tier with security and admin features        │  │
│  │  [bundle] [subscription] [organization]                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ADD-ONS                                                        │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                                                 │
│  BUILD CLOUD · requires Pro, Team, or Business                  │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Build Cloud Minutes                          $25        │  │
│  │  build-cloud-minutes            per 500-min block · imm  │  │
│  │  Additional build minutes (block of 500)                 │  │
│  │  [add-on] [prepaid] [block pricing]                      │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
│  TESTCONTAINERS CLOUD · requires Pro, Team, or Business         │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  TC Cloud Minutes — Prepaid                   $3          │  │
│  │  tc-prepaid-minutes             per 100-min block · imm  │  │
│  │  Prepaid runtime minutes (block of 100)                  │  │
│  │  [add-on] [prepaid] [block pricing]                      │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  TC Cloud Minutes — On-Demand                 $0.04      │  │
│  │  tc-on-demand-minutes               per min · arrears    │  │
│  │  On-demand runtime billed at end of period               │  │
│  │  [add-on] [payg] [per-unit pricing]                      │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
│  GORDON · requires any DSoP subscription                        │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Gordon Pro                                   $20        │  │
│  │  gordon-pro                              per mo · fixed  │  │
│  │  2× credits, excess enabled                              │  │
│  │  [add-on] [subscription]                                 │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Gordon Max                                   $50        │  │
│  │  ...                                                     │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Gordon Ultra                                 $200       │  │
│  │  ...                                                     │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Gordon Enterprise                            $0.01      │  │
│  │  gordon-enterprise                   per req · arrears   │  │
│  │  [add-on] [payg]                                         │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
│  PREMIUM SUPPORT · requires Docker Business                     │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Premium Support                              $40,000    │  │
│  │  premium-support-org                     per yr · fixed  │  │
│  │  24×7 support with priority SLAs                         │  │
│  │  [add-on] [subscription]                                 │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  TAM Service                                  $60,000    │  │
│  │  tam-org                                 per yr · fixed  │  │
│  │  requires: Premium Support                               │  │
│  │  [add-on] [subscription]                                 │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```


### Example: DHI detail (standalone + add-on, variant pairing)

DHI has two Enterprise variants (per-repo and full-catalog) and two matching ELS add-ons that can only attach to their corresponding variant. Premium Support also appears here because it has an OR dependency on DHI Enterprise.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Product Catalog / Docker Hardened Images                     │
│                                                                 │
│  Docker Hardened Images                                         │
│  Secure container images product line                           │
│                                                                 │
│  OFFERINGS                                                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Free                                   $0         │  │
│  │  dhi-free                                     free       │  │
│  │  Hardened images, SBOMs, SLSA provenance                 │  │
│  │  [standalone] [subscription]                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Select                                 $5,000     │  │
│  │  dhi-select-org                          per repo · yr   │  │
│  │  Production-ready security with compliance support       │  │
│  │  [standalone] [subscription] [organization]              │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Enterprise (Per-Repo)                  $8,000     │  │
│  │  dhi-enterprise-per-repo                 per repo · yr   │  │
│  │  CVE SLAs, FIPS/STIG, compliance, mirroring             │  │
│  │  [standalone] [subscription] [organization]              │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DHI — Enterprise (Full Catalog)              $200,000   │  │
│  │  dhi-enterprise-full-catalog             per yr · fixed  │  │
│  │  Full DHI catalog access, unlimited repos                │  │
│  │  [standalone] [subscription] [organization]              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ADD-ONS                                                        │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                                                 │
│  DOCKER HARDENED IMAGES                                         │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  DHI — ELS (Per-Repo)                         $8,000     │  │
│  │  dhi-els-per-repo                        per repo · yr   │  │
│  │  +5 yrs hardened updates for EOL software                │  │
│  │  [add-on] [subscription]                                 │  │
│  │  requires: DHI Enterprise (Per-Repo)                     │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  DHI — ELS (Full Catalog)                     $200,000   │  │
│  │  dhi-els-full-catalog                    per yr · fixed  │  │
│  │  +5 yrs hardened updates for EOL software                │  │
│  │  [add-on] [subscription]                                 │  │
│  │  requires: DHI Enterprise (Full Catalog)                 │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
│  PREMIUM SUPPORT · requires DHI Enterprise (Per-Repo) or (Full Catalog)                      │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Premium Support                              $40,000    │  │
│  │  premium-support-org                     per yr · fixed  │  │
│  │  24×7 support with priority SLAs                         │  │
│  │  [add-on] [subscription]                                 │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  TAM Service                                  $60,000    │  │
│  │  tam-org                                 per yr · fixed  │  │
│  │  requires: Premium Support                               │  │
│  │  [add-on] [subscription]                                 │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```


### Example: Build Cloud detail (single offering, block pricing)

When a group has a single consolidated offering, the detail view still shows the pricing model clearly.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Product Catalog / Build Cloud                                │
│                                                                 │
│  Build Cloud                                                    │
│  Additional build minutes                                       │
│  Requires a paid DSoP subscription (Pro, Team, or Business)     │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Build Cloud Minutes                          $25         │  │
│  │  build-cloud-minutes            per 500-min block · imm  │  │
│  │  Prepaid build minutes, expires end of subscription      │  │
│  │  [add-on] [prepaid] [block pricing]                      │  │
│  │                                                          │  │
│  │  $0.05/min · blocks of 500                               │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```


### Example: Premium Support detail (own group, chained deps)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Product Catalog / Docker Premium Support                     │
│                                                                 │
│  Docker Premium Support                                         │
│  Premium support and TAM services                               │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  Premium Support                              $40,000    │  │
│  │  premium-support-org                     per yr · fixed  │  │
│  │  24×7 support with priority SLAs                         │  │
│  │  [add-on] [subscription] [organization]                  │  │
│  │  requires: Docker Business OR DHI Enterprise             │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  TAM Service                                  $60,000    │  │
│  │  tam-org                                 per yr · fixed  │  │
│  │  Technical Account Manager                               │  │
│  │  [add-on] [subscription] [organization]                  │  │
│  │  requires: Premium Support                               │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```


---

## Add-on resolution logic

To populate the ADD-ONS zone on any group detail page, query:

1. **Internal add-ons:** offerings in THIS group where `offering_package = 'add_on'`
2. **External add-ons:** offerings in OTHER groups that have an `offering_dependency` pointing at any offering or group in THIS group

Group the results by source offering group. Show the dependency scope next to each sub-group label (e.g. "requires Pro, Team, or Business" vs "requires Docker Business" vs "requires DHI Enterprise").

### Dependency scope display

| Dependency type | Display |
|----------------|---------|
| `required_group_id` → DSoP group | "requires any DSoP subscription" |
| `required_group_id` → DSoP group, but only paid plans are eligible | "requires Pro, Team, or Business" |
| `required_offering_id` → specific offering | "requires {offering name}" |
| Multiple `required_offering_id` (OR) | "requires {A} or {B}" |


---

## Data per card (View 2)

Every offering card on the group detail page shows:

| Field | Source | Example |
|-------|--------|---------|
| Name | `offerings.offering_name` | Docker Pro |
| Slug | `offerings.slug` | docker-pro |
| Description | `offerings.description` | Professional tier for... |
| Package badge | `offerings.offering_package` | bundle / standalone / add-on |
| Monetization badge | `offerings.monetization_strategy` | subscription / payg / prepaid |
| Pricing model badge | `rate_cards.pricing_type` | fixed / per-unit / block |
| Account type badge | `offerings.account_type` | user / organization |
| Price | `rate_cards.pricing_details` → extract price | $11 |
| Cycle | `rate_cards.billing_cycle` + `billing_timing` | per seat · monthly |
| Dependency (add-ons only) | `offering_dependencies` | requires: Docker Business |
| Click affordance | `→` on right side | navigates to offering detail (View 3) |

### Price line formatting (View 2 cards)

The price line implicitly communicates the pricing model — no badge needed.

| Pricing model | Example display |
|--------------|----------------|
| Fixed, free | `$0` `free` |
| Fixed, paid | `$40,000/yr` |
| Per-unit | `$11/seat · mo` |
| Block | `$25 per 500-min block` |
| Per-unit, PAYG | `$0.04/min · arrears` |
| Graduated / volume | `from $0.03/min` |
| Draft (no rate card) | `pricing TBD` `[draft]` |


---

## View 3: Offering Detail

Click an offering card from View 2 → full configuration page. Shows the offering metadata, then the services it includes with their features/entitlements, rate cards, lifecycle transitions, and constraints.

Back link returns to the group detail page.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← DSoP / Docker Pro                                            │
│                                                                 │
│  Docker Pro                                                     │
│  docker-pro                                                     │
│  Professional tier for individual developers                    │
│                                                                 │
│  [bundle] [subscription] [user]                                 │
│  $11 per seat · monthly  ($108 annual)                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  SERVICES & ENTITLEMENTS                                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  General                                                  │  │
│  │  svc: general                                             │  │
│  │                                                           │  │
│  │  seats                              1         static     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Hub                                               │  │
│  │  svc: hub                                                 │  │
│  │                                                           │  │
│  │  private_repositories_limit         ∞         static     │  │
│  │  image_pull_count_included_monthly  25,000    static     │  │
│  │  concurrent_builds_limit            5         static     │  │
│  │  image_pull_rate_limit_per_hour     —         static     │  │
│  │  trusted_content_catalog_enabled    ✗         —          │  │
│  │  webhooks_enabled                   ✗         —          │  │
│  │  ...                                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Build                                             │  │
│  │  svc: build                                               │  │
│  │                                                           │  │
│  │  build_minutes_included_monthly     200       static     │  │
│  │  cloud_builders_type                basic     —          │  │
│  │  storage_gib_limit                  50        static     │  │
│  │  concurrent_builds_limit            4         static     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Docker Scout                                             │  │
│  │  svc: scout                                               │  │
│  │                                                           │  │
│  │  remote_repositories                2         static     │  │
│  │  health_scores_enabled              ✓         —          │  │
│  │  local_vulnerability_analysis       ✓         —          │  │
│  │  image_remediation_enabled          ✓         —          │  │
│  │  policy_library_type                basic     —          │  │
│  │  alerting_type                      basic     —          │  │
│  │  ...                                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Testcontainers Cloud                                     │  │
│  │  svc: testcontainers                                      │  │
│  │                                                           │  │
│  │  tc_runtime_minutes_monthly         100       aggregated │  │
│  │  tc_max_concurrent_workers_desktop  4         static     │  │
│  │  tc_dashboard_enabled               ✓         —          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Gordon                                                   │  │
│  │  svc: gordon                                              │  │
│  │                                                           │  │
│  │  gordon_enabled                     ✓         —          │  │
│  │  gordon_monthly_budget              900       —          │  │
│  │  gordon_excess_credits_enabled      ✗         —          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  RATE CARDS                                                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Seat · per_unit · advance · monthly                      │  │
│  │  $11.00 / seat                                Stripe ↗   │  │
│  │                                                           │  │
│  │  Seat · per_unit · advance · annual                       │  │
│  │  $108.00 / seat                               Stripe ↗   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  LIFECYCLE                                                      │
│                                                                 │
│  ↑ upgrade from: Docker Personal (immediate)                    │
│  ↓ downgrade to: Docker Personal (end of period)                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  CONSTRAINTS                                                    │
│                                                                 │
│  seats: self-serve 1–1 · inside-sales 1–1                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sections

| Section | Source tables | Notes |
|---------|-------------|-------|
| Header | `offerings` | Name, slug, description, badges, price summary |
| Services & Entitlements | `offering_services` → `offering_features` joined to `service_features` | One card per service. Features listed as slug / value / metering_type. |
| Rate Cards | `rate_cards` + pricing detail tables | Pricing type, billing timing, cycle, price, external system link |
| Lifecycle | `offering_lifecycle_transitions` | Upgrades and downgrades with timing |
| Constraints | `offering_constraints` | Min/max per origin (self-serve, inside-sales) |

### Feature display rules

| Feature type | Value display | Style |
|-------------|--------------|-------|
| `boolean` true | ✓ | normal |
| `boolean` false | ✗ | dimmed (`g.400`, lower opacity) |
| `integer` NULL | ∞ (unlimited) | normal |
| `integer` 0 | 0 | dimmed |
| `integer` > 0 | formatted number (e.g. 25,000) | normal |
| `integer` -1 | ∞ (unlimited, used in PAYG) | normal |
| `string` | raw value (e.g. "basic", "standard") | normal |
| `string` "none" | none | dimmed |


---

## Navigation summary

```
View 1: Group Index
  │
  ├─ [ ☰ List ] ←→ [ ◈ Graph ]    toggle between list and network diagram
  │
  └─ click group (either mode) → View 2: Group Detail
                                    │  (pill toggle: All / Individual / Organization)
                                    │
                                    ├─ OFFERINGS (bundles, standalones)
                                    │    └─ click card → View 3: Offering Detail
                                    │
                                    └─ ADD-ONS (internal + external deps)
                                         └─ click card → View 3: Offering Detail
```


---

## Visual treatment summary

| Element | Standalone / Bundle | Add-On |
|---------|-------------------|--------|
| Background | `#FFFFFF` (white) | `#F9FAFB` (g.50) |
| Border | `1px solid #E5E7EB` | `1px solid #F3F4F6` |
| Border hover | `#D1D5DB` | `#E5E7EB` |
| Section header | `OFFERINGS` | `ADD-ONS` |
| Sub-group label | — | Source group name + dep scope in `#9CA3AF` |
| Dependency line | — | shows "requires: X" in `#9CA3AF` on card |
| Click affordance | `→` right side | `→` right side |


---

## Design Decisions (resolved)

1. **Draft offerings.** Show with a `[draft]` badge and dimmed styling. Audience can see the full roadmap without confusing it with live offerings.
2. **Pricing display on cards.** No pricing model badge. Instead, let the price line convey the model implicitly: `$11/seat` (per-unit), `$25 per 500-min block` (block), `from $0.03/min` (graduated), `$40,000/yr` (fixed). Pricing model details live in View 3.
3. **Block pricing effective rate.** Show block price only on the card (`$25 per 500-min block`). Show the effective per-unit rate (`$0.05/min`) in View 3 offering detail.
4. **Premium Support on DHI.** Requires either DHI Enterprise variant — display as "requires DHI Enterprise (Per-Repo) or (Full Catalog)" on the DHI detail page. Explicit OR so the engineering team sees the dependency shape.
5. **Feature display in View 3.** Show all features including ✗ booleans and 0 values, but dim/fade them. Complete picture for the billing engineering audience, with visual hierarchy so enabled features stand out.
