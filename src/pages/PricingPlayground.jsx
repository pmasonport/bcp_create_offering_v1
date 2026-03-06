import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { METERS } from '../data/meters'
import { OFFERINGS } from '../data/offerings'
import { getMutableAndMeteredFeatures } from '../data/helpers'

// ─── Design Tokens ─────────────────────────────────────────────────────────
const B = '#2560FF', BL = '#EEF2FF', BBG = '#F8FAFF'
const G50='#F9FAFB',G100='#F3F4F6',G200='#E5E7EB',G300='#D1D5DB'
const G400='#9CA3AF',G500='#6B7280',G700='#374151',G900='#111827'
const GREEN='#10B981'

// ─── Fade ───────────────────────────────────────────────────────────────────
const Fade = ({ children }) => {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), 30); return () => clearTimeout(t) }, [])
  return (
    <div style={{ opacity: v?1:0, transform: v?'none':'translateY(8px)', transition:'opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)' }}>
      {children}
    </div>
  )
}

// ─── UI Atoms ───────────────────────────────────────────────────────────────
const inp = { width:'100%', padding:'8px 10px', border:`1px solid ${G200}`, borderRadius:4, fontSize:13, color:G900, outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#fff' }

const Label = ({ children, hint }) => (
  <label style={{ display:'block', fontSize:13, fontWeight:500, color:G700, marginBottom:6 }}>
    {children}
    {hint && <span style={{ fontWeight:400, color:G400, marginLeft:5, fontSize:12 }}>{hint}</span>}
  </label>
)
const Input = ({ style, ...p }) => <input style={{ ...inp, ...style }} {...p} />
const Select = ({ style, children, ...p }) => <select style={{ ...inp, ...style }} {...p}>{children}</select>
const SectionQ = ({ children }) => <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>{children}</div>
const Divider = ({ mt=28, mb=28 }) => <div style={{ height:1, background:G200, margin:`${mt}px 0 ${mb}px` }} />
const Note = ({ children }) => <div style={{ padding:'8px 12px', background:G50, border:`1px solid ${G100}`, borderRadius:4, fontSize:12, color:G500, lineHeight:1.6, marginBottom:16 }}>{children}</div>
const Explainer = ({ children }) => <div style={{ padding:'8px 10px', background:G50, border:`1px solid ${G100}`, borderRadius:4, fontSize:12, color:G500, lineHeight:1.6, marginTop:6 }}>{children}</div>

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{ padding:'5px 12px', borderRadius:9999, fontSize:12, fontWeight:500, cursor:'pointer', border: active ? `1px solid ${B}` : `1px solid ${G200}`, background: active ? BL : '#fff', color: active ? B : G700, transition:'all 0.12s', outline:'none', fontFamily:'inherit' }}>
    {children}
  </button>
)

const SelCard = ({ title, desc, selected, onClick }) => (
  <div onClick={onClick} style={{ border: selected ? `1.5px solid ${B}` : `1px solid ${G200}`, background: selected ? BBG : '#fff', borderRadius:6, padding:'14px 16px', cursor:'pointer', transition:'all 0.15s', position:'relative' }}>
    {selected && (
      <div style={{ position:'absolute', top:10, right:10, width:18, height:18, borderRadius:'50%', background:B, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg viewBox="0 0 13 13" width="10" height="10"><polyline points="1.5,6.5 5,10 11.5,3" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    )}
    <div style={{ fontSize:13, fontWeight:500, color:G900, marginBottom:3 }}>{title}</div>
    <div style={{ fontSize:12, color:G500, lineHeight:1.5 }}>{desc}</div>
  </div>
)

const BtnPrimary = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: disabled?G200:B, color: disabled?G400:'#fff', border:'none', borderRadius:4, padding:'9px 18px', fontSize:13, fontWeight:500, cursor: disabled?'default':'pointer', display:'inline-flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
    {children}
    <svg viewBox="0 0 15 15" width="12" height="12"><path d="M2 7.5h11m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
)

const BtnGhost = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ background:'none', color:B, border:`1px dashed ${G300}`, borderRadius:4, padding:'6px 12px', fontSize:12, fontWeight:500, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4, fontFamily:'inherit', ...style }}>
    <svg viewBox="0 0 15 15" width="10" height="10"><line x1="7.5" y1="1.5" x2="7.5" y2="13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1.5" y1="7.5" x2="13.5" y2="7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    {children}
  </button>
)

// ─── Inline create ──────────────────────────────────────────────────────────
function InlineCreate({ label, onAdd, fields = [{ key:'name', placeholder:'Name...' }] }) {
  const [open, setOpen] = useState(false)
  const [vals, setVals] = useState({})
  const upd = (k,v) => setVals(p=>({...p,[k]:v}))
  const canSave = fields.every(f => vals[f.key]?.trim())
  const save = () => { if (canSave) { onAdd(vals); setVals({}); setOpen(false) } }
  if (!open) return <BtnGhost onClick={()=>setOpen(true)}>{label}</BtnGhost>
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8, flexWrap:'wrap' }}>
      {fields.map(f => <Input key={f.key} placeholder={f.placeholder} value={vals[f.key]||''} onChange={e=>upd(f.key,e.target.value)} style={{ width:160 }} onKeyDown={e=>e.key==='Enter'&&save()} autoFocus={f===fields[0]}/>)}
      <button onClick={save} disabled={!canSave} style={{ background: canSave?B:G200, color: canSave?'#fff':G400, border:'none', borderRadius:4, padding:'8px 12px', fontSize:12, cursor: canSave?'pointer':'default', fontFamily:'inherit' }}>Add</button>
      <button onClick={()=>setOpen(false)} style={{ background:'none', border:'none', fontSize:12, color:G500, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
    </div>
  )
}

// ─── Strategy Forms ─────────────────────────────────────────────────────────
function SubscriptionForm({ onDone, allMetered, allMutable, onCreateMetered, onCreateMutable }) {
  const [c, setC] = useState({ whatGet:null, feature:null, quantity:'', overage:null, overageRate:'', rollover:null, rollCapType:null, rollCap:'', timing:null, cycle:null, price:'', priceAnnual:'' })
  const upd = (k,v) => setC(p=>({...p,[k]:v}))

  const featureType = (f) => allMetered.find(m=>m.name===f) ? 'metered' : 'mutable'
  const unitLabel = (f) => allMutable.find(m=>m.name===f)?.unit || 'unit'

  const priceReady = c.timing && c.cycle && (
    (c.cycle==='monthly'&&c.price) || (c.cycle==='annual'&&c.priceAnnual) || (c.cycle==='both'&&c.price&&c.priceAnnual)
  )
  const canDone = c.whatGet==='access' ? priceReady : (c.feature && priceReady)

  return (
    <div>
      <Fade>
        <SectionQ>What do customers get?</SectionQ>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:6 }}>
          <SelCard title="Access" desc="Flat fee. Unlocks the product — no quantity or meter." selected={c.whatGet==='access'} onClick={()=>upd('whatGet','access')}/>
          <SelCard title="A quantity of something" desc="Price scales with seats, repos, or an included usage allowance." selected={c.whatGet==='quantity'} onClick={()=>upd('whatGet','quantity')}/>
        </div>
        <Explainer>Access = flat fee no matter what. Quantity = price is tied to a countable thing — seats, repos, or usage.</Explainer>
      </Fade>

      {c.whatGet==='quantity' && (
        <Fade key="feat">
          <Divider />
          <SectionQ>Which feature or resource?</SectionQ>
          <Select value={c.feature||''} onChange={e=>upd('feature',e.target.value)} style={{ marginBottom:8 }}>
            <option value="">Select...</option>
            {['General', 'Hub / registry', 'Hardened Images', 'Scout', 'Build Cloud', 'Offload', 'Custom (mutable)'].map(cat => {
              const items = allMutable.filter(m => (m.category || 'Custom (mutable)') === cat)
              if (items.length === 0) return null
              return (
                <optgroup key={cat} label={cat}>
                  {items.map(m=><option key={m.slug||m.name} value={m.name}>{m.name}</option>)}
                </optgroup>
              )
            })}
            {['Compute', 'Storage', 'Network', 'Requests / events', 'Scout specific', 'Custom (metered)'].map(cat => {
              const items = allMetered.filter(m => m.category === cat || (cat === 'Custom (metered)' && m.category === 'Custom'))
              if (items.length === 0) return null
              return (
                <optgroup key={cat} label={cat}>
                  {items.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                </optgroup>
              )
            })}
          </Select>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <InlineCreate label="New feature" fields={[{key:'name',placeholder:'Feature name'},{key:'unit',placeholder:'Unit (seat)'},{key:'plural',placeholder:'Plural (seats)'}]} onAdd={f=>onCreateMutable(f)}/>
            <InlineCreate label="New metered resource" fields={[{key:'name',placeholder:'Resource name'}]} onAdd={f=>onCreateMetered(f)}/>
          </div>

          {c.feature && featureType(c.feature)==='metered' && (
            <Fade key="met-detail">
              <Divider mt={16} mb={16}/>
              <div style={{ marginBottom:14 }}>
                <Label hint={`${c.feature} / period`}>Included per billing period</Label>
                <Input type="number" placeholder="500" value={c.quantity} onChange={e=>upd('quantity',e.target.value)} style={{ width:160 }}/>
              </div>
              <SectionQ>When the included amount runs out</SectionQ>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <Pill active={c.overage==='hardstop'} onClick={()=>upd('overage','hardstop')}>Hard stop</Pill>
                <Pill active={c.overage==='payg'} onClick={()=>upd('overage','payg')}>PAYG overage</Pill>
              </div>
              {c.overage==='payg' && (
                <Fade key="ov-rate">
                  <div style={{ marginBottom:14 }}>
                    <Label hint="per unit">Overage rate ($)</Label>
                    <Input type="number" placeholder="0.001" value={c.overageRate} onChange={e=>upd('overageRate',e.target.value)} style={{ width:140 }}/>
                  </div>
                </Fade>
              )}
              <SectionQ>Rollover</SectionQ>
              <div style={{ display:'flex', gap:8 }}>
                <Pill active={c.rollover===true} onClick={()=>upd('rollover',true)}>Unused rolls over</Pill>
                <Pill active={c.rollover===false} onClick={()=>upd('rollover',false)}>Use it or lose it</Pill>
              </div>
              {c.rollover && (
                <Fade key="roll-cap">
                  <div style={{ marginTop:14 }}>
                    <SectionQ>Cap expressed as</SectionQ>
                    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                      <Pill active={c.rollCapType==='multiplier'} onClick={()=>upd('rollCapType','multiplier')}>Multiplier (e.g. 2×)</Pill>
                      <Pill active={c.rollCapType==='fixed'} onClick={()=>upd('rollCapType','fixed')}>Fixed amount</Pill>
                    </div>
                    {c.rollCapType==='multiplier' && <Input type="number" placeholder="2" value={c.rollCap} onChange={e=>upd('rollCap',e.target.value)} style={{ width:100 }}/>}
                    {c.rollCapType==='fixed' && <Input type="number" placeholder="1000" value={c.rollCap} onChange={e=>upd('rollCap',e.target.value)} style={{ width:160 }}/>}
                  </div>
                </Fade>
              )}
            </Fade>
          )}
        </Fade>
      )}

      {(c.whatGet==='access' || (c.whatGet==='quantity' && c.feature)) && (
        <Fade key="timing">
          <Divider />
          <SectionQ>Billing timing</SectionQ>
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <Pill active={c.timing==='advance'} onClick={()=>upd('timing','advance')}>In advance</Pill>
            <Pill active={c.timing==='arrears'} onClick={()=>upd('timing','arrears')}>In arrears</Pill>
          </div>
          <SectionQ>Billing cycle</SectionQ>
          <div style={{ display:'flex', gap:8 }}>
            <Pill active={c.cycle==='monthly'} onClick={()=>upd('cycle','monthly')}>Monthly</Pill>
            <Pill active={c.cycle==='annual'} onClick={()=>upd('cycle','annual')}>Annual</Pill>
            <Pill active={c.cycle==='both'} onClick={()=>upd('cycle','both')}>Both</Pill>
          </div>
        </Fade>
      )}

      {c.timing && c.cycle && (
        <Fade key="price">
          <Divider />
          <SectionQ>Price</SectionQ>
          {c.cycle!=='annual' && (
            <div style={{ marginBottom:12 }}>
              <Label hint={c.whatGet==='quantity'&&c.feature&&featureType(c.feature)==='mutable' ? `per ${unitLabel(c.feature)} / month` : '/ month'}>Monthly price ($)</Label>
              <Input type="number" placeholder="0.00" value={c.price} onChange={e=>upd('price',e.target.value)} style={{ width:160 }}/>
            </div>
          )}
          {c.cycle!=='monthly' && (
            <div>
              <Label hint={c.whatGet==='quantity'&&c.feature&&featureType(c.feature)==='mutable' ? `per ${unitLabel(c.feature)} / year` : '/ year'}>Annual price ($)</Label>
              <Input type="number" placeholder="0.00" value={c.priceAnnual} onChange={e=>upd('priceAnnual',e.target.value)} style={{ width:160 }}/>
            </div>
          )}
        </Fade>
      )}

      {canDone && (
        <Fade key="done">
          <Divider mt={28} mb={0}/>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:20 }}>
            <BtnPrimary onClick={()=>onDone({ type:'subscription', ...c, featureType: c.feature ? featureType(c.feature) : null, unitLabel: c.feature ? unitLabel(c.feature) : null })}>Add component</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

function PAYGForm({ onDone, allMetered, onCreateMetered }) {
  const empty = () => ({ resource:'', model:'perunit', price:'', blockSize:'', blockPrice:'', tiers:[{min:'0',max:'',price:''}] })
  const [resources, setResources] = useState([empty()])
  const upd = (i,k,v) => setResources(r=>r.map((x,j)=>j===i?{...x,[k]:v}:x))
  const updTier = (ri,ti,k,v) => setResources(r=>r.map((x,j)=>j===ri?{...x,tiers:x.tiers.map((t,ki)=>ki===ti?{...t,[k]:v}:t)}:x))
  const addTier = ri => setResources(r=>r.map((x,j)=>j===ri?{...x,tiers:[...x.tiers,{min:'',max:'',price:''}]}:x))
  const canDone = resources.some(r=>r.resource)

  return (
    <div>
      <Note>Always billed monthly, in arrears. Customers are charged after the billing period ends based on what they used.</Note>
      {resources.map((res, i) => (
        <Fade key={i}>
          <div style={{ border:`1px solid ${G200}`, borderRadius:6, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:G500, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.04em' }}>Resource {i+1}</div>
            <div style={{ marginBottom:12 }}>
              <Label>Metered resource</Label>
              <Select value={res.resource} onChange={e=>upd(i,'resource',e.target.value)} style={{ marginBottom:6 }}>
                <option value="">Select...</option>
                {['Compute', 'Storage', 'Network', 'Requests / events', 'Scout specific', 'Custom'].map(cat => {
                  const items = allMetered.filter(m => m.category === cat)
                  if (items.length === 0) return null
                  return (
                    <optgroup key={cat} label={cat}>
                      {items.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                    </optgroup>
                  )
                })}
              </Select>
              <InlineCreate label="New metered resource" fields={[{key:'name',placeholder:'Resource name'}]} onAdd={f=>onCreateMetered(f.name)}/>
            </div>
            {res.resource && (
              <>
                <SectionQ>Pricing model</SectionQ>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                  {[['perunit','Per unit'],['block','Block'],['graduated','Graduated'],['volume','Volume']].map(([id,lbl])=>(
                    <Pill key={id} active={res.model===id} onClick={()=>upd(i,'model',id)}>{lbl}</Pill>
                  ))}
                </div>
                {res.model==='perunit' && <Fade key="pu"><Label hint="per unit">Price ($)</Label><Input type="number" placeholder="0.001" value={res.price} onChange={e=>upd(i,'price',e.target.value)} style={{ width:160 }}/></Fade>}
                {res.model==='block' && (
                  <Fade key="bl">
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div><Label>Block size (units)</Label><Input type="number" placeholder="100" value={res.blockSize} onChange={e=>upd(i,'blockSize',e.target.value)}/></div>
                      <div><Label hint="per block">Price ($)</Label><Input type="number" placeholder="1.00" value={res.blockPrice} onChange={e=>upd(i,'blockPrice',e.target.value)}/></div>
                    </div>
                    <Explainer>Each block of {res.blockSize||'N'} units costs ${res.blockPrice||'X'}, regardless of how many within the block are used.</Explainer>
                  </Fade>
                )}
                {(res.model==='graduated'||res.model==='volume') && (
                  <Fade key="tiers">
                    {res.model==='graduated' && <Explainer>Each unit is charged at the rate of the tier it falls in.</Explainer>}
                    {res.model==='volume' && <Explainer>All units are charged at the rate of the highest tier reached.</Explainer>}
                    <div style={{ marginTop:10 }}>
                      {res.tiers.map((tier,ti)=>(
                        <div key={ti} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
                          <div><Label>From</Label><Input type="number" value={tier.min} onChange={e=>updTier(i,ti,'min',e.target.value)}/></div>
                          <div><Label>To</Label><Input type="number" placeholder="∞" value={tier.max} onChange={e=>updTier(i,ti,'max',e.target.value)}/></div>
                          <div><Label>$ / unit</Label><Input type="number" placeholder="0.001" value={tier.price} onChange={e=>updTier(i,ti,'price',e.target.value)}/></div>
                        </div>
                      ))}
                      <BtnGhost onClick={()=>addTier(i)}>Add tier</BtnGhost>
                    </div>
                  </Fade>
                )}
              </>
            )}
          </div>
        </Fade>
      ))}
      <BtnGhost onClick={()=>setResources(r=>[...r,empty()])} style={{ marginBottom:20 }}>Add another metered resource</BtnGhost>
      {canDone && (
        <Fade key="done">
          <Divider mt={8} mb={0}/>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:20 }}>
            <BtnPrimary onClick={()=>onDone({ type:'payg', resources: resources.filter(r=>r.resource) })}>Add component</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

function PrepaidForm({ onDone, allMetered, onCreateMetered }) {
  const [c, setC] = useState({ resource:'', packs:[{qty:'',price:''}], expires:null, expiryMonths:'', stackable:null })
  const upd = (k,v) => setC(p=>({...p,[k]:v}))
  const updPack = (i,k,v) => setC(p=>({...p,packs:p.packs.map((x,j)=>j===i?{...x,[k]:v}:x)}))
  const canDone = c.resource && c.packs.every(p=>p.qty&&p.price) && c.expires!==null && c.stackable!==null

  return (
    <div>
      <Note>One-time purchase, paid in advance. Not recurring. Credits are drawn down as the customer uses the resource.</Note>
      <Fade>
        <Label>Metered resource</Label>
        <Select value={c.resource} onChange={e=>upd('resource',e.target.value)} style={{ marginBottom:8 }}>
          <option value="">Select...</option>
          {['Compute', 'Storage', 'Network', 'Requests / events', 'Scout specific', 'Custom'].map(cat => {
            const items = allMetered.filter(m => m.category === cat)
            if (items.length === 0) return null
            return (
              <optgroup key={cat} label={cat}>
                {items.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
              </optgroup>
            )
          })}
        </Select>
        <InlineCreate label="New metered resource" fields={[{key:'name',placeholder:'Resource name'}]} onAdd={f=>onCreateMetered(f.name)}/>
      </Fade>

      {c.resource && (
        <>
          <Fade key="packs">
            <Divider />
            <SectionQ>Pack sizes</SectionQ>
            {c.packs.map((pack,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10, marginBottom:10, alignItems:'flex-end' }}>
                <div><Label hint={c.resource}>Quantity</Label><Input type="number" placeholder="500" value={pack.qty} onChange={e=>updPack(i,'qty',e.target.value)}/></div>
                <div><Label hint="$">Price</Label><Input type="number" placeholder="5.00" value={pack.price} onChange={e=>updPack(i,'price',e.target.value)}/></div>
                {c.packs.length>1 && <button onClick={()=>setC(p=>({...p,packs:p.packs.filter((_,j)=>j!==i)}))} style={{ background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontSize:16,paddingBottom:2 }}>×</button>}
              </div>
            ))}
            <BtnGhost onClick={()=>setC(p=>({...p,packs:[...p.packs,{qty:'',price:''}]}))}>Add another pack size</BtnGhost>
          </Fade>
          <Fade key="exp">
            <Divider />
            <SectionQ>Do these credits expire?</SectionQ>
            <div style={{ display:'flex', gap:8, marginBottom:c.expires?12:0 }}>
              <Pill active={c.expires===true} onClick={()=>upd('expires',true)}>Yes, they expire</Pill>
              <Pill active={c.expires===false} onClick={()=>upd('expires',false)}>No expiry</Pill>
            </div>
            {c.expires && (
              <Fade key="expmonths">
                <div style={{ marginTop:12 }}>
                  <Label hint="months from purchase date">Expiry duration</Label>
                  <Input type="number" placeholder="12" value={c.expiryMonths} onChange={e=>upd('expiryMonths',e.target.value)} style={{ width:120 }}/>
                </div>
              </Fade>
            )}
          </Fade>
          {c.expires!==null && (
            <Fade key="stack">
              <Divider />
              <SectionQ>Can customers stack balances?</SectionQ>
              <div style={{ display:'flex', gap:8 }}>
                <Pill active={c.stackable===true} onClick={()=>upd('stackable',true)}>Yes — balances stack</Pill>
                <Pill active={c.stackable===false} onClick={()=>upd('stackable',false)}>No — new pack replaces balance</Pill>
              </div>
              <Explainer>{c.stackable===true ? 'A customer with 300 minutes left who buys a 500-minute pack will have 800 total.' : c.stackable===false ? 'Purchasing a new pack replaces any remaining balance.' : 'Choose stackable behavior.'}</Explainer>
            </Fade>
          )}
        </>
      )}

      {canDone && (
        <Fade key="done">
          <Divider mt={28} mb={0}/>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:20 }}>
            <BtnPrimary onClick={()=>onDone({ type:'prepaid', ...c })}>Add component</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

function OneTimeForm({ onDone }) {
  const [c, setC] = useState({ timing:null, price:'' })
  const upd = (k,v) => setC(p=>({...p,[k]:v}))
  const canDone = c.timing && c.price
  return (
    <div>
      <Fade>
        <SectionQ>Payment timing</SectionQ>
        <div style={{ display:'flex', gap:8, marginBottom:6 }}>
          <Pill active={c.timing==='advance'} onClick={()=>upd('timing','advance')}>In advance</Pill>
          <Pill active={c.timing==='arrears'} onClick={()=>upd('timing','arrears')}>In arrears</Pill>
        </div>
        <Explainer>{c.timing==='advance' ? 'Customer pays before receiving access.' : c.timing==='arrears' ? 'Customer pays after the service is delivered.' : 'In advance = pay before access. In arrears = pay after delivery.'}</Explainer>
      </Fade>
      {c.timing && (
        <Fade key="price">
          <Divider />
          <Label hint="one-time, USD">Amount ($)</Label>
          <Input type="number" placeholder="0.00" value={c.price} onChange={e=>upd('price',e.target.value)} style={{ width:160 }}/>
        </Fade>
      )}
      {canDone && (
        <Fade key="done">
          <Divider mt={28} mb={0}/>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:20 }}>
            <BtnPrimary onClick={()=>onDone({ type:'onetime', ...c })}>Add component</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

function MFCForm({ onDone }) {
  const activeOfferings = OFFERINGS.filter(o => o.status === 'active')
  const [offerings, setOfferings] = useState([])
  const [discounts, setDiscounts] = useState({})
  const toggle = o => setOfferings(p=>p.includes(o)?p.filter(x=>x!==o):[...p,o])
  const canDone = offerings.length > 0
  return (
    <div>
      <Note>MFC is a commercial wrapper — it doesn't redefine how offerings are priced. The commitment amount is negotiated per customer and is not set here.</Note>
      <Fade>
        <SectionQ>Which offerings are in scope?</SectionQ>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:6 }}>
          {activeOfferings.map(o=><Pill key={o.id} active={offerings.includes(o.id)} onClick={()=>toggle(o.id)}>{o.name}</Pill>)}
        </div>
        <Explainer>The customer can use any of these offerings to burn down their committed spend.</Explainer>
      </Fade>
      {offerings.length > 0 && (
        <Fade key="discounts">
          <Divider />
          <SectionQ>Discounts off list price <span style={{ textTransform:'none', fontWeight:400, letterSpacing:'normal' }}>(optional)</span></SectionQ>
          <div style={{ marginBottom:6 }}>
            {offerings.map(oid=>{
              const o = activeOfferings.find(x=>x.id===oid)
              if (!o) return null
              return (
                <div key={o.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                  <span style={{ fontSize:13, color:G700, minWidth:200 }}>{o.name}</span>
                  <Input type="number" min="0" max="100" placeholder="0" value={discounts[o.id]||''} onChange={e=>setDiscounts(p=>({...p,[o.id]:e.target.value}))} style={{ width:70 }}/>
                  <span style={{ fontSize:12, color:G500 }}>% off</span>
                </div>
              )
            })}
          </div>
          <Explainer>Leave blank for standard rates. All other pricing terms — including overage behavior — follow each offering's own configuration.</Explainer>
        </Fade>
      )}
      {canDone && (
        <Fade key="done">
          <Divider mt={28} mb={0}/>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:20 }}>
            <BtnPrimary onClick={()=>onDone({ type:'mfc', offerings, discounts })}>Add component</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

// ─── Trial Form ─────────────────────────────────────────────────────────────
function TrialForm({ onDone }) {
  const [type, setType] = useState(null)
  const [c, setC] = useState({})
  const upd = (k,v) => setC(p=>({...p,[k]:v}))
  const TYPES = [
    { id:'timed', label:'Free trial (time-based)', desc:'Full access for N days, then normal billing or a free tier.' },
    { id:'reverse', label:'Reverse trial (auto-downgrade)', desc:'Start with premium access, auto-downgrade to a lower tier at the end.' },
    { id:'cap', label:'Monetary cap trial', desc:'Free until a dollar amount of usage is consumed.' },
  ]
  const canDone = type==='timed'?(c.days&&c.after):type==='reverse'?(c.days&&c.downgradeTo):type==='cap'?(c.cap&&c.after):false
  const activeOfferings = OFFERINGS.filter(o => o.status === 'active')

  return (
    <div>
      <Fade>
        <SectionQ>Trial type</SectionQ>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
          {TYPES.map(t=><SelCard key={t.id} title={t.label} desc={t.desc} selected={type===t.id} onClick={()=>{setType(t.id);setC({})}}/>)}
        </div>
      </Fade>

      {type==='timed' && (
        <Fade key="timed">
          <Divider />
          <div style={{ marginBottom:14 }}><Label hint="days">Trial duration</Label><Input type="number" placeholder="14" value={c.days||''} onChange={e=>upd('days',e.target.value)} style={{ width:120 }}/></div>
          <SectionQ>When the trial ends</SectionQ>
          <div style={{ display:'flex', gap:8 }}>
            <Pill active={c.after==='bill'} onClick={()=>upd('after','bill')}>Start billing</Pill>
            <Pill active={c.after==='downgrade'} onClick={()=>upd('after','downgrade')}>Downgrade to free tier</Pill>
          </div>
        </Fade>
      )}
      {type==='reverse' && (
        <Fade key="reverse">
          <Divider />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:6 }}>
            <div><Label hint="days">Trial duration</Label><Input type="number" placeholder="30" value={c.days||''} onChange={e=>upd('days',e.target.value)}/></div>
            <div>
              <Label>Downgrade to</Label>
              <Select value={c.downgradeTo||''} onChange={e=>upd('downgradeTo',e.target.value)}>
                <option value="">Select offering...</option>
                {activeOfferings.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </div>
          </div>
          <Explainer>Customers start at the top and auto-downgrade rather than losing access entirely — tends to convert better than a hard cutoff.</Explainer>
        </Fade>
      )}
      {type==='cap' && (
        <Fade key="cap">
          <Divider />
          <div style={{ marginBottom:14 }}><Label hint="$">Usage cap</Label><Input type="number" placeholder="50" value={c.cap||''} onChange={e=>upd('cap',e.target.value)} style={{ width:140 }}/></div>
          <SectionQ>When the cap is hit</SectionQ>
          <div style={{ display:'flex', gap:8 }}>
            <Pill active={c.after==='bill'} onClick={()=>upd('after','bill')}>Start billing</Pill>
            <Pill active={c.after==='suspend'} onClick={()=>upd('after','suspend')}>Suspend service</Pill>
          </div>
        </Fade>
      )}
      {canDone && (
        <Fade key="done">
          <Divider mt={28} mb={0}/>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:20 }}>
            <BtnPrimary onClick={()=>onDone({ type, ...c })}>Add trial</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

// ─── Completed Card ─────────────────────────────────────────────────────────
function CompletedCard({ comp, onEdit, onRemove }) {
  const labels = { subscription:'Subscription', payg:'Pay-as-you-go', prepaid:'Prepaid w/ Top-Ups', onetime:'One-time Payment', mfc:'Min. Fee Commitment' }
  const meta = {
    subscription: () => `${comp.whatGet==='access'?'Flat fee':`Per ${comp.feature||'unit'}`} · ${comp.cycle||''} · $${comp.price||comp.priceAnnual||'?'}`,
    payg: () => comp.resources?.filter(r=>r.resource).map(r=>r.resource).join(', ') || '—',
    prepaid: () => `${comp.resource} · ${comp.packs?.length} pack${comp.packs?.length===1?'':'s'}${comp.expires?` · ${comp.expiryMonths}mo expiry`:''}`,
    onetime: () => `$${comp.price} · ${comp.timing==='advance'?'in advance':'in arrears'}`,
    mfc: () => {
      const activeOfferings = OFFERINGS.filter(o => o.status === 'active')
      return comp.offerings?.map(id => activeOfferings.find(o=>o.id===id)?.name).filter(Boolean).join(', ') || '—'
    },
  }[comp.type]?.() || ''

  return (
    <div style={{ border:`1px solid ${G200}`, borderRadius:6, padding:'10px 14px', background:G50, marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:22, height:22, borderRadius:'50%', background:BL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg viewBox="0 0 13 13" width="10" height="10"><polyline points="1.5,6.5 5,10 11.5,3" fill="none" stroke={B} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:G900 }}>{labels[comp.type]}</div>
        <div style={{ fontSize:11, color:G400, fontFamily:'monospace', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{meta}</div>
      </div>
      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
        <button onClick={onEdit} style={{ background:'none', border:`1px solid ${G200}`, borderRadius:3, fontSize:11, color:G500, cursor:'pointer', padding:'3px 8px', fontFamily:'inherit' }}>Edit</button>
        <button onClick={onRemove} style={{ background:'none', border:'none', fontSize:16, color:G300, cursor:'pointer', padding:'0 4px', lineHeight:1, fontFamily:'inherit' }}>×</button>
      </div>
    </div>
  )
}

// ─── Summary Panel ──────────────────────────────────────────────────────────
function SummaryPanel({ isFree, components, trial }) {
  const Check = () => <span style={{ color:GREEN, marginRight:8 }}>✓</span>
  const activeOfferings = OFFERINGS.filter(o => o.status === 'active')

  if (isFree===null) return (
    <div style={{ textAlign:'center', padding:'60px 16px' }}>
      <div style={{ fontSize:28, marginBottom:12, opacity:0.3 }}>◻</div>
      <div style={{ fontSize:13, color:G400, lineHeight:1.8 }}>Build your pricing on the left.<br/>The customer view will appear here.</div>
    </div>
  )

  if (isFree) return (
    <div style={{ border:`1px solid ${G200}`, borderRadius:8, padding:24 }}>
      <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>YOUR OFFERING</div>
      <div><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>$0</span><span style={{ fontSize:14, color:G500 }}> / month</span></div>
      <div style={{ fontSize:13, color:G500, marginTop:4, marginBottom:20 }}>Free — no purchase required</div>
      <Divider mt={0} mb={16}/>
      <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>WHAT'S INCLUDED</div>
      <div style={{ fontSize:13, color:G900, marginBottom:8 }}><Check/>Full access — no charge</div>
      <div style={{ fontSize:13, color:G900, marginBottom:20 }}><Check/>Available to all customers automatically</div>
      <button style={{ width:'100%', padding:10, background:G900, color:'#fff', border:'none', borderRadius:4, fontSize:13, fontWeight:500, cursor:'default', fontFamily:'inherit' }}>Get started — free</button>
    </div>
  )

  if (components.length===0) return (
    <div style={{ border:`1px dashed ${G300}`, borderRadius:8, padding:24, textAlign:'center' }}>
      <div style={{ fontSize:13, color:G400, lineHeight:1.8 }}>Choose a pricing strategy on the left<br/>to see the customer view here.</div>
    </div>
  )

  const renderComponent = (comp, i, total) => {
    const isFirst = i===0
    const isAddon = !isFirst
    const sep = isAddon ? { borderTop:`1px solid ${G200}`, marginTop:20, paddingTop:20 } : {}
    const typeLabel = { subscription:'Subscription', payg:'Pay as you go', prepaid:'Prepaid', onetime:'One-time', mfc:'Min. Fee Commitment' }[comp.type]

    let priceDisplay = null
    let includes = []
    let cta = 'Buy now'

    if (comp.type==='subscription') {
      cta = 'Subscribe'
      const hasBoth = comp.cycle==='both' && comp.price && comp.priceAnnual
      const monthly = comp.cycle!=='annual'
      const annual = comp.cycle!=='monthly'

      if (hasBoth) {
        // Show both prices with savings
        const savings = Math.round((1-(comp.priceAnnual/12)/comp.price)*100)
        priceDisplay = (
          <div>
            <div>
              <span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.price}</span>
              <span style={{ fontSize:13, color:G500 }}>/{comp.featureType==='mutable'?`${comp.unitLabel}/`:''}mo</span>
            </div>
            <div style={{ fontSize:14, color:G500, marginTop:6 }}>
              or ${comp.priceAnnual}/{comp.featureType==='mutable'?`${comp.unitLabel}/`:''}yr
              {savings > 0 && <span style={{ color:GREEN, marginLeft:8 }}>· save {savings}%</span>}
            </div>
          </div>
        )
      } else if (monthly && comp.price) {
        priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.price}</span><span style={{ fontSize:13, color:G500 }}>/{comp.featureType==='mutable'?`${comp.unitLabel}/`:''}mo</span></>
      } else if (annual && comp.priceAnnual) {
        priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.priceAnnual}</span><span style={{ fontSize:13, color:G500 }}>/yr</span></>
      }
      if (comp.whatGet==='access') includes.push('Full product access')
      if (comp.whatGet==='quantity' && comp.feature) {
        if (comp.featureType==='mutable') includes.push(`Priced per ${comp.unitLabel}`)
        if (comp.featureType==='metered' && comp.quantity) includes.push(`${comp.quantity} ${comp.feature} included / period`)
      }
      if (comp.timing==='advance') includes.push('Billed at the start of each period')
      if (comp.timing==='arrears') includes.push('Billed at the end of each period')
      if (comp.overage==='hardstop') includes.push(`Usage stops when ${comp.feature} runs out`)
      if (comp.overage==='payg') includes.push(`Overage: $${comp.overageRate} / extra unit`)
      if (comp.rollover) includes.push(`Rollover: up to ${comp.rollCap}${comp.rollCapType==='multiplier'?'× monthly allocation':` ${comp.feature}`}`)
    }

    if (comp.type==='payg') {
      cta = 'Enable'
      priceDisplay = <span style={{ fontSize:16, fontWeight:600, color:G700 }}>Usage-based</span>
      comp.resources?.forEach(r => {
        if (!r.resource) return
        let p = ''
        if (r.model==='perunit') p = `$${r.price} per unit`
        else if (r.model==='block') p = `$${r.blockPrice} per ${r.blockSize} units`
        else if (r.model==='graduated') p = `Graduated — ${r.tiers.length} tiers`
        else p = `Volume — ${r.tiers.length} tiers`
        includes.push(`${r.resource}: ${p}`)
      })
      includes.push('Billed monthly · In arrears')
    }

    if (comp.type==='prepaid') {
      priceDisplay = <span style={{ fontSize:16, fontWeight:600, color:G700 }}>Prepaid packs</span>
      comp.packs?.filter(p=>p.qty&&p.price).forEach(p => includes.push(`${p.qty} ${comp.resource} — $${p.price}`))
      if (comp.expires) includes.push(`Credits expire after ${comp.expiryMonths} months`)
      if (comp.stackable===true) includes.push('Balances stack across purchases')
      if (comp.stackable===false) includes.push('New purchase replaces remaining balance')
    }

    if (comp.type==='onetime') {
      priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.price}</span><span style={{ fontSize:13, color:G500 }}> one-time</span></>
      includes.push(comp.timing==='advance' ? 'Charged before access is granted' : 'Charged after service delivery')
    }

    if (comp.type==='mfc') {
      cta = 'Contact sales'
      priceDisplay = <span style={{ fontSize:14, fontWeight:500, color:G700 }}>Negotiated commitment</span>
      const offeringNames = comp.offerings?.map(id => activeOfferings.find(o=>o.id===id)?.name).filter(Boolean) || []
      includes.push(`Eligible offerings: ${offeringNames.join(', ')}`)
      const disc = Object.entries(comp.discounts||{}).filter(([,v])=>v)
      if (disc.length) disc.forEach(([k,v])=>{
        const offering = activeOfferings.find(o=>o.id===k)
        if (offering) includes.push(`${offering.name}: ${v}% off list price`)
      })
      else includes.push('Standard rates apply')
      includes.push('Commitment amount agreed per customer')
    }

    return (
      <div key={i} style={sep}>
        {isAddon && <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>ADD-ON: {typeLabel}</div>}
        {priceDisplay && <div style={{ marginBottom:isFirst?16:12 }}>{priceDisplay}</div>}
        {isFirst && includes.length>0 && <><Divider mt={0} mb={14}/><div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>WHAT'S INCLUDED</div></>}
        {isAddon && includes.length>0 && <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:10, marginBottom:10 }}>WHAT'S INCLUDED</div>}
        {includes.map((l,j)=><div key={j} style={{ fontSize:13, color:G900, marginBottom:8 }}><Check/>{l}</div>)}
      </div>
    )
  }

  return (
    <div style={{ border:`1px solid ${G200}`, borderRadius:8, padding:32, maxWidth:720 }}>
      <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>
        {components.length === 1 ? 'YOUR OFFERING' : 'YOUR OFFERING + ADD-ONS'}
      </div>
      {components.map((comp, i) => renderComponent(comp, i, components.length))}
      {trial && (
        <>
          <Divider mt={16} mb={14}/>
          <div style={{ padding:'10px 12px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:4, fontSize:12, color:'#166534', lineHeight:1.6 }}>
            {trial.type==='timed' && `✓ ${trial.days}-day free trial — then ${trial.after==='bill'?'normal billing':'downgrade to free tier'}`}
            {trial.type==='reverse' && `✓ ${trial.days}-day premium trial — auto-downgrades to ${activeOfferings.find(o=>o.id===trial.downgradeTo)?.name || trial.downgradeTo}`}
            {trial.type==='cap' && `✓ Free up to $${trial.cap} of usage — then ${trial.after==='bill'?'normal billing':'service suspended'}`}
          </div>
        </>
      )}
      <Divider mt={16} mb={16}/>
      <button style={{ width:'100%', padding:10, background:B, color:'#fff', border:'none', borderRadius:4, fontSize:13, fontWeight:500, cursor:'default', fontFamily:'inherit' }}>
        {components[0]?.type==='subscription'?'Subscribe':components[0]?.type==='payg'?'Enable':components[0]?.type==='mfc'?'Contact sales':'Buy now'}
      </button>
    </div>
  )
}

// ─── Export ─────────────────────────────────────────────────────────────────
function doExport(config) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'pricing-config.json'; a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export default function PricingPlayground() {
  const [isFree, setIsFree] = useState(null)
  const [components, setComponents] = useState([])
  const [activeType, setActiveType] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [trial, setTrial] = useState(null)
  const [showTrial, setShowTrial] = useState(false)
  const [sessionMetered, setSessionMetered] = useState([])
  const [sessionMutable, setSessionMutable] = useState([])
  const [editIndex, setEditIndex] = useState(null)

  // Dummy metered resources organized by category
  const baseMeteredResources = [
    // Compute
    { name: 'Build — Small (2 vCPU / 4 GB)', id: 'build-small', category: 'Compute' },
    { name: 'Build — Medium (4 vCPU / 8 GB)', id: 'build-medium', category: 'Compute' },
    { name: 'Build — Large (8 vCPU / 16 GB)', id: 'build-large', category: 'Compute' },
    { name: 'Build — XLarge (16 vCPU / 32 GB)', id: 'build-xlarge', category: 'Compute' },
    { name: 'Sandbox — Small (2 vCPU / 4 GB)', id: 'sandbox-small', category: 'Compute' },
    { name: 'Sandbox — Medium (4 vCPU / 8 GB)', id: 'sandbox-medium', category: 'Compute' },
    { name: 'Sandbox — Large (8 vCPU / 16 GB)', id: 'sandbox-large', category: 'Compute' },
    // Storage
    { name: 'Cache storage (GB-hrs)', id: 'cache-storage', category: 'Storage' },
    { name: 'Registry storage (GB)', id: 'registry-storage', category: 'Storage' },
    { name: 'Volume storage (GB-hrs)', id: 'volume-storage', category: 'Storage' },
    // Network
    { name: 'Data egress (GB)', id: 'data-egress', category: 'Network' },
    { name: 'Data ingress (GB)', id: 'data-ingress', category: 'Network' },
    // Requests / events
    { name: 'API requests', id: 'api-requests', category: 'Requests / events' },
    { name: 'Build executions', id: 'build-executions', category: 'Requests / events' },
    { name: 'Vulnerability scan events', id: 'vuln-scans', category: 'Requests / events' },
    { name: 'Webhook deliveries', id: 'webhooks', category: 'Requests / events' },
    { name: 'AI tokens (Gordon)', id: 'ai-tokens', category: 'Requests / events' },
    // Scout specific
    { name: 'Scout repositories scanned', id: 'scout-repos', category: 'Scout specific' },
    { name: 'CVE alerts generated', id: 'cve-alerts', category: 'Scout specific' },
  ]

  // Mutable features organized by category
  const baseMutableFeatures = [
    // General
    { name: 'Seats', slug: 'seats', unit: 'seat', plural: 'seats', category: 'General' },
    // Hub / registry
    { name: 'Private repositories', slug: 'private-repos', unit: 'repo', plural: 'repos', category: 'Hub / registry' },
    { name: 'Verified publisher namespaces', slug: 'verified-namespaces', unit: 'namespace', plural: 'namespaces', category: 'Hub / registry' },
    // Hardened Images
    { name: 'Hardened image repositories', slug: 'hardened-repos', unit: 'repo', plural: 'repos', category: 'Hardened Images' },
    // Scout
    { name: 'Scout-enabled repositories', slug: 'scout-repos', unit: 'repo', plural: 'repos', category: 'Scout' },
    { name: 'Scout policies', slug: 'scout-policies', unit: 'policy', plural: 'policies', category: 'Scout' },
    // Build Cloud
    { name: 'Concurrent builds', slug: 'concurrent-builds', unit: 'build', plural: 'builds', category: 'Build Cloud' },
    // Offload
    { name: 'Offload licenses', slug: 'offload-licenses', unit: 'license', plural: 'licenses', category: 'Offload' },
  ]

  const allMetered = [
    ...baseMeteredResources,
    ...sessionMetered.map(name => ({ name, id: `session-${name}`, category: 'Custom' }))
  ]

  const allMutable = [
    ...baseMutableFeatures,
    ...sessionMutable.map(m => ({ ...m, category: m.category || 'Custom (mutable)' }))
  ]

  const STRATEGIES = [
    { id:'subscription', label:'Subscription', desc:'Recurring charge on a regular billing cycle' },
    { id:'payg', label:'Pay-as-you-go', desc:'Charged based on actual usage, billed monthly in arrears' },
    { id:'prepaid', label:'Prepaid w/ Top-Ups', desc:'Customer buys a balance of usage upfront and draws it down' },
    { id:'onetime', label:'One-time Payment', desc:'Single charge, no recurrence' },
    { id:'mfc', label:'Minimum Fee Commitment', desc:'Negotiated minimum spend in exchange for discounts' },
  ]

  const handleFree = (free) => {
    setIsFree(free)
    if (!free) { setShowPicker(true); setActiveType(null) }
  }

  const handleStratDone = (config) => {
    if (editIndex!==null) {
      setComponents(p=>p.map((c,i)=>i===editIndex?config:c))
      setEditIndex(null)
    } else {
      setComponents(p=>[...p,config])
    }
    setActiveType(null); setShowPicker(false)
  }

  const handleEdit = (i) => {
    setEditIndex(i); setActiveType(components[i].type)
    setComponents(p=>p.filter((_,j)=>j!==i))
    setShowPicker(false)
  }

  const isDone = isFree || (components.length>0 && !activeType && !showPicker)
  const stratForms = {
    subscription: <SubscriptionForm onDone={handleStratDone} allMetered={allMetered} allMutable={allMutable} onCreateMetered={n=>setSessionMetered(p=>[...p,n])} onCreateMutable={f=>setSessionMutable(p=>[...p,f])}/>,
    payg: <PAYGForm onDone={handleStratDone} allMetered={allMetered} onCreateMetered={n=>setSessionMetered(p=>[...p,n])}/>,
    prepaid: <PrepaidForm onDone={handleStratDone} allMetered={allMetered} onCreateMetered={n=>setSessionMetered(p=>[...p,n])}/>,
    onetime: <OneTimeForm onDone={handleStratDone}/>,
    mfc: <MFCForm onDone={handleStratDone}/>,
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", background:'#fff', fontSize:13, width:'100%' }}>
      {/* ── Left panel ── */}
      <div style={{ flex:1, borderRight:`1px solid ${G200}`, padding:'44px 40px 160px', overflowY:'auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize:12, color:G400, marginBottom:24 }}>
          <Link to="/" style={{ color:G400, textDecoration:'none' }}>Catalog</Link>
          <span style={{ color:G300, margin:'0 6px' }}>/</span>
          <span style={{ color:G900, fontWeight:500 }}>New offering</span>
        </div>
        <h1 style={{ fontSize:20, fontWeight:600, color:G900, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Pricing strategy</h1>
        <div style={{ fontSize:13, color:G500, marginBottom:32 }}>Configure how customers will be charged for this offering.</div>

        {/* Step 1 */}
        <Fade>
          <SectionQ>Is this offering free or paid?</SectionQ>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <SelCard title="Free" desc="No purchase required. Customers access automatically." selected={isFree===true} onClick={()=>handleFree(true)}/>
            <SelCard title="Paid" desc="Customers must purchase before accessing." selected={isFree===false} onClick={()=>handleFree(false)}/>
          </div>
        </Fade>

        {/* Completed components */}
        {components.length>0 && (
          <Fade key={`c${components.length}`}>
            <Divider />
            {components.map((comp,i)=>(
              <CompletedCard key={i} comp={comp} onEdit={()=>handleEdit(i)} onRemove={()=>setComponents(p=>p.filter((_,j)=>j!==i))}/>
            ))}
          </Fade>
        )}

        {/* Strategy picker */}
        {showPicker && (
          <Fade key="picker">
            <Divider />
            <SectionQ>{components.length === 0 ? 'Choose a pricing strategy' : 'Choose add-on pricing strategy'}</SectionQ>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {STRATEGIES.map(s=>(
                <SelCard key={s.id} title={s.label} desc={s.desc} selected={activeType===s.id} onClick={()=>{ setActiveType(s.id); setShowPicker(false) }}/>
              ))}
            </div>
          </Fade>
        )}

        {/* Active form */}
        {activeType && (
          <Fade key={`f-${activeType}-${editIndex}`}>
            <Divider />
            <div style={{ fontSize:14, fontWeight:600, color:G900, marginBottom:16 }}>
              {STRATEGIES.find(s=>s.id===activeType)?.label}
            </div>
            {stratForms[activeType]}
          </Fade>
        )}

        {/* Post-strategy actions */}
        {isDone && !isFree && !showPicker && !activeType && (
          <Fade key="post">
            <Divider />
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              <BtnGhost onClick={()=>{ setShowPicker(true); setShowTrial(false) }}>Add an add-on</BtnGhost>
              {!trial && !showTrial && (
                <BtnGhost onClick={()=>setShowTrial(true)} style={{ borderColor:G200, color:G500 }}>Add free trial</BtnGhost>
              )}
            </div>
            {showTrial && !trial && (
              <Fade key="trial">
                <div style={{ fontSize:14, fontWeight:600, color:G900, marginBottom:16 }}>Free trial <span style={{ fontSize:12, fontWeight:400, color:G400 }}>(overlay)</span></div>
                <TrialForm onDone={t=>{ setTrial(t); setShowTrial(false) }}/>
              </Fade>
            )}
            {trial && (
              <Fade key="trial-done">
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:4, marginBottom:16 }}>
                  <span style={{ fontSize:12, color:'#166534' }}>✓ Trial configured</span>
                  <button onClick={()=>setTrial(null)} style={{ marginLeft:'auto', background:'none', border:'none', fontSize:11, color:'#166534', cursor:'pointer', textDecoration:'underline', fontFamily:'inherit' }}>Remove</button>
                </div>
              </Fade>
            )}
            <Divider mt={20} mb={0}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:20 }}>
              <div style={{ fontSize:12, color:G500 }}>Export configuration as JSON</div>
              <button onClick={()=>doExport({ isFree, components, trial })} style={{ background:G900, color:'#fff', border:'none', borderRadius:4, padding:'8px 14px', fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
                <svg viewBox="0 0 15 15" width="11" height="11"><path d="M7.5 1v9m-3-3 3 3 3-3M2 11v3h11v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export config
              </button>
            </div>
          </Fade>
        )}

        {isFree && (
          <Fade key="free-export">
            <Divider />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:G500 }}>Export configuration as JSON</div>
              <button onClick={()=>doExport({ isFree, components:[], trial:null })} style={{ background:G900, color:'#fff', border:'none', borderRadius:4, padding:'8px 14px', fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
                <svg viewBox="0 0 15 15" width="11" height="11"><path d="M7.5 1v9m-3-3 3 3 3-3M2 11v3h11v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export config
              </button>
            </div>
          </Fade>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex:1, padding:'44px 60px', position:'sticky', top:0, maxHeight:'100vh', overflowY:'auto', background:G50 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>CUSTOMER VIEW</div>
          <div style={{ fontSize:12, color:G400, lineHeight:1.6 }}>This is how customers will see and understand this offering. The right panel is the deliverable.</div>
        </div>
        <SummaryPanel isFree={isFree} components={components} trial={trial}/>
      </div>
    </div>
  )
}
