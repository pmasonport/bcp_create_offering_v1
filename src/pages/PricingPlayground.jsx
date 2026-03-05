import React, { useState, useReducer } from 'react'
import { Link } from 'react-router-dom'
import { SERVICES, SERVICE_FEATURES } from '../data/services'

// Simple reducer for playground state
function reducer(state, action) {
  switch (action.type) {
    case 'SET_STRATEGY':
      return { ...state, strategy: action.value, rateCards: [] }
    case 'SET_EDITING_CARD':
      return { ...state, editingCard: action.value }
    case 'ADD_RATE_CARD':
      return { ...state, rateCards: [...state.rateCards, action.card] }
    case 'REMOVE_RATE_CARD':
      return { ...state, rateCards: state.rateCards.filter((_, i) => i !== action.index) }
    case 'SET_RATE_CARDS':
      return { ...state, rateCards: action.cards }
    default:
      return state
  }
}

export default function PricingPlayground() {
  const [state, dispatch] = useReducer(reducer, {
    strategy: 'payg',
    editingCard: {
      feature: '',
      pricingModel: '',
      perUnitPrice: '',
      blockSize: '',
      blockPrice: '',
      tiers: null,
      billingTiming: 'arrears'
    },
    rateCards: []
  })

  const [editingCard, setEditingCard] = useState({
    feature: '',
    pricingModel: '',
    perUnitPrice: '',
    blockSize: '',
    blockPrice: '',
    tiers: null,
    billingTiming: 'arrears'
  })

  const addRateCard = () => {
    const card = { ...editingCard }
    dispatch({ type: 'ADD_RATE_CARD', card })
    setEditingCard({
      feature: '',
      pricingModel: '',
      perUnitPrice: '',
      blockSize: '',
      blockPrice: '',
      tiers: null,
      billingTiming: 'arrears'
    })
  }

  const addTier = () => {
    const tiers = editingCard.tiers || []
    const lastTier = tiers[tiers.length - 1]
    const newFrom = lastTier.to === Infinity ? lastTier.from + 1000 : lastTier.to + 1
    const updatedTiers = [...tiers]
    if (lastTier.to === Infinity) {
      updatedTiers[updatedTiers.length - 1] = { ...lastTier, to: newFrom - 1 }
    }
    updatedTiers.push({ from: newFrom, to: Infinity, perUnit: '', fixedFee: '' })
    setEditingCard({ ...editingCard, tiers: updatedTiers })
  }

  const updateTier = (tierIndex, field, value) => {
    const tiers = [...editingCard.tiers]
    tiers[tierIndex] = { ...tiers[tierIndex], [field]: value }
    setEditingCard({ ...editingCard, tiers })
  }

  const selectedFeature = editingCard.feature ? (() => {
    const [serviceId, featureSlug] = editingCard.feature.split('_')
    const service = SERVICES.find(s => s.id === serviceId)
    const feature = SERVICE_FEATURES[serviceId]?.find(f => f.slug === featureSlug)
    return { service, feature }
  })() : null

  const isCardValid = () => {
    if (!editingCard.feature || !editingCard.pricingModel) return false
    if (editingCard.pricingModel === 'per-unit') return !!editingCard.perUnitPrice
    if (editingCard.pricingModel === 'block') return !!editingCard.blockSize && !!editingCard.blockPrice
    if (editingCard.pricingModel === 'graduated' || editingCard.pricingModel === 'volume') {
      if (!editingCard.tiers || editingCard.tiers.length === 0) return false
      return editingCard.tiers.every(tier => tier.perUnit !== '' && tier.perUnit !== undefined)
    }
    return false
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-g-900">Pricing Model Playground</h1>
          <p className="text-sm text-g-500 mt-1">Test different pricing models for metered resources</p>
        </div>
        <Link
          to="/"
          className="text-sm text-blue hover:underline"
        >
          ← Back to Catalog
        </Link>
      </div>

      {/* Strategy Selector */}
      <div className="border border-g-200 rounded-md p-6 bg-white mb-6">
        <label className="block text-sm font-semibold text-g-700 mb-3">Monetization Strategy</label>
        <div className="flex gap-2">
          {[
            { value: 'payg', label: 'Pay-as-you-go' },
            { value: 'prepaid', label: 'Prepaid' },
            { value: 'subscription', label: 'Subscription' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => dispatch({ type: 'SET_STRATEGY', value })}
              className={`px-4 py-2 border rounded text-sm font-medium transition-all ${
                state.strategy === value
                  ? 'border-blue bg-blue text-white'
                  : 'border-g-200 text-g-700 hover:border-g-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* PAYG Metered Resources */}
      {state.strategy === 'payg' && (
        <div className="border border-g-200 rounded-md p-6 bg-white">
          <h4 className="text-xs font-semibold text-g-500 uppercase tracking-wider mb-2">Metered Resources</h4>
          <p className="text-sm text-g-500 mb-5">
            Add metered resources to test different pricing models.
          </p>

          {/* Saved rate cards */}
          {state.rateCards.map((card, cardIndex) => {
            const [serviceId, featureSlug] = card.feature.split('_')
            const feature = SERVICE_FEATURES[serviceId]?.find(f => f.slug === featureSlug)
            return (
              <div key={cardIndex} className="border border-g-200 rounded bg-white mb-4 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-g-900">{feature?.name}</div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_RATE_CARD', index: cardIndex })}
                    className="text-g-400 hover:text-g-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-g-600">
                  {card.pricingModel === 'per-unit' && `$${card.perUnitPrice} per ${feature?.name?.toLowerCase()}`}
                  {card.pricingModel === 'block' && `${card.blockSize} units for $${card.blockPrice}`}
                  {card.pricingModel === 'graduated' && 'Graduated pricing'}
                  {card.pricingModel === 'volume' && 'Volume pricing'}
                </div>
              </div>
            )
          })}

          {/* Editing card */}
          <div className="border border-g-200 rounded bg-white mb-4 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <select
                value={editingCard.feature || ''}
                onChange={(e) => {
                  setEditingCard({
                    feature: e.target.value,
                    pricingModel: '',
                    perUnitPrice: '',
                    blockSize: '',
                    blockPrice: '',
                    tiers: null,
                    billingTiming: 'arrears'
                  })
                }}
                className="flex-1 text-base font-medium text-g-900 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="">Select a metered resource...</option>
                {SERVICES.map(service => {
                  const features = (SERVICE_FEATURES[service.id] || []).filter(f => f.metering === 'aggregated')
                  if (features.length === 0) return null
                  return (
                    <optgroup key={service.id} label={service.name}>
                      {features.map(feature => (
                        <option key={`${service.id}_${feature.slug}`} value={`${service.id}_${feature.slug}`}>
                          {feature.name}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
              <svg className="w-5 h-5 text-g-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {editingCard.feature && (
              <div className="px-4 pb-4 border-t border-g-200 pt-4">
                <label className="block text-xs font-semibold text-g-500 uppercase tracking-wider mb-3">Pricing Model</label>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { value: 'per-unit', label: 'Flat per-unit', desc: 'Same price for every unit', bars: [8,8,8,8,8] },
                    { value: 'block', label: 'Block', desc: 'Fixed price per chunk', bars: null },
                    { value: 'graduated', label: 'Graduated', desc: "Each unit at tier's rate", bars: [4,5,6,7,8] },
                    { value: 'volume', label: 'Volume', desc: 'All units at tier rate', bars: null }
                  ].map(({ value, label, desc, bars }) => (
                    <button
                      key={value}
                      onClick={() => {
                        if (value === 'graduated' || value === 'volume') {
                          setEditingCard({
                            ...editingCard,
                            pricingModel: value,
                            tiers: [
                              { from: 0, to: 1000, perUnit: '', fixedFee: '' },
                              { from: 1001, to: Infinity, perUnit: '', fixedFee: '' }
                            ]
                          })
                        } else {
                          setEditingCard({ ...editingCard, pricingModel: value, tiers: null })
                        }
                      }}
                      className={`relative p-4 border rounded text-left transition-all ${
                        editingCard.pricingModel === value
                          ? 'border-blue bg-blue-light/20'
                          : 'border-g-200 hover:border-g-300'
                      }`}
                    >
                      {editingCard.pricingModel === value && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {bars && (
                        <div className="flex gap-0.5 mb-3 h-8 items-end">
                          {bars.map((h, i) => (
                            <div key={i} className={`w-4 rounded-sm ${editingCard.pricingModel === value ? 'bg-blue' : 'bg-g-400'}`} style={{ height: `${h * 3}px` }} />
                          ))}
                        </div>
                      )}
                      <div className="font-medium text-sm text-g-900 mb-1">{label}</div>
                      <div className="text-xs text-g-500">{desc}</div>
                    </button>
                  ))}
                </div>

                {editingCard.pricingModel === 'per-unit' && (
                  <div>
                    <label className="block text-sm font-medium text-g-700 mb-1.5">
                      Price per {selectedFeature?.feature?.name?.toLowerCase() || 'unit'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-g-500">$</span>
                      <input
                        type="number"
                        step="0.001"
                        value={editingCard.perUnitPrice || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, perUnitPrice: e.target.value })}
                        placeholder="0.00"
                        className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
                      />
                    </div>
                  </div>
                )}

                {editingCard.pricingModel === 'block' && (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-g-700 mb-1.5">Block size</label>
                      <input
                        type="number"
                        value={editingCard.blockSize || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, blockSize: e.target.value })}
                        placeholder="1000"
                        className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-g-700 mb-1.5">Price per block</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-g-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editingCard.blockPrice || ''}
                          onChange={(e) => setEditingCard({ ...editingCard, blockPrice: e.target.value })}
                          placeholder="50.00"
                          className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {(editingCard.pricingModel === 'graduated' || editingCard.pricingModel === 'volume') && editingCard.tiers && (
                  <div>
                    <div className="bg-white border border-g-200 rounded overflow-hidden mb-3">
                      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-g-50 border-b border-g-200 text-xs font-semibold text-g-500 uppercase tracking-wider">
                        <div className="col-span-2">From</div>
                        <div className="col-span-2">To</div>
                        <div className="col-span-4">Per Unit</div>
                        <div className="col-span-4">Fixed Fee</div>
                      </div>
                      {editingCard.tiers.map((tier, tierIndex) => (
                        <div key={tierIndex} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-g-200 last:border-b-0">
                          <div className="col-span-2 flex items-center text-sm text-g-600">
                            {tier.from.toLocaleString('en-US')}
                          </div>
                          <div className="col-span-2 flex items-center">
                            {tierIndex === editingCard.tiers.length - 1 ? (
                              <span className="text-sm text-g-600">∞</span>
                            ) : (
                              <input
                                type="number"
                                value={tier.to === Infinity ? '' : tier.to}
                                onChange={(e) => updateTier(tierIndex, 'to', parseInt(e.target.value) || '')}
                                className="w-full px-2 py-1.5 border border-g-200 rounded text-sm"
                              />
                            )}
                          </div>
                          <div className="col-span-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-g-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.perUnit || ''}
                                onChange={(e) => updateTier(tierIndex, 'perUnit', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 border border-g-200 rounded text-sm"
                              />
                            </div>
                          </div>
                          <div className="col-span-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-g-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.fixedFee || ''}
                                onChange={(e) => updateTier(tierIndex, 'fixedFee', e.target.value)}
                                placeholder="—"
                                className="w-full px-2 py-1.5 border border-g-200 rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addTier} className="text-sm text-blue hover:underline">
                      + Add tier
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isCardValid() && (
            <button
              onClick={() => addRateCard()}
              className="text-sm text-blue hover:underline"
            >
              + Add another metered resource
            </button>
          )}
        </div>
      )}
    </div>
  )
}
