export const GROUPS = [
  { id:"dsop", name:"Docker Suite of Products (DSoP)", short:"DSoP", desc:"Core subscription tiers", standalone:false },
  { id:"build-cloud", name:"Build Cloud", short:"Build Cloud", desc:"Additional build minutes", standalone:false },
  { id:"testcontainers", name:"Testcontainers Cloud", short:"TC Cloud", desc:"Cloud runtime minutes", standalone:false },
  { id:"dhi", name:"Hardened Images", short:"Hardened Images", desc:"Secure container images", standalone:false },
  { id:"premium-support", name:"Support", short:"Support", desc:"Premium support services", standalone:false },
  { id:"gordon", name:"Gordon", short:"Gordon", desc:"Docker AI assistant", standalone:false },
  { id:"sandboxes", name:"Sandboxes", short:"Sandboxes", desc:"On-demand ephemeral compute environments", standalone:false },
];

// Which external groups' add-ons show on a given group's detail page
export const EXTERNAL_ADDONS = {
  "dsop": [
    { sourceGroup:"premium-support", dep:"requires Docker Business" },
  ],
  "dhi": [
    { sourceGroup:"premium-support", dep:"requires Enterprise (Per-Repo) or (Full Catalog)" },
  ]
};

// Graph edges (from dependent → to required)
export const GRAPH_EDGES = [
  { from:"build-cloud", to:"dsop" },
  { from:"testcontainers", to:"dsop" },
  { from:"gordon", to:"dsop" },
  { from:"premium-support", to:"dsop" },
  { from:"premium-support", to:"dhi" },
];
