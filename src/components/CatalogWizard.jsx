import { useState, useEffect, useRef } from "react";

/* ─── Helpers ─── */
function toSlug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
let _id = 0;
function uid() { return "p" + ++_id; }

const GROUPS = ["DSoP", "DHI", "Sandboxes", "Support", "AI"];

const DOCKER_OFFERINGS = [
  // User offerings (individual accounts)
  { id: "docker_personal", name: "Docker Personal", type: "USER", slug: "personal" },
  { id: "docker_pro", name: "Docker Pro", type: "USER", slug: "pro" },

  // Organization offerings
  { id: "docker_free_team", name: "Docker Free Team", type: "ORG", slug: "free-team" },
  { id: "docker_team", name: "Docker Team", type: "ORG", slug: "team" },
  { id: "docker_business", name: "Docker Business", type: "ORG", slug: "business" }
];

const BILLING_UNITS=[{id:"docker_core.seats",label:"Seats",slug:"docker_core.seats"},{id:"dhi.repos",label:"Repos",slug:"dhi.repos"}];
const METERED_FEATURES=[
  {id:"build_cloud.build_minutes_small",label:"Build minutes (Small)",slug:"build_cloud.build_minutes_small"},
  {id:"build_cloud.build_minutes_medium",label:"Build minutes (Medium)",slug:"build_cloud.build_minutes_medium"},
  {id:"build_cloud.build_minutes_large",label:"Build minutes (Large)",slug:"build_cloud.build_minutes_large"},
  {id:"tc_cloud.runtime_minutes_small",label:"Runtime minutes (Small)",slug:"tc_cloud.runtime_minutes_small"},
  {id:"tc_cloud.runtime_minutes_medium",label:"Runtime minutes (Medium)",slug:"tc_cloud.runtime_minutes_medium"},
  {id:"tc_cloud.runtime_minutes_large",label:"Runtime minutes (Large)",slug:"tc_cloud.runtime_minutes_large"},
  {id:"hub.pull_rate_per_hour",label:"Pull rate (per hr)",slug:"hub.pull_rate_per_hour"},
  {id:"sandboxes.compute_seconds",label:"Compute seconds",slug:"sandboxes.compute_seconds"},
  {id:"sandboxes.storage_gb_hours",label:"Storage (GB-hrs)",slug:"sandboxes.storage_gb_hours"},
  {id:"sandboxes.memory_gb_hours",label:"Memory (GB-hrs)",slug:"sandboxes.memory_gb_hours"},
];
const PRORATION = [
  { value: "CREDIT_REMAINING", label: "Credit remaining" },
  { value: "NO_REFUND", label: "No refund" },
  { value: "NONE", label: "None" },
];
const PLAN_PLACEHOLDERS = ["e.g. Personal", "e.g. Pro", "e.g. Team", "e.g. Business", "e.g. Enterprise"];

/* ─── Design tokens ─── */
const blue = "#2560FF";
const green = "#10B981";
const amber = "#F59E0B";
const red = "#EF4444";
const g = { 50:"#F9FAFB",100:"#F3F4F6",200:"#E5E7EB",300:"#D1D5DB",400:"#9CA3AF",500:"#6B7280",600:"#4B5563",700:"#374151",900:"#111827" };
const font = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const mono = "'SF Mono','Fira Code',Menlo,monospace";
const inp = { width:"100%",boxSizing:"border-box",padding:"8px 10px",fontSize:13,color:g[900],border:"1px solid "+g[200],borderRadius:5,outline:"none",fontFamily:font,transition:"border-color 0.15s" };
const lbl = { display:"block",fontSize:13,fontWeight:500,color:g[600],marginBottom:6 };
const foc = { onFocus:e=>e.target.style.borderColor=blue, onBlur:e=>e.target.style.borderColor=g[200] };

/* ─── Icons ─── */
const sp = {fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"};
const I = ({name}) => {
  const m = {
    x:<svg width="14" height="14" viewBox="0 0 24 24" {...sp} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:<svg width="15" height="15" viewBox="0 0 24 24" {...sp} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    arrowR:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    chevD:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    chevU:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
    edit:<svg width="13" height="13" viewBox="0 0 24 24" {...sp} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    link:<svg width="12" height="12" viewBox="0 0 24 24" {...sp} strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    unlink:<svg width="12" height="12" viewBox="0 0 24 24" {...sp} strokeWidth="2"><path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="m5.16 11.75-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>,
    pkg:<svg width="18" height="18" viewBox="0 0 24 24" {...sp}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    puzzle:<svg width="18" height="18" viewBox="0 0 24 24" {...sp}><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.969a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></svg>,
    layers:<svg width="18" height="18" viewBox="0 0 24 24" {...sp}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    file:<svg width="18" height="18" viewBox="0 0 24 24" {...sp} strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    grip:<svg width="10" height="14" viewBox="0 0 10 14" fill={g[400]} stroke="none"><circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/><circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/></svg>,
  };
  return m[name] || null;
};

/* ─── Animated wrapper (skip prop bypasses animation for tab switching) ─── */
const Fade = ({children,delay=0,show=true,k,skip=false}) => {
  const [v,setV]=useState(skip);
  useEffect(()=>{if(skip){setV(true);return}setV(false);if(show){const t=setTimeout(()=>setV(true),delay);return()=>clearTimeout(t)}},[show,delay,k,skip]);
  return <div style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(8px)",transition:skip?"none":"opacity 0.35s cubic-bezier(.4,0,.2,1),transform 0.35s cubic-bezier(.4,0,.2,1)"}}>{children}</div>;
};

/* ─── Selection card ─── */
function SelectCard({selected,onClick,icon,title,desc}) {
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8,padding:"16px 16px 14px",
        border:selected?"1px solid "+blue:"1px solid "+(hov?g[300]:g[200]),borderRadius:5,
        background:selected?"#F8FAFF":hov?g[50]:"#fff",cursor:"pointer",textAlign:"left",outline:"none",
        transition:"all 0.15s"}}>
      {selected&&<div style={{position:"absolute",top:10,right:10,width:16,height:16,borderRadius:"50%",background:blue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><svg width="9" height="7" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
      <div style={{color:selected?blue:g[400],transition:"color 0.15s"}}><I name={icon}/></div>
      <div>
        <div style={{fontSize:14,fontWeight:500,color:g[900]}}>{title}</div>
        <div style={{fontSize:13,color:g[500],marginTop:1,lineHeight:1.4}}>{desc}</div>
      </div>
    </button>
  );
}

/* ─── Dropdown (unified with inline create) ─── */
function Dropdown({value,options,onSelect,onCreate,placeholder,createLabel}){
  const [open,setOpen]=useState(false);
  const [adding,setAdding]=useState(false);
  const [custom,setCustom]=useState("");
  const ref=useRef(null);
  useEffect(()=>{if(!open)return;const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setAdding(false);setCustom("")}};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[open]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{...inp,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:"#fff",borderColor:open?blue:g[200],color:value?g[900]:g[400]}}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value||placeholder||"Select..."}</span><I name="chevD"/>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:9999,background:"#fff",border:"1px solid "+g[200],borderRadius:4,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",overflow:"hidden",maxHeight:240,overflowY:"auto"}}>
          {options.map(o=>(
            <button key={o} onClick={()=>{onSelect(o);setOpen(false);setAdding(false);setCustom("")}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:value===o?g[100]:"#fff",cursor:"pointer",fontSize:13,color:g[900],textAlign:"left",fontFamily:font}}
              onMouseEnter={e=>{if(value!==o)e.target.style.background=g[50]}} onMouseLeave={e=>{if(value!==o)e.target.style.background="#fff"}}>{o}</button>
          ))}
          <div style={{height:1,background:g[200]}}/>
          {!adding?(
            <button onClick={()=>setAdding(true)} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"#fff",cursor:"pointer",fontSize:13,color:blue,textAlign:"left",fontFamily:font,fontWeight:500}}
              onMouseEnter={e=>e.target.style.background=g[50]} onMouseLeave={e=>e.target.style.background="#fff"}>{createLabel||"+ Create new"}</button>
          ):(
            <div style={{padding:"8px 12px",display:"flex",gap:6,alignItems:"center"}}>
              <input type="text" value={custom} placeholder="Name" autoFocus
                onChange={e=>setCustom(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&custom.trim()){onCreate(custom.trim());setCustom("");setAdding(false);setOpen(false)}if(e.key==="Escape"){setAdding(false);setCustom("")}}}
                style={{...inp,flex:1,padding:"5px 8px",fontSize:12}}/>
              <button onClick={()=>{if(custom.trim()){onCreate(custom.trim());setCustom("");setAdding(false);setOpen(false)}}}
                style={{background:"none",border:"none",cursor:"pointer",color:blue,fontSize:12,fontWeight:600,fontFamily:font,whiteSpace:"nowrap"}}>Add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Pills ─── */
function Pills({options,value,onChange}){
  return(
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {options.map(o=>{
        const sel=value===o.value;
        return(<button key={o.value} onClick={()=>onChange(o.value)} style={{padding:"5px 12px",fontSize:12,fontWeight:500,fontFamily:font,border:"1px solid "+(sel?blue:g[200]),borderRadius:3,background:sel?"#EEF2FF":"#fff",color:sel?blue:g[600],cursor:"pointer",outline:"none",transition:"all 0.12s"}}>{o.label}</button>);
      })}
    </div>
  );
}

/* ─── Divider ─── */
const Div = ({mt=32,mb=28}) => <div style={{height:1,background:g[200],marginTop:mt,marginBottom:mb}}/>;

/* ─── Continue button ─── */
function Cont({onClick,disabled,label="Continue"}){
  return(
    <div style={{marginTop:28,paddingTop:24,borderTop:"1px solid "+g[200],display:"flex",justifyContent:"flex-end"}}>
      <button onClick={onClick} disabled={disabled}
        style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",border:"none",borderRadius:4,fontSize:13,fontWeight:500,
          cursor:disabled?"default":"pointer",background:disabled?g[200]:blue,color:disabled?g[400]:"#fff",
          transition:"background 0.15s,color 0.15s",fontFamily:font}}>
        {label} <I name="arrowR"/>
      </button>
    </div>
  );
}

/* ─── Section label with optional subtitle ─── */
function SectionQ({children,sub}){
  return <div style={{marginBottom:10}}>
    <div style={{fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.06em"}}>{children}</div>
    {sub&&<div style={{fontSize:12,color:g[400],marginTop:3,lineHeight:1.45,fontWeight:400}}>{sub}</div>}
  </div>;
}

/* ─── Pricing model cards ─── */
function PricingModelCard({selected,onClick,title,desc,children}){
  const [hov,setHov]=useState(false);
  return(
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"14px",border:selected?"1px solid "+blue:"1px solid "+(hov?g[300]:g[200]),borderRadius:5,
        background:selected?"#F8FAFF":hov?g[50]:"#fff",cursor:"pointer",textAlign:"left",outline:"none",
        transition:"all 0.15s",display:"flex",flexDirection:"column",gap:8,position:"relative"}}>
      {selected&&<div style={{position:"absolute",top:8,right:8,width:14,height:14,borderRadius:"50%",background:blue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><svg width="8" height="6" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
      <div style={{height:32,display:"flex",alignItems:"flex-end",gap:1}}>{children}</div>
      <div><div style={{fontSize:12,fontWeight:500,color:g[900]}}>{title}</div><div style={{fontSize:11,color:g[500],marginTop:1,lineHeight:1.4}}>{desc}</div></div>
    </button>
  );
}

function PricingModelPicker({value,onChange}){
  const barH=[16,16,16,16,16];const tierH=[8,14,20,26];const volH=[12,12,20,20];const blockH=[14,14,22,22];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <PricingModelCard selected={value==="PER_UNIT"} onClick={()=>onChange("PER_UNIT")} title="Flat per-unit" desc="Same price for every unit.">
        {barH.map((h,i)=><div key={i} style={{width:8,height:h,background:value==="PER_UNIT"?blue:g[300],borderRadius:1,transition:"background 0.2s"}}/>)}
      </PricingModelCard>
      <PricingModelCard selected={value==="BLOCK"} onClick={()=>onChange("BLOCK")} title="Block" desc="Fixed price per chunk of N units.">
        {blockH.map((h,i)=><div key={i} style={{width:10,height:h,background:value==="BLOCK"?blue:g[300],borderRadius:1,transition:"background 0.2s",marginRight:i%2===1?4:0}}/>)}
      </PricingModelCard>
      <PricingModelCard selected={value==="TIERED"} onClick={()=>onChange("TIERED")} title="Graduated" desc="Each unit priced at its tier's rate.">
        {tierH.map((h,i)=><div key={i} style={{width:10,height:h,background:value==="TIERED"?[blue,"#60A5FA","#93C5FD","#BFDBFE"][i]:g[300],borderRadius:1,transition:"background 0.2s"}}/>)}
      </PricingModelCard>
      <PricingModelCard selected={value==="VOLUME"} onClick={()=>onChange("VOLUME")} title="Volume" desc="All units priced at the tier you land in.">
        {volH.map((h,i)=><div key={i} style={{width:10,height:h,background:value==="VOLUME"?blue:g[300],borderRadius:1,transition:"background 0.2s"}}/>)}
      </PricingModelCard>
    </div>
  );
}

/* ─── Tier builder ─── */
function TierBuilder({tiers,onChange,previewQty,onPreviewQty,pricingModel}){
  const upTier=(i,patch)=>{const t=[...tiers];t[i]={...t[i],...patch};onChange(t)};
  const addTier=()=>{const t=[...tiers];const li=t.length-1;const pt=t[li-1]?.to||1000;t.splice(li,0,{from:pt+1,to:pt+1000,unitAmt:"",fixedAmt:""});t[li+1]={...t[li+1],from:pt+1001};onChange(t)};
  const rmTier=(i)=>{if(tiers.length<=2)return;const t=[...tiers];t.splice(i,1);if(i<t.length)t[i]={...t[i],from:i===0?0:(t[i-1].to||0)+1};onChange(t)};
  const qty=parseFloat(previewQty)||0;
  let total=0,breakdown=[];
  if(qty>0&&tiers.length>0){
    if(pricingModel==="TIERED"){let r=qty;tiers.forEach(t=>{const lo=t.from;const hi=t.to===null?Infinity:t.to;const rng=hi-lo+1;const u=Math.min(r,rng);if(u>0){const a=u*(parseFloat(t.unitAmt)||0)+(parseFloat(t.fixedAmt)||0);breakdown.push({lo,hi:t.to,units:u,rate:t.unitAmt,fixed:t.fixedAmt,amt:a});total+=a}r-=u})}
    else if(pricingModel==="VOLUME"){let at=tiers[tiers.length-1];for(const t of tiers){if(qty<=(t.to===null?Infinity:t.to)){at=t;break}}total=qty*(parseFloat(at.unitAmt)||0)+(parseFloat(at.fixedAmt)||0);breakdown=[{units:qty,rate:at.unitAmt,amt:total}]}
  }
  return(
    <div>
      <div style={{border:"1px solid "+g[200],borderRadius:6,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"70px 90px 1fr 90px 32px",gap:0,padding:"6px 10px",background:g[50],borderBottom:"1px solid "+g[200],fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.04em"}}>
          <span>From</span><span>To</span><span>Per unit</span><span>Fixed fee</span><span/>
        </div>
        {tiers.map((tier,i)=>{const isF=i===0;const isL=i===tiers.length-1;return(
          <div key={i} style={{display:"grid",gridTemplateColumns:"70px 90px 1fr 90px 32px",gap:0,padding:"6px 10px",borderBottom:isL?"none":"1px solid "+g[100],alignItems:"center",fontSize:13,background:i%2===0?"#fff":g[50]}}>
            <span style={{color:g[400],fontFamily:mono,fontSize:12}}>{tier.from.toLocaleString()}</span>
            <span>{isL?<span style={{color:g[400],fontSize:12}}>∞</span>:<input type="number" value={tier.to||""} onChange={e=>{const v=parseInt(e.target.value)||0;upTier(i,{to:v});if(i+1<tiers.length)upTier(i+1,{from:v+1})}} style={{...inp,width:70,padding:"4px 6px",fontSize:12,fontFamily:mono}}/>}</span>
            <span><div style={{display:"flex",alignItems:"center",gap:2}}><span style={{color:g[400],fontSize:12}}>$</span><input type="text" value={tier.unitAmt} onChange={e=>upTier(i,{unitAmt:e.target.value})} placeholder="0.00" style={{...inp,width:70,padding:"4px 6px",fontSize:12,fontFamily:mono}}/></div></span>
            <span><div style={{display:"flex",alignItems:"center",gap:2}}><span style={{color:g[400],fontSize:12}}>$</span><input type="text" value={tier.fixedAmt} onChange={e=>upTier(i,{fixedAmt:e.target.value})} placeholder="-" style={{...inp,width:60,padding:"4px 6px",fontSize:12,fontFamily:mono,color:g[500]}}/></div></span>
            <span>{!isF&&!isL&&tiers.length>2&&<button onClick={()=>rmTier(i)} style={{background:"none",border:"none",cursor:"pointer",color:g[300],padding:2,outline:"none"}} onMouseEnter={e=>e.currentTarget.style.color=red} onMouseLeave={e=>e.currentTarget.style.color=g[300]}><I name="x"/></button>}</span>
          </div>
        )})}
      </div>
      <button onClick={addTier} style={{marginTop:6,background:"none",border:"none",cursor:"pointer",fontSize:12,color:g[400],fontWeight:500,fontFamily:font,padding:"4px 0"}} onMouseEnter={e=>e.currentTarget.style.color=blue} onMouseLeave={e=>e.currentTarget.style.color=g[400]}>+ Add tier</button>
      <div style={{marginTop:16,padding:"12px 14px",background:g[50],borderRadius:6,border:"1px solid "+g[100]}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:breakdown.length>0?10:0}}>
          <span style={{fontSize:12,fontWeight:500,color:g[600]}}>Preview:</span>
          <input type="text" value={previewQty} onChange={e=>onPreviewQty(e.target.value)} placeholder="Enter quantity" style={{...inp,width:120,padding:"4px 8px",fontSize:12,fontFamily:mono,background:"#fff"}}/>
          {qty>0&&<span style={{fontSize:13,fontWeight:700,color:blue}}>${total.toFixed(2)}</span>}
        </div>
        {breakdown.length>0&&pricingModel==="TIERED"&&breakdown.map((b,i)=>(
          <div key={i} style={{fontSize:11,color:g[500],fontFamily:mono}}>{b.units.toLocaleString()} @ ${b.rate||"0"}/unit{b.fixed&&parseFloat(b.fixed)>0?" + $"+b.fixed+" fixed":""} = <span style={{color:g[900],fontWeight:600}}>${b.amt.toFixed(2)}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ─── Radio group ─── */
function RadioGroup({options,value,onChange}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {options.map(o=>{const sel=value===o.id;return(
        <button key={o.id} onClick={()=>onChange(o.id)}
          style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",border:sel?"1px solid "+blue:"1px solid "+g[200],borderRadius:5,background:sel?"#F8FAFF":"#fff",cursor:"pointer",textAlign:"left",outline:"none",transition:"all 0.15s",fontFamily:font}}>
          <div style={{width:14,height:14,borderRadius:"50%",border:sel?"1px solid "+blue:"1px solid "+g[300],background:"#fff",flexShrink:0,transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {sel&&<div style={{width:6,height:6,borderRadius:"50%",background:blue,transition:"all 0.15s"}}/>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,color:g[900]}}>{o.label}</div>
            {o.desc&&<div style={{fontSize:12,color:g[500],marginTop:1,lineHeight:1.4}}>{o.desc}</div>}
          </div>
        </button>
      )})}
    </div>
  );
}

/* ─── Feature picker dropdown ─── */
function FeaturePicker({options,value,onChange,onCreate,placeholder}){
  const [open,setOpen]=useState(false);const [adding,setAdding]=useState(false);const [custom,setCustom]=useState("");
  const ref=useRef(null);const selected=options.find(o=>o.id===value);
  useEffect(()=>{if(!open)return;const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setAdding(false);setCustom("")}};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[open]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{...inp,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:"#fff",borderColor:open?blue:g[200],color:selected?g[900]:g[400]}}>
        <span>{selected?selected.label:placeholder||"Select..."}</span><I name="chevD"/>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:9999,background:"#fff",border:"1px solid "+g[200],borderRadius:4,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",overflow:"hidden",maxHeight:240,overflowY:"auto"}}>
          {options.map(o=>(
            <button key={o.id} onClick={()=>{onChange(o.id);setOpen(false)}}
              style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",border:"none",background:value===o.id?g[100]:"#fff",cursor:"pointer",fontSize:13,color:g[900],textAlign:"left",fontFamily:font}}
              onMouseEnter={e=>{if(value!==o.id)e.target.style.background=g[50]}} onMouseLeave={e=>{if(value!==o.id)e.target.style.background="#fff"}}>
              <span style={{flex:1}}>{o.label}</span>
              {o.slug&&<span style={{fontSize:11,color:g[400],fontFamily:mono}}>{o.slug}</span>}
            </button>
          ))}
          <div style={{height:1,background:g[200]}}/>
          {!adding?<button onClick={()=>setAdding(true)} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"#fff",cursor:"pointer",fontSize:13,color:blue,textAlign:"left",fontFamily:font,fontWeight:500}} onMouseEnter={e=>e.target.style.background=g[50]} onMouseLeave={e=>e.target.style.background="#fff"}>+ Create new feature</button>
          :<div style={{padding:"8px 12px",display:"flex",gap:6,alignItems:"center"}}>
            <input type="text" value={custom} placeholder="Feature name" autoFocus onChange={e=>setCustom(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&custom.trim()){onCreate(custom.trim());setCustom("");setAdding(false);setOpen(false)}if(e.key==="Escape"){setAdding(false);setCustom("")}}}
              style={{...inp,flex:1,padding:"5px 8px",fontSize:12}}/>
            <button onClick={()=>{if(custom.trim()){onCreate(custom.trim());setCustom("");setAdding(false);setOpen(false)}}} style={{background:"none",border:"none",cursor:"pointer",color:blue,fontSize:12,fontWeight:600,fontFamily:font}}>Add</button>
          </div>}
        </div>
      )}
    </div>
  );
}

/* ─── Add-on offering selector ─── */
function AddonOfferingSelector({ selected, onChange }) {
  const toggleOffering = (offeringId) => {
    if (selected.includes(offeringId)) {
      onChange(selected.filter(id => id !== offeringId));
    } else {
      onChange([...selected, offeringId]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {DOCKER_OFFERINGS.map(offering => {
        const isSelected = selected.includes(offering.id);
        return (
          <button
            key={offering.id}
            onClick={() => toggleOffering(offering.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              border: `1px solid ${isSelected ? blue : g[200]}`,
              borderRadius: 5,
              background: isSelected ? blue + "06" : "#fff",
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "left",
              outline: "none"
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                border: `1px solid ${isSelected ? blue : g[300]}`,
                background: isSelected ? blue : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease"
              }}
            >
              {isSelected && (
                <svg width="8" height="6" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1, fontWeight: 400, color: g[900], fontSize: 13 }}>
              {offering.name}
            </div>
            <div style={{
              fontSize: 10,
              fontWeight: 500,
              color: offering.type === "USER" ? blue : g[500],
              background: offering.type === "USER" ? blue + "10" : g[100],
              padding: "2px 7px",
              borderRadius: 3,
              letterSpacing: "0.02em"
            }}>
              {offering.type === "USER" ? "User" : "Organization"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Tier badge ─── */
function TierBadge({n,active,isFirst,isLast}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0,flexShrink:0,width:28}}>
      {!isFirst&&<div style={{width:2,height:12,background:active?blue:g[200],transition:"background 0.3s"}}/>}
      <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,fontFamily:font,background:active?blue:"#fff",color:active?"#fff":g[400],border:active?"2px solid "+blue:"2px solid "+g[200],transition:"all 0.3s",flexShrink:0}}>{n}</div>
      {!isLast&&<div style={{width:2,height:12,background:active?blue:g[200],transition:"background 0.3s"}}/>}
    </div>
  );
}

/* ─── Pricing summary for accordion headers ─── */
function priceSummary(pc, allUnits, allMeters) {
  if (!pc || !pc.billingType) return null;
  if (pc.billingType === "FREE") return "Free";
  const uL=allUnits.find(f=>f.id===pc.billingUnit)?.label?.toLowerCase()||allMeters.find(f=>f.id===pc.meteredFeature)?.label?.toLowerCase()||"unit";
  if (pc.billingType==="SUBSCRIPTION") {
    if (pc.recurModel==="FLAT") {
      const ps=(pc.cycles||[]).map(c=>{const p=(pc.cyclePrices||{})[c];return p?"$"+p+"/"+(c==="MONTHLY"?"mo":"yr"):null}).filter(Boolean);
      return ps.length?ps.join(" · "):"Flat (configuring...)";
    }
    if (pc.recurModel==="PER_UNIT") {
      const ps=(pc.cycles||[]).map(c=>{const p=(pc.cyclePrices||{})[c];return p?"$"+p+"/"+uL+"/"+(c==="MONTHLY"?"mo":"yr"):null}).filter(Boolean);
      return ps.length?ps.join(" · "):"Per "+uL+" (configuring...)";
    }
    return "Subscription (configuring...)";
  }
  if (pc.billingType==="USAGE_BASED") {
    const configured=(pc.meters||[]).filter(m=>m.featureId);
    if(configured.length===0) return "Usage-based (configuring...)";
    const labels=configured.map(m=>allMeters.find(f=>f.id===m.featureId)?.label).filter(Boolean);
    return "Usage-based · "+labels.join(", ");
  }
  if (pc.billingType==="ONE_TIME") {
    const exp=pc.expires&&pc.expiryAmount?" · expires "+pc.expiryAmount+" "+(pc.expiryUnit||"DAYS").toLowerCase():"";
    if (pc.oneTimeModel==="FIXED"&&pc.flatPrice) return "$"+pc.flatPrice+" one-time"+exp;
    if (pc.oneTimeModel==="PER_UNIT"&&pc.unitPrice) return "$"+pc.unitPrice+"/"+uL+" one-time"+exp;
    return "One-time (configuring...)";
  }
  return "Configuring...";
}

/* ═══════════════════════════════════════
   MAIN WIZARD
   ═══════════════════════════════════════ */
export default function CatalogWizard() {
  const [entryType,setEntryType]=useState(null);
  const [structure,setStructure]=useState(null);
  const [step0Done,setStep0Done]=useState(false);

  const [bName,setBName]=useState("");
  const [bSlug,setBSlug]=useState("");
  const [slugEd,setSlugEd]=useState(false);
  const [showDesc,setShowDesc]=useState(false);
  const [desc,setDesc]=useState("");
  const [grp,setGrp]=useState("");
  const [customGrps,setCustomGrps]=useState([]);
  const [p1Done,setP1Done]=useState(false);
  const [p1Edit,setP1Edit]=useState(false);

  const [plans,setPlans]=useState([]);
  const [showPaths,setShowPaths]=useState(false);
  const [paths,setPaths]=useState([]);
  const [editPath,setEditPath]=useState(null);
  const [addPathMode,setAddPathMode]=useState(false);
  const [npFrom,setNpFrom]=useState("");
  const [npTo,setNpTo]=useState("");
  const [hovPath,setHovPath]=useState(null);
  const [customBillingUnits,setCustomBillingUnits]=useState([]);
  const [customMeters,setCustomMeters]=useState([]);

  const [p2Done,setP2Done]=useState(false);
  const [expandedPlan,setExpandedPlan]=useState(null);
  const [planConfig,setPlanConfig]=useState({});
  const [dragIdx,setDragIdx]=useState(null);
  const [dropIdx,setDropIdx]=useState(null);
  const p3Ref=useRef(null);
  const p1Ref=useRef(null);
  const p2Ref=useRef(null);
  const pathRef=useRef(null);

  const [addonOfferings, setAddonOfferings] = useState([]); // Array of offering IDs

  const allGrps=[...GROUPS,...customGrps];
  const isBundle=structure==="bundle";
  const entityLabel=entryType==="addon"?"add-on":isBundle?"bundle":"product";

  const scrollTo=ref=>setTimeout(()=>ref.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);

  const canStep0=entryType&&(entryType==="addon"||structure);
  const confirmStep0=()=>{setStep0Done(true);setTimeout(()=>p1Ref.current?.scrollIntoView({behavior:"smooth",block:"start"}),120)};

  const handleBName=v=>{setBName(v);if(!slugEd)setBSlug(toSlug(v))};
  const handleBSlug=v=>{setSlugEd(true);setBSlug(toSlug(v))};
  const canP1=bName.trim()&&bSlug.trim()&&grp&&(entryType !== "addon" || addonOfferings.length > 0);
  const confirmP1=()=>{
    if (entryType === "addon") {
      // Add-ons get a single plan named after the add-on itself
      const planId = uid();
      setPlans([{ id: planId, name: bName, active: true, standalone: true }]);

      // Derive account type from selected offerings
      const hasUserOfferings = addonOfferings.some(id =>
        DOCKER_OFFERINGS.find(o => o.id === id)?.type === "USER"
      );
      const hasOrgOfferings = addonOfferings.some(id =>
        DOCKER_OFFERINGS.find(o => o.id === id)?.type === "ORG"
      );

      let acctType = "INDIVIDUAL";
      if (hasUserOfferings && hasOrgOfferings) {
        acctType = "BOTH";
      } else if (hasOrgOfferings) {
        acctType = "ORGANIZATION";
      }

      // Initialize pricing config with derived account type
      setPlanConfig({
        [planId]: {
          acctType,
          channel: "SELF_SERVE",
          billingType: null,
          isPaid: null,
          recurrence: null,
          recurModel: null,
          oneTimeModel: null,
          pricingModel: null,
          billingUnit: "",
          meteredFeature: "",
          flatPrice: "",
          unitPrice: "",
          blockSize: "",
          blockPrice: "",
          tiers: [{from:0,to:1000,unitAmt:"",fixedAmt:""},{from:1001,to:null,unitAmt:"",fixedAmt:""}],
          cycles: [],
          cyclePrices: {},
          previewQty: "",
          expires: null,
          expiryAmount: "",
          expiryUnit: "DAYS",
          meters: []
        }
      });

      setExpandedPlan(planId);
      setP1Done(true);
      setP1Edit(false);
      setP2Done(true); // Skip Phase 2 (plans)
      setTimeout(() => p3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } else if (isBundle) {
      setPlans(plans.length === 0 ? [{id:uid(),name:"",slug:"",slugEd:false,inherits:false}] : plans);
      setP1Done(true);
      setP1Edit(false);
      setTimeout(() => p2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } else {
      // Standalone product
      setPlans([{id:uid(),name:bName,slug:bSlug,slugEd:true,inherits:false}]);
      setP1Done(true);
      setP1Edit(false);
      setTimeout(() => p3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  };

  const upPlan=(id,patch)=>setPlans(ps=>ps.map(p=>p.id===id?{...p,...patch}:p));
  const addPlan=()=>setPlans(ps=>[...ps,{id:uid(),name:"",slug:"",slugEd:false,inherits:ps.length>0}]);
  const rmPlan=id=>{setPlans(ps=>ps.filter(p=>p.id!==id));setPaths(pp=>pp.filter(p=>p.from!==id&&p.to!==id))};
  const movePlan=(i,d)=>setPlans(ps=>{const a=[...ps];const n=i+d;if(n<0||n>=a.length)return a;[a[i],a[n]]=[a[n],a[i]];return a});
  const onDragStart=(idx)=>{setDragIdx(idx)};
  const onDragOver=(e,idx)=>{e.preventDefault();if(dragIdx!==null&&idx!==dragIdx)setDropIdx(idx)};
  const onDragEnd=()=>{
    if(dragIdx!==null&&dropIdx!==null&&dragIdx!==dropIdx){
      setPlans(ps=>{const a=[...ps];const [item]=a.splice(dragIdx,1);a.splice(dropIdx,0,item);return a});
    }
    setDragIdx(null);setDropIdx(null);
  };
  const pName=(id,v)=>{const p=plans.find(x=>x.id===id);upPlan(id,{name:v,slug:p.slugEd?p.slug:toSlug(v)})};

  const genPaths=()=>{const auto=[];for(let i=0;i<plans.length-1;i++){auto.push({from:plans[i].id,to:plans[i+1].id,dir:"UPGRADE",timing:"IMMEDIATE",pro:"NONE"});auto.push({from:plans[i+1].id,to:plans[i].id,dir:"DOWNGRADE",timing:"END_OF_CYCLE",pro:"NO_REFUND"})}setPaths(auto);setShowPaths(true);scrollTo(pathRef)};
  const upPath=(i,patch)=>setPaths(ps=>ps.map((p,j)=>j===i?{...p,...patch}:p));
  const rmPathAt=i=>{setPaths(ps=>ps.filter((_,j)=>j!==i));setEditPath(null)};
  const doAddPath=()=>{if(!npFrom||!npTo||npFrom===npTo)return;const fi=plans.findIndex(p=>p.id===npFrom);const ti=plans.findIndex(p=>p.id===npTo);const d=ti>fi?"UPGRADE":"DOWNGRADE";setPaths(ps=>[...ps,{from:npFrom,to:npTo,dir:d,timing:d==="UPGRADE"?"IMMEDIATE":"END_OF_CYCLE",pro:d==="UPGRADE"?"CREDIT_REMAINING":"NO_REFUND"}]);setAddPathMode(false);setNpFrom("");setNpTo("")};

  const getPc=(id)=>planConfig[id]||{};
  const setPc=(id,patch)=>setPlanConfig(pc=>({...pc,[id]:{...pc[id],...patch}}));

  const confirmP2=()=>{
    setP2Done(true);
    const init={};
    plans.forEach((p,i)=>{
      if(!planConfig[p.id]){
        const prev=i>0?planConfig[plans[i-1]?.id]:null;
        init[p.id]={acctType:prev?.acctType||(i===0?"INDIVIDUAL":"ORGANIZATION"),channel:prev?.channel||"SELF_SERVE",billingType:null,isPaid:null,recurrence:null,recurModel:null,oneTimeModel:null,pricingModel:null,billingUnit:"",meteredFeature:"",flatPrice:"",unitPrice:"",blockSize:"",blockPrice:"",tiers:[{from:0,to:1000,unitAmt:"",fixedAmt:""},{from:1001,to:null,unitAmt:"",fixedAmt:""}],cycles:[],cyclePrices:{},previewQty:"",expires:null,expiryAmount:"",expiryUnit:"DAYS",meters:[]};
      }
    });
    if(Object.keys(init).length)setPlanConfig(pc=>({...pc,...init}));
    if(named.length>0)setExpandedPlan(named[0].id);
    setTimeout(()=>p3Ref.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);
  };

  const upgradePaths=paths.filter(p=>p.dir==="UPGRADE");
  const downgradePaths=paths.filter(p=>p.dir==="DOWNGRADE");
  const named=plans.filter(p=>p.name.trim());
  const canPaths=named.length>=2;

  const allBU=[...BILLING_UNITS,...customBillingUnits.map(n=>({id:toSlug(n),label:n,slug:toSlug(n)}))];
  const allMet=[...METERED_FEATURES,...customMeters.map(n=>({id:toSlug(n),label:n,slug:toSlug(n)}))];
  const allUnits=[...allBU,...allMet];

  const crumb=step0Done?(entryType==="addon"?"New add-on":isBundle?"New bundle":"New product"):"New entry";

  /* ─── Render pricing body for a plan ─── */
  const renderPricing=(plan)=>{
    const pc=getPc(plan.id);const sp=(patch)=>setPc(plan.id,patch);
    const bt=pc.billingType; // FREE, ONE_TIME, SUBSCRIPTION, USAGE_BASED
    const isOT=bt==="ONE_TIME";const isSub=bt==="SUBSCRIPTION";const isPayg=bt==="USAGE_BASED";
    const isFlat=pc.recurModel==="FLAT";const isPUSub=pc.recurModel==="PER_UNIT";
    const isOTF=isOT&&pc.oneTimeModel==="FIXED";const isOTP=isOT&&pc.oneTimeModel==="PER_UNIT";
    const isPU=isPUSub||isOTP;
    const needsPM=isPU||isOTP;const hasPM=!!pc.pricingModel;
    const needsCyc=isFlat||isPUSub;const hasCyc=(pc.cycles||[]).length>0;
    const uL=allUnits.find(u=>u.id===pc.billingUnit)?.label?.toLowerCase()||allMet.find(u=>u.id===pc.meteredFeature)?.label?.toLowerCase()||"unit";

    const resetAll={billingType:null,recurrence:null,recurModel:null,oneTimeModel:null,pricingModel:null,billingUnit:"",meteredFeature:"",flatPrice:"",unitPrice:"",blockSize:"",blockPrice:"",cycles:[],cyclePrices:{},expires:null,expiryAmount:"",expiryUnit:"DAYS",isPaid:null,meters:[]};

    return(
      <div style={{padding:"16px 16px 20px",borderTop:"1px solid "+blue+"30",borderRadius:"0 0 6px 6px"}}>
        <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Account type</div>
            {entryType === "addon" ? (
              <div style={{padding:"8px 12px",background:g[50],border:"1px solid "+g[200],borderRadius:4}}>
                <div style={{fontSize:13,fontWeight:600,color:g[900],marginBottom:2}}>
                  {pc.acctType === "BOTH" ? "Individual & Organization" : pc.acctType === "ORGANIZATION" ? "Organization" : "Individual"}
                </div>
                <div style={{fontSize:11,color:g[500]}}>
                  {pc.acctType === "BOTH" ? "Set by compatible offerings (both types)" : "Set by compatible offerings"}
                </div>
              </div>
            ) : (
              <Pills value={pc.acctType} onChange={v=>sp({acctType:v})} options={[{value:"INDIVIDUAL",label:"Individual"},{value:"ORGANIZATION",label:"Organization"}]}/>
            )}
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Sales channel</div>
            <Pills value={pc.channel} onChange={v=>sp({channel:v})} options={[{value:"SELF_SERVE",label:"Self-serve"},{value:"SALES_ASSISTED",label:"Sales-led"},{value:"BOTH",label:"Both"}]}/>
          </div>
        </div>
        <Div mt={0} mb={20}/>

        {/* Single combined billing type question */}
        <div style={{marginBottom:20}}>
          <SectionQ>How is this plan billed?</SectionQ>
          <RadioGroup value={bt} onChange={v=>sp({...resetAll,billingType:v,acctType:pc.acctType,channel:pc.channel,
            isPaid:v!=="FREE",
            recurrence:v==="ONE_TIME"?"ONE_TIME":v==="SUBSCRIPTION"||v==="USAGE_BASED"?"RECURRING":null,
            recurModel:v==="USAGE_BASED"?"PAYG":null,
            cycles:v==="USAGE_BASED"?["MONTHLY"]:[],
            meters:v==="USAGE_BASED"?[{featureId:"",pricingModel:null,unitPrice:"",blockSize:"",blockPrice:"",tiers:[{from:0,to:1000,unitAmt:"",fixedAmt:""},{from:1001,to:null,unitAmt:"",fixedAmt:""}],previewQty:""}]:[],
          })} options={[
            {id:"FREE",label:"Free",desc:"Auto-granted, no billing configuration needed."},
            {id:"SUBSCRIPTION",label:"Subscription",desc:"Recurring charges on a monthly or annual cycle."},
            {id:"ONE_TIME",label:"One-time purchase",desc:"Single charge, no renewal. Optional expiry."},
            {id:"USAGE_BASED",label:"Usage-based",desc:"No base fee — customers pay only for what they consume."},
          ]}/>
        </div>

        {bt==="FREE"&&<div style={{padding:"10px 14px",background:g[50],borderRadius:6,border:"1px solid "+g[100],fontSize:13,color:g[500],display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:green}}/> No pricing needed. This plan will be auto-granted.</div>}

        {/* Subscription sub-type: flat vs per-unit */}
        {isSub&&<div style={{marginBottom:20}}>
          <SectionQ sub="How the base fee is structured for this plan.">Subscription type</SectionQ>
          <RadioGroup value={pc.recurModel} onChange={v=>sp({recurModel:v,pricingModel:null,billingUnit:"",cycles:[],cyclePrices:{}})} options={[
            {id:"FLAT",label:"Flat fee",desc:"Same price regardless of usage or quantity."},
            {id:"PER_UNIT",label:"Per-unit",desc:"Price scales with seats, repos, or another purchasable quantity."},
          ]}/>
        </div>}

        {/* One-time sub-type: fixed vs per-unit */}
        {isOT&&<div style={{marginBottom:20}}>
          <SectionQ>Pricing structure</SectionQ>
          <RadioGroup value={pc.oneTimeModel} onChange={v=>sp({oneTimeModel:v,pricingModel:null,billingUnit:"",unitPrice:"",flatPrice:""})} options={[
            {id:"FIXED",label:"Fixed price",desc:"One flat amount regardless of quantity."},
            {id:"PER_UNIT",label:"Per-unit",desc:"Price scales with the number of units purchased."},
          ]}/>
        </div>}

        {/* One-time fixed: just price */}
        {isOTF&&<div style={{marginBottom:20}}><label style={lbl}>Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,color:g[400],fontWeight:500}}>$</span><input type="text" value={pc.flatPrice||""} placeholder="0.00" onChange={e=>sp({flatPrice:e.target.value})} {...foc} style={{...inp,width:120,fontFamily:mono}}/></div></div>}

        {/* Per-unit subscription: pick billing unit */}
        {isPUSub&&<div style={{marginBottom:20}}>
          <SectionQ sub="The purchasable quantity that scales the base fee.">Billing unit</SectionQ>
          <FeaturePicker options={allUnits} value={pc.billingUnit} onChange={v=>sp({billingUnit:v})} onCreate={n=>{setCustomBillingUnits(c=>[...c,n]);sp({billingUnit:toSlug(n)})}} placeholder="e.g. Seats, Repos"/>
        </div>}

        {/* PAYG: multi-meter resource builder */}
        {isPayg&&<div style={{marginBottom:20}}>
          <SectionQ sub="Add each metered resource customers will be billed for. Each gets its own rate.">Metered resources</SectionQ>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(pc.meters||[]).map((meter,mi)=>{
              const mFeature=allMet.find(f=>f.id===meter.featureId);
              const mLabel=mFeature?.label?.toLowerCase()||"unit";
              const usedIds=(pc.meters||[]).map(m=>m.featureId).filter((_,i)=>i!==mi);
              const availableMeters=allMet.filter(f=>!usedIds.includes(f.id));
              return(
                <div key={mi} style={{border:"1px solid "+g[200],borderRadius:6,background:"#fff"}}>
                  {/* Meter header */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderBottom:meter.featureId?"1px solid "+g[100]:"none",background:g[50],borderRadius:meter.featureId?"6px 6px 0 0":6}}>
                    <div style={{flex:1}}>
                      <FeaturePicker options={availableMeters} value={meter.featureId} onChange={v=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],featureId:v};sp({meters:m})}} onCreate={n=>{setCustomMeters(c=>[...c,n]);const m=[...(pc.meters||[])];m[mi]={...m[mi],featureId:toSlug(n)};sp({meters:m})}} placeholder="Select a metered resource"/>
                    </div>
                    {(pc.meters||[]).length>1&&<button onClick={()=>{const m=[...(pc.meters||[])];m.splice(mi,1);sp({meters:m})}} style={{background:"none",border:"none",cursor:"pointer",color:g[300],padding:3,outline:"none",flexShrink:0,transition:"color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.color=red} onMouseLeave={e=>e.currentTarget.style.color=g[300]}><I name="x"/></button>}
                  </div>
                  {/* Meter pricing — only if feature selected */}
                  {meter.featureId&&<div style={{padding:"12px"}}>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Pricing model</div>
                      <PricingModelPicker value={meter.pricingModel||""} onChange={v=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],pricingModel:v};sp({meters:m})}}/>
                    </div>

                    {meter.pricingModel==="PER_UNIT"&&<div style={{marginTop:10}}>
                      <label style={lbl}>Price per {mLabel}</label>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,color:g[400],fontWeight:500}}>$</span><input type="text" value={meter.unitPrice||""} placeholder="0.00" onChange={e=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],unitPrice:e.target.value};sp({meters:m})}} {...foc} style={{...inp,width:120,fontFamily:mono}}/></div>
                    </div>}

                    {meter.pricingModel==="BLOCK"&&<div style={{marginTop:10}}>
                      <div style={{display:"flex",gap:16,marginBottom:8}}>
                        <div><label style={lbl}>Block size</label><input type="text" value={meter.blockSize||""} placeholder="e.g. 20" onChange={e=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],blockSize:e.target.value};sp({meters:m})}} {...foc} style={{...inp,width:100,fontFamily:mono}}/></div>
                        <div><label style={lbl}>Price per block</label><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14,color:g[400]}}>$</span><input type="text" value={meter.blockPrice||""} placeholder="0.00" onChange={e=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],blockPrice:e.target.value};sp({meters:m})}} {...foc} style={{...inp,width:100,fontFamily:mono}}/></div></div>
                      </div>
                    </div>}

                    {(meter.pricingModel==="TIERED"||meter.pricingModel==="VOLUME")&&<div style={{marginTop:10}}>
                      <TierBuilder
                        tiers={meter.tiers||[{from:0,to:1000,unitAmt:"",fixedAmt:""},{from:1001,to:null,unitAmt:"",fixedAmt:""}]}
                        onChange={t=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],tiers:t};sp({meters:m})}}
                        previewQty={meter.previewQty||""}
                        onPreviewQty={v=>{const m=[...(pc.meters||[])];m[mi]={...m[mi],previewQty:v};sp({meters:m})}}
                        pricingModel={meter.pricingModel}
                      />
                    </div>}
                  </div>}
                </div>
              );
            })}
          </div>
          <button onClick={()=>sp({meters:[...(pc.meters||[]),{featureId:"",pricingModel:null,unitPrice:"",blockSize:"",blockPrice:"",tiers:[{from:0,to:1000,unitAmt:"",fixedAmt:""},{from:1001,to:null,unitAmt:"",fixedAmt:""}],previewQty:""}]})}
            style={{marginTop:8,background:"none",border:"none",cursor:"pointer",fontSize:12,color:g[400],fontWeight:500,fontFamily:font,padding:"4px 0",transition:"color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.color=blue} onMouseLeave={e=>e.currentTarget.style.color=g[400]}>+ Add metered resource</button>
        </div>}

        {/* One-time per-unit: pick unit */}
        {isOTP&&<div style={{marginBottom:20}}>
          <SectionQ sub="The unit customers are purchasing a quantity of.">What unit?</SectionQ>
          <FeaturePicker options={allUnits} value={pc.billingUnit} onChange={v=>sp({billingUnit:v})} onCreate={n=>{setCustomBillingUnits(c=>[...c,n]);sp({billingUnit:toSlug(n)})}} placeholder="e.g. Seats, Repos, Minutes"/>
        </div>}

        {/* Pricing model — for per-unit and PAYG paths */}
        {needsPM&&((isPU&&pc.billingUnit)||(isOTP&&pc.billingUnit))&&<div style={{marginBottom:20}}>
          <SectionQ sub="How should the per-unit price scale with quantity?">Pricing model</SectionQ>
          <PricingModelPicker value={pc.pricingModel||""} onChange={v=>sp({pricingModel:v})}/>
        </div>}

        {/* Per-unit price — ONE-TIME only (subscription per-unit uses per-cycle prices below) */}
        {pc.pricingModel==="PER_UNIT"&&isOTP&&<div style={{marginBottom:20}}>
          <label style={lbl}>Price per {uL}</label>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,color:g[400],fontWeight:500}}>$</span><input type="text" value={pc.unitPrice||""} placeholder="0.00" onChange={e=>sp({unitPrice:e.target.value})} {...foc} style={{...inp,width:120,fontFamily:mono}}/></div>
        </div>}

        {/* Block config — subscription and one-time */}
        {pc.pricingModel==="BLOCK"&&(isOTP||isPUSub)&&<div style={{marginBottom:20}}>
          <div style={{display:"flex",gap:16,marginBottom:8}}>
            <div><label style={lbl}>Block size</label><input type="text" value={pc.blockSize||""} placeholder="e.g. 20" onChange={e=>sp({blockSize:e.target.value})} {...foc} style={{...inp,width:100,fontFamily:mono}}/></div>
            <div><label style={lbl}>Price per block</label><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14,color:g[400]}}>$</span><input type="text" value={pc.blockPrice||""} placeholder="0.00" onChange={e=>sp({blockPrice:e.target.value})} {...foc} style={{...inp,width:100,fontFamily:mono}}/></div></div>
          </div>
          {pc.blockSize&&pc.blockPrice&&<div style={{padding:"8px 12px",background:g[50],borderRadius:4,fontSize:12,color:g[500],fontFamily:mono}}>{pc.blockSize} units = 1 block = ${pc.blockPrice} · {parseInt(pc.blockSize)*2+1} units = 2 blocks = ${(parseFloat(pc.blockPrice)*2).toFixed(2)}</div>}
        </div>}

        {/* Tiered/Volume config — subscription and one-time */}
        {(pc.pricingModel==="TIERED"||pc.pricingModel==="VOLUME")&&(isOTP||isPUSub)&&<div style={{marginBottom:20}}>
          <TierBuilder tiers={pc.tiers||[{from:0,to:1000,unitAmt:"",fixedAmt:""},{from:1001,to:null,unitAmt:"",fixedAmt:""}]} onChange={t=>sp({tiers:t})} previewQty={pc.previewQty||""} onPreviewQty={v=>sp({previewQty:v})} pricingModel={pc.pricingModel}/>
        </div>}

        {/* ── Subscription billing cycles + per-cycle prices ── */}
        {isSub&&pc.recurModel&&(isFlat||(isPUSub&&hasPM))&&<div style={{marginBottom:20}}>
          <SectionQ>Billing cycles</SectionQ>
          <div style={{display:"flex",gap:6,marginBottom:hasCyc?16:0}}>
            {["MONTHLY","ANNUAL"].map(cyc=>{const sel=(pc.cycles||[]).includes(cyc);return(
              <button key={cyc} onClick={()=>{const arr=pc.cycles||[];sp({cycles:sel?arr.filter(c=>c!==cyc):[...arr,cyc]})}}
                style={{padding:"8px 20px",fontSize:13,fontWeight:500,fontFamily:font,border:"1px solid "+(sel?blue:g[200]),borderRadius:4,background:sel?"#EEF2FF":"#fff",color:sel?blue:g[600],cursor:"pointer",outline:"none",transition:"all 0.12s",display:"flex",alignItems:"center",gap:6}}>
                {sel&&<div style={{width:14,height:14,borderRadius:"50%",background:blue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><I name="check"/></div>}
                {cyc==="MONTHLY"?"Monthly":"Annual"}
              </button>
            )})}
          </div>
          {hasCyc&&(isFlat||pc.pricingModel==="PER_UNIT")&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(pc.cycles||[]).map(cyc=><div key={cyc} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,fontWeight:600,color:g[600],width:70}}>{cyc==="MONTHLY"?"Monthly":"Annual"}</span>
              <span style={{fontSize:14,color:g[400]}}>$</span>
              <input type="text" value={(pc.cyclePrices||{})[cyc]||""} placeholder="0.00" onChange={e=>sp({cyclePrices:{...pc.cyclePrices,[cyc]:e.target.value}})} {...foc} style={{...inp,width:100,fontFamily:mono}}/>
              <span style={{fontSize:12,color:g[400]}}>/{isFlat?(cyc==="MONTHLY"?"month":"year"):pc.pricingModel==="BLOCK"?"block/"+(cyc==="MONTHLY"?"mo":"yr"):uL+"/"+(cyc==="MONTHLY"?"mo":"yr")}</span>
            </div>)}
          </div>}
        </div>}

        {/* Expiry — one-time purchases only */}
        {isOT&&(isOTF?(pc.flatPrice):(pc.pricingModel))&&<div style={{marginBottom:20}}>
          <SectionQ>Does this purchase expire?</SectionQ>
          <RadioGroup value={pc.expires===true?"YES":pc.expires===false?"NO":null} onChange={v=>sp({expires:v==="YES",expiryAmount:v==="YES"?(pc.expiryAmount||"365"):"",expiryUnit:v==="YES"?(pc.expiryUnit||"DAYS"):"DAYS"})} options={[
            {id:"NO",label:"No expiry",desc:"Purchase is valid indefinitely."},
            {id:"YES",label:"Expires after a set period",desc:"Access or credits expire after a defined time."}
          ]}/>
          {pc.expires===true&&<div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontWeight:500,color:g[600]}}>Expires after</span>
            <input type="text" value={pc.expiryAmount||""} placeholder="365" onChange={e=>sp({expiryAmount:e.target.value})} {...foc} style={{...inp,width:70,fontFamily:mono,textAlign:"center"}}/>
            <Pills value={pc.expiryUnit||"DAYS"} onChange={v=>sp({expiryUnit:v})} options={[{value:"DAYS",label:"Days"},{value:"MONTHS",label:"Months"},{value:"YEARS",label:"Years"}]}/>
            <span style={{fontSize:12,color:g[400]}}>from purchase</span>
          </div>}
        </div>}

        {/* PAYG billing note */}
        {isPayg&&(pc.meters||[]).some(m=>m.pricingModel)&&<div style={{marginBottom:20,padding:"10px 14px",background:g[50],borderRadius:6,border:"1px solid "+g[100],fontSize:12,color:g[500],display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:g[300]}}/> Billed monthly in arrears based on consumption.</div>}

        {/* Annual discount banner */}
        {needsCyc&&(pc.cycles||[]).includes("MONTHLY")&&(pc.cycles||[]).includes("ANNUAL")&&(()=>{
          const m=parseFloat(pc.cyclePrices?.MONTHLY);const a=parseFloat(pc.cyclePrices?.ANNUAL);
          if(!m||!a||isNaN(m)||isNaN(a))return null;
          const at=a*12;const mt=m*12;const pct=Math.round((1-at/mt)*100);if(pct===0)return null;
          return <div style={{marginBottom:20,padding:"10px 14px",background:pct>0?"#FFFBEB":"#FEF2F2",borderRadius:6,border:"1px solid "+(pct>0?"#FEF3C7":"#FEE2E2"),fontSize:12,color:pct>0?"#92400E":"#991B1B",display:"flex",alignItems:"center",gap:8}}>
            Annual saves {Math.abs(pct)}% vs. paying monthly (${at.toFixed(0)} vs ${mt.toFixed(0)}/yr)
          </div>;
        })()}
      </div>
    );
  };

  const resetAll=()=>{setEntryType(null);setStructure(null);setStep0Done(false);setBName("");setBSlug("");setSlugEd(false);setShowDesc(false);setDesc("");setGrp("");setCustomGrps([]);setP1Done(false);setP1Edit(false);setPlans([]);setShowPaths(false);setPaths([]);setEditPath(null);setAddPathMode(false);setNpFrom("");setNpTo("");setHovPath(null);setCustomBillingUnits([]);setCustomMeters([]);setP2Done(false);setExpandedPlan(null);setPlanConfig({});setDragIdx(null);setDropIdx(null);_id=0};

  return(
    <div style={{minHeight:"100vh",background:"#fff",fontFamily:font}}>
      {/* Header */}
      <div style={{borderBottom:"1px solid "+g[100],padding:"16px 0",background:"#fff"}}>
        <div style={{maxWidth:680,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <svg width="95" height="19" viewBox="0 0 95 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.6096 7.81142C23.0211 7.41529 21.4751 7.24613 20.3513 7.54912C20.291 6.42959 19.7132 5.486 18.6572 4.66268L18.2664 4.40038L18.0059 4.79401C17.4937 5.5713 17.2778 6.60731 17.3542 7.54912C17.4145 8.1294 17.6162 8.78142 18.0059 9.25464C16.543 10.1033 15.1944 9.91058 9.22236 9.91058H0.00204151C-0.0247244 11.2592 0.191901 13.853 1.84139 15.9647C2.02376 16.1981 2.22326 16.4236 2.44024 16.641C3.78139 17.9839 5.80775 18.9689 8.83765 18.9714C13.4603 18.9757 17.4206 16.4768 19.8299 10.4356C20.6225 10.4484 22.7152 10.5776 23.7395 8.5987C23.7645 8.56551 24 8.07409 24 8.07409L23.6096 7.81178V7.81142ZM6.01938 6.57841H3.42665V9.17113H6.01938V6.57841ZM9.36868 6.57841H6.77596V9.17113H9.36868V6.57841ZM12.7183 6.57841H10.1256V9.17113H12.7183V6.57841ZM16.068 6.57841H13.4753V9.17113H16.068V6.57841ZM2.66971 6.57841H0.0769861V9.17113H2.66971V6.57841ZM6.01938 3.30369H3.42665V5.89641H6.01938V3.30369ZM9.36868 3.30369H6.77596V5.89641H9.36868V3.30369ZM12.7183 3.30369H10.1256V5.89641H12.7183V3.30369ZM12.7183 0.0286102H10.1256V2.62133H12.7183V0.0286102Z" fill="currentColor"/>
              <path d="M34.434 10.934C34.29 10.682 33.822 9.98 32.688 9.98C31.482 9.98 30.69 11.006 30.69 12.338C30.69 13.688 31.482 14.714 32.706 14.714C33.876 14.714 34.362 13.976 34.47 13.76H37.278C37.17 15.056 35.928 17.234 32.634 17.234C29.88 17.234 27.756 15.308 27.756 12.338C27.756 9.386 29.88 7.442 32.598 7.442C35.892 7.442 37.134 9.584 37.278 10.934H34.434ZM42.6337 7.442C45.5497 7.442 47.7457 9.44 47.7457 12.338C47.7457 15.218 45.5497 17.234 42.6337 17.234C39.6997 17.234 37.5217 15.218 37.5217 12.338C37.5217 9.44 39.6997 7.442 42.6337 7.442ZM42.6337 14.696C43.9477 14.696 44.8117 13.67 44.8117 12.338C44.8117 11.006 43.9477 9.98 42.6337 9.98C41.3197 9.98 40.4377 11.006 40.4377 12.338C40.4377 13.67 41.3197 14.696 42.6337 14.696ZM48.7063 17V7.676H51.6223V9.116C51.9823 8.504 53.0083 7.478 54.6283 7.478C56.9503 7.478 58.4263 9.152 58.4263 11.51V17H55.4923V12.104C55.4923 10.862 54.7363 10.07 53.5663 10.07C52.3963 10.07 51.6223 10.88 51.6223 12.104V17H48.7063ZM64.3435 13.562C63.8395 13.526 63.5155 13.49 63.0295 13.454C60.7435 13.31 59.2855 12.338 59.2855 10.412C59.2855 8.558 60.9235 7.424 63.6235 7.424C67.1335 7.424 68.1055 9.242 68.3035 10.142H65.2255C65.0995 9.98 64.6855 9.494 63.6055 9.494C62.7415 9.494 62.2555 9.782 62.2555 10.232C62.2555 10.61 62.5435 10.898 63.3535 10.97C63.7675 11.024 64.0915 11.042 64.5775 11.078C67.3855 11.276 68.4655 12.248 68.4655 14.192C68.4655 16.082 66.9895 17.252 63.9655 17.252C60.3295 17.252 59.2495 15.218 59.0875 14.354H62.2375C62.3095 14.552 62.7415 15.146 63.9655 15.146C64.9915 15.146 65.4775 14.822 65.4775 14.372C65.4775 13.94 65.2255 13.634 64.3435 13.562ZM73.9347 7.442C76.8507 7.442 79.0467 9.44 79.0467 12.338C79.0467 15.218 76.8507 17.234 73.9347 17.234C71.0007 17.234 68.8227 15.218 68.8227 12.338C68.8227 9.44 71.0007 7.442 73.9347 7.442ZM73.9347 14.696C75.2487 14.696 76.1127 13.67 76.1127 12.338C76.1127 11.006 75.2487 9.98 73.9347 9.98C72.6207 9.98 71.7387 11.006 71.7387 12.338C71.7387 13.67 72.6207 14.696 73.9347 14.696ZM80.0433 17V3.752H82.9773V17H80.0433ZM88.9632 7.442C91.9512 7.442 93.9492 9.35 93.9492 12.392V12.896H86.8572C87.0012 14.066 87.8832 14.948 89.1612 14.948C90.2952 14.948 90.8352 14.426 90.9612 14.228H93.8592C93.7152 15.344 92.3832 17.234 89.1612 17.234C85.9932 17.234 83.9772 15.182 83.9772 12.338C83.9772 9.386 86.0292 7.442 88.9632 7.442ZM88.9632 9.566C87.9012 9.566 87.1632 10.16 86.9112 11.114H91.0152C90.7632 10.142 90.0072 9.566 88.9632 9.566Z" fill="currentColor"/>
            </svg>
            <div style={{height:16,width:1,background:g[200]}}/>
            <span style={{fontSize:13,color:g[400]}}>Catalog</span>
            <span style={{color:g[300]}}>/</span>
            <span style={{fontSize:13,color:g[900]}}>{crumb}</span>
          </div>
          <button onClick={resetAll} style={{padding:"6px 12px",fontSize:12,fontWeight:500,border:"1px solid "+g[200],borderRadius:4,background:"#fff",cursor:"pointer",color:g[500],fontFamily:font,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=red;e.currentTarget.style.color=red}} onMouseLeave={e=>{e.currentTarget.style.borderColor=g[200];e.currentTarget.style.color=g[500]}}>Reset</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"40px 32px 160px"}}>

        {/* ════ STEP 0 ════ */}
        {!step0Done?(
          <div>
            <Fade><h1 style={{fontSize:20,fontWeight:600,color:g[900],margin:"0 0 36px",letterSpacing:"-0.02em"}}>Create a new offering</h1></Fade>
            <Fade delay={50}>
              <div style={{marginBottom:entryType==="product"?24:0}}>
                <label style={lbl}>What are you creating?</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <SelectCard selected={entryType==="product"} onClick={()=>{setEntryType("product");setStructure(null)}} icon="pkg" title="Product" desc="Plans, pricing, and features."/>
                  <SelectCard selected={entryType==="addon"} onClick={()=>{setEntryType("addon");setStructure(null)}} icon="puzzle" title="Add-on" desc="Extends an existing plan."/>
                </div>
              </div>
            </Fade>
            {entryType==="product"&&<Fade delay={40} k="structure"><div><Div mt={24} mb={24}/><label style={lbl}>How is it structured?</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><SelectCard selected={structure==="bundle"} onClick={()=>setStructure("bundle")} icon="layers" title="Bundle" desc="Multiple plans — good, better, best."/><SelectCard selected={structure==="standalone"} onClick={()=>setStructure("standalone")} icon="file" title="Standalone" desc="A single plan with one pricing model."/></div></div></Fade>}
            {canStep0&&<Fade delay={50} k={"c0"+(entryType||"")+(structure||"")}><Cont onClick={confirmStep0} disabled={false}/></Fade>}
          </div>
        ):(
          <Fade><button onClick={()=>{setStep0Done(false);setP1Done(false);setP1Edit(false)}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",border:"1px solid "+g[200],borderRadius:4,background:g[50],cursor:"pointer",outline:"none",fontFamily:font,fontSize:12,fontWeight:500,color:g[600],marginBottom:28}} onMouseEnter={e=>e.currentTarget.style.borderColor=g[300]} onMouseLeave={e=>e.currentTarget.style.borderColor=g[200]}>
            <I name={entryType==="addon"?"puzzle":isBundle?"layers":"file"}/>{entryType==="addon"?"Add-on":isBundle?"Product bundle":"Standalone product"}<span style={{color:g[400],marginLeft:2}}>· Change</span>
          </button></Fade>
        )}

        {/* ════ PHASE 1 ════ */}
        {step0Done&&(
          <div ref={p1Ref}>
            {p1Done&&!p1Edit?(
              <Fade><button onClick={()=>setP1Edit(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",border:"1px solid "+g[200],borderRadius:4,background:g[50],cursor:"pointer",outline:"none",marginBottom:32,textAlign:"left",fontFamily:font,transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=g[300]} onMouseLeave={e=>e.currentTarget.style.borderColor=g[200]}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{color:blue}}><I name="pkg"/></div>
                  <div><div style={{fontSize:14,fontWeight:600,color:g[900]}}>{bName}</div><div style={{fontSize:12,color:g[400],fontFamily:mono,marginTop:1}}>{bSlug} <span style={{color:g[300],margin:"0 4px"}}>·</span> <span style={{fontFamily:font,color:g[500]}}>{grp}</span></div></div>
                </div>
                <div style={{color:g[400]}}><I name="edit"/></div>
              </button></Fade>
            ):(
              <Fade delay={step0Done&&!p1Done?60:0}><div>
                <h2 style={{fontSize:16,fontWeight:600,color:g[900],margin:"0 0 24px",letterSpacing:"-0.01em"}}>{p1Edit?"Edit details":"Name your "+entityLabel}</h2>
                <div style={{marginBottom:20}}><label style={lbl}>Name</label><input type="text" value={bName} placeholder={entryType==="addon"?"e.g. Premium Support & TAM":"e.g. Docker Hardened Images"} onChange={e=>handleBName(e.target.value)} {...foc} style={inp}/></div>
                <div style={{marginBottom:20}}><label style={lbl}>Slug <span style={{fontWeight:400,color:g[400]}}>auto-generated</span></label>
                  <div style={{position:"relative",display:"flex",alignItems:"center",gap:6}}>
                    <div style={{color:slugEd?g[400]:blue,transition:"color 0.2s",flexShrink:0}}><I name={slugEd?"unlink":"link"}/></div>
                    <input type="text" value={bSlug} placeholder="auto-generated" onChange={e=>handleBSlug(e.target.value)} {...foc} style={{...inp,fontFamily:mono,fontSize:12,color:g[500]}}/>
                    {slugEd&&<button onClick={()=>{setSlugEd(false);setBSlug(toSlug(bName))}} style={{position:"absolute",right:8,background:"none",border:"none",cursor:"pointer",fontSize:11,color:blue,fontWeight:500,fontFamily:font}}>Reset</button>}
                  </div>
                </div>
                <div style={{marginBottom:20}}>{!showDesc?<button onClick={()=>setShowDesc(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:g[400],fontFamily:font,fontWeight:500,padding:0}}>+ Add description</button>:<div><label style={lbl}>Description <span style={{fontWeight:400,color:g[400]}}>optional</span></label><textarea value={desc} rows={2} placeholder="Brief internal description." onChange={e=>setDesc(e.target.value)} {...foc} style={{...inp,resize:"vertical",minHeight:56,lineHeight:1.5}}/></div>}</div>
                <div style={{marginBottom:8}}><label style={lbl}>Offering group</label>
                  <Dropdown value={grp} options={allGrps} placeholder="Select an offering group" onSelect={v=>setGrp(v)} onCreate={v=>{setCustomGrps(c=>c.includes(v)?c:[...c,v]);setGrp(v)}} createLabel="+ Create new group"/>
                </div>
                {entryType === "addon" && (
                  <Fade delay={40} k="addon-offerings">
                    <div>
                      <Div mt={24} mb={24} />
                      <label style={lbl}>
                        Compatible with
                        <span style={{ fontSize: 13, color: g[500], fontWeight: 400, marginLeft: 8 }}>
                          (Users need any one of these)
                        </span>
                      </label>
                      <div style={{ marginTop: 8 }}>
                        <AddonOfferingSelector
                          selected={addonOfferings}
                          onChange={setAddonOfferings}
                        />
                      </div>
                    </div>
                  </Fade>
                )}
                <div style={{marginTop:28,paddingTop:24,borderTop:"1px solid "+g[200],display:"flex",justifyContent:"flex-end",gap:8}}>
                  {p1Edit&&<button onClick={()=>setP1Edit(false)} style={{padding:"9px 16px",background:"#fff",color:g[600],border:"1px solid "+g[200],borderRadius:4,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:font}}>Cancel</button>}
                  <button onClick={confirmP1} disabled={!canP1} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",border:"none",borderRadius:4,fontSize:13,fontWeight:500,cursor:canP1?"pointer":"default",background:canP1?blue:g[200],color:canP1?"#fff":g[400],transition:"background 0.15s",fontFamily:font}}>Continue <I name="arrowR"/></button>
                </div>
              </div></Fade>
            )}
          </div>
        )}

        {/* ════ PHASE 2 ════ */}
        {p1Done&&isBundle&&!p2Done&&(
          <div ref={p2Ref}><Fade delay={60}><div>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:g[700],marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Define your plans</label>
            <p style={{fontSize:13,color:g[400],margin:"0 0 16px",lineHeight:1.5}}>List your tiers from lowest to highest. Drag to reorder.</p>

            {/* Plan list — single bordered container */}
            <div style={{border:"1px solid "+g[200],borderRadius:6}}>
              {plans.map((plan,idx)=>{
                const active=plan.name.trim().length>0;
                const isDragging=dragIdx===idx;
                const isDropTarget=dropIdx===idx;
                return(
                  <div key={plan.id}
                    draggable
                    onDragStart={()=>onDragStart(idx)}
                    onDragOver={e=>onDragOver(e,idx)}
                    onDragEnd={onDragEnd}
                    style={{
                      display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                      borderBottom:idx<plans.length-1?"1px solid "+g[100]:"none",
                      background:isDragging?g[50]:isDropTarget?"#EEF2FF":"#fff",
                      opacity:isDragging?0.5:1,
                      borderTop:isDropTarget&&dropIdx<dragIdx?"2px solid "+blue:"none",
                      borderBottomColor:isDropTarget&&dropIdx>dragIdx?blue:idx<plans.length-1?g[100]:"transparent",
                      borderBottomWidth:isDropTarget&&dropIdx>dragIdx?2:1,
                      transition:"background 0.1s",
                      cursor:"grab",
                      borderRadius:idx===0&&plans.length===1?6:idx===0?"6px 6px 0 0":idx===plans.length-1?"0 0 6px 6px":0,
                    }}>
                    {/* Grip */}
                    <div style={{color:g[300],flexShrink:0,display:"flex",alignItems:"center"}}><I name="grip"/></div>

                    {/* Tier number */}
                    <div style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,fontWeight:700,flexShrink:0,
                      background:active?blue:g[100],color:active?"#fff":g[400],
                      transition:"all 0.2s"}}>{idx+1}</div>

                    {/* Name input */}
                    <input type="text" value={plan.name}
                      draggable={false}
                      placeholder={PLAN_PLACEHOLDERS[idx]||"Plan "+(idx+1)}
                      onChange={e=>pName(plan.id,e.target.value)}
                      onMouseDown={e=>e.stopPropagation()}
                      {...foc}
                      style={{...inp,flex:1,fontSize:13,fontWeight:active?600:400,border:"none",padding:"4px 0",background:"transparent",borderRadius:0,cursor:"text"}}/>

                    {/* Inheritance chip (plans after first) */}
                    {idx>0&&active&&(
                      <button onClick={e=>{e.stopPropagation();upPlan(plan.id,{inherits:!plan.inherits})}}
                        style={{padding:"2px 8px",fontSize:11,fontWeight:500,border:"1px solid "+(plan.inherits?blue+"30":g[200]),
                          borderRadius:3,background:plan.inherits?"#EEF2FF":"#fff",color:plan.inherits?blue:g[400],
                          cursor:"pointer",outline:"none",fontFamily:font,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s"}}>
                        {plan.inherits?"extends "+(plans[idx-1]?.name?.trim()||"above"):"standalone"}
                      </button>
                    )}
                    {idx===0&&active&&<span style={{fontSize:11,fontWeight:500,color:g[400],padding:"2px 8px",background:g[50],borderRadius:3,flexShrink:0}}>base</span>}

                    {/* Delete */}
                    {plans.length>1&&(
                      <button onClick={e=>{e.stopPropagation();rmPlan(plan.id)}}
                        style={{background:"none",border:"none",cursor:"pointer",color:g[300],padding:3,outline:"none",borderRadius:3,flexShrink:0,transition:"color 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.color=red} onMouseLeave={e=>e.currentTarget.style.color=g[300]}>
                        <I name="x"/>
                      </button>
                    )}
                  </div>
                );
              })}
              {/* Add plan row */}
              <div style={{borderTop:plans.length>0?"1px solid "+g[100]:"none",borderRadius:plans.length===0?6:"0 0 6px 6px"}}>
                <button onClick={addPlan}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",border:"none",cursor:"pointer",
                    fontSize:13,color:g[400],fontWeight:500,display:"flex",alignItems:"center",gap:8,fontFamily:font,
                    outline:"none",transition:"all 0.15s",borderRadius:"0 0 6px 6px"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=g[50];e.currentTarget.style.color=blue}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=g[400]}}>
                  <I name="plus"/> Add plan
                </button>
              </div>
            </div>

            {canPaths&&<div ref={pathRef} style={{marginTop:36}}><Fade delay={40}>
              <Div mt={0} mb={24}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div><label style={{display:"block",fontSize:13,fontWeight:600,color:g[700],textTransform:"uppercase",letterSpacing:"0.05em"}}>Upgrade & downgrade paths</label><p style={{fontSize:13,color:g[400],margin:"4px 0 0"}}>Define how customers move between plans.</p></div>
                {!showPaths&&<button onClick={genPaths} style={{padding:"7px 14px",fontSize:12,fontWeight:500,border:"1px solid "+g[200],borderRadius:4,background:"#fff",cursor:"pointer",color:blue,fontFamily:font,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="#F8FAFF";e.currentTarget.style.borderColor=blue}} onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=g[200]}}>Auto-generate</button>}
              </div>
              {showPaths&&<div>
                <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20,padding:"12px 16px",background:g[50],borderRadius:6,border:"1px solid "+g[100]}}>
                  {named.map((p,i)=>{const isH=hovPath!==null&&(paths[hovPath]?.from===p.id||paths[hovPath]?.to===p.id);return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:0,flex:1}}><div style={{padding:"6px 14px",borderRadius:4,fontSize:12,fontWeight:600,background:isH?"#EEF2FF":"#fff",color:isH?blue:g[900],border:"1px solid "+(isH?blue:g[200]),transition:"all 0.2s",textAlign:"center",flex:1}}>{p.name}</div>{i<named.length-1&&<div style={{padding:"0 6px",color:g[300],fontSize:12}}>↔</div>}</div>)})}
                </div>
                {[{label:"Upgrades",color:green,items:upgradePaths},{label:"Downgrades",color:amber,items:downgradePaths}].map(grpDef=>(
                  grpDef.items.length>0&&<div key={grpDef.label} style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:600,color:grpDef.color,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:grpDef.color,opacity:0.4}}/>{grpDef.label}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      {grpDef.items.map(path=>{const gi=paths.indexOf(path);const fp=plans.find(p=>p.id===path.from);const tp=plans.find(p=>p.id===path.to);if(!fp||!tp)return null;const isEd=editPath===gi;return(<div key={gi} onMouseEnter={()=>setHovPath(gi)} onMouseLeave={()=>setHovPath(null)}>
                        <button onClick={()=>setEditPath(isEd?null:gi)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",border:"1px solid "+(isEd?blue:hovPath===gi?g[300]:g[200]),borderRadius:isEd?"6px 6px 0 0":6,background:isEd?"#F8FAFF":hovPath===gi?g[50]:"#fff",cursor:"pointer",outline:"none",fontFamily:font,transition:"all 0.15s"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}><span style={{fontWeight:600,color:g[900]}}>{fp.name}</span><span style={{color:grpDef.color,fontSize:14}}>→</span><span style={{fontWeight:600,color:g[900]}}>{tp.name}</span></div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:g[400],background:g[100],padding:"2px 8px",borderRadius:3}}>{path.timing==="IMMEDIATE"?"Immediate":"End of cycle"}</span><span style={{fontSize:11,color:g[400],background:g[100],padding:"2px 8px",borderRadius:3}}>{PRORATION.find(o=>o.value===path.pro)?.label}</span><I name={isEd?"chevU":"chevD"}/></div>
                        </button>
                        {isEd&&<div style={{padding:"16px 14px",border:"1px solid "+blue,borderTop:"none",borderRadius:"0 0 6px 6px",background:"#FAFBFF"}}>
                          <div style={{display:"flex",gap:28,marginBottom:14,flexWrap:"wrap"}}><div><div style={{fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Timing</div><Pills value={path.timing} onChange={v=>upPath(gi,{timing:v})} options={[{value:"IMMEDIATE",label:"Immediate"},{value:"END_OF_CYCLE",label:"End of cycle"}]}/></div><div><div style={{fontSize:11,fontWeight:600,color:g[500],textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Proration</div><Pills value={path.pro} onChange={v=>upPath(gi,{pro:v})} options={PRORATION}/></div></div>
                          <button onClick={()=>rmPathAt(gi)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:red,fontWeight:500,fontFamily:font,padding:0}}>Remove this path</button>
                        </div>}
                      </div>)})}
                    </div>
                  </div>
                ))}
                {!addPathMode?<button onClick={()=>setAddPathMode(true)} style={{marginTop:4,background:"none",border:"none",cursor:"pointer",fontSize:12,color:g[400],fontWeight:500,fontFamily:font,padding:"4px 0"}} onMouseEnter={e=>e.currentTarget.style.color=blue} onMouseLeave={e=>e.currentTarget.style.color=g[400]}>+ Add custom path</button>
                :<div style={{marginTop:8,padding:14,border:"1px solid "+g[200],borderRadius:6,background:g[50]}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}><select value={npFrom} onChange={e=>setNpFrom(e.target.value)} style={{...inp,width:"auto",flex:1}}><option value="">From…</option>{named.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><span style={{color:g[300],fontSize:14,fontWeight:600}}>→</span><select value={npTo} onChange={e=>setNpTo(e.target.value)} style={{...inp,width:"auto",flex:1}}><option value="">To…</option>{named.filter(p=>p.id!==npFrom).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  <div style={{display:"flex",gap:6}}><button onClick={doAddPath} disabled={!npFrom||!npTo} style={{padding:"6px 14px",fontSize:12,fontWeight:500,border:"none",borderRadius:4,background:npFrom&&npTo?blue:g[200],color:npFrom&&npTo?"#fff":g[400],cursor:npFrom&&npTo?"pointer":"default",fontFamily:font}}>Add path</button><button onClick={()=>{setAddPathMode(false);setNpFrom("");setNpTo("")}} style={{padding:"6px 14px",fontSize:12,fontWeight:500,border:"1px solid "+g[200],borderRadius:4,background:"#fff",color:g[600],cursor:"pointer",fontFamily:font}}>Cancel</button></div>
                </div>}
              </div>}
            </Fade></div>}

            {named.length>=1&&<Fade delay={40}><Cont onClick={confirmP2} label="Continue to pricing"/></Fade>}
          </div></Fade></div>
        )}

        {p1Done&&isBundle&&p2Done&&(
          <Fade><button onClick={()=>setP2Done(false)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",border:"1px solid "+g[200],borderRadius:4,background:g[50],cursor:"pointer",outline:"none",marginBottom:32,textAlign:"left",fontFamily:font,transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=g[300]} onMouseLeave={e=>e.currentTarget.style.borderColor=g[200]}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{color:blue}}><I name="layers"/></div><div><div style={{fontSize:13,fontWeight:600,color:g[900]}}>{named.length} plans</div><div style={{fontSize:12,color:g[400],marginTop:1}}>{named.map(p=>p.name).join(" → ")}</div></div></div>
            <div style={{color:g[400]}}><I name="edit"/></div>
          </button></Fade>
        )}

        {/* ════ PHASE 3: Pricing — Accordion ════ */}
        {p2Done&&(entryType==="product"||entryType==="addon")&&(
          <div ref={p3Ref}><Fade delay={60}><div>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:g[700],marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Set pricing</label>
            <p style={{fontSize:13,color:g[400],margin:"0 0 20px",lineHeight:1.5}}>{isBundle?"Configure pricing for each plan in your bundle.":"Configure pricing for your product."}</p>

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {named.map((plan,pi)=>{
                if(!isBundle&&pi>0)return null;
                const pc=getPc(plan.id);const isOpen=expandedPlan===plan.id;
                const summary=priceSummary(pc,allUnits,allMet);
                const isDone=!!pc.billingType&&(pc.billingType==="FREE"||pc.recurModel||pc.oneTimeModel||(pc.meters||[]).some(m=>m.featureId));

                return(<div key={plan.id} style={{border:"1px solid "+(isOpen?blue:g[200]),borderRadius:6,transition:"border-color 0.2s"}}>
                  <button onClick={()=>setExpandedPlan(isOpen?null:plan.id)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:isOpen?"#FAFBFF":g[50],border:"none",cursor:"pointer",outline:"none",fontFamily:font,transition:"background 0.15s",borderRadius:isOpen?"6px 6px 0 0":6}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:isDone?green+"18":isOpen?blue+"12":g[100],color:isDone?green:isOpen?blue:g[400],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,border:"1.5px solid "+(isDone?green+"40":isOpen?blue+"30":g[200]),transition:"all 0.2s"}}>
                        {isDone?<I name="check"/>:(pi+1)}
                      </div>
                      <div style={{textAlign:"left"}}>
                        <div style={{fontSize:14,fontWeight:600,color:g[900]}}>{plan.name}</div>
                        {!isOpen&&summary&&<div style={{fontSize:12,color:isDone?green:g[400],marginTop:1}}>{summary}</div>}
                      </div>
                    </div>
                    <div style={{color:g[400],transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"rotate(0)"}}><I name="chevD"/></div>
                  </button>
                  {isOpen&&renderPricing(plan)}
                </div>);
              })}
            </div>

            <Fade delay={40}><Cont onClick={() => {
              const output = {
                meta: {
                  entryType,
                  structure,
                  name: bName,
                  slug: bSlug,
                  description: desc,
                  group: grp,
                  ...(entryType === "addon" && {
                    compatibleOfferings: addonOfferings,
                    requirementType: "ANY_ONE"
                  })
                },
                plans: named.map(p => ({
                  id: p.id,
                  name: p.name,
                  standalone: p.standalone,
                  pricing: getPc(p.id)
                })),
                paths: paths.map(path => ({
                  from: path.from,
                  to: path.to,
                  direction: path.dir,
                  timing: path.timing,
                  proration: path.pro
                }))
              };
              console.log("FINAL OUTPUT:", output);
            }} label="Continue to features"/></Fade>
          </div></Fade></div>
        )}

        {p1Done&&!isBundle&&!p2Done&&entryType==="product"&&<Fade delay={60}><Cont onClick={confirmP2} label="Continue to pricing"/></Fade>}
      </div>
    </div>
  );
}
