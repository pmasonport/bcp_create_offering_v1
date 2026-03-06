import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { METERS } from '../data/meters'
import { OFFERINGS } from '../data/offerings'
import { getMutableAndMeteredFeatures } from '../data/helpers'
import { transformComponentForExport } from '../utils/pricingTransform'
import { EXAMPLE_OFFERINGS } from '../data/exampleOfferings'

// ─── Design Tokens ─────────────────────────────────────────────────────────
const B = '#2560FF', BL = '#EEF2FF', BBG = '#F8FAFF'
const G50='#F9FAFB',G100='#F3F4F6',G200='#E5E7EB',G300='#D1D5DB'
const G400='#9CA3AF',G500='#6B7280',G700='#374151',G900='#111827'
const GREEN='#10B981'
const ORANGE='#F97316', ORANGE_BG='#FFF7ED', ORANGE_BORDER='#FDBA74'

// ─── Utilities ──────────────────────────────────────────────────────────────
// Helper to convert recurrence period to display text
const recurrencePeriodToText = (period) => {
  const map = {
    hourly: 'hour',
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    annual: 'year'
  }
  return map[period] || period
}

const recurrencePeriodToAdverb = (period) => {
  const map = {
    hourly: 'hourly',
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
    annual: 'yearly'
  }
  return map[period] || period
}

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
const Alert = ({ children, type = 'info' }) => {
  const styles = {
    warning: {
      background: ORANGE_BG,
      border: `1px solid ${ORANGE_BORDER}`,
      color: '#92400E'
    },
    info: {
      background: G50,
      border: `1px solid ${G100}`,
      color: G500
    }
  }
  const style = styles[type] || styles.info
  return (
    <div style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:6, fontSize:13, lineHeight:1.6, marginBottom:24, ...style }}>
      {type === 'warning' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )}
      <div>{children}</div>
    </div>
  )
}

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{ padding:'5px 12px', borderRadius:9999, fontSize:12, fontWeight:500, cursor:'pointer', border: active ? `1px solid ${B}` : `1px solid ${G200}`, background: active ? BL : '#fff', color: active ? B : G700, transition:'all 0.12s', outline:'none', fontFamily:'inherit' }}>
    {children}
  </button>
)

const SegmentedControl = ({ options, value, onChange }) => (
  <div style={{ display:'inline-flex', background:G100, borderRadius:6, padding:2, gap:2 }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          padding: '6px 16px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
          background: value === opt.value ? '#fff' : 'transparent',
          color: value === opt.value ? G900 : G500,
          transition: 'all 0.15s',
          fontFamily: 'inherit',
          boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
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

const ExampleCard = ({ example, onClick }) => {
  // Check if has trial or add-on components
  const hasTrial = example.state.trial !== null
  const hasMultipleComponents = example.state.components.length > 1
  const hasAddon = hasMultipleComponents && example.state.components.some(c => c.type !== example.state.components[0].type)

  return (
    <div
      onClick={onClick}
      style={{
        border:`1px solid ${G200}`,
        borderRadius:6,
        padding:'12px 14px',
        cursor:'pointer',
        background: '#fff',
        position: 'relative'
      }}
    >
      {/* Tags in top right */}
      <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6, flexDirection:'row-reverse' }}>
        {/* Main category tag */}
        <div style={{
          padding: '3px 8px',
          background: G100,
          border: `1px solid ${G300}`,
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 500,
          color: G700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {example.category}
        </div>

        {/* Free trial tag */}
        {hasTrial && (
          <div style={{
            padding: '3px 8px',
            background: G100,
            border: `1px solid ${G300}`,
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 500,
            color: G700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Free trial
          </div>
        )}

        {/* Add-on tag */}
        {hasAddon && (
          <div style={{
            padding: '3px 8px',
            background: G100,
            border: `1px solid ${G300}`,
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 500,
            color: G700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            + Add-on
          </div>
        )}
      </div>

      <div style={{ fontSize:13, fontWeight:500, color:G900, marginBottom:4, paddingRight: hasTrial || hasAddon ? 140 : 100 }}>
        {example.name}
      </div>

      <div style={{ fontSize:12, color:G500, lineHeight:1.5 }}>
        {example.description}
      </div>
    </div>
  )
}

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

// ─── Multi-select Dropdown ──────────────────────────────────────────────────
function MultiSelect({ items, selected, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id))
    } else {
      onChange([...selected, id])
    }
  }
  const remove = (id) => onChange(selected.filter(x => x !== id))

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: `1px solid ${G200}`,
          borderRadius: 4,
          fontSize: 13,
          color: selected.length > 0 ? G900 : G400,
          background: '#fff',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 36
        }}
      >
        <span>{selected.length > 0 ? `${selected.length} selected` : placeholder}</span>
        <svg viewBox="0 0 15 15" width="12" height="12" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M3.5 5.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {selected.map(id => {
            const item = items.find(i => i.id === id)
            if (!item) return null
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: BL, border: `1px solid ${B}`, borderRadius: 4, fontSize: 12, color: B }}>
                <span>{item.name}</span>
                <button onClick={() => remove(id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: B, fontSize: 14, lineHeight: 1, fontFamily: 'inherit' }}>×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            border: `1px solid ${G200}`,
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 20,
            maxHeight: 240,
            overflowY: 'auto'
          }}>
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: G900,
                  background: selected.includes(item.id) ? G50 : '#fff',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => { if (!selected.includes(item.id)) e.currentTarget.style.background = G50 }}
                onMouseLeave={e => { if (!selected.includes(item.id)) e.currentTarget.style.background = '#fff' }}
              >
                <div style={{
                  width: 16,
                  height: 16,
                  border: `1.5px solid ${selected.includes(item.id) ? B : G300}`,
                  borderRadius: 3,
                  background: selected.includes(item.id) ? B : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selected.includes(item.id) && (
                    <svg viewBox="0 0 13 13" width="10" height="10">
                      <polyline points="1.5,6.5 5,10 11.5,3" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Strategy Forms ─────────────────────────────────────────────────────────
function SubscriptionForm({ onDone, allMetered, allMutable, onCreateMetered, onCreateMutable, initialData }) {
  const [c, setC] = useState(initialData || {
    whatGet:null,
    feature:null,
    quantity:'',
    overage:null,
    overageRate:'',
    rollover:null,
    rollCapType:null,
    rollCap:'',
    timing:null,
    cycle:null,
    price:'',
    priceAnnual:'',
    // New fields for metered + quantity
    billingCycle:null,
    recurrenceMonthly:null,
    recurrenceAnnual:null,
    includedAmountMonthly:'',
    includedAmountAnnual:''
  })
  const upd = (k,v) => setC(p=>({...p,[k]:v}))

  const featureType = (f) => allMetered.find(m=>m.name===f) ? 'metered' : 'mutable'
  const unitLabel = (f) => allMutable.find(m=>m.name===f)?.unit || 'unit'

  // Validation for non-metered cases (access or mutable quantity)
  const priceReady = c.timing && c.cycle && (
    (c.cycle==='monthly'&&c.price) || (c.cycle==='annual'&&c.priceAnnual) || (c.cycle==='both'&&c.price&&c.priceAnnual)
  )

  // Validation for metered + quantity
  const meteredQuantityReady = c.billingCycle &&
    (c.billingCycle === 'monthly' ? (c.recurrenceMonthly && c.includedAmountMonthly && c.price) :
     c.billingCycle === 'annual' ? (c.recurrenceAnnual && c.includedAmountAnnual && c.priceAnnual) :
     (c.recurrenceMonthly && c.recurrenceAnnual && c.includedAmountMonthly && c.includedAmountAnnual && c.price && c.priceAnnual))
    && c.timing && c.overage
    && (c.overage === 'hardstop' || c.overageRate)
    && (c.rollover === false || (c.rollCapType && c.rollCap))

  const isMeteredQuantity = c.whatGet === 'quantity' && c.feature && featureType(c.feature) === 'metered'

  const canDone = c.whatGet === 'access' ? priceReady :
                  isMeteredQuantity ? meteredQuantityReady :
                  (c.feature && priceReady)

  return (
    <div>
      <Fade>
        <SectionQ>Can customers choose a quantity when purchasing?</SectionQ>
        <div style={{ fontSize:13, color:G500, marginBottom:16, lineHeight:1.5 }}>
          For example, a team plan sold per seat, buying 10 gives you 10 seats.
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <SelCard
            title="No — fixed offering"
            desc="One price, no quantity choice"
            selected={c.whatGet==='access'}
            onClick={()=>upd('whatGet','access')}
          />
          <SelCard
            title="Yes — quantity selector"
            desc="Price scales by quantity chosen"
            selected={c.whatGet==='quantity'}
            onClick={()=>upd('whatGet','quantity')}
          />
        </div>
        {c.whatGet==='access' && (
          <Fade key="access-note">
            <div style={{ marginTop:12, fontSize:12, color:G500, lineHeight:1.6 }}>
              → What's included (features, usage limits, etc.) will be configured in the Entitlements step
            </div>
          </Fade>
        )}
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
            <InlineCreate label="New feature" fields={[{key:'name',placeholder:'Feature name'},{key:'unit',placeholder:'Unit (seat)'},{key:'plural',placeholder:'Plural (seats)'}]} onAdd={f=>{onCreateMutable(f); upd('feature', f.name)}}/>
            <InlineCreate label="New metered resource" fields={[{key:'name',placeholder:'Resource name'}]} onAdd={f=>{onCreateMetered(f.name); upd('feature', f.name)}}/>
          </div>

          {c.feature && featureType(c.feature)==='metered' && (
            <Fade key="met-detail">
              <Divider mt={16} mb={16}/>

              {/* Step 1: Billing Cycle */}
              <SectionQ>Billing cycle</SectionQ>
              <SegmentedControl
                value={c.billingCycle}
                onChange={(v) => upd('billingCycle', v)}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'annual', label: 'Annual' },
                  { value: 'both', label: 'Both' }
                ]}
              />

              {/* Step 2-4: Configure Billing (Grouped by billing cycle) */}
              {c.billingCycle && (
                <Fade key="configure-billing">
                  <Divider mt={20} mb={20}/>

                  {/* Monthly Billing Configuration */}
                  {(c.billingCycle === 'monthly' || c.billingCycle === 'both') && (
                    <div style={{ marginBottom: c.billingCycle === 'both' ? 28 : 0 }}>
                      {c.billingCycle === 'both' && (
                        <div style={{ fontSize:13, fontWeight:600, color:G700, marginBottom:14 }}>
                          Monthly billing
                        </div>
                      )}

                      <SectionQ>How often does a customer's allowance refresh?</SectionQ>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['hourly', 'daily', 'weekly', 'monthly', 'annual'].map(period => (
                          <Pill
                            key={period}
                            active={c.recurrenceMonthly === period}
                            onClick={() => upd('recurrenceMonthly', period)}
                          >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </Pill>
                        ))}
                      </div>
                      {c.recurrenceMonthly && (
                        <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
                          {c.recurrenceMonthly === 'hourly' && '→ Allowance resets every hour'}
                          {c.recurrenceMonthly === 'daily' && '→ Allowance resets at midnight every day'}
                          {c.recurrenceMonthly === 'weekly' && '→ Allowance resets every week'}
                          {c.recurrenceMonthly === 'monthly' && '→ Allowance resets on the same day each month'}
                          {c.recurrenceMonthly === 'annual' && '→ Allowance resets once per year'}
                        </div>
                      )}

                      {c.recurrenceMonthly && (
                        <Fade key="monthly-amount">
                          <div style={{ marginTop: 16, marginBottom: 14 }}>
                            <Label hint={`${c.feature} per purchase / ${recurrencePeriodToText(c.recurrenceMonthly)}`}>
                              {c.billingCycle === 'both' ? 'Included amount' : 'How much does one purchase include?'}
                            </Label>
                            <Input
                              type="number"
                              placeholder="100"
                              value={c.includedAmountMonthly}
                              onChange={e=>upd('includedAmountMonthly',e.target.value)}
                              style={{ width:160 }}
                            />
                          </div>
                        </Fade>
                      )}

                      {c.includedAmountMonthly && (
                        <Fade key="monthly-price">
                          <div style={{ marginBottom: 14 }}>
                            <Label hint={`/ month for ${c.includedAmountMonthly} ${c.feature} / ${recurrencePeriodToText(c.recurrenceMonthly)}`}>
                              {c.billingCycle === 'both' ? 'Price' : 'Price ($)'}
                            </Label>
                            <Input
                              type="number"
                              placeholder="5.00"
                              value={c.price}
                              onChange={e=>upd('price',e.target.value)}
                              style={{ width:160 }}
                            />
                          </div>
                        </Fade>
                      )}

                      {c.price && (
                        <Fade key="monthly-summary">
                          <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
                            → ${c.price}/month includes {c.includedAmountMonthly} {c.feature}/{recurrencePeriodToText(c.recurrenceMonthly)}
                          </div>
                        </Fade>
                      )}
                    </div>
                  )}

                  {/* Annual Billing Configuration */}
                  {(c.billingCycle === 'annual' || c.billingCycle === 'both') && (
                    <div>
                      {c.billingCycle === 'both' && (
                        <div style={{ fontSize:13, fontWeight:600, color:G700, marginBottom:14, marginTop:20 }}>
                          Annual billing
                        </div>
                      )}

                      <SectionQ>How often does a customer's allowance refresh?</SectionQ>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['hourly', 'daily', 'weekly', 'monthly', 'annual'].map(period => (
                          <Pill
                            key={period}
                            active={c.recurrenceAnnual === period}
                            onClick={() => upd('recurrenceAnnual', period)}
                          >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </Pill>
                        ))}
                      </div>
                      {c.recurrenceAnnual && (
                        <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
                          {c.recurrenceAnnual === 'hourly' && '→ Allowance resets every hour'}
                          {c.recurrenceAnnual === 'daily' && '→ Allowance resets at midnight every day'}
                          {c.recurrenceAnnual === 'weekly' && '→ Allowance resets every week'}
                          {c.recurrenceAnnual === 'monthly' && '→ Allowance resets on the same day each month'}
                          {c.recurrenceAnnual === 'annual' && '→ Allowance resets once per year on the anniversary date'}
                        </div>
                      )}

                      {c.recurrenceAnnual && (
                        <Fade key="annual-amount">
                          <div style={{ marginTop: 16, marginBottom: 14 }}>
                            <Label hint={`${c.feature} per purchase / ${recurrencePeriodToText(c.recurrenceAnnual)}`}>
                              {c.billingCycle === 'both' ? 'Included amount' : 'How much does one purchase include?'}
                            </Label>
                            <Input
                              type="number"
                              placeholder="1000"
                              value={c.includedAmountAnnual}
                              onChange={e=>upd('includedAmountAnnual',e.target.value)}
                              style={{ width:160 }}
                            />
                          </div>
                        </Fade>
                      )}

                      {c.includedAmountAnnual && (
                        <Fade key="annual-price">
                          <div style={{ marginBottom: 14 }}>
                            <Label hint={`/ year for ${c.includedAmountAnnual} ${c.feature} / ${recurrencePeriodToText(c.recurrenceAnnual)}`}>
                              {c.billingCycle === 'both' ? 'Price' : 'Price ($)'}
                            </Label>
                            <Input
                              type="number"
                              placeholder="50.00"
                              value={c.priceAnnual}
                              onChange={e=>upd('priceAnnual',e.target.value)}
                              style={{ width:160 }}
                            />
                          </div>
                        </Fade>
                      )}

                      {c.priceAnnual && (
                        <Fade key="annual-summary">
                          <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
                            → ${c.priceAnnual}/year includes {c.includedAmountAnnual} {c.feature}/{recurrencePeriodToText(c.recurrenceAnnual)}
                          </div>
                        </Fade>
                      )}
                    </div>
                  )}
                </Fade>
              )}

              {/* Step 5: Payment Timing */}
              {c.billingCycle && ((c.billingCycle === 'monthly' && c.price) || (c.billingCycle === 'annual' && c.priceAnnual) || (c.billingCycle === 'both' && c.price && c.priceAnnual)) && (
                <Fade key="timing">
                  <Divider mt={20} mb={20}/>
                  <SectionQ>When do customers pay?</SectionQ>
                  <SegmentedControl
                    value={c.timing}
                    onChange={(v) => upd('timing', v)}
                    options={[
                      { value: 'advance', label: 'In advance' },
                      { value: 'arrears', label: 'In arrears' }
                    ]}
                  />
                  {c.timing && (
                    <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
                      {c.timing === 'advance' && '→ Customer pays at the beginning of the period'}
                      {c.timing === 'arrears' && '→ Customer pays at the end of the period'}
                    </div>
                  )}
                </Fade>
              )}

              {/* Step 6: Overage Behavior */}
              {c.timing && (
                <Fade key="overage">
                  <Divider mt={20} mb={20}/>
                  <SectionQ>What happens when the included amount runs out?</SectionQ>
                  <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                    <Pill active={c.overage==='hardstop'} onClick={()=>upd('overage','hardstop')}>Hard stop</Pill>
                    <Pill active={c.overage==='payg'} onClick={()=>upd('overage','payg')}>Soft limit (PAYG)</Pill>
                  </div>
                  {c.overage==='payg' && (
                    <Fade key="ov-rate">
                      <div style={{ marginBottom:14 }}>
                        <Label hint="per unit">Overage rate ($)</Label>
                        <Input type="number" placeholder="0.001" value={c.overageRate} onChange={e=>upd('overageRate',e.target.value)} style={{ width:140 }}/>
                      </div>
                    </Fade>
                  )}
                </Fade>
              )}

              {/* Step 7: Rollover */}
              {c.overage && (
                <Fade key="rollover">
                  <Divider mt={20} mb={20}/>
                  <SectionQ>Do unused amounts rollover?</SectionQ>
                  <div style={{ display:'flex', gap:8 }}>
                    <Pill active={c.rollover===true} onClick={()=>upd('rollover',true)}>Yes, unused rolls over</Pill>
                    <Pill active={c.rollover===false} onClick={()=>upd('rollover',false)}>No, use it or lose it</Pill>
                  </div>
                  {c.rollover && (
                    <Fade key="roll-cap">
                      <div style={{ marginTop:14 }}>
                        <SectionQ>Maximum rollover cap</SectionQ>
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
        </Fade>
      )}

      {(c.whatGet==='access' || (c.whatGet==='quantity' && c.feature && featureType(c.feature)==='mutable')) && (
        <Fade key="timing">
          <Divider />
          <SectionQ>When do customers pay?</SectionQ>
          <SegmentedControl
            value={c.timing}
            onChange={(v) => upd('timing', v)}
            options={[
              { value: 'advance', label: 'In advance' },
              { value: 'arrears', label: 'In arrears' }
            ]}
          />
          {c.timing && (
            <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
              {c.timing === 'advance' && '→ Customer pays at the beginning of the period'}
              {c.timing === 'arrears' && '→ Customer pays at the end of the period'}
            </div>
          )}
          <Divider mt={20} mb={20}/>
          <SectionQ>Billing cycle</SectionQ>
          <SegmentedControl
            value={c.cycle}
            onChange={(v) => upd('cycle', v)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual' },
              { value: 'both', label: 'Both' }
            ]}
          />
        </Fade>
      )}

      {c.timing && c.cycle && (c.whatGet==='access' || (c.whatGet==='quantity' && c.feature && featureType(c.feature)==='mutable')) && (
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

function PAYGForm({ onDone, allMetered, onCreateMetered, initialData }) {
  const empty = () => ({ resource:'', model:'perunit', price:'', blockSize:'', blockPrice:'', tiers:[{min:'0',max:'',price:''}] })
  const [resources, setResources] = useState(initialData?.resources || [empty()])
  const upd = (i,k,v) => setResources(r=>r.map((x,j)=>j===i?{...x,[k]:v}:x))
  const updTier = (ri,ti,k,v) => {
    setResources(r=>r.map((x,j)=>j===ri?{
      ...x,
      tiers:x.tiers.map((t,ki)=>{
        if (ki===ti) {
          // Update the current tier
          return {...t,[k]:v}
        } else if (k==='max' && ki===ti+1 && v) {
          // Auto-update next tier's min when current tier's max changes
          const maxNum = parseFloat(v)
          if (!isNaN(maxNum)) {
            return {...t, min: String(maxNum + 1)}
          }
        }
        return t
      })
    }:x))
  }
  const addTier = ri => setResources(r=>r.map((x,j)=>{
    if (j===ri) {
      const lastTier = x.tiers[x.tiers.length - 1]
      const newMin = lastTier?.max ? String(parseFloat(lastTier.max) + 1) : ''
      return {...x, tiers:[...x.tiers, {min:newMin, max:'', price:''}]}
    }
    return x
  }))

  const isResourceValid = (r) => {
    if (!r.resource) return false
    if (r.model === 'perunit') return r.price
    if (r.model === 'block') return r.blockSize && r.blockPrice
    if (r.model === 'graduated' || r.model === 'volume') return r.tiers.some(t => t.price)
    return false
  }

  const canDone = resources.some(isResourceValid)

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
              <InlineCreate label="New metered resource" fields={[{key:'name',placeholder:'Resource name'}]} onAdd={f=>{onCreateMetered(f.name); upd(i,'resource',f.name)}}/>
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
            <BtnPrimary onClick={()=>onDone({ type:'payg', resources: resources.filter(isResourceValid) })}>Add component</BtnPrimary>
          </div>
        </Fade>
      )}
    </div>
  )
}

function PrepaidForm({ onDone, allMetered, onCreateMetered, initialData }) {
  const [c, setC] = useState(initialData || { resource:'', packs:[{qty:'',price:''}], expires:null, expiryMonths:'', stackable:null })
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
        <InlineCreate label="New metered resource" fields={[{key:'name',placeholder:'Resource name'}]} onAdd={f=>{onCreateMetered(f.name); upd('resource',f.name)}}/>
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

function OneTimeForm({ onDone, initialData }) {
  const [c, setC] = useState(initialData || { timing:null, price:'' })
  const upd = (k,v) => setC(p=>({...p,[k]:v}))
  const canDone = c.timing && c.price
  return (
    <div>
      <Fade>
        <SectionQ>When do customers pay?</SectionQ>
        <SegmentedControl
          value={c.timing}
          onChange={(v) => upd('timing', v)}
          options={[
            { value: 'advance', label: 'In advance' },
            { value: 'arrears', label: 'In arrears' }
          ]}
        />
        {c.timing && (
          <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
            {c.timing === 'advance' && '→ Customer pays before receiving access'}
            {c.timing === 'arrears' && '→ Customer pays after the service is delivered'}
          </div>
        )}
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

function MFCForm({ onDone, initialData }) {
  const activeOfferings = OFFERINGS.filter(o => o.status === 'active')
  const [offerings, setOfferings] = useState(initialData?.offerings || [])
  const [discounts, setDiscounts] = useState(initialData?.discounts || {})
  const canDone = offerings.length > 0
  return (
    <div>
      <Note>MFC is a commercial wrapper — it doesn't redefine how offerings are priced. The commitment amount and commitment term are negotiated per customer and are not set here.</Note>
      <Fade>
        <div style={{ marginBottom: 14 }}>
          <Label>Which offerings are in scope?</Label>
          <MultiSelect
            items={activeOfferings}
            selected={offerings}
            onChange={setOfferings}
            placeholder="Select offerings..."
          />
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
    subscription: () => {
      const isMeteredQuantity = comp.whatGet === 'quantity' && comp.featureType === 'metered' && comp.billingCycle

      if (isMeteredQuantity) {
        // Metered subscription with quantity
        const recurrence = comp.billingCycle === 'monthly'
          ? recurrencePeriodToText(comp.recurrenceMonthly)
          : recurrencePeriodToText(comp.recurrenceAnnual)

        let priceText = ''
        if (comp.billingCycle === 'both') {
          priceText = `$${comp.price}/mo or $${comp.priceAnnual}/yr`
        } else if (comp.billingCycle === 'monthly') {
          priceText = `$${comp.price}/mo`
        } else {
          priceText = `$${comp.priceAnnual}/yr`
        }

        const includedAmount = comp.billingCycle === 'monthly' ? comp.includedAmountMonthly : comp.includedAmountAnnual
        const overageText = comp.overage === 'hardstop' ? 'hard stop' : `$${comp.overageRate} overage`

        return `${includedAmount} ${comp.feature}/${recurrence} • ${priceText} • ${overageText}`
      }

      // Regular subscription (access or mutable quantity)
      if (comp.whatGet === 'access') {
        if (comp.cycle === 'both') {
          return `Unlimited access • $${comp.price}/mo or $${comp.priceAnnual}/yr`
        } else if (comp.cycle === 'monthly') {
          return `Unlimited access • $${comp.price}/month`
        } else {
          return `Unlimited access • $${comp.priceAnnual}/year`
        }
      } else {
        // Mutable quantity
        const unit = comp.feature || 'unit'
        if (comp.cycle === 'both') {
          return `Per ${unit} • $${comp.price}/mo or $${comp.priceAnnual}/yr each`
        } else if (comp.cycle === 'monthly') {
          return `Per ${unit} • $${comp.price}/month each`
        } else {
          return `Per ${unit} • $${comp.priceAnnual}/year each`
        }
      }
    },

    payg: () => {
      const resources = comp.resources?.filter(r => r.resource) || []
      if (resources.length === 0) return '—'

      return resources.map(r => {
        if (r.model === 'perunit' || r.model === 'per_unit') {
          return `${r.resource} • $${r.price} per unit`
        } else if (r.model === 'block') {
          return `${r.resource} • $${r.blockPrice} per ${r.blockSize}`
        } else if (r.model === 'graduated' || r.model === 'volume') {
          const tierCount = r.tiers?.length || 0
          const minPrice = r.tiers?.[0]?.price || '?'
          const maxPrice = r.tiers?.[r.tiers.length - 1]?.price || '?'
          return `${r.resource} • ${tierCount} tiers • $${minPrice}-$${maxPrice}`
        }
        return r.resource
      }).join(' • ')
    },

    prepaid: () => {
      const packCount = comp.packs?.length || 0
      const minPrice = comp.packs?.[0]?.price ? `$${comp.packs[0].price}` : ''
      const maxPrice = comp.packs?.[comp.packs.length - 1]?.price ? `$${comp.packs[comp.packs.length - 1].price}` : ''
      const priceRange = minPrice && maxPrice && minPrice !== maxPrice ? ` • ${minPrice}-${maxPrice}` : minPrice ? ` • ${minPrice}` : ''
      const expiry = comp.expires ? ` • ${comp.expiryMonths}mo expiry` : ' • No expiry'
      return `${comp.resource} • ${packCount} pack${packCount === 1 ? '' : 's'}${priceRange}${expiry}`
    },

    onetime: () => {
      const timingText = comp.timing === 'advance' ? 'Paid in advance' : 'Paid in arrears'
      return `One-time fee • $${comp.price} • ${timingText}`
    },

    mfc: () => {
      const offeringCount = comp.offerings?.length || 0
      const discountCount = Object.keys(comp.discounts || {}).filter(k => comp.discounts[k]).length
      return `Minimum commitment • ${offeringCount} offering${offeringCount === 1 ? '' : 's'} • ${discountCount} discount${discountCount === 1 ? '' : 's'}`
    },
  }[comp.type]?.() || ''

  return (
    <div style={{ border:`1px solid ${G200}`, borderRadius:6, padding:'10px 14px', background:'#fff', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:22, height:22, borderRadius:'50%', background:BL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg viewBox="0 0 13 13" width="10" height="10"><polyline points="1.5,6.5 5,10 11.5,3" fill="none" stroke={B} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:G900 }}>{labels[comp.type]}</div>
        <div style={{ fontSize:12, color:G500, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{meta}</div>
      </div>
      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
        <button onClick={onEdit} style={{ background:'none', border:`1px solid ${G200}`, borderRadius:3, fontSize:11, color:G500, cursor:'pointer', padding:'3px 8px', fontFamily:'inherit' }}>Edit</button>
        <button onClick={onRemove} style={{ background:'none', border:'none', fontSize:16, color:G300, cursor:'pointer', padding:'0 4px', lineHeight:1, fontFamily:'inherit' }}>×</button>
      </div>
    </div>
  )
}

// ─── Pricing Table for Tiers ───────────────────────────────────────────────
function PricingTable({ resource, model, tiers }) {
  return (
    <div style={{ marginTop: 16, marginBottom: 20, border: `1px solid ${G200}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: G100, padding: '12px 16px', borderBottom: `1px solid ${G200}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: G700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {resource} — {model === 'graduated' ? 'Graduated pricing' : 'Volume pricing'}
        </div>
      </div>
      <div style={{ background: '#fff' }}>
        {tiers.map((tier, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 16,
            padding: '14px 16px',
            borderBottom: i < tiers.length - 1 ? `1px solid ${G100}` : 'none'
          }}>
            <div style={{ fontSize: 13, color: G900, fontWeight: 500 }}>
              {tier.min && tier.max ? `${tier.min} – ${tier.max} units` :
               tier.min && !tier.max ? `${tier.min}+ units` :
               !tier.min && tier.max ? `Up to ${tier.max} units` :
               'All units'}
            </div>
            <div style={{ fontSize: 16, color: G900, fontWeight: 700, letterSpacing: '-0.01em' }}>
              ${tier.price}/unit
            </div>
          </div>
        ))}
      </div>
      {model === 'graduated' && (
        <div style={{ background: G50, padding: '10px 16px', borderTop: `1px solid ${G200}`, fontSize: 12, color: G500, lineHeight: 1.6 }}>
          Each unit is charged at the rate of the tier it falls in
        </div>
      )}
      {model === 'volume' && (
        <div style={{ background: G50, padding: '10px 16px', borderTop: `1px solid ${G200}`, fontSize: 12, color: G500, lineHeight: 1.6 }}>
          All units are charged at the rate of the highest tier reached
        </div>
      )}
    </div>
  )
}

// ─── Summary Panel ──────────────────────────────────────────────────────────
function SummaryPanel({ offeringType, compatibleWith, customOfferings, offeringName, isFree, freeOptIn, components, trial }) {
  const Check = () => <span style={{ color:GREEN, marginRight:8 }}>✓</span>
  const activeOfferings = OFFERINGS.filter(o => o.status === 'active')
  const displayName = offeringName.trim() || 'Your offering'
  const isAddon = offeringType === 'addon'
  const allOfferings = [...activeOfferings, ...(customOfferings || [])]
  const requiredOfferings = compatibleWith?.length > 0
    ? compatibleWith.map(id => allOfferings.find(o => o.id === id)).filter(Boolean)
    : []

  if (!offeringType || isFree===null) return (
    <div style={{ textAlign:'center', padding:'60px 16px' }}>
      <div style={{ fontSize:28, marginBottom:12, opacity:0.3 }}>◻</div>
      <div style={{ fontSize:13, color:G400, lineHeight:1.8 }}>Build your pricing on the left.<br/>The customer view will appear here.</div>
    </div>
  )

  if (isFree && !freeOptIn) return (
    <div style={{ textAlign:'center', padding:'60px 16px' }}>
      <div style={{ fontSize:28, marginBottom:12, opacity:0.3 }}>◻</div>
      <div style={{ fontSize:13, color:G400, lineHeight:1.8 }}>Choose how customers access<br/>this free offering.</div>
    </div>
  )

  if (isFree && freeOptIn) return (
    <div style={{ border:`1px solid ${G200}`, borderRadius:8, padding:24 }}>
      <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>{displayName.toUpperCase()}</div>
      <div><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>$0</span><span style={{ fontSize:14, color:G500 }}> / month</span></div>
      <div style={{ fontSize:13, color:G500, marginTop:4, marginBottom:20 }}>Free — no purchase required</div>
      <Divider mt={0} mb={16}/>
      <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>HOW IT WORKS</div>
      <div style={{ fontSize:13, color:G900, marginBottom:8 }}><Check/>Full access — no charge</div>
      {freeOptIn==='automatic' && <div style={{ fontSize:13, color:G900, marginBottom:20 }}><Check/>Available to all customers automatically</div>}
      {freeOptIn==='optin' && <div style={{ fontSize:13, color:G900, marginBottom:20 }}><Check/>Requires customer opt-in to activate</div>}
      <button style={{ width:'100%', padding:10, background:G900, color:'#fff', border:'none', borderRadius:4, fontSize:13, fontWeight:500, cursor:'default', fontFamily:'inherit' }}>
        {freeOptIn==='automatic' ? 'Already available' : 'Get started — free'}
      </button>
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

    // Add requirements for add-ons at the top of includes
    if (isFirst && offeringType === 'addon' && requiredOfferings.length > 0) {
      const offeringNames = requiredOfferings.map(o => o.name).join(', ')
      includes.push(`Requires one of: ${offeringNames}`)
    }

    if (comp.type==='subscription') {
      cta = 'Subscribe'
      const isMeteredQuantity = comp.whatGet === 'quantity' && comp.featureType === 'metered' && comp.billingCycle

      if (isMeteredQuantity) {
        // New flow for metered + quantity
        const hasBoth = comp.billingCycle === 'both' && comp.price && comp.priceAnnual

        if (hasBoth) {
          // Show both prices with savings and descriptions
          const savings = Math.round((1-(comp.priceAnnual/12)/comp.price)*100)
          const recurrenceMonthly = recurrencePeriodToText(comp.recurrenceMonthly)
          const recurrenceAnnual = recurrencePeriodToText(comp.recurrenceAnnual)
          priceDisplay = (
            <div>
              <div>
                <span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.price}</span>
                <span style={{ fontSize:13, color:G500 }}>/mo</span>
              </div>
              <div style={{ fontSize:13, color:G500, marginTop:4 }}>
                for {comp.includedAmountMonthly} {comp.feature} / {recurrenceMonthly}
              </div>
              <div style={{ fontSize:14, color:G500, marginTop:8 }}>
                or ${comp.priceAnnual}/yr
                {savings > 0 && <span style={{ color:GREEN, marginLeft:8 }}>· save {savings}%</span>}
              </div>
              <div style={{ fontSize:13, color:G500, marginTop:4 }}>
                for {comp.includedAmountAnnual} {comp.feature} / {recurrenceAnnual}
              </div>
            </div>
          )
        } else if (comp.billingCycle === 'monthly' && comp.price) {
          const recurrence = recurrencePeriodToText(comp.recurrenceMonthly)
          priceDisplay = (
            <div>
              <div>
                <span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.price}</span>
                <span style={{ fontSize:13, color:G500 }}>/mo</span>
              </div>
              <div style={{ fontSize:13, color:G500, marginTop:4 }}>
                for {comp.includedAmountMonthly} {comp.feature} / {recurrence}
              </div>
            </div>
          )
        } else if (comp.billingCycle === 'annual' && comp.priceAnnual) {
          const recurrence = recurrencePeriodToText(comp.recurrenceAnnual)
          priceDisplay = (
            <div>
              <div>
                <span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${comp.priceAnnual}</span>
                <span style={{ fontSize:13, color:G500 }}>/yr</span>
              </div>
              <div style={{ fontSize:13, color:G500, marginTop:4 }}>
                for {comp.includedAmountAnnual} {comp.feature} / {recurrence}
              </div>
            </div>
          )
        }

        // Describe the metered quantity subscription details
        if (hasBoth) {
          const recurrenceMonthly = recurrencePeriodToAdverb(comp.recurrenceMonthly)
          const recurrenceAnnual = recurrencePeriodToAdverb(comp.recurrenceAnnual)
          includes.push(`For monthly billing, allowance refreshes ${recurrenceMonthly}`)
          includes.push(`For annual billing, allowance refreshes ${recurrenceAnnual}`)
        } else {
          const recurrence = comp.billingCycle === 'monthly'
            ? recurrencePeriodToAdverb(comp.recurrenceMonthly)
            : recurrencePeriodToAdverb(comp.recurrenceAnnual)
          includes.push(`Allowance refreshes ${recurrence}`)
        }

        if (comp.timing === 'advance') includes.push('Charged at the start of each billing period')
        if (comp.timing === 'arrears') includes.push('Charged at the end of each billing period')
        if (comp.overage === 'hardstop') includes.push(`Hard stop when allowance runs out`)
        if (comp.overage === 'payg') includes.push(`Overage billed monthly: $${comp.overageRate} per extra ${comp.feature}`)
        if (comp.rollover === false) includes.push(`No rollover — use it or lose it`)
        if (comp.rollover === true) includes.push(`Rollover: up to ${comp.rollCap}${comp.rollCapType === 'multiplier' ? '× allowance' : ` ${comp.feature}`}`)
      } else {
        // Original flow for access or mutable quantity
        const hasBoth = comp.cycle==='both' && comp.price && comp.priceAnnual
        const monthly = comp.cycle!=='annual'
        const annual = comp.cycle!=='monthly'
        const isMutable = comp.featureType === 'mutable'

        // Format price with commas
        const formatPrice = (price) => {
          return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        }

        if (hasBoth) {
          // Show both prices with savings
          const savings = Math.round((1-(comp.priceAnnual/12)/comp.price)*100)
          if (isMutable) {
            priceDisplay = (
              <div>
                <div>
                  <span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${formatPrice(comp.price)}</span>
                  <span style={{ fontSize:13, color:G500 }}> per {comp.unitLabel} / mo</span>
                </div>
                <div style={{ fontSize:14, color:G500, marginTop:6 }}>
                  or ${formatPrice(comp.priceAnnual)} per {comp.unitLabel} / yr
                  {savings > 0 && <span style={{ color:GREEN, marginLeft:8 }}>· save {savings}%</span>}
                </div>
              </div>
            )
          } else {
            priceDisplay = (
              <div>
                <div>
                  <span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${formatPrice(comp.price)}</span>
                  <span style={{ fontSize:13, color:G500 }}> / mo</span>
                </div>
                <div style={{ fontSize:14, color:G500, marginTop:6 }}>
                  or ${formatPrice(comp.priceAnnual)} / yr
                  {savings > 0 && <span style={{ color:GREEN, marginLeft:8 }}>· save {savings}%</span>}
                </div>
              </div>
            )
          }
        } else if (monthly && comp.price) {
          if (isMutable) {
            priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${formatPrice(comp.price)}</span><span style={{ fontSize:13, color:G500 }}> per {comp.unitLabel} / mo</span></>
          } else {
            priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${formatPrice(comp.price)}</span><span style={{ fontSize:13, color:G500 }}> / mo</span></>
          }
        } else if (annual && comp.priceAnnual) {
          if (isMutable) {
            priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${formatPrice(comp.priceAnnual)}</span><span style={{ fontSize:13, color:G500 }}> per {comp.unitLabel} / yr</span></>
          } else {
            priceDisplay = <><span style={{ fontSize:36, fontWeight:700, color:G900, letterSpacing:'-0.02em' }}>${formatPrice(comp.priceAnnual)}</span><span style={{ fontSize:13, color:G500 }}> / yr</span></>
          }
        }
        // Removed "Full product access" line
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
    }

    if (comp.type==='payg') {
      cta = 'Enable'

      // Separate simple and complex pricing models
      const simpleResources = []
      const complexResources = []

      comp.resources?.forEach(r => {
        if (!r.resource) return
        if (r.model === 'graduated' || r.model === 'volume') {
          complexResources.push(r)
        } else {
          simpleResources.push(r)
        }
      })

      // Just show simple heading
      priceDisplay = <div style={{ fontSize:18, fontWeight:600, color:G900, letterSpacing:'-0.01em' }}>Pay-as-you-go</div>

      // Add pricing details to includes section
      includes.push('Billed monthly in arrears')

      // Store resources to render in HOW IT WORKS section
      if (simpleResources.length > 0 || complexResources.length > 0) {
        includes.push('__PAYG_RESOURCES__') // Marker to render resources
      }
    }

    if (comp.type==='prepaid') {
      const packs = comp.packs?.filter(p=>p.qty&&p.price) || []

      if (packs.length > 0) {
        priceDisplay = (
          <div>
            <div style={{ fontSize:16, fontWeight:600, color:G700, marginBottom:12 }}>{comp.resource} packs</div>
            <div style={{ display:'grid', gridTemplateColumns: packs.length <= 3 ? `repeat(${packs.length}, 1fr)` : 'repeat(3, 1fr)', gap:12 }}>
              {packs.map((pack, idx) => {
                const unitPrice = (parseFloat(pack.price) / parseInt(pack.qty)).toFixed(4)
                return (
                  <div key={idx} style={{ border:`1px solid ${G200}`, borderRadius:6, padding:'12px 14px', background:'#fff' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
                      {pack.qty} {comp.resource}
                    </div>
                    <div style={{ fontSize:24, fontWeight:700, color:G900, letterSpacing:'-0.01em' }}>
                      ${pack.price}
                    </div>
                    <div style={{ fontSize:11, color:G400, marginTop:4 }}>
                      ${unitPrice} per unit
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      } else {
        priceDisplay = <span style={{ fontSize:16, fontWeight:600, color:G700 }}>Prepaid packs</span>
      }

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
      priceDisplay = <span style={{ fontSize:14, fontWeight:500, color:G700 }}>Minimum fee commitment (negotiated per customer)</span>
      const offeringNames = comp.offerings?.map(id => activeOfferings.find(o=>o.id===id)?.name).filter(Boolean) || []
      includes.push(`Eligible offerings: ${offeringNames.join(', ')}`)
      const disc = Object.entries(comp.discounts||{}).filter(([,v])=>v)
      if (disc.length) disc.forEach(([k,v])=>{
        const offering = activeOfferings.find(o=>o.id===k)
        if (offering) includes.push(`${offering.name}: ${v}% off list price`)
      })
      else includes.push('Standard rates apply')
      includes.push('Commitment amount and term agreed per customer')
    }

    // Collect complex resources for PAYG pricing tables
    const complexResources = comp.type === 'payg'
      ? comp.resources?.filter(r => r.resource && (r.model === 'graduated' || r.model === 'volume')) || []
      : []

    return (
      <div key={i} style={sep}>
        {isAddon && <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>ADD-ON: {typeLabel}</div>}
        {priceDisplay && <div style={{ marginBottom:isFirst?20:14 }}>{priceDisplay}</div>}
        {isFirst && includes.length>0 && <><Divider mt={0} mb={16}/><div style={{ fontSize:12, fontWeight:600, color:G700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>HOW IT WORKS</div></>}
        {isAddon && includes.length>0 && <div style={{ fontSize:12, fontWeight:600, color:G700, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:12, marginBottom:12 }}>HOW IT WORKS</div>}
        {includes.map((l,j)=>{
          // Render PAYG resources inline
          if (l === '__PAYG_RESOURCES__' && comp.type === 'payg') {
            const simpleRes = comp.resources?.filter(r => r.resource && r.model !== 'graduated' && r.model !== 'volume') || []
            const complexRes = comp.resources?.filter(r => r.resource && (r.model === 'graduated' || r.model === 'volume')) || []
            return (
              <div key={j} style={{ marginTop:8, marginBottom:12 }}>
                {simpleRes.map((r, idx) => {
                  let priceText = ''
                  if (r.model === 'perunit' || r.model === 'per_unit') {
                    priceText = `$${r.price} per ${r.resource.toLowerCase()}`
                  } else if (r.model === 'block') {
                    priceText = `$${r.blockPrice} per ${r.blockSize} ${r.resource.toLowerCase()}`
                  }
                  return (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: idx < simpleRes.length - 1 || complexRes.length > 0 ? `1px solid ${G200}` : 'none' }}>
                      <div style={{ fontSize:13, color:G900 }}><Check/>{r.resource}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:G900 }}>{priceText}</div>
                    </div>
                  )
                })}
                {complexRes.map((r, idx) => (
                  <div key={`complex-${idx}`} style={{ marginTop:16 }}>
                    <PricingTable resource={r.resource} model={r.model} tiers={r.tiers} />
                  </div>
                ))}
              </div>
            )
          }
          return <div key={j} style={{ fontSize:13, color:G900, marginBottom:10, lineHeight:1.6 }}><Check/>{l}</div>
        })}

        {/* Note about entitlements for subscription and one-time */}
        {(comp.type === 'subscription' || comp.type === 'onetime') && (
          <div style={{
            marginTop:includes.length > 0 ? 12 : 0,
            padding:'8px 12px',
            background:'#FFFBEB',
            border:`1px solid #FDE68A`,
            borderRadius:6,
            fontSize:11,
            color:'#92400E',
            lineHeight:1.5
          }}>
            <strong>Note:</strong> This shows pricing only. Feature entitlements will be configured separately.
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      border:`1px solid ${G200}`,
      borderRadius:12,
      padding:32,
      maxWidth:720,
      background:'#fff',
      boxShadow:'0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Add-on badge */}
      {isAddon && (
        <div style={{ display:'inline-block', padding:'4px 8px', background:BL, border:`1px solid ${B}`, borderRadius:4, fontSize:10, fontWeight:600, color:B, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>
          Add-on
        </div>
      )}

      {/* Header */}
      <div style={{ fontSize:12, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
        {isAddon ? displayName.toUpperCase() :
         components.length === 1 ? displayName.toUpperCase() : `${displayName.toUpperCase()} + ADD-ONS`}
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
      <Divider mt={20} mb={20}/>
      <button style={{
        width:'100%',
        padding:'12px 16px',
        background:B,
        color:'#fff',
        border:'none',
        borderRadius:6,
        fontSize:14,
        fontWeight:600,
        cursor:'pointer',
        fontFamily:'inherit',
        transition:'all 0.15s',
        boxShadow:'0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {components[0]?.type==='subscription'?'Subscribe':components[0]?.type==='payg'?'Enable':components[0]?.type==='mfc'?'Contact sales':'Buy now'}
      </button>
    </div>
  )
}

// ─── Export ─────────────────────────────────────────────────────────────────
function doExport(config) {
  // Transform components to data model-aligned format
  const payload = {
    ...config,
    components: config.components.map(transformComponentForExport),
    _meta: {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transformedFormat: true,
      offeringType: config.offeringType || 'base' // 'base' or 'addon'
    }
  }

  // Generate filename from offering name
  const filename = (config.offeringName || 'pricing-config')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') + '-config.json'

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export default function PricingPlayground() {
  const [offeringType, setOfferingType] = useState(null) // 'base' or 'addon'
  const [compatibleWith, setCompatibleWith] = useState([]) // Array of offering IDs for add-ons
  const [customOfferings, setCustomOfferings] = useState([]) // Custom offerings created by user
  const [offeringName, setOfferingName] = useState('')
  const [isFree, setIsFree] = useState(null)
  const [freeOptIn, setFreeOptIn] = useState(null) // 'automatic' or 'optin'
  const [components, setComponents] = useState([])
  const [activeType, setActiveType] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [trial, setTrial] = useState(null)
  const [showTrial, setShowTrial] = useState(false)
  const [sessionMetered, setSessionMetered] = useState([])
  const [sessionMutable, setSessionMutable] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [editingComponent, setEditingComponent] = useState(null)
  const [showExamples, setShowExamples] = useState(null) // null | 'examples' | 'scratch'
  const [selectedExample, setSelectedExample] = useState(null)
  const formRef = useRef(null)
  const freeOptInRef = useRef(null)

  // Scroll to form when strategy is selected
  useEffect(() => {
    if (activeType && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100) // Small delay to let the Fade animation start
    }
  }, [activeType])

  // Scroll to opt-in question when free is selected
  useEffect(() => {
    if (isFree === true && freeOptInRef.current) {
      setTimeout(() => {
        freeOptInRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [isFree])

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
    setFreeOptIn(null) // Reset opt-in choice when changing free/paid

    // Clear all paid-related state when switching
    setComponents([])
    setActiveType(null)
    setTrial(null)
    setShowTrial(false)
    setEditIndex(null)

    if (!free) {
      setShowPicker(true)
    } else {
      setShowPicker(false)
    }
  }

  const handleStratDone = (config) => {
    if (editIndex!==null) {
      setComponents(p=>p.map((c,i)=>i===editIndex?config:c))
      setEditIndex(null)
    } else {
      setComponents(p=>[...p,config])
    }
    setActiveType(null)
    setShowPicker(false)
    setEditingComponent(null)
  }

  const handleEdit = (i) => {
    const comp = components[i]
    setEditIndex(i)
    setActiveType(comp.type)
    setEditingComponent(comp)
    setShowPicker(true) // Show picker so user can change strategy if desired
  }

  const isDone = (isFree && freeOptIn) || (components.length>0 && !activeType && !showPicker)
  const getInitialData = (type) => (editingComponent?.type === type ? editingComponent : null)
  const stratForms = {
    subscription: <SubscriptionForm onDone={handleStratDone} allMetered={allMetered} allMutable={allMutable} onCreateMetered={n=>setSessionMetered(p=>[...p,n])} onCreateMutable={f=>setSessionMutable(p=>[...p,f])} initialData={getInitialData('subscription')}/>,
    payg: <PAYGForm onDone={handleStratDone} allMetered={allMetered} onCreateMetered={n=>setSessionMetered(p=>[...p,n])} initialData={getInitialData('payg')}/>,
    prepaid: <PrepaidForm onDone={handleStratDone} allMetered={allMetered} onCreateMetered={n=>setSessionMetered(p=>[...p,n])} initialData={getInitialData('prepaid')}/>,
    onetime: <OneTimeForm onDone={handleStratDone} initialData={getInitialData('onetime')}/>,
    mfc: <MFCForm onDone={handleStratDone} initialData={getInitialData('mfc')}/>,
  }

  const handleReset = () => {
    if (window.confirm('Reset all fields? This will clear everything you\'ve entered.')) {
      setOfferingType(null)
      setCompatibleWith([])
      setCustomOfferings([])
      setOfferingName('')
      setIsFree(null)
      setFreeOptIn(null)
      setComponents([])
      setActiveType(null)
      setShowPicker(false)
      setTrial(null)
      setShowTrial(false)
      setSessionMetered([])
      setSessionMutable([])
      setEditIndex(null)
      setEditingComponent(null)
      setShowExamples(null)
      setSelectedExample(null)
    }
  }

  const loadExample = (example) => {
    const state = example.state

    // Populate all state from example
    setOfferingType(state.offeringType)
    setOfferingName(state.offeringName)
    setIsFree(state.isFree)
    setFreeOptIn(state.freeOptIn)
    setCompatibleWith(state.compatibleWith || [])
    setCustomOfferings(state.customOfferings || [])
    setComponents(state.components)
    setTrial(state.trial)
    setSessionMetered(state.sessionMetered || [])
    setSessionMutable(state.sessionMutable || [])

    // Mark that we've loaded an example
    setSelectedExample(example.id)

    // Don't show picker - go straight to editing view
    setActiveType(null)
    setShowPicker(false)
    setEditIndex(null)
    setEditingComponent(null)
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
        <div style={{ fontSize:13, color:G500, marginBottom:24 }}>Configure how customers will be charged for this offering.</div>

        <Alert type="warning">
          <strong>Note:</strong> This tool is illustrative and experimental. For a complete list of supported monetization strategies and capabilities, please check the <a href="https://docs.google.com/document/d/1UbLv9W8jCThbO7Ly13zrcFAYujRghpka0nLgMhwnkT8/edit?tab=t.f4cd87mzobtj" target="_blank" rel="noopener noreferrer" style={{ color:ORANGE, textDecoration:'underline' }}>on-rails billing definitions</a>.
        </Alert>

        {/* Step -1: See example or create your own - always visible */}
        <Fade>
          <SectionQ>How would you like to start?</SectionQ>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <SelCard
              title="See an example"
              desc="Explore pre-configured offerings to learn or use as a starting point."
              selected={showExamples === 'examples'}
              onClick={() => {
                setShowExamples('examples')
                setSelectedExample(null)
                setOfferingType(null)
              }}
            />
            <SelCard
              title="Create your own"
              desc="Build a new offering from scratch."
              selected={showExamples === 'scratch'}
              onClick={() => {
                setShowExamples('scratch')
                setSelectedExample(null)
              }}
            />
          </div>
        </Fade>

        {/* Example offering picker */}
        {showExamples === 'examples' && !selectedExample && (
          <Fade key="examples">
            <Divider mt={28} mb={28} />
            <SectionQ>Choose an example to explore</SectionQ>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:12 }}>
              {EXAMPLE_OFFERINGS.map(ex => (
                <ExampleCard
                  key={ex.id}
                  example={ex}
                  onClick={() => loadExample(ex)}
                />
              ))}
            </div>
            <div style={{
              marginTop:20,
              padding:'12px 16px',
              background:BL,
              border:`1px solid ${B}`,
              borderRadius:6,
              fontSize:12,
              color:'#1E40AF',
              lineHeight:1.6,
              display:'flex',
              alignItems:'start',
              gap:8
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <div>
                <strong>Tip:</strong> All examples are fully editable. Click any example to load it, then modify values, add components, or use it as a starting point for your own offering.
              </div>
            </div>
          </Fade>
        )}

        {/* Step 0: Offering type - show if creating from scratch */}
        {showExamples === 'scratch' && (
          <Fade>
            <Divider mt={28} mb={28} />
            <SectionQ>What are you creating?</SectionQ>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <SelCard
                title="Base offering"
                desc="A purchasable offering like Docker Team or Offload. You can attach add-ons to extend it."
                selected={offeringType==='base'}
                onClick={()=>setOfferingType('base')}
              />
              <SelCard
                title="Add-on"
                desc="Supplements a base offering."
                selected={offeringType==='addon'}
                onClick={()=>setOfferingType('addon')}
              />
            </div>
            {offeringType && (
              <div style={{ marginTop:8, fontSize:12, color:G500, lineHeight:1.5 }}>
                {offeringType === 'base' && '→ You\'re creating an offering that can have multiple pricing components'}
                {offeringType === 'addon' && '→ You\'re creating an add-on that depends on an existing offering'}
              </div>
            )}
          </Fade>
        )}

        {/* Offering name - show if type selected OR example loaded */}
        {(offeringType || selectedExample) && (
          <Fade key="name">
            <Divider mt={28} mb={28} />
            {selectedExample && (
              <div style={{ marginBottom:16, fontSize:12, color:G500, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Loaded from example: <strong>{EXAMPLE_OFFERINGS.find(e => e.id === selectedExample)?.name}</strong>
                {' · '}
                <button
                  onClick={() => {
                    // Allow switching to another example
                    setSelectedExample(null)
                    // Keep showExamples='examples' to show picker again
                  }}
                  style={{ background:'none', border:'none', color:B, textDecoration:'underline', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}
                >
                  Load different example
                </button>
                {' · '}
                <button
                  onClick={() => {
                    setSelectedExample(null)
                    setShowExamples(null)
                    // Reset all state
                    handleReset()
                  }}
                  style={{ background:'none', border:'none', color:G500, textDecoration:'underline', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}
                >
                  Start from scratch
                </button>
              </div>
            )}
            <div style={{ marginBottom:28 }}>
              <Label hint="optional">{offeringType === 'addon' ? 'Add-on name' : 'Offering name'}</Label>
              <Input
                type="text"
                placeholder={offeringType === 'addon' ? 'e.g., Build minutes, Extra storage' : 'e.g. Docker Team or Hardened Images Enterprise.'}
                value={offeringName}
                onChange={e=>setOfferingName(e.target.value)}
                style={{ maxWidth:400 }}
              />
            </div>

            {/* Compatible offerings for add-ons */}
            {offeringType === 'addon' && (
              <div style={{ marginBottom:28 }}>
                <Label>Compatible with</Label>
                <MultiSelect
                  items={[
                    // Docker offerings
                    ...OFFERINGS.filter(o => ['personal', 'pro', 'team', 'business'].includes(o.id))
                      .map(o => ({ id: o.id, name: o.name })),
                    // Hardened Images offerings
                    ...OFFERINGS.filter(o => ['dhi-free', 'dhi-sel', 'dhi-ent-r', 'dhi-ent-f'].includes(o.id))
                      .map(o => ({ id: o.id, name: o.name })),
                    // Custom offerings
                    ...customOfferings.map(o => ({ id: o.id, name: o.name }))
                  ]}
                  selected={compatibleWith}
                  onChange={setCompatibleWith}
                  placeholder="Select offerings this add-on works with..."
                />
                <div style={{ fontSize:12, color:G400, marginTop:6, marginBottom:12 }}>
                  Select which offerings this add-on can be purchased with.
                </div>

                {/* Add custom offering */}
                <InlineCreate
                  label="+ Add custom offering"
                  fields={[{ key: 'name', placeholder: 'Offering name' }]}
                  onAdd={(vals) => {
                    const customId = `custom-${Date.now()}`
                    const newOffering = { id: customId, name: vals.name }
                    setCustomOfferings(prev => [...prev, newOffering])
                    setCompatibleWith(prev => [...prev, customId])
                  }}
                />
              </div>
            )}
          </Fade>
        )}

        {/* Step 1: Free or Paid - only show when creating from scratch */}
        {showExamples === 'scratch' && offeringType && (
          <Fade key="freepaid">
            <Divider mt={28} mb={28} />
            <SectionQ>Is this offering free or paid?</SectionQ>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <SelCard title="Free" desc="No purchase required." selected={isFree===true} onClick={()=>handleFree(true)}/>
              <SelCard title="Paid" desc="This offering has a cost — customers may be charged before, or after use." selected={isFree===false} onClick={()=>handleFree(false)}/>
            </div>
          </Fade>
        )}

        {/* Step 1b - Free opt-in behavior */}
        {isFree===true && (
          <Fade key="free-optin">
            <div ref={freeOptInRef}>
              <Divider />
              <SectionQ>How do customers access this free offering?</SectionQ>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <SelCard
                  title="Automatic access"
                  desc="Everyone gets it by default. No action needed."
                  selected={freeOptIn==='automatic'}
                  onClick={()=>setFreeOptIn('automatic')}
                />
                <SelCard
                  title="Opt-in required"
                  desc="Customers must explicitly activate or sign up."
                  selected={freeOptIn==='optin'}
                  onClick={()=>setFreeOptIn('optin')}
                />
              </div>
            </div>
          </Fade>
        )}

        {/* Completed components */}
        {isFree===false && components.length>0 && (
          <Fade key={`c${components.length}`}>
            <Divider />
            {offeringType === 'addon' ? (
              /* Standalone add-on - no section headers */
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                  ADD-ON
                </div>
                <CompletedCard
                  comp={components[0]}
                  onEdit={()=>handleEdit(0)}
                  onRemove={()=>setComponents(p=>p.filter((_,j)=>j!==0))}
                />
              </div>
            ) : (
              /* Base offering with optional add-ons */
              <>
                <div style={{ marginBottom: components.length > 1 ? 16 : 0 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                    BASE OFFERING
                  </div>
                  <CompletedCard
                    comp={components[0]}
                    onEdit={()=>handleEdit(0)}
                    onRemove={()=>setComponents(p=>p.filter((_,j)=>j!==0))}
                  />
                </div>

                {/* Add-ons */}
                {components.length > 1 && (
                  <div style={{ background:G50, border:`1px solid ${G100}`, borderRadius:6, padding:12, marginTop:4 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:G500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                      ADD-ONS
                    </div>
                    {components.slice(1).map((comp,i)=>(
                      <CompletedCard
                        key={i+1}
                        comp={comp}
                        onEdit={()=>handleEdit(i+1)}
                        onRemove={()=>setComponents(p=>p.filter((_,j)=>j!==i+1))}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </Fade>
        )}

        {/* Strategy picker */}
        {isFree===false && showPicker && (
          <Fade key="picker">
            <Divider />
            <SectionQ>
              {offeringType === 'addon' ? 'Choose pricing strategy' :
               components.length === 0 ? 'Choose a pricing strategy' : 'Choose add-on pricing strategy'}
            </SectionQ>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: activeType ? 20 : 0 }}>
              {STRATEGIES.map(s=>(
                <SelCard key={s.id} title={s.label} desc={s.desc} selected={activeType===s.id} onClick={()=>setActiveType(s.id)}/>
              ))}
            </div>

            {/* Cancel button - only show when adding a new component (not editing) and already have components */}
            {!activeType && components.length > 0 && editIndex === null && (
              <div style={{ marginTop:12 }}>
                <button
                  onClick={() => {
                    setShowPicker(false)
                    setActiveType(null)
                    setEditingComponent(null)
                  }}
                  style={{
                    background:'none',
                    border:`1px solid ${G200}`,
                    borderRadius:4,
                    padding:'8px 16px',
                    fontSize:13,
                    color:G500,
                    cursor:'pointer',
                    fontFamily:'inherit',
                    transition:'all 0.15s'
                  }}
                  onMouseOver={(e) => { e.target.style.borderColor = G300; e.target.style.color = G700 }}
                  onMouseOut={(e) => { e.target.style.borderColor = G200; e.target.style.color = G500 }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Active form - shown below strategy cards */}
            {activeType && (
              <Fade key={`f-${activeType}-${editIndex}`}>
                <div ref={formRef}>
                  <Divider mt={0} mb={16}/>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:G900 }}>
                      {STRATEGIES.find(s=>s.id===activeType)?.label}
                    </div>
                    {/* Cancel button - only show when adding new component (not editing) */}
                    {editIndex === null && (
                      <button
                        onClick={() => {
                          setActiveType(null)
                          if (components.length > 0) {
                            setShowPicker(false)
                          }
                        }}
                        style={{
                          background:'none',
                          border:'none',
                          fontSize:13,
                          color:G400,
                          cursor:'pointer',
                          fontFamily:'inherit',
                          textDecoration:'underline',
                          padding:0
                        }}
                        onMouseOver={(e) => { e.target.style.color = G700 }}
                        onMouseOut={(e) => { e.target.style.color = G400 }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {stratForms[activeType]}
                </div>
              </Fade>
            )}
          </Fade>
        )}

        {/* Post-strategy actions */}
        {isFree===false && isDone && !showPicker && !activeType && (
          <Fade key="post">
            <Divider />
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              {/* Only show "Add an add-on" if this is a base offering or if no components added yet */}
              {offeringType === 'base' && (
                <BtnGhost onClick={()=>{ setShowPicker(true); setShowTrial(false) }}>Add an add-on</BtnGhost>
              )}
              {offeringType === 'base' && !trial && !showTrial && (
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
              <button onClick={()=>doExport({ offeringType, compatibleWith: offeringType === 'addon' ? compatibleWith : undefined, offeringName: offeringName.trim() || 'Your offering', isFree, freeOptIn, components, trial })} style={{ background:G900, color:'#fff', border:'none', borderRadius:4, padding:'8px 14px', fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
                <svg viewBox="0 0 15 15" width="11" height="11"><path d="M7.5 1v9m-3-3 3 3 3-3M2 11v3h11v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export config
              </button>
            </div>
          </Fade>
        )}

        {isFree && freeOptIn && (
          <Fade key="free-export">
            <Divider />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:G500 }}>Export configuration as JSON</div>
              <button onClick={()=>doExport({ offeringType, compatibleWith: offeringType === 'addon' ? compatibleWith : undefined, offeringName: offeringName.trim() || 'Your offering', isFree, freeOptIn, components:[], trial:null })} style={{ background:G900, color:'#fff', border:'none', borderRadius:4, padding:'8px 14px', fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
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
        <SummaryPanel offeringType={offeringType} compatibleWith={compatibleWith} customOfferings={customOfferings} offeringName={offeringName} isFree={isFree} freeOptIn={freeOptIn} components={components} trial={trial}/>
      </div>

      {/* Sticky Reset Button */}
      <button
        onClick={handleReset}
        style={{
          position:'fixed',
          bottom:24,
          right:24,
          background:'#fff',
          border:`1px solid ${G200}`,
          borderRadius:8,
          padding:'10px 16px',
          fontSize:13,
          fontWeight:500,
          color:G700,
          cursor:'pointer',
          fontFamily:'inherit',
          display:'flex',
          alignItems:'center',
          gap:8,
          boxShadow:'0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          transition:'all 0.2s',
          zIndex:100
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = G50
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)'
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
        Reset
      </button>
    </div>
  )
}
