export const METERS = [
  { id:"m-build-min", slug:"build_minutes_usage", name:"Build Minutes Usage", service:"Docker Build", serviceId:"build", feature:"build_minutes_included_monthly", unit:"minutes", status:"active", external:"UBB · meter_2aBcD" },
  { id:"m-tc-min", slug:"tc_runtime_minutes", name:"TC Runtime Minutes", service:"Testcontainers Cloud", serviceId:"testcontainers", feature:"tc_runtime_minutes_monthly", unit:"minutes", status:"active", external:"UBB · meter_3eFgH" },
  { id:"m-scout-repo", slug:"scout_repository_count", name:"Scout Repository Count", service:"Docker Scout", serviceId:"scout", feature:"remote_repositories", unit:"count_distinct", status:"active", external:null },
  { id:"m-gordon-credits", slug:"gordon_credit_usage", name:"Gordon Credit Usage", service:"Gordon", serviceId:"gordon", feature:"gordon_monthly_budget", unit:"requests", status:"active", external:"UBB · meter_4iJkL" },
  { id:"m-hub-pulls", slug:"image_pull_count", name:"Image Pull Count", service:"Docker Hub", serviceId:"hub", feature:"image_pull_count_included_monthly", unit:"requests", status:"active", external:"UBB · meter_5mNpQ" },
  { id:"m-sbx-cpu", slug:"sandbox_cpu", name:"Sandbox CPU Usage", service:"Docker Sandboxes", serviceId:"sandboxes", feature:"sandbox_cpu_usage", unit:"vcpu_hours", status:"active", external:"UBB · meter_6rStU" },
  { id:"m-sbx-mem", slug:"sandbox_memory", name:"Sandbox Memory Usage", service:"Docker Sandboxes", serviceId:"sandboxes", feature:"sandbox_memory_usage", unit:"gb_hours", status:"active", external:"UBB · meter_7vWxY" },
  { id:"m-sbx-stor", slug:"sandbox_storage", name:"Sandbox Storage Usage", service:"Docker Sandboxes", serviceId:"sandboxes", feature:"sandbox_storage_usage", unit:"gib_hours", status:"active", external:"UBB · meter_8zAbC" },
  { id:"m-gordon-req", slug:"gordon_request_count", name:"Gordon Request Count", service:"Gordon", serviceId:"gordon", feature:"gordon_enabled", unit:"requests", status:"active", external:null },
];

export const METERED_RESOURCES = [
  { id:"r-std-build", slug:"standard_build", name:"Standard Build", service:"Docker Build", serviceId:"build", desc:"Standard cloud builder instance (4 CPU / 8 GB)", status:"active", meters:["m-build-min"] },
  { id:"r-perf-build", slug:"performance_build", name:"Performance Build", service:"Docker Build", serviceId:"build", desc:"Performance cloud builder instance (8 CPU / 32 GB)", status:"active", meters:["m-build-min"] },
  { id:"r-tc-worker", slug:"tc_worker", name:"TC Cloud Worker", service:"Testcontainers Cloud", serviceId:"testcontainers", desc:"Testcontainers Cloud worker instance", status:"active", meters:["m-tc-min"] },
  { id:"r-sbx-small", slug:"2cpu_4gb", name:"Sandbox — Small", service:"Docker Sandboxes", serviceId:"sandboxes", desc:"2 vCPU, 4 GB RAM sandbox instance", status:"active", meters:["m-sbx-cpu","m-sbx-mem","m-sbx-stor"] },
  { id:"r-sbx-med", slug:"4cpu_8gb", name:"Sandbox — Medium", service:"Docker Sandboxes", serviceId:"sandboxes", desc:"4 vCPU, 8 GB RAM sandbox instance", status:"active", meters:["m-sbx-cpu","m-sbx-mem","m-sbx-stor"] },
  { id:"r-sbx-lg", slug:"8cpu_16gb", name:"Sandbox — Large", service:"Docker Sandboxes", serviceId:"sandboxes", desc:"8 vCPU, 16 GB RAM sandbox instance", status:"active", meters:["m-sbx-cpu","m-sbx-mem","m-sbx-stor"] },
  { id:"r-gordon-tok", slug:"gordon_token", name:"Gordon Token", service:"Gordon", serviceId:"gordon", desc:"Gordon AI credit unit", status:"active", meters:["m-gordon-credits","m-gordon-req"] },
];
