// Entitlements by offering ID (service cards with features)
export const OFFERING_ENTITLEMENTS = {
  "personal": [
    { svc:"General", slug:"general", feats:[{s:"seats",v:"1",m:"static"}]},
    { svc:"Docker Hub", slug:"hub", feats:[
      {s:"private_repositories_limit",v:"1",m:"static"},{s:"image_pull_rate_limit_per_hour",v:"40",m:"static"},
      {s:"image_pull_count_included_monthly",v:"0",m:"static",dim:true},{s:"concurrent_builds_limit",v:"0",m:"static",dim:true},
      {s:"trusted_content_catalog_enabled",v:"✗",dim:true},{s:"webhooks_enabled",v:"✗",dim:true},
    ]},
    { svc:"Docker Scout", slug:"scout", feats:[
      {s:"remote_repositories",v:"1",m:"static"},{s:"health_scores_enabled",v:"✓"},
      {s:"local_vulnerability_analysis",v:"✓"},{s:"image_remediation_enabled",v:"✗",dim:true},
      {s:"policy_library_type",v:"none",dim:true},{s:"alerting_type",v:"none",dim:true},
    ]},
  ],
  "pro": [
    { svc:"General", slug:"general", feats:[{s:"seats",v:"1",m:"static"}]},
    { svc:"Docker Hub", slug:"hub", feats:[
      {s:"private_repositories_limit",v:"∞",m:"static"},{s:"image_pull_count_included_monthly",v:"25,000",m:"static"},
      {s:"concurrent_builds_limit",v:"5",m:"static"},{s:"image_pull_rate_limit_per_hour",v:"—",m:"static"},
      {s:"trusted_content_catalog_enabled",v:"✗",dim:true},{s:"webhooks_enabled",v:"✗",dim:true},
    ]},
    { svc:"Docker Build", slug:"build", feats:[
      {s:"build_minutes_included_monthly",v:"200",m:"static"},{s:"cloud_builders_type",v:"basic"},
      {s:"storage_gib_limit",v:"50",m:"static"},{s:"concurrent_builds_limit",v:"4",m:"static"},
    ]},
    { svc:"Docker Scout", slug:"scout", feats:[
      {s:"remote_repositories",v:"2",m:"static"},{s:"health_scores_enabled",v:"✓"},
      {s:"local_vulnerability_analysis",v:"✓"},{s:"image_remediation_enabled",v:"✓"},
      {s:"policy_library_type",v:"basic"},{s:"alerting_type",v:"basic"},
    ]},
    { svc:"Testcontainers Cloud", slug:"testcontainers", feats:[
      {s:"tc_runtime_minutes_monthly",v:"100",m:"aggregated"},{s:"tc_max_concurrent_workers_desktop",v:"4",m:"static"},
      {s:"tc_dashboard_enabled",v:"✓"},
    ]},
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_monthly_budget",v:"900"},
      {s:"gordon_excess_credits_enabled",v:"✗",dim:true},
    ]},
  ],
  "team": [
    { svc:"General", slug:"general", feats:[{s:"seats",v:"1",m:"static"}]},
    { svc:"Docker Hub", slug:"hub", feats:[
      {s:"private_repositories_limit",v:"∞",m:"static"},{s:"image_pull_count_included_monthly",v:"100,000",m:"static"},
      {s:"concurrent_builds_limit",v:"15",m:"static"},
    ]},
    { svc:"Docker Build", slug:"build", feats:[
      {s:"build_minutes_included_monthly",v:"500",m:"static"},{s:"cloud_builders_type",v:"standard"},
      {s:"storage_gib_limit",v:"100",m:"static"},{s:"concurrent_builds_limit",v:"∞",m:"static"},
    ]},
    { svc:"Docker Scout", slug:"scout", feats:[
      {s:"remote_repositories",v:"∞",m:"static"},{s:"health_scores_enabled",v:"✓"},
      {s:"policy_library_type",v:"standard"},{s:"alerting_type",v:"standard"},
    ]},
    { svc:"Docker Admin", slug:"admin", feats:[
      {s:"role_based_access_control_enabled",v:"✓"},{s:"audit_logs_enabled",v:"✓"},
      {s:"organization_access_tokens_limit",v:"10",m:"static"},{s:"single_sign_on_enabled",v:"✗",dim:true},
    ]},
    { svc:"Testcontainers Cloud", slug:"testcontainers", feats:[
      {s:"tc_runtime_minutes_monthly",v:"500",m:"aggregated"},{s:"tc_max_concurrent_workers_desktop",v:"4",m:"static"},
    ]},
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_monthly_budget",v:"900"},
      {s:"gordon_excess_credits_enabled",v:"✗",dim:true},
    ]},
  ],
  "business": [
    { svc:"General", slug:"general", feats:[{s:"seats",v:"1",m:"static"}]},
    { svc:"Docker Hub", slug:"hub", feats:[
      {s:"private_repositories_limit",v:"∞",m:"static"},{s:"image_pull_count_included_monthly",v:"1,000,000",m:"static"},
      {s:"concurrent_builds_limit",v:"15",m:"static"},{s:"image_access_management_enabled",v:"✓"},
    ]},
    { svc:"Docker Build", slug:"build", feats:[
      {s:"build_minutes_included_monthly",v:"1,500",m:"static"},{s:"cloud_builders_type",v:"standard"},
      {s:"storage_gib_limit",v:"200",m:"static"},{s:"concurrent_builds_limit",v:"∞",m:"static"},
    ]},
    { svc:"Docker Scout", slug:"scout", feats:[
      {s:"remote_repositories",v:"∞",m:"static"},{s:"health_scores_enabled",v:"✓"},
      {s:"policy_library_type",v:"standard"},{s:"vulnerability_reporting_enabled",v:"✓"},
      {s:"cve_suppression_enabled",v:"✓"},{s:"api_integrations_enabled",v:"✓"},
    ]},
    { svc:"Docker Admin", slug:"admin", feats:[
      {s:"role_based_access_control_enabled",v:"✓"},{s:"audit_logs_enabled",v:"✓"},
      {s:"single_sign_on_enabled",v:"✓"},{s:"scim_enabled",v:"✓"},
      {s:"settings_management_enabled",v:"✓"},{s:"organization_access_tokens_limit",v:"100",m:"static"},
      {s:"custom_roles_enabled",v:"✓"},{s:"domain_audit_enabled",v:"✓"},
    ]},
    { svc:"Testcontainers Cloud", slug:"testcontainers", feats:[
      {s:"tc_runtime_minutes_monthly",v:"1,500",m:"aggregated"},{s:"tc_max_concurrent_workers_desktop",v:"4",m:"static"},
    ]},
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_monthly_budget",v:"900"},
      {s:"gordon_excess_credits_enabled",v:"✗",dim:true},
    ]},
  ],
  "dhi-free": [
    { svc:"Hardened Images", slug:"dhi", feats:[
      {s:"dhi_enabled",v:"✓"},{s:"dhi_hardened_image_repos",v:"0",m:"static",dim:true},
      {s:"dhi_sbom_enabled",v:"✓"},{s:"dhi_slsa_provenance",v:"✓"},
      {s:"dhi_cve_visibility",v:"✓"},{s:"dhi_cve_remediation_sla",v:"✗",dim:true},
      {s:"dhi_fips_stig",v:"✗",dim:true},{s:"dhi_compliance_support",v:"✗",dim:true},
      {s:"dhi_mirroring",v:"✗",dim:true},{s:"dhi_els_enabled",v:"✗",dim:true},
      {s:"dhi_select_enabled",v:"✗",dim:true},{s:"dhi_customizations_limit",v:"0",dim:true},
      {s:"dhi_hardened_sys_pkg_repo",v:"✗",dim:true},{s:"dhi_full_catalog_access",v:"✗",dim:true},
    ]},
  ],
  "dhi-sel": [
    { svc:"Hardened Images", slug:"dhi", feats:[
      {s:"dhi_enabled",v:"✓"},{s:"dhi_hardened_image_repos",v:"1",m:"static"},
      {s:"dhi_sbom_enabled",v:"✓"},{s:"dhi_slsa_provenance",v:"✓"},
      {s:"dhi_cve_visibility",v:"✓"},{s:"dhi_cve_remediation_sla",v:"✓"},
      {s:"dhi_fips_stig",v:"✓"},{s:"dhi_compliance_support",v:"✓"},
      {s:"dhi_mirroring",v:"✗",dim:true},{s:"dhi_els_enabled",v:"✗",dim:true},
      {s:"dhi_select_enabled",v:"✓"},{s:"dhi_customizations_limit",v:"5",m:"static"},
      {s:"dhi_hardened_sys_pkg_repo",v:"✗",dim:true},{s:"dhi_full_catalog_access",v:"✗",dim:true},
    ]},
  ],
  "dhi-ent-r": [
    { svc:"Hardened Images", slug:"dhi", feats:[
      {s:"dhi_enabled",v:"✓"},{s:"dhi_hardened_image_repos",v:"1",m:"static"},
      {s:"dhi_sbom_enabled",v:"✓"},{s:"dhi_slsa_provenance",v:"✓"},
      {s:"dhi_cve_visibility",v:"✓"},{s:"dhi_cve_remediation_sla",v:"✓"},
      {s:"dhi_fips_stig",v:"✓"},{s:"dhi_compliance_support",v:"✓"},
      {s:"dhi_mirroring",v:"✓"},{s:"dhi_els_enabled",v:"✗",dim:true},
      {s:"dhi_select_enabled",v:"✓"},{s:"dhi_customizations_limit",v:"∞",m:"static"},
      {s:"dhi_hardened_sys_pkg_repo",v:"✓"},{s:"dhi_full_catalog_access",v:"✗",dim:true},
    ]},
  ],
  "dhi-ent-f": [
    { svc:"Hardened Images", slug:"dhi", feats:[
      {s:"dhi_enabled",v:"✓"},{s:"dhi_hardened_image_repos",v:"∞",m:"static"},
      {s:"dhi_sbom_enabled",v:"✓"},{s:"dhi_slsa_provenance",v:"✓"},
      {s:"dhi_cve_visibility",v:"✓"},{s:"dhi_cve_remediation_sla",v:"✓"},
      {s:"dhi_fips_stig",v:"✓"},{s:"dhi_compliance_support",v:"✓"},
      {s:"dhi_mirroring",v:"✓"},{s:"dhi_els_enabled",v:"✗",dim:true},
      {s:"dhi_select_enabled",v:"✓"},{s:"dhi_customizations_limit",v:"∞",m:"static"},
      {s:"dhi_hardened_sys_pkg_repo",v:"✓"},{s:"dhi_full_catalog_access",v:"✓"},
    ]},
  ],
  "dhi-els-r": [
    { svc:"Hardened Images", slug:"dhi", feats:[
      {s:"dhi_els_enabled",v:"✓"},
    ]},
  ],
  "dhi-els-f": [
    { svc:"Hardened Images", slug:"dhi", feats:[
      {s:"dhi_els_enabled",v:"✓"},
    ]},
  ],
  "prem": [
    { svc:"Docker Support", slug:"support", feats:[
      {s:"premium_support_enabled",v:"✓"},{s:"sev1_response_hours",v:"1",m:"static"},
      {s:"sev2_response_hours",v:"4",m:"static"},{s:"sev3_response_hours",v:"8",m:"static"},
      {s:"priority_ticket_routing",v:"✓"},{s:"escalation_management",v:"✓"},
      {s:"live_troubleshooting",v:"✓"},{s:"root_cause_analysis",v:"✓"},
      {s:"support_availability",v:"24×7"},
    ]},
  ],
  "tam": [
    { svc:"Docker Support", slug:"support", feats:[
      {s:"tam_enabled",v:"✓"},{s:"tam_quickstarts",v:"✓"},
      {s:"tam_health_adoption",v:"✓"},{s:"tam_roadmap_advisory",v:"✓"},
      {s:"tam_architecture_review",v:"✓"},{s:"tam_ebrs_qbrs",v:"✓"},
    ]},
  ],
  "g-pro": [
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_monthly_budget",v:"1,800"},
      {s:"gordon_excess_enabled",v:"✓"},
    ]},
  ],
  "g-max": [
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_monthly_budget",v:"4,500"},
      {s:"gordon_excess_enabled",v:"✓"},
    ]},
  ],
  "g-ult": [
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_monthly_budget",v:"18,000"},
      {s:"gordon_excess_enabled",v:"✓"},
    ]},
  ],
  "g-ent": [
    { svc:"Gordon", slug:"gordon", feats:[
      {s:"gordon_enabled",v:"✓"},{s:"gordon_spending_cap",v:"∞"},
      {s:"gordon_excess_enabled",v:"✗",dim:true},
    ]},
  ],
  "bc-min": [
    { svc:"Docker Build", slug:"build", feats:[
      {s:"build_minutes_additional_annual",v:"per block",m:"static"},
    ]},
  ],
  "tc-pre": [
    { svc:"Testcontainers Cloud", slug:"testcontainers", feats:[
      {s:"tc_additional_minutes",v:"per block",m:"aggregated"},
    ]},
  ],
  "tc-od": [
    { svc:"Testcontainers Cloud", slug:"testcontainers", feats:[
      {s:"tc_additional_minutes",v:"∞ (PAYG)",m:"aggregated"},
    ]},
  ],
  "sbx": [
    { svc:"Sandboxes", slug:"sandboxes", feats:[
      {s:"sandboxes_enabled",v:"✓",m:"static"},
      {s:"sandbox_cpu_usage",v:"∞ (PAYG)",m:"aggregated"},
      {s:"sandbox_memory_usage",v:"∞ (PAYG)",m:"aggregated"},
      {s:"sandbox_storage_usage",v:"∞ (PAYG)",m:"aggregated"},
    ]},
  ],
};

// Rate cards by offering ID
export const RATE_CARDS = {
  "personal": [{label:"Seat · fixed · advance · monthly", price:"$0.00", external:"Stripe · price_1PxgztCi2Sw6UZ9J"}],
  "pro": [{label:"Seat · fixed · advance · monthly", price:"$11.00 / month", external:"Stripe · price_1Pxh7CCi2Sw6UZ9J"},{label:"Seat · fixed · advance · annual", price:"$108.00 / year", external:"Stripe · price_1Pxh7CCi2Sw6UZ9Jv"}],
  "team": [{label:"Seat · per_unit · advance · monthly", price:"$16.00 / seat", external:"Stripe · price_1PxhIvCi2Sw6UZ9J"},{label:"Seat · per_unit · advance · annual", price:"$180.00 / seat", external:"Stripe · price_1PxhIvCi2Sw6UZ9Jc"}],
  "business": [{label:"Seat · per_unit · advance · annual", price:"$288.00 / seat", external:"Stripe · price_1PxhLECi2Sw6UZ9J"}],
  "bc-min": [{label:"Build minutes · block · immediate · one-time", price:"$25.00/500-min ($0.05/min effective)"}],
  "tc-pre": [{label:"TC minutes · block · immediate · one-time", price:"$3.00/100-min ($0.03/min effective)"}],
  "tc-od": [{label:"TC minutes · per_unit · arrears · monthly", price:"$0.04 / minute"}],
  "dhi-free": [{label:"DHI access · fixed · advance · monthly", price:"$0.00"}],
  "dhi-sel": [{label:"DHI repo · per_unit · advance · annual", price:"$5,000.00 / repo / year"}],
  "dhi-ent-r": [{label:"DHI repo · per_unit · advance · annual", price:"$8,000.00 / repo / year"}],
  "dhi-ent-f": [{label:"DHI catalog · fixed · advance · annual", price:"$200,000.00 / year"}],
  "dhi-els-r": [{label:"ELS repo · per_unit · advance · annual", price:"$8,000.00 / repo / year"}],
  "dhi-els-f": [{label:"ELS catalog · fixed · advance · annual", price:"$200,000.00 / year"}],
  "prem": [{label:"Support · fixed · advance · annual", price:"$40,000.00 / year"}],
  "tam": [{label:"TAM · fixed · advance · annual", price:"$60,000.00 / year"}],
  "g-pro": [{label:"Gordon · fixed · advance · monthly", price:"$20.00 / month"},{label:"Gordon overage · per_unit · arrears · monthly", price:"$0.000001 / credit"}],
  "g-max": [{label:"Gordon · fixed · advance · monthly", price:"$50.00 / month"},{label:"Gordon overage · per_unit · arrears · monthly", price:"$0.000001 / credit"}],
  "g-ult": [{label:"Gordon · fixed · advance · monthly", price:"$200.00 / month"},{label:"Gordon overage · per_unit · arrears · monthly", price:"$0.000001 / credit"}],
  "g-ent": [{label:"Gordon · per_unit · arrears · monthly", price:"$0.01 / request (placeholder)"}],
  "sbx": [
    {label:"CPU · per_unit · arrears · monthly", price:"from $0.035 / vCPU-hour"},
    {label:"Memory · per_unit · arrears · monthly", price:"from $0.005 / GB-hour"},
    {label:"Storage · per_unit · arrears · monthly", price:"from $0.06 / GB-month"},
  ],
};

// Lifecycle transitions by offering ID
export const LIFECYCLE = {
  "personal": [{dir:"↑",text:"upgrade to: Docker Pro (immediate)"}],
  "pro": [{dir:"↑",text:"upgrade from: Docker Personal (immediate)"},{dir:"↓",text:"downgrade to: Docker Personal (end of period)"}],
  "team": [{dir:"↑",text:"upgrade to: Docker Business (immediate)"}],
  "business": [{dir:"↓",text:"downgrade to: Docker Team (end of period)"}],
  "dhi-free": [{dir:"↑",text:"upgrade to: Select (immediate)"},{dir:"↑",text:"upgrade to: Enterprise (immediate)"}],
  "dhi-sel": [{dir:"↑",text:"upgrade from: Community (immediate)"},{dir:"↑",text:"upgrade to: Enterprise (immediate)"},{dir:"↓",text:"downgrade to: Community (end of period)"}],
  "dhi-ent-r": [{dir:"↑",text:"upgrade from: Select (immediate)"},{dir:"↓",text:"downgrade to: Select (end of period)"}],
  "dhi-ent-f": [{dir:"↑",text:"upgrade from: Select (immediate)"},{dir:"↓",text:"downgrade to: Select (end of period)"}],
  "g-pro": [{dir:"↑",text:"upgrade to: Gordon Max (immediate)"},{dir:"↑",text:"upgrade to: Gordon Ultra (immediate)"}],
  "g-max": [{dir:"↑",text:"upgrade from: Gordon Pro (immediate)"},{dir:"↑",text:"upgrade to: Gordon Ultra (immediate)"},{dir:"↓",text:"downgrade to: Gordon Pro (end of period)"}],
  "g-ult": [{dir:"↑",text:"upgrade from: Gordon Max (immediate)"},{dir:"↓",text:"downgrade to: Gordon Max (end of period)"},{dir:"↓",text:"downgrade to: Gordon Pro (end of period)"}],
};

// Constraints by offering ID
export const CONSTRAINTS = {
  "personal": ["seats: self-serve 1–1"],
  "pro": ["seats: self-serve 1–1"],
  "team": ["seats: self-serve 1–100 · sales-led 25+"],
  "business": ["seats: self-serve 1–100 · sales-led 25+"],
};
