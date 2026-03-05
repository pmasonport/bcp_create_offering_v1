import React, { useReducer, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Stepper from '../components/Stepper'
import SelectCard from '../components/SelectCard'
import TierBuilder from '../components/TierBuilder'
import { GROUPS } from '../data/groups'
import { SERVICES, SERVICE_FEATURES } from '../data/services'
import { METERS, METERED_RESOURCES } from '../data/meters'

// Reducer for complex form state management
const initialState = {
  // Step 1: Basics
  offeringGroup: '',
  name: '',
  slug: '',
  description: '',
  packageType: '', // 'bundle', 'standalone', 'add_on'
  accountType: [], // ['user', 'organization']
  salesChannel: [], // ['self-serve', 'sales-led']
  dependencyType: 'any-in-group', // 'any-in-group', 'specific-in-group', 'other-group'
  dependencyGroup: '',
  specificDependencies: [],

  // Step 2: Pricing
  isPaid: null, // null, true, false
  monetizationStrategy: '', // 'subscription', 'payg', 'prepaid', 'one-time'
  rateCards: [],

  // Step 3: Entitlements
  selectedServices: [],
  featureValues: {}, // { serviceId_featureSlug: value }
  featureRecurrence: {}, // { serviceId_featureSlug: recurrence }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'TOGGLE_ARRAY_FIELD':
      const arr = state[action.field]
      const exists = arr.includes(action.value)
      return {
        ...state,
        [action.field]: exists
          ? arr.filter(v => v !== action.value)
          : [...arr, action.value]
      }
    case 'ADD_RATE_CARD':
      return { ...state, rateCards: [...state.rateCards, action.card] }
    case 'UPDATE_RATE_CARD':
      return {
        ...state,
        rateCards: state.rateCards.map((card, i) =>
          i === action.index ? { ...card, ...action.updates } : card
        )
      }
    case 'REMOVE_RATE_CARD':
      return {
        ...state,
        rateCards: state.rateCards.filter((_, i) => i !== action.index)
      }
    case 'TOGGLE_SERVICE':
      const services = state.selectedServices
      const hasService = services.includes(action.serviceId)
      return {
        ...state,
        selectedServices: hasService
          ? services.filter(s => s !== action.serviceId)
          : [...services, action.serviceId]
      }
    case 'SET_FEATURE_VALUE':
      return {
        ...state,
        featureValues: { ...state.featureValues, [action.key]: action.value }
      }
    case 'SET_FEATURE_RECURRENCE':
      return {
        ...state,
        featureRecurrence: { ...state.featureRecurrence, [action.key]: action.value }
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export default function CreateOfferingWizard({ isAddon = false }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('group')

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    offeringGroup: groupId || '',
    packageType: isAddon ? 'add_on' : ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroupInput, setShowNewGroupInput] = useState(false)

  // Current rate card being edited (for step 2)
  const [editingCard, setEditingCard] = useState({
    feature: '',
    meter: '',
    resource: '',
    pricingModel: '', // 'fixed', 'per-unit', 'block', 'graduated', 'volume'
    billingPeriod: '', // 'monthly', 'annual', 'both'
    monthlyPrice: '',
    annualPrice: '',
    perUnitPrice: '',
    blockSize: '',
    blockPrice: '',
    tiers: [
      { from: 0, to: 1000, perUnit: '', fixed: '' },
      { from: 1001, to: '∞', perUnit: '', fixed: '' }
    ],
    billingTiming: 'advance',
    billingCycle: 'monthly',
    expiration: 'end-of-period'
  })

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    dispatch({ type: 'SET_FIELD', field: 'name', value })
    if (!state.slug || state.slug === slugify(state.name)) {
      dispatch({ type: 'SET_FIELD', field: 'slug', value: slugify(value) })
    }
  }

  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Step 1 validation
  const canProceedStep1 = () => {
    return (
      state.offeringGroup &&
      state.name &&
      state.slug &&
      state.packageType &&
      state.accountType.length > 0 &&
      state.salesChannel.length > 0 &&
      (!isAddon || state.dependencyType)
    )
  }

  // Step 2 validation
  const canProceedStep2 = () => {
    if (state.isPaid === null) return false
    if (!state.isPaid) return true // Free offerings skip pricing config
    return state.rateCards.length > 0
  }

  // Handle adding a rate card
  const addRateCard = () => {
    const card = { ...editingCard }
    dispatch({ type: 'ADD_RATE_CARD', card })

    // Reset editing card
    setEditingCard({
      feature: '',
      meter: '',
      resource: '',
      pricingModel: '',
      billingPeriod: '',
      monthlyPrice: '',
      annualPrice: '',
      perUnitPrice: '',
      blockSize: '',
      blockPrice: '',
      tiers: [
        { from: 0, to: 1000, perUnit: '', fixed: '' },
        { from: 1001, to: '∞', perUnit: '', fixed: '' }
      ],
      billingTiming: 'advance',
      billingCycle: 'monthly',
      expiration: 'end-of-period'
    })
  }

  // Get required features from pricing configuration
  const getRequiredFeatures = () => {
    const required = new Set()
    state.rateCards.forEach(card => {
      if (card.feature) required.add(card.feature)
      if (card.meter) {
        const meter = METERS.find(m => m.id === card.meter)
        if (meter?.feature) required.add(meter.feature)
      }
    })
    return required
  }

  const handleSave = (addAnother = false) => {
    // In real app, this would save to backend
    console.log('Saving offering:', state)

    if (addAnother) {
      dispatch({ type: 'RESET' })
      setCurrentStep(1)
    } else {
      navigate(`/offerings/groups/${state.offeringGroup}`)
    }
  }

  // Render Step 1: Basics
  const renderStep1 = () => (
    <div className="border border-g-200 rounded-md p-6 mt-3 bg-white">
      <h3 className="text-base font-semibold text-g-900 mb-5">Offering Basics</h3>

      {/* Offering Group */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1.5">
          Offering Group <span className="text-red">*</span>
        </label>
        {showNewGroupInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm focus:border-blue focus:outline-none"
            />
            <button
              onClick={() => {
                // In real app, create new group
                dispatch({ type: 'SET_FIELD', field: 'offeringGroup', value: slugify(newGroupName) })
                setShowNewGroupInput(false)
              }}
              className="px-4 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewGroupInput(false)}
              className="px-4 py-2.5 border border-g-200 text-sm font-medium rounded hover:bg-g-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <select
              value={state.offeringGroup}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'offeringGroup', value: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white focus:border-blue focus:outline-none appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20viewBox%3D%270%200%2010%206%27%20fill%3D%27none%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%239CA3AF%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] pr-9"
            >
              <option value="">Select a group...</option>
              {GROUPS.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewGroupInput(true)}
              className="mt-2 text-sm text-blue font-medium hover:opacity-80"
            >
              + Create new group
            </button>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1.5">
          Offering Name <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., Docker Pro"
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm focus:border-blue focus:outline-none"
        />
      </div>

      {/* Slug */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1.5">
          Slug <span className="text-red">*</span>
          <span className="text-xs text-g-400 font-normal ml-1.5">Auto-generated, editable</span>
        </label>
        <input
          type="text"
          value={state.slug}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'slug', value: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm font-mono text-g-500 focus:border-blue focus:outline-none"
        />
      </div>

      {/* Package Type (if not locked to add-on) */}
      {!isAddon && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-3">
            Package Type <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <SelectCard
              icon="📦"
              title="Bundle"
              description="Combination of multiple services"
              selected={state.packageType === 'bundle'}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'packageType', value: 'bundle' })}
            />
            <SelectCard
              icon="⬜"
              title="Standalone"
              description="Single service offering"
              selected={state.packageType === 'standalone'}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'packageType', value: 'standalone' })}
            />
          </div>
        </div>
      )}

      {/* Account Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-3">
          Account Type <span className="text-red">*</span>
        </label>
        <div className="flex gap-1">
          {['user', 'organization'].map(type => (
            <button
              key={type}
              onClick={() => dispatch({ type: 'TOGGLE_ARRAY_FIELD', field: 'accountType', value: type })}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                ${state.accountType.includes(type)
                  ? 'border-blue bg-blue-light text-blue'
                  : 'border-g-200 bg-white text-g-600 hover:border-g-300 hover:bg-g-50'
                }
              `}
            >
              {type === 'organization' ? 'org' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Channel */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-3">
          Sales Channel <span className="text-red">*</span>
        </label>
        <div className="flex gap-1">
          {['self-serve', 'sales-led'].map(channel => (
            <button
              key={channel}
              onClick={() => dispatch({ type: 'TOGGLE_ARRAY_FIELD', field: 'salesChannel', value: channel })}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                ${state.salesChannel.includes(channel)
                  ? 'border-blue bg-blue-light text-blue'
                  : 'border-g-200 bg-white text-g-600 hover:border-g-300 hover:bg-g-50'
                }
              `}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1.5">
          Description
        </label>
        <textarea
          value={state.description}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
          placeholder="Brief description of this offering"
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm resize-vertical min-h-[56px] leading-relaxed focus:border-blue focus:outline-none"
        />
      </div>

      {/* Dependency Configuration (for add-ons) */}
      {isAddon && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-3">
            What does this add-on require? <span className="text-red">*</span>
          </label>
          <div className="space-y-1.5">
            <label className="flex items-start gap-3 p-3 border border-g-200 rounded cursor-pointer hover:border-g-300 transition-all">
              <input
                type="radio"
                name="dependency"
                checked={state.dependencyType === 'any-in-group'}
                onChange={() => dispatch({ type: 'SET_FIELD', field: 'dependencyType', value: 'any-in-group' })}
                className="mt-0.5"
              />
              <div>
                <div className="text-[13px] font-medium text-g-900">Any offering in this product line</div>
                <div className="text-xs text-g-500 mt-0.5">
                  Requires any offering in {GROUPS.find(g => g.id === state.offeringGroup)?.name || 'this group'}
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-g-200 rounded cursor-pointer hover:border-g-300 transition-all">
              <input
                type="radio"
                name="dependency"
                checked={state.dependencyType === 'specific-in-group'}
                onChange={() => dispatch({ type: 'SET_FIELD', field: 'dependencyType', value: 'specific-in-group' })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-[13px] font-medium text-g-900">Specific offerings in this product line</div>
                {state.dependencyType === 'specific-in-group' && (
                  <div className="mt-2 p-3 border border-g-100 rounded bg-g-50">
                    <p className="text-xs text-g-500 mb-2">Select required offerings:</p>
                    {/* In real app, show offering picker */}
                    <input
                      type="text"
                      placeholder="Type to search offerings..."
                      className="w-full px-2.5 py-1.5 border border-g-200 rounded text-xs bg-white"
                    />
                  </div>
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-g-200 rounded cursor-pointer hover:border-g-300 transition-all">
              <input
                type="radio"
                name="dependency"
                checked={state.dependencyType === 'other-group'}
                onChange={() => dispatch({ type: 'SET_FIELD', field: 'dependencyType', value: 'other-group' })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-[13px] font-medium text-g-900">An offering in a different product line</div>
                {state.dependencyType === 'other-group' && (
                  <div className="mt-2 p-3 border border-g-100 rounded bg-g-50">
                    <select
                      value={state.dependencyGroup}
                      onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'dependencyGroup', value: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-g-200 rounded text-xs bg-white mb-2"
                    >
                      <option value="">Select a product line...</option>
                      {GROUPS.filter(g => g.id !== state.offeringGroup).map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                    {state.dependencyGroup && (
                      <label className="flex items-center gap-2 text-xs text-g-600">
                        <input type="checkbox" />
                        Any offering in this group
                      </label>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Button Row */}
      <div className="flex gap-2 mt-6 pt-5 border-t border-g-200 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-white text-g-700 border border-g-200 rounded text-sm font-medium hover:border-g-300 hover:bg-g-50"
        >
          Cancel
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!canProceedStep1()}
          className="px-5 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Continue to Pricing
        </button>
      </div>
    </div>
  )

  // Render Step 2: Pricing (split into multiple functions due to size)
  const renderSubscriptionConfig = () => (
    <div className="mb-6 p-4 border border-g-200 rounded bg-g-50">
      <h4 className="text-sm font-semibold text-g-900 mb-4">Subscription Configuration</h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-g-700 mb-1.5">
          What is being charged for?
        </label>
        <select
          value={editingCard.feature}
          onChange={(e) => setEditingCard({ ...editingCard, feature: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white"
        >
          <option value="">Select a feature...</option>
          <optgroup label="General">
            <option value="general_seats">Seats (General)</option>
          </optgroup>
          <optgroup label="Docker Build">
            <option value="build_minutes">Build Minutes (Docker Build)</option>
          </optgroup>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-g-700 mb-3">Pricing model</label>
        <div className="flex gap-2">
          <button
            onClick={() => setEditingCard({ ...editingCard, pricingModel: 'fixed' })}
            className={`flex-1 px-3 py-2 border rounded text-sm font-medium transition-all ${
              editingCard.pricingModel === 'fixed'
                ? 'border-blue bg-blue-light text-blue'
                : 'border-g-200 bg-white text-g-600 hover:bg-g-50'
            }`}
          >
            Fixed amount
          </button>
          <button
            onClick={() => setEditingCard({ ...editingCard, pricingModel: 'per-unit' })}
            className={`flex-1 px-3 py-2 border rounded text-sm font-medium transition-all ${
              editingCard.pricingModel === 'per-unit'
                ? 'border-blue bg-blue-light text-blue'
                : 'border-g-200 bg-white text-g-600 hover:bg-g-50'
            }`}
          >
            Per unit
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-g-700 mb-3">Billing period</label>
        <div className="flex gap-2">
          {['monthly', 'annual', 'both'].map(period => (
            <button
              key={period}
              onClick={() => setEditingCard({ ...editingCard, billingPeriod: period })}
              className={`flex-1 px-3 py-2 border rounded text-sm font-medium transition-all ${
                editingCard.billingPeriod === period
                  ? 'border-blue bg-blue-light text-blue'
                  : 'border-g-200 bg-white text-g-600 hover:bg-g-50'
              }`}
            >
              {period === 'both' ? 'Monthly & annual' : period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {(editingCard.billingPeriod === 'monthly' || editingCard.billingPeriod === 'both') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-g-700 mb-1.5">Monthly price</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-g-500">$</span>
            <input
              type="number"
              step="0.01"
              value={editingCard.monthlyPrice}
              onChange={(e) => setEditingCard({ ...editingCard, monthlyPrice: e.target.value })}
              placeholder="0.00"
              className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
            />
          </div>
        </div>
      )}

      {(editingCard.billingPeriod === 'annual' || editingCard.billingPeriod === 'both') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-g-700 mb-1.5">Annual price</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-g-500">$</span>
            <input
              type="number"
              step="0.01"
              value={editingCard.annualPrice}
              onChange={(e) => setEditingCard({ ...editingCard, annualPrice: e.target.value })}
              placeholder="0.00"
              className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
            />
          </div>
        </div>
      )}

      <button
        onClick={addRateCard}
        disabled={!editingCard.pricingModel || !editingCard.billingPeriod || (!editingCard.monthlyPrice && !editingCard.annualPrice)}
        className="w-full px-4 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-35"
      >
        Add Rate Card
      </button>
    </div>
  )

  const renderPaygConfig = () => (
    <div className="mb-6 p-4 border border-g-200 rounded bg-g-50">
      <h4 className="text-sm font-semibold text-g-900 mb-4">Pay-As-You-Go Configuration</h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-g-700 mb-1.5">Which meter?</label>
        <select
          value={editingCard.meter}
          onChange={(e) => setEditingCard({ ...editingCard, meter: e.target.value, resource: '' })}
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white"
        >
          <option value="">Select a meter...</option>
          {METERS.map(meter => (
            <option key={meter.id} value={meter.id}>
              {meter.name} ({meter.unit})
            </option>
          ))}
        </select>
      </div>

      {editingCard.meter && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-g-700 mb-1.5">Which resource?</label>
          <select
            value={editingCard.resource}
            onChange={(e) => setEditingCard({ ...editingCard, resource: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white"
          >
            <option value="">Select a resource...</option>
            {METERED_RESOURCES.filter(r => r.meters.includes(editingCard.meter)).map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} — {resource.desc}
              </option>
            ))}
          </select>
        </div>
      )}

      {editingCard.resource && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-g-700 mb-3">Pricing model</label>
            <div className="grid grid-cols-4 gap-2">
              {['per-unit', 'block', 'graduated', 'volume'].map(model => (
                <button
                  key={model}
                  onClick={() => setEditingCard({ ...editingCard, pricingModel: model })}
                  className={`p-3 border rounded text-xs font-medium transition-all ${
                    editingCard.pricingModel === model
                      ? 'border-blue bg-blue-light text-blue'
                      : 'border-g-200 bg-white text-g-600 hover:bg-g-50'
                  }`}
                >
                  <div className="mb-1 text-base">{model === 'per-unit' && '▌▌▌▌'}{model === 'block' && '▌▌ ▌▌'}{model === 'graduated' && '▌ ▌ ▌'}{model === 'volume' && '▌▌ ▌▌'}</div>
                  <div>{model.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                </button>
              ))}
            </div>
          </div>

          {editingCard.pricingModel === 'per-unit' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-g-700 mb-1.5">Price per unit</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-g-500">$</span>
                <input
                  type="number"
                  step="0.001"
                  value={editingCard.perUnitPrice}
                  onChange={(e) => setEditingCard({ ...editingCard, perUnitPrice: e.target.value })}
                  placeholder="0.00"
                  className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
                />
              </div>
            </div>
          )}

          {editingCard.pricingModel === 'block' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-g-700 mb-1.5">Block size</label>
                <input
                  type="number"
                  value={editingCard.blockSize}
                  onChange={(e) => setEditingCard({ ...editingCard, blockSize: e.target.value })}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-g-700 mb-1.5">Price per block</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-g-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editingCard.blockPrice}
                    onChange={(e) => setEditingCard({ ...editingCard, blockPrice: e.target.value })}
                    placeholder="25.00"
                    className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {(editingCard.pricingModel === 'graduated' || editingCard.pricingModel === 'volume') && (
            <div className="mb-4">
              <TierBuilder
                tiers={editingCard.tiers}
                onChange={(tiers) => setEditingCard({ ...editingCard, tiers })}
              />
            </div>
          )}

          <button
            onClick={addRateCard}
            disabled={!editingCard.pricingModel}
            className="w-full px-4 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-35"
          >
            Add Rate Card
          </button>
        </>
      )}
    </div>
  )

  const renderPrepaidConfig = () => (
    <div className="mb-6 p-4 border border-g-200 rounded bg-g-50">
      <h4 className="text-sm font-semibold text-g-900 mb-4">Prepaid Configuration</h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-g-700 mb-1.5">What is being sold?</label>
        <select
          value={editingCard.feature}
          onChange={(e) => setEditingCard({ ...editingCard, feature: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white"
        >
          <option value="">Select a feature...</option>
          <option value="build_minutes">Build minutes (Docker Build)</option>
          <option value="tc_minutes">TC runtime minutes (Testcontainers Cloud)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-g-700 mb-1.5">Block size</label>
          <input
            type="number"
            value={editingCard.blockSize}
            onChange={(e) => setEditingCard({ ...editingCard, blockSize: e.target.value })}
            placeholder="500"
            className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-g-700 mb-1.5">Block price</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-g-500">$</span>
            <input
              type="number"
              step="0.01"
              value={editingCard.blockPrice}
              onChange={(e) => setEditingCard({ ...editingCard, blockPrice: e.target.value })}
              placeholder="25.00"
              className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={addRateCard}
        disabled={!editingCard.feature || !editingCard.blockSize || !editingCard.blockPrice}
        className="w-full px-4 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-35"
      >
        Add Rate Card
      </button>
    </div>
  )

  const renderOneTimeConfig = () => (
    <div className="mb-6 p-4 border border-g-200 rounded bg-g-50">
      <h4 className="text-sm font-semibold text-g-900 mb-4">One-Time Payment Configuration</h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-g-700 mb-1.5">Price</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-g-500">$</span>
          <input
            type="number"
            step="0.01"
            value={editingCard.monthlyPrice}
            onChange={(e) => setEditingCard({ ...editingCard, monthlyPrice: e.target.value })}
            placeholder="500.00"
            className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
          />
        </div>
      </div>

      <button
        onClick={addRateCard}
        disabled={!editingCard.monthlyPrice}
        className="w-full px-4 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-35"
      >
        Add Rate Card
      </button>
    </div>
  )

  const renderStep2 = () => (
    <div className="border border-g-200 rounded-md p-6 mt-3 bg-white">
      <h3 className="text-base font-semibold text-g-900 mb-5">Pricing Configuration</h3>

      {state.isPaid === null && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-3">
            Is this offering free or paid? <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <SelectCard
              title="Free"
              description="No charge to customers"
              selected={state.isPaid === false}
              onClick={() => {
                dispatch({ type: 'SET_FIELD', field: 'isPaid', value: false })
                dispatch({
                  type: 'ADD_RATE_CARD',
                  card: { pricingModel: 'fixed', price: 0, billingTiming: 'advance', billingCycle: 'monthly' }
                })
              }}
            />
            <SelectCard
              title="Paid"
              description="Customers pay for this offering"
              selected={state.isPaid === true}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'isPaid', value: true })}
            />
          </div>
        </div>
      )}

      {state.isPaid === true && !state.monetizationStrategy && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-3">
            How will customers pay? <span className="text-red">*</span>
          </label>
          <div className="space-y-1.5">
            {[
              { value: 'subscription', label: 'Recurring subscription', desc: 'Charged on a recurring basis (monthly, annual, or both)' },
              { value: 'payg', label: 'Pay-as-you-go', desc: 'Charged based on actual usage at end of billing period' },
              { value: 'prepaid', label: 'Prepaid top-ups', desc: 'Customer purchases credits/blocks upfront, draws down over time' },
              { value: 'one-time', label: 'One-time payment', desc: 'Single charge, no recurrence' }
            ].map(({ value, label, desc }) => (
              <label
                key={value}
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'monetizationStrategy', value })}
                className="flex items-start gap-3 p-3 border border-g-200 rounded cursor-pointer hover:border-g-300 transition-all"
              >
                <div className="w-4 h-4 border-2 border-g-300 rounded-full mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[13px] font-medium text-g-900">{label}</div>
                  <div className="text-xs text-g-500 mt-0.5">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {state.rateCards.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-3">Rate Cards</label>
          {state.rateCards.map((card, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-g-200 rounded mb-2 bg-white hover:border-g-300 transition-all">
              <div className="flex-1">
                <div className="text-sm font-semibold text-g-900">
                  {card.pricingModel === 'fixed' && `Fixed${card.price > 0 ? ` · $${card.price}` : ' · Free'}`}
                  {card.pricingModel === 'per-unit' && `Per unit · $${card.perUnitPrice}`}
                  {card.pricingModel === 'block' && `Block · ${card.blockSize} units · $${card.blockPrice}`}
                  {card.pricingModel === 'graduated' && 'Graduated pricing'}
                  {card.pricingModel === 'volume' && 'Volume pricing'}
                </div>
                <div className="text-xs text-g-400 mt-1">
                  {card.billingTiming} · {card.billingCycle}
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE_RATE_CARD', index })}
                className="w-7 h-7 border border-g-200 rounded flex items-center justify-center text-g-400 hover:border-g-300 hover:text-g-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {state.monetizationStrategy === 'subscription' && renderSubscriptionConfig()}
      {state.monetizationStrategy === 'payg' && renderPaygConfig()}
      {state.monetizationStrategy === 'prepaid' && renderPrepaidConfig()}
      {state.monetizationStrategy === 'one-time' && renderOneTimeConfig()}

      <div className="flex gap-2 mt-6 pt-5 border-t border-g-200 justify-end">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-5 py-2.5 bg-white text-g-700 border border-g-200 rounded text-sm font-medium hover:border-g-300 hover:bg-g-50"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={!canProceedStep2()}
          className="px-5 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-35"
        >
          Continue to Entitlements
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const requiredFeatures = getRequiredFeatures()

    return (
      <div className="border border-g-200 rounded-md p-6 mt-3 bg-white">
        <h3 className="text-base font-semibold text-g-900 mb-5">Entitlements & Review</h3>

        {requiredFeatures.size > 0 && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wider mb-3">
              Required by Pricing
            </div>
            <p className="text-xs text-g-500 mb-3">
              These features are needed to support your rate card configuration.
            </p>
            {Array.from(requiredFeatures).map(featureKey => (
              <div key={featureKey} className="p-3 border border-g-200 rounded mb-2 bg-blue-bg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-g-900">{featureKey}</div>
                    <div className="text-xs text-g-500 mt-0.5">Required by pricing</div>
                  </div>
                  <input
                    type="number"
                    value={state.featureValues[featureKey] || ''}
                    onChange={(e) => dispatch({ type: 'SET_FEATURE_VALUE', key: featureKey, value: e.target.value })}
                    placeholder="Value"
                    className="w-24 px-2 py-1 border border-g-200 rounded text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wider mb-3">
            Additional Services & Features
          </div>
          <p className="text-xs text-g-500 mb-3">
            Select any additional services and configure their entitlements.
          </p>
          {SERVICES.map(service => {
            const isSelected = state.selectedServices.includes(service.id)
            const features = SERVICE_FEATURES[service.id] || []

            return (
              <div key={service.id} className="border border-g-200 rounded mb-2 overflow-hidden">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_SERVICE', serviceId: service.id })}
                  className="w-full px-4 py-3 bg-g-50 border-b border-g-200 flex items-center justify-between hover:bg-g-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-semibold text-g-900 text-left">{service.name}</div>
                      <div className="text-xs text-g-400 text-left">{features.length} features</div>
                    </div>
                  </div>
                  <div className="text-g-400">{isSelected ? '▼' : '▶'}</div>
                </button>

                {isSelected && (
                  <div className="p-4 bg-white">
                    {features.map(feat => {
                      const key = `${service.id}_${feat.slug}`
                      return (
                        <div key={feat.slug} className="flex items-center justify-between py-2 border-b border-g-100 last:border-b-0">
                          <div className="flex-1">
                            <div className="text-sm text-g-900">{feat.name}</div>
                            <div className="text-xs text-g-500">{feat.desc}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {feat.type === 'boolean' && (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={state.featureValues[key] || false}
                                  onChange={(e) => dispatch({ type: 'SET_FEATURE_VALUE', key, value: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs text-g-500">Enabled</span>
                              </label>
                            )}
                            {feat.type === 'integer' && (
                              <input
                                type="number"
                                value={state.featureValues[key] || ''}
                                onChange={(e) => dispatch({ type: 'SET_FEATURE_VALUE', key, value: e.target.value })}
                                placeholder="0"
                                className="w-20 px-2 py-1 border border-g-200 rounded text-sm"
                              />
                            )}
                            {feat.type === 'string' && (
                              <input
                                type="text"
                                value={state.featureValues[key] || ''}
                                onChange={(e) => dispatch({ type: 'SET_FEATURE_VALUE', key, value: e.target.value })}
                                placeholder="Value"
                                className="w-32 px-2 py-1 border border-g-200 rounded text-sm"
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-g-200">
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wider mb-3">Review</div>
          <div className="border border-g-200 rounded p-5 bg-white">
            <div className="text-base font-semibold text-g-900">{state.name}</div>
            <div className="text-xs font-mono text-g-400 mt-1">{state.slug}</div>
            {state.description && (
              <p className="text-sm text-g-500 mt-2">{state.description}</p>
            )}

            <div className="flex gap-1 mt-3">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                state.packageType === 'bundle' ? 'bg-blue-light text-blue' :
                state.packageType === 'add_on' ? 'bg-g-100 text-g-500' :
                'bg-g-100 text-g-600'
              }`}>
                {state.packageType === 'add_on' ? 'add-on' : state.packageType}
              </span>
              {state.isPaid !== null && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  state.isPaid ? 'bg-green/10 text-green' : 'bg-g-100 text-g-600'
                }`}>
                  {state.isPaid ? state.monetizationStrategy : 'free'}
                </span>
              )}
              {state.accountType.map(type => (
                <span key={type} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-g-400 border border-g-200">
                  {type === 'organization' ? 'org' : type}
                </span>
              ))}
            </div>

            {state.rateCards.length > 0 && (
              <div className="mt-4 pt-4 border-t border-g-100">
                <div className="text-xs font-semibold text-g-600 mb-2">Rate Cards:</div>
                {state.rateCards.map((card, i) => (
                  <div key={i} className="text-xs text-g-600 py-1">
                    • {card.pricingModel} · {card.billingTiming} · {card.billingCycle}
                  </div>
                ))}
              </div>
            )}

            {state.selectedServices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-g-100">
                <div className="text-xs font-semibold text-g-600 mb-2">Services:</div>
                <div className="text-xs text-g-600">
                  {state.selectedServices.map(sId => SERVICES.find(s => s.id === sId)?.name).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-5 border-t border-g-200 justify-end">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-5 py-2.5 bg-white text-g-700 border border-g-200 rounded text-sm font-medium hover:border-g-300 hover:bg-g-50"
          >
            Back
          </button>
          <button
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 bg-white text-g-700 border border-g-200 rounded text-sm font-medium hover:border-g-300 hover:bg-g-50"
          >
            Save & return
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-5 py-2.5 bg-blue text-white text-sm font-medium rounded hover:opacity-90"
          >
            Save & add another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[960px] px-10 py-12 pb-40">
      <button
        onClick={() => navigate(-1)}
        className="text-[13px] text-g-400 hover:text-g-700 inline-flex items-center gap-1 mb-6 border-0 bg-transparent cursor-pointer"
      >
        ← <span className="text-g-900 font-medium">Offerings</span>
      </button>

      <h1 className="text-2xl font-semibold tracking-tight text-g-900">
        Create {isAddon ? 'Add-on' : 'Offering'}
      </h1>
      <p className="text-sm text-g-500 mt-1.5 leading-relaxed">
        {isAddon
          ? 'Configure an add-on that extends an existing offering or product line.'
          : 'Configure a new offering for the product catalog.'
        }
      </p>

      <Stepper
        steps={['Basics', 'Pricing', 'Entitlements & Review']}
        currentStep={currentStep}
      />

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  )
}
