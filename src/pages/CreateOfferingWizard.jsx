import React, { useReducer, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Stepper from '../components/Stepper'
import SelectCard from '../components/SelectCard'
import TierBuilder from '../components/TierBuilder'
import Drawer from '../components/Drawer'
import CreateGroupDrawer from '../components/CreateGroupDrawer'
import Toast from '../components/Toast'
import { GROUPS } from '../data/groups'
import { SERVICES, SERVICE_FEATURES } from '../data/services'
import { METERS, METERED_RESOURCES } from '../data/meters'
import { OFFERINGS } from '../data/offerings'
import { deriveAccountType } from '../data/helpers'

// Reducer for complex form state management
const initialState = {
  // Step 1: Basics
  offeringGroup: '',
  name: '',
  slug: '',
  description: '',
  packageType: '', // 'bundle', 'standalone', 'add_on'
  accountType: [], // ['user', 'organization']
  salesChannel: 'both', // 'self-serve', 'sales-led', 'both'
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
    case 'SET_SPECIFIC_DEPENDENCIES':
      return { ...state, specificDependencies: action.value }
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
  const [isEditingSlug, setIsEditingSlug] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [dependencySearch, setDependencySearch] = useState('')
  const [showDependencyDropdown, setShowDependencyDropdown] = useState(false)
  const [showSalesChannelDropdown, setShowSalesChannelDropdown] = useState(false)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)

  // Drawer and toast state
  const [showCreateGroupDrawer, setShowCreateGroupDrawer] = useState(false)
  const [toast, setToast] = useState(null)

  // Calculate derived account type for add-ons
  const derivedAccountType = useMemo(() => {
    if (!isAddon) return null
    return deriveAccountType(state.specificDependencies)
  }, [isAddon, state.specificDependencies])

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
    // For add-ons, use derived account type validation
    const accountTypeValid = isAddon
      ? derivedAccountType !== null
      : state.accountType.length > 0

    return (
      state.offeringGroup &&
      state.name &&
      state.slug &&
      state.packageType &&
      accountTypeValid &&
      state.salesChannel &&
      (!isAddon || state.specificDependencies.length > 0)
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

  // Handle creating new offering group
  const handleGroupCreated = (newGroup) => {
    // Set the newly created group as selected
    dispatch({ type: 'SET_FIELD', field: 'offeringGroup', value: newGroup.id })

    // Close drawer
    setShowCreateGroupDrawer(false)

    // Show success toast
    setToast({ message: `Offering group "${newGroup.name}" created successfully`, type: 'success' })
  }

  // Render Step 1: Basics
  const renderStep1 = () => (
    <div className="border border-g-200 rounded-md p-6 bg-white">
      <h3 className="text-base font-semibold text-g-900 mb-5">
        Basic info
      </h3>

      {/* Offering Group */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1">
          Offering Group <span className="text-red">*</span>
        </label>
        <p className="text-xs text-g-500 mb-2">
          {isAddon ? 'Which product line does this add-on belong to?' : 'Where should this offering be listed?'}
        </p>

        <div className="relative">
          {/* Custom dropdown button */}
          <button
            type="button"
            onClick={() => setShowGroupDropdown(!showGroupDropdown)}
            className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white hover:border-g-300 focus:border-blue focus:outline-none text-left flex items-center justify-between"
          >
            <span className={state.offeringGroup ? 'text-g-900' : 'text-g-400'}>
              {state.offeringGroup
                ? GROUPS.find(g => g.id === state.offeringGroup)?.name
                : 'Select a group...'}
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-2">
              <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {showGroupDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[5]"
                onClick={() => setShowGroupDropdown(false)}
              />

              <div className="absolute z-10 w-full mt-1 border border-g-200 rounded-md bg-white shadow-lg max-h-[320px] overflow-y-auto">
                {GROUPS.map((group, index) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_FIELD', field: 'offeringGroup', value: group.id })
                      setShowGroupDropdown(false)
                    }}
                    className={`w-full text-left px-3.5 py-3 hover:bg-g-50 transition-colors ${
                      index < GROUPS.length - 1 ? 'border-b border-g-100' : ''
                    } ${state.offeringGroup === group.id ? 'bg-blue-light/20' : ''}`}
                  >
                    <div className="text-sm font-medium text-g-900">{group.name}</div>
                    <div className="text-xs text-g-500 mt-0.5">{group.desc || group.short}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setShowCreateGroupDrawer(true)}
          className="mt-2 text-sm text-blue font-medium hover:opacity-80"
        >
          + Create new offering group
        </button>
      </div>

      {/* Name with inline slug */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1">
          Name <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={isAddon ? "e.g., Hardened Images" : "e.g., Docker Pro"}
          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm focus:border-blue focus:outline-none"
        />
        {state.slug && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs text-g-400">→ Slug:</span>
            <span className="text-xs font-mono text-g-500">{state.slug}</span>
          </div>
        )}
      </div>

      {/* Package Type (if not locked to add-on) */}
      {!isAddon && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-1">
            Package Type <span className="text-red">*</span>
          </label>
          <p className="text-xs text-g-500 mb-3">What kind of offering is this?</p>
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

      {/* Compatible Offerings (for add-ons) */}
      {isAddon && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-1">
            Compatible offerings <span className="text-red">*</span>
          </label>
          <p className="text-xs text-g-500 mb-3">
            Select which offerings this add-on can be used with
          </p>

          {/* Multi-select input with chips */}
          <div className="relative">
            <div
              className="min-h-[42px] px-3.5 py-2 border border-g-200 rounded text-sm bg-white focus-within:border-blue cursor-text"
              onClick={() => setShowDependencyDropdown(true)}
            >
              <div className="flex flex-wrap gap-1.5">
                {/* Selected chips */}
                {state.specificDependencies.map(depId => {
                  const offering = OFFERINGS.find(o => o.id === depId)
                  if (!offering) return null
                  return (
                    <span
                      key={depId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-light/30 border border-blue/20 rounded text-xs font-medium text-g-900"
                    >
                      {offering.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch({
                            type: 'SET_SPECIFIC_DEPENDENCIES',
                            value: state.specificDependencies.filter(id => id !== depId)
                          })
                        }}
                        className="hover:text-g-700"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  )
                })}
                {/* Search input */}
                <input
                  type="text"
                  value={dependencySearch}
                  onChange={(e) => {
                    setDependencySearch(e.target.value)
                    setShowDependencyDropdown(true)
                  }}
                  onFocus={() => setShowDependencyDropdown(true)}
                  placeholder={state.specificDependencies.length === 0 ? "Search and select offerings..." : ""}
                  className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-0.5"
                />
              </div>
            </div>

            {/* Dropdown list */}
            {showDependencyDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-[5]"
                  onClick={() => {
                    setShowDependencyDropdown(false)
                    setDependencySearch('')
                  }}
                />

                <div className="absolute z-10 w-full mt-1 border border-g-200 rounded-md bg-white shadow-lg max-h-[280px] overflow-y-auto">
                  {GROUPS.map(group => {
                    const offerings = OFFERINGS.filter(o =>
                      o.group === group.id &&
                      o.pkg !== 'add_on' &&
                      (dependencySearch === '' ||
                       o.name.toLowerCase().includes(dependencySearch.toLowerCase()) ||
                       group.name.toLowerCase().includes(dependencySearch.toLowerCase()))
                    )

                    if (offerings.length === 0) return null

                    return (
                      <div key={group.id} className="border-b border-g-100 last:border-b-0">
                        {/* Group header */}
                        <div className="px-3.5 py-1.5 bg-g-50 text-xs font-medium text-g-600 sticky top-0">
                          {group.name}
                        </div>
                        {/* Offerings in this group */}
                        <div>
                          {offerings.map(offering => {
                            const isSelected = state.specificDependencies.includes(offering.id)
                            return (
                              <button
                                key={offering.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    dispatch({
                                      type: 'SET_SPECIFIC_DEPENDENCIES',
                                      value: state.specificDependencies.filter(id => id !== offering.id)
                                    })
                                  } else {
                                    dispatch({
                                      type: 'SET_SPECIFIC_DEPENDENCIES',
                                      value: [...state.specificDependencies, offering.id]
                                    })
                                  }
                                }}
                                className={`w-full text-left px-3.5 py-2.5 transition-colors border-b border-g-50 last:border-b-0 ${
                                  isSelected ? 'bg-blue-light/20 hover:bg-blue-light/30' : 'hover:bg-g-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {/* Checkbox indicator */}
                                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                                    isSelected ? 'bg-blue border-blue' : 'border-g-300'
                                  }`}>
                                    {isSelected && (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-g-900">{offering.name}</div>
                                    <div className="text-xs text-g-500">
                                      {offering.acct === 'user' && 'Individual users'}
                                      {offering.acct === 'organization' && 'Organizations'}
                                      {offering.acct === 'both' && 'Both'}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  {GROUPS.every(group => {
                    const offerings = OFFERINGS.filter(o =>
                      o.group === group.id &&
                      o.pkg !== 'add_on' &&
                      (dependencySearch === '' ||
                       o.name.toLowerCase().includes(dependencySearch.toLowerCase()) ||
                       group.name.toLowerCase().includes(dependencySearch.toLowerCase()))
                    )
                    return offerings.length === 0
                  }) && (
                    <div className="px-3.5 py-3 text-sm text-g-500 text-center">
                      No offerings found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Selected offerings list */}
          {state.specificDependencies.length > 0 && (
            <div className="mt-3 space-y-2">
              {state.specificDependencies.map(depId => {
                const offering = OFFERINGS.find(o => o.id === depId)
                if (!offering) return null
                const group = GROUPS.find(g => g.id === offering.group)
                return (
                  <div
                    key={depId}
                    className="flex items-center justify-between px-3 py-2 border border-g-200 rounded-md bg-white hover:bg-g-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-g-900">{offering.name}</div>
                      <div className="text-xs text-g-500">{group?.name || offering.group}</div>
                    </div>
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'SET_SPECIFIC_DEPENDENCIES',
                          value: state.specificDependencies.filter(id => id !== depId)
                        })
                      }}
                      className="ml-2 p-1 text-g-400 hover:text-g-700 transition-colors"
                      title="Remove"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Account Type - only show for non-add-ons */}
      {!isAddon && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-1">
            Account Type <span className="text-red">*</span>
          </label>
          <p className="text-xs text-g-500 mb-3">Who can purchase this offering?</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={state.accountType.includes('user')}
                onChange={() => dispatch({ type: 'TOGGLE_ARRAY_FIELD', field: 'accountType', value: 'user' })}
                className="w-4 h-4"
              />
              <span className="text-sm text-g-700">Individual users</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={state.accountType.includes('organization')}
                onChange={() => dispatch({ type: 'TOGGLE_ARRAY_FIELD', field: 'accountType', value: 'organization' })}
                className="w-4 h-4"
              />
              <span className="text-sm text-g-700">Organizations</span>
            </label>
          </div>
        </div>
      )}

      {/* Sales Channel */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-g-700 mb-1">
          Sales Channel <span className="text-red">*</span>
        </label>
        <p className="text-xs text-g-500 mb-2">How will this be sold?</p>

        <div className="relative">
          {/* Custom dropdown button */}
          <button
            type="button"
            onClick={() => setShowSalesChannelDropdown(!showSalesChannelDropdown)}
            className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white hover:border-g-300 focus:border-blue focus:outline-none text-left flex items-center justify-between"
          >
            <span className="text-g-900">
              {state.salesChannel === 'both' && 'Both: self-serve and sales-led'}
              {state.salesChannel === 'self-serve' && 'Self-serve only'}
              {state.salesChannel === 'sales-led' && 'Sales-led only'}
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-2">
              <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {showSalesChannelDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[5]"
                onClick={() => setShowSalesChannelDropdown(false)}
              />

              <div className="absolute z-10 w-full mt-1 border border-g-200 rounded-md bg-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_FIELD', field: 'salesChannel', value: 'both' })
                    setShowSalesChannelDropdown(false)
                  }}
                  className={`w-full text-left px-3.5 py-3 hover:bg-g-50 transition-colors border-b border-g-100 ${
                    state.salesChannel === 'both' ? 'bg-blue-light/20' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-g-900">Both: self-serve and sales-led</div>
                  <div className="text-xs text-g-500 mt-0.5">Available through both channels</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_FIELD', field: 'salesChannel', value: 'self-serve' })
                    setShowSalesChannelDropdown(false)
                  }}
                  className={`w-full text-left px-3.5 py-3 hover:bg-g-50 transition-colors border-b border-g-100 ${
                    state.salesChannel === 'self-serve' ? 'bg-blue-light/20' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-g-900">Self-serve only</div>
                  <div className="text-xs text-g-500 mt-0.5">Users can add it themselves in the product UI</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_FIELD', field: 'salesChannel', value: 'sales-led' })
                    setShowSalesChannelDropdown(false)
                  }}
                  className={`w-full text-left px-3.5 py-3 hover:bg-g-50 transition-colors ${
                    state.salesChannel === 'sales-led' ? 'bg-blue-light/20' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-g-900">Sales-led only</div>
                  <div className="text-xs text-g-500 mt-0.5">Requires sales team to provision</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description - collapsible */}
      <div className="mb-6">
        {showDescription ? (
          <div>
            <label className="block text-sm font-medium text-g-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
              placeholder="Brief description of this offering"
              className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm resize-vertical min-h-[72px] leading-relaxed focus:border-blue focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => setShowDescription(false)}
              className="mt-2 text-xs text-g-500 hover:text-g-700"
            >
              Remove description
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDescription(true)}
            className="text-sm text-blue font-medium hover:opacity-80"
          >
            + Add description (optional)
          </button>
        )}
      </div>

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
          Continue to Pricing →
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
    <div className="border border-g-200 rounded-md p-6 bg-white">
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
      <div className="border border-g-200 rounded-md p-6 bg-white">
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
    <div>
      {/* Breadcrumb Area */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-g-500 hover:text-g-700 transition-colors"
        >
          <span>←</span>
          <span className="font-medium text-g-900">Offerings</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-g-900">
          Create {isAddon ? 'Add-on' : 'Offering'}
        </h1>
        <p className="text-sm text-g-500 mt-1.5 leading-relaxed">
          {isAddon
            ? 'Configure an add-on that extends an existing offering or product line.'
            : 'Configure a new offering for the product catalog.'
          }
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        steps={['Basics', 'Pricing', 'Entitlements & Review']}
        currentStep={currentStep}
      />

      {/* Form Steps */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Drawer */}
      {showCreateGroupDrawer && (
        <Drawer
          content={
            <CreateGroupDrawer
              onClose={() => setShowCreateGroupDrawer(false)}
              onCreate={handleGroupCreated}
            />
          }
          onClose={() => setShowCreateGroupDrawer(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
