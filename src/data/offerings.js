export const OFFERINGS = [
  // DSoP
  { id:"personal", group:"dsop", name:"Docker Personal", slug:"docker-personal", desc:"Free tier for individual developers", pkg:"bundle", mon:"subscription", acct:"user", channel:["self-serve"], price:"$0", cycle:"free", status:"active" },
  { id:"pro", group:"dsop", name:"Docker Pro", slug:"docker-pro", desc:"Professional tier for individual developers", pkg:"bundle", mon:"subscription", acct:"user", channel:["self-serve"], price:"$11/mo", cycle:"monthly", altPrice:"$108/yr", altCycle:"annual", status:"active" },
  { id:"team", group:"dsop", name:"Docker Team", slug:"docker-team", desc:"Collaboration tier for small teams (1 seat minimum)", pkg:"bundle", mon:"subscription", acct:"organization", channel:["self-serve", "sales-led"], price:"$16/seat/mo", cycle:"monthly", altPrice:"$180/seat/yr", altCycle:"annual", status:"active" },
  { id:"business", group:"dsop", name:"Docker Business", slug:"docker-business", desc:"Enterprise tier with security and admin features (1 seat minimum)", pkg:"bundle", mon:"subscription", acct:"organization", channel:["self-serve", "sales-led"], price:"$24/seat/mo", cycle:"monthly", altPrice:"$288/seat/yr", altCycle:"annual", status:"active" },
  // Build Cloud
  { id:"bc-min", group:"build-cloud", name:"Build Cloud Minutes", slug:"build-cloud-minutes", desc:"Prepaid build minutes, expires end of subscription period", pkg:"add_on", mon:"prepaid", acct:"both", channel:["self-serve", "sales-led"], price:"$25/500-min", cycle:"immediate", status:"active" },
  // TC
  { id:"tc-pre", group:"testcontainers", name:"TC Cloud Minutes — Prepaid", slug:"tc-prepaid-minutes", desc:"Prepaid runtime minutes (block of 100)", pkg:"add_on", mon:"prepaid", acct:"both", channel:["self-serve", "sales-led"], price:"$3/100-min", cycle:"immediate", status:"active" },
  { id:"tc-od", group:"testcontainers", name:"TC Cloud Minutes — On-Demand", slug:"tc-on-demand-minutes", desc:"On-demand runtime billed at end of period", pkg:"add_on", mon:"payg", acct:"both", channel:["self-serve", "sales-led"], price:"$0.04/min", cycle:"arrears", status:"active" },
  // DHI
  { id:"dhi-free", group:"dhi", name:"Community", slug:"dhi-free", desc:"Hardened images, SBOMs, SLSA provenance, Apache 2.0", pkg:"standalone", mon:"subscription", acct:"both", channel:["self-serve"], price:"$0", cycle:"free", status:"active" },
  { id:"dhi-sel", group:"dhi", name:"Select", slug:"dhi-select-org", desc:"Production-ready security with compliance support", pkg:"standalone", mon:"subscription", acct:"organization", channel:["sales-led"], price:"$5,000/repo/yr", cycle:"annual", status:"active" },
  { id:"dhi-ent-r", group:"dhi", name:"Enterprise (Per-Repo)", slug:"dhi-enterprise-per-repo", desc:"CVE SLAs, FIPS/STIG, compliance, mirroring", pkg:"standalone", mon:"subscription", acct:"organization", channel:["sales-led"], price:"$8,000/repo/yr", cycle:"annual", status:"active" },
  { id:"dhi-ent-f", group:"dhi", name:"Enterprise (Full Catalog)", slug:"dhi-enterprise-full-catalog", desc:"Full catalog access, unlimited repos", pkg:"standalone", mon:"subscription", acct:"organization", channel:["sales-led"], price:"$200,000/yr", cycle:"annual · fixed", status:"active" },
  { id:"dhi-els-r", group:"dhi", name:"ELS (Per-Repo)", slug:"dhi-els-per-repo", desc:"+5 yrs hardened updates for EOL software", pkg:"add_on", mon:"subscription", acct:"organization", channel:["sales-led"], price:"$8,000/repo/yr", cycle:"annual", status:"active", requires:"Enterprise (Per-Repo)" },
  { id:"dhi-els-f", group:"dhi", name:"ELS (Full Catalog)", slug:"dhi-els-full-catalog", desc:"+5 yrs hardened updates for EOL software", pkg:"add_on", mon:"subscription", acct:"organization", channel:["sales-led"], price:"$200,000/yr", cycle:"annual · fixed", status:"active", requires:"Enterprise (Full Catalog)" },
  // Premium Support
  { id:"prem", group:"premium-support", name:"Premium Support", slug:"premium-support-org", desc:"24×7 support with priority SLAs, escalation, live troubleshooting, and RCA", pkg:"add_on", mon:"subscription", acct:"organization", channel:["sales-led"], price:"$40,000/yr", cycle:"annual · fixed", status:"active", requires:"Docker Business or Enterprise (Per-Repo) or (Full Catalog)" },
  // Gordon
  { id:"g-pro", group:"gordon", name:"Gordon Pro", slug:"gordon-pro", desc:"2× credits ($18 budget), excess enabled", pkg:"add_on", mon:"subscription", acct:"user", channel:["self-serve"], price:"$20/mo", cycle:"monthly", status:"active" },
  { id:"g-max", group:"gordon", name:"Gordon Max", slug:"gordon-max", desc:"5× credits ($45 budget), excess enabled", pkg:"add_on", mon:"subscription", acct:"user", channel:["self-serve"], price:"$50/mo", cycle:"monthly", status:"active" },
  { id:"g-ult", group:"gordon", name:"Gordon Ultra", slug:"gordon-ultra", desc:"20× credits ($180 budget), excess enabled", pkg:"add_on", mon:"subscription", acct:"user", channel:["self-serve"], price:"$200/mo", cycle:"monthly", status:"active" },
  { id:"g-ent", group:"gordon", name:"Gordon Enterprise", slug:"gordon-enterprise", desc:"Unlimited usage, PAYG per request", pkg:"add_on", mon:"payg", acct:"organization", channel:["sales-led"], price:"$0.01/req", cycle:"arrears", status:"active" },
  { id:"g-pro-o", group:"gordon", name:"Gordon Pro (Org)", slug:"gordon-pro-org", desc:"Org variant — pricing TBD", pkg:"add_on", mon:"subscription", acct:"organization", channel:["self-serve"], price:"pricing TBD", cycle:"—", status:"draft" },
  { id:"g-max-o", group:"gordon", name:"Gordon Max (Org)", slug:"gordon-max-org", desc:"Org variant — pricing TBD", pkg:"add_on", mon:"subscription", acct:"organization", channel:["self-serve"], price:"pricing TBD", cycle:"—", status:"draft" },
  { id:"g-ult-o", group:"gordon", name:"Gordon Ultra (Org)", slug:"gordon-ultra-org", desc:"Org variant — pricing TBD", pkg:"add_on", mon:"subscription", acct:"organization", channel:["self-serve"], price:"pricing TBD", cycle:"—", status:"draft" },
  // Sandboxes
  { id:"sbx", group:"sandboxes", name:"Sandboxes", slug:"sandboxes-payg", desc:"On-demand ephemeral compute — CPU, memory, storage metered", pkg:"standalone", mon:"payg", acct:"both", channel:["self-serve", "sales-led"], price:"from $0.035/hr", cycle:"arrears", status:"active" },
];

// Explicit dependency mapping: add-on ID → array of required offering IDs
export const OFFERING_DEPS = {
  "dhi-els-r": ["dhi-ent-r"],
  "dhi-els-f": ["dhi-ent-f"],
  "prem": ["business", "dhi-ent-r", "dhi-ent-f"],
  "bc-min": ["pro", "team", "business"],
  "tc-pre": ["pro", "team", "business"],
  "tc-od": ["pro", "team", "business"],
  "g-pro": ["personal", "pro", "team", "business"],
  "g-max": ["personal", "pro", "team", "business"],
  "g-ult": ["personal", "pro", "team", "business"],
  "g-ent": ["personal", "pro", "team", "business"],
  "g-pro-o": ["personal", "pro", "team", "business"],
  "g-max-o": ["personal", "pro", "team", "business"],
  "g-ult-o": ["personal", "pro", "team", "business"],
};
