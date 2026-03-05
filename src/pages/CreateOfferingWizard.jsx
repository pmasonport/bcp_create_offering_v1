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
  pricingModel: '', // 'fixed', 'per-unit' - set before feature selection for subscription
  selectedFeature: '', // For subscription/prepaid/one-time
  selectedMeter: '', // For PAYG
  selectedResource: '', // For metered features/meters
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
    case 'SET_RATE_CARDS':
      return { ...state, rateCards: action.cards }
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

  // Auto-generate slug from name with group prefix
  const handleNameChange = (value) => {
    dispatch({ type: 'SET_FIELD', field: 'name', value })
    if (!state.slug || state.slug === slugify(state.name, state.offeringGroup)) {
      dispatch({ type: 'SET_FIELD', field: 'slug', value: slugify(value, state.offeringGroup) })
    }
  }

  // Update slug when group changes
  const handleGroupChange = (groupId) => {
    dispatch({ type: 'SET_FIELD', field: 'offeringGroup', value: groupId })
    // Re-generate slug with new group prefix if it was auto-generated
    if (state.name && (!state.slug || state.slug === slugify(state.name, state.offeringGroup))) {
      dispatch({ type: 'SET_FIELD', field: 'slug', value: slugify(state.name, groupId) })
    }
  }

  const slugify = (text, groupId = '') => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Prefix with group slug if available
    if (groupId) {
      return `${groupId}-${baseSlug}`
    }
    return baseSlug
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
  // Helper to check if PAYG editing card is valid
  const isPaygEditingCardValid = () => {
    if (!editingCard.feature || !editingCard.pricingModel) return false

    if (editingCard.pricingModel === 'per-unit') {
      return !!editingCard.perUnitPrice
    }

    if (editingCard.pricingModel === 'block') {
      return !!editingCard.blockSize && !!editingCard.blockPrice
    }

    if (editingCard.pricingModel === 'graduated' || editingCard.pricingModel === 'volume') {
      if (!editingCard.tiers || editingCard.tiers.length === 0) return false
      // Check that all tiers have at least perUnit filled
      return editingCard.tiers.every(tier => tier.perUnit !== '' && tier.perUnit !== undefined)
    }

    return false
  }

  const canProceedStep2 = () => {
    // Must select free or paid
    if (state.isPaid === null) return false

    // Free offerings only need the free rate card (auto-added)
    if (state.isPaid === false) return state.rateCards.length > 0

    // Paid offerings need a strategy
    if (!state.monetizationStrategy) return false

    // For subscription, validate fields are filled instead of checking rate cards
    if (state.monetizationStrategy === 'subscription') {
      if (!state.pricingModel) return false
      if (state.pricingModel === 'per-unit' && !state.selectedFeature) return false
      if (!editingCard.billingTiming) return false
      if (!editingCard.billingPeriod) return false

      // Check that at least one price is entered
      if (editingCard.billingPeriod === 'monthly' && !editingCard.monthlyPrice) return false
      if (editingCard.billingPeriod === 'annual' && !editingCard.annualPrice) return false
      if (editingCard.billingPeriod === 'both' && (!editingCard.monthlyPrice || !editingCard.annualPrice)) return false

      return true
    }

    // For one-time, validate billing timing and price are filled
    if (state.monetizationStrategy === 'one-time') {
      return !!editingCard.billingTiming && !!editingCard.monthlyPrice
    }

    // For PAYG, check if there's at least one saved rate card OR if the editing card is valid
    if (state.monetizationStrategy === 'payg') {
      return state.rateCards.length > 0 || isPaygEditingCardValid()
    }

    // For prepaid, need at least one rate card
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
    handleGroupChange(newGroup.id)

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
                      handleGroupChange(group.id)
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
  const renderPaygConfig = () => {
    // If no rate cards and no editing card, show empty state with add button
    const showingCards = state.rateCards.length > 0 || editingCard.feature

    const addNewCard = () => {
      // If currently editing, save it first
      if (editingCard.feature && editingCard.pricingModel) {
        addRateCard()
      }
      // Reset editing card
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

    return (
      <div>
        <h4 className="text-xs font-semibold text-g-500 uppercase tracking-wider mb-2">Metered Resources</h4>
        <p className="text-sm text-g-500 mb-5">
          Add each metered resource customers will be billed for. Each gets its own rate.
        </p>

        {/* For PAYG, we only show the editing card format - no separate saved cards section */}
        {/* Display saved rate cards would go here, but for now we'll just use editing card */}
        {false && state.rateCards.map((card, cardIndex) => {
          const [serviceId, featureSlug] = card.feature.split('_')
          const service = SERVICES.find(s => s.id === serviceId)
          const feature = SERVICE_FEATURES[serviceId]?.find(f => f.slug === featureSlug)
          return (
            <div key={cardIndex} className="border border-g-200 rounded p-5 bg-white mb-4">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-medium text-g-900">{feature?.name}</div>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_RATE_CARD', index: cardIndex })}
                  className="w-7 h-7 border border-g-200 rounded flex items-center justify-center text-g-400 hover:border-g-300 hover:text-g-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="text-xs font-semibold text-g-500 uppercase tracking-wider mb-2">Pricing Model</div>
                <div className="text-sm text-g-700">
                  {card.pricingModel === 'per-unit' && 'Flat per-unit'}
                  {card.pricingModel === 'block' && 'Block'}
                  {card.pricingModel === 'graduated' && 'Graduated'}
                  {card.pricingModel === 'volume' && 'Volume'}
                </div>
              </div>

              {card.pricingModel === 'per-unit' && (
                <div>
                  <label className="block text-sm font-medium text-g-700 mb-1.5">
                    Price per {feature?.name?.toLowerCase() || 'unit'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-g-500">$</span>
                    <input
                      type="number"
                      step="0.001"
                      value={card.perUnitPrice || ''}
                      onChange={(e) => {
                        const updatedCards = [...state.rateCards]
                        updatedCards[cardIndex] = { ...card, perUnitPrice: e.target.value }
                        dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                      }}
                      className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
                    />
                  </div>
                </div>
              )}

              {card.pricingModel === 'block' && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-g-700 mb-1.5">Block size</label>
                    <input
                      type="number"
                      value={card.blockSize || ''}
                      onChange={(e) => {
                        const updatedCards = [...state.rateCards]
                        updatedCards[cardIndex] = { ...card, blockSize: e.target.value }
                        dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                      }}
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
                        value={card.blockPrice || ''}
                        onChange={(e) => {
                          const updatedCards = [...state.rateCards]
                          updatedCards[cardIndex] = { ...card, blockPrice: e.target.value }
                          dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                        }}
                        className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {(card.pricingModel === 'graduated' || card.pricingModel === 'volume') && card.tiers && (
                <div>
                  <div className="bg-white border border-g-200 rounded overflow-hidden mb-3">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-g-50 border-b border-g-200 text-xs font-semibold text-g-500 uppercase tracking-wider">
                      <div className="col-span-2">From</div>
                      <div className="col-span-2">To</div>
                      <div className="col-span-4">Per Unit</div>
                      <div className="col-span-4">Fixed Fee</div>
                    </div>
                    {card.tiers.map((tier, tierIndex) => (
                      <div key={tierIndex} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-g-200 last:border-b-0">
                        <div className="col-span-2 flex items-center text-sm text-g-600">
                          {tier.from.toLocaleString('en-US')}
                        </div>
                        <div className="col-span-2 flex items-center">
                          {tierIndex === card.tiers.length - 1 ? (
                            <span className="text-sm text-g-600">∞</span>
                          ) : (
                            <input
                              type="number"
                              value={tier.to === Infinity ? '' : tier.to}
                              onChange={(e) => {
                                const updatedCards = [...state.rateCards]
                                const tiers = [...updatedCards[cardIndex].tiers]
                                tiers[tierIndex] = { ...tiers[tierIndex], to: parseInt(e.target.value) || '' }
                                updatedCards[cardIndex] = { ...updatedCards[cardIndex], tiers }
                                dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                              }}
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
                              onChange={(e) => {
                                const updatedCards = [...state.rateCards]
                                const tiers = [...updatedCards[cardIndex].tiers]
                                tiers[tierIndex] = { ...tiers[tierIndex], perUnit: e.target.value }
                                updatedCards[cardIndex] = { ...updatedCards[cardIndex], tiers }
                                dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                              }}
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
                              onChange={(e) => {
                                const updatedCards = [...state.rateCards]
                                const tiers = [...updatedCards[cardIndex].tiers]
                                tiers[tierIndex] = { ...tiers[tierIndex], fixedFee: e.target.value }
                                updatedCards[cardIndex] = { ...updatedCards[cardIndex], tiers }
                                dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                              }}
                              placeholder="—"
                              className="w-full px-2 py-1.5 border border-g-200 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const updatedCards = [...state.rateCards]
                      const tiers = updatedCards[cardIndex].tiers || []
                      const lastTier = tiers[tiers.length - 1]
                      const newFrom = lastTier.to === Infinity ? lastTier.from + 1000 : lastTier.to + 1
                      const updatedTiers = [...tiers]
                      if (lastTier.to === Infinity) {
                        updatedTiers[updatedTiers.length - 1] = { ...lastTier, to: newFrom - 1 }
                      }
                      updatedTiers.push({ from: newFrom, to: Infinity, perUnit: '', fixedFee: '' })
                      updatedCards[cardIndex] = { ...updatedCards[cardIndex], tiers: updatedTiers }
                      dispatch({ type: 'SET_RATE_CARDS', cards: updatedCards })
                    }}
                    className="text-sm text-blue hover:underline"
                  >
                    + Add tier
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Current editing card */}
        <div className="border border-g-200 rounded bg-white mb-4 overflow-hidden">
          {/* Collapsible header with feature selector */}
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
              className="flex-1 text-base font-medium text-g-900 bg-transparent border-none outline-none cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: 'none' }}
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
            <svg className="w-5 h-5 text-g-400 flex-shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <button
              onClick={() => {
                setEditingCard({
                  feature: '',
                  pricingModel: '',
                  perUnitPrice: '',
                  blockSize: '',
                  blockPrice: '',
                  tiers: null,
                  billingTiming: 'arrears'
                })
              }}
              className="w-6 h-6 flex items-center justify-center text-g-400 hover:text-g-700 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {editingCard.feature && (
            <div className="px-4 pb-4 border-t border-g-200 pt-4">
              <label className="block text-xs font-semibold text-g-500 uppercase tracking-wider mb-3">Pricing Model</label>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => setEditingCard({ ...editingCard, pricingModel: 'per-unit', tiers: null })}
                  className={`relative p-4 border rounded text-left transition-all ${
                    editingCard.pricingModel === 'per-unit'
                      ? 'border-blue bg-blue-light/20'
                      : 'border-g-200 hover:border-g-300'
                  }`}
                >
                  {editingCard.pricingModel === 'per-unit' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex gap-0.5 mb-3 h-8 items-end">
                    {[8, 8, 8, 8, 8].map((h, i) => (
                      <div key={i} className={`w-4 rounded-sm ${editingCard.pricingModel === 'per-unit' ? 'bg-blue' : 'bg-g-400'}`} style={{ height: `${h * 3}px` }} />
                    ))}
                  </div>
                  <div className="font-medium text-sm text-g-900 mb-1">Flat per-unit</div>
                  <div className="text-xs text-g-500">Same price for every unit.</div>
                </button>

                <button
                  onClick={() => setEditingCard({ ...editingCard, pricingModel: 'block', tiers: null })}
                  className={`relative p-4 border rounded text-left transition-all ${
                    editingCard.pricingModel === 'block'
                      ? 'border-blue bg-blue-light/20'
                      : 'border-g-200 hover:border-g-300'
                  }`}
                >
                  {editingCard.pricingModel === 'block' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex gap-1 mb-3 h-8 items-end">
                    <div className={`flex gap-0.5 ${editingCard.pricingModel === 'block' ? 'opacity-100' : 'opacity-60'}`}>
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'block' ? 'bg-blue' : 'bg-g-400'}`} style={{ height: '16px' }} />
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'block' ? 'bg-blue' : 'bg-g-400'}`} style={{ height: '16px' }} />
                    </div>
                    <div className={`flex gap-0.5 ${editingCard.pricingModel === 'block' ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'block' ? 'bg-blue' : 'bg-g-300'}`} style={{ height: '24px' }} />
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'block' ? 'bg-blue' : 'bg-g-300'}`} style={{ height: '24px' }} />
                    </div>
                  </div>
                  <div className="font-medium text-sm text-g-900 mb-1">Block</div>
                  <div className="text-xs text-g-500">Fixed price per chunk of N units.</div>
                </button>

                <button
                  onClick={() => setEditingCard({
                    ...editingCard,
                    pricingModel: 'graduated',
                    tiers: [
                      { from: 0, to: 1000, perUnit: '', fixedFee: '' },
                      { from: 1001, to: Infinity, perUnit: '', fixedFee: '' }
                    ]
                  })}
                  className={`relative p-4 border rounded text-left transition-all ${
                    editingCard.pricingModel === 'graduated'
                      ? 'border-blue bg-blue-light/20'
                      : 'border-g-200 hover:border-g-300'
                  }`}
                >
                  {editingCard.pricingModel === 'graduated' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex gap-0.5 mb-3 h-8 items-end">
                    {[4, 5, 6, 7, 8].map((h, i) => (
                      <div key={i} className={`w-4 rounded-sm ${editingCard.pricingModel === 'graduated' ? 'bg-blue' : 'bg-g-400'}`} style={{ height: `${h * 3}px` }} />
                    ))}
                  </div>
                  <div className="font-medium text-sm text-g-900 mb-1">Graduated</div>
                  <div className="text-xs text-g-500">Each unit priced at its tier's rate.</div>
                </button>

                <button
                  onClick={() => setEditingCard({
                    ...editingCard,
                    pricingModel: 'volume',
                    tiers: [
                      { from: 0, to: 1000, perUnit: '', fixedFee: '' },
                      { from: 1001, to: Infinity, perUnit: '', fixedFee: '' }
                    ]
                  })}
                  className={`relative p-4 border rounded text-left transition-all ${
                    editingCard.pricingModel === 'volume'
                      ? 'border-blue bg-blue-light/20'
                      : 'border-g-200 hover:border-g-300'
                  }`}
                >
                  {editingCard.pricingModel === 'volume' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex gap-1 mb-3 h-8 items-end">
                    <div className={`flex gap-0.5 ${editingCard.pricingModel === 'volume' ? 'opacity-100' : 'opacity-60'}`}>
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'volume' ? 'bg-blue' : 'bg-g-400'}`} style={{ height: '16px' }} />
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'volume' ? 'bg-blue' : 'bg-g-400'}`} style={{ height: '16px' }} />
                    </div>
                    <div className={`flex gap-0.5 ${editingCard.pricingModel === 'volume' ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'volume' ? 'bg-blue' : 'bg-g-300'}`} style={{ height: '24px' }} />
                      <div className={`w-3 rounded-sm ${editingCard.pricingModel === 'volume' ? 'bg-blue' : 'bg-g-300'}`} style={{ height: '24px' }} />
                    </div>
                  </div>
                  <div className="font-medium text-sm text-g-900 mb-1">Volume</div>
                  <div className="text-xs text-g-500">All units priced at the tier you land in.</div>
                </button>
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

        {/* Only show "Add another metered resource" if editing card is complete */}
        {isPaygEditingCardValid() && (
          <button
            onClick={() => addRateCard()}
            className="text-sm text-blue hover:underline"
          >
            + Add another metered resource
          </button>
        )}
      </div>
    )
  }

  const renderPrepaidConfig = () => (
    <div className="mb-6 p-5 border border-g-200 rounded bg-white">
      <h4 className="text-sm font-semibold text-g-900 mb-4">Configure Prepaid Pricing</h4>
      <p className="text-xs text-g-500 mb-4">Prepaid uses block pricing only</p>

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
          Add prepaid option
        </button>
      </div>
    )

  const renderOneTimeConfig = () => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-g-700 mb-2">Billing timing</label>
      <div className="space-y-2 mb-3">
        {[
          { value: 'advance', label: 'In-advance', desc: 'Customer pays immediately upon purchase' },
          { value: 'arrears', label: 'In-arrears', desc: 'Customer pays after service delivery' }
        ].map(({ value, label, desc }) => (
          <label
            key={value}
            className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all ${
              editingCard.billingTiming === value
                ? 'border-blue bg-blue-light/20'
                : 'border-g-200 hover:border-g-300'
            }`}
          >
            <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
              editingCard.billingTiming === value ? 'border-blue' : 'border-g-300'
            }`}>
              {editingCard.billingTiming === value && (
                <div className="w-2 h-2 bg-blue rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-g-900">{label}</div>
              <div className="text-xs text-g-500 mt-0.5">{desc}</div>
            </div>
            <input
              type="radio"
              name="billing-timing-onetime"
              value={value}
              checked={editingCard.billingTiming === value}
              onChange={() => setEditingCard({ ...editingCard, billingTiming: value, pricingModel: 'fixed' })}
              className="sr-only"
            />
          </label>
        ))}
      </div>

      {editingCard.billingTiming && (
        <>
          <div className="border-t border-g-200 my-5" />
          <label className="block text-sm font-medium text-g-700 mb-1.5">Price</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-g-500">$</span>
            <input
              type="number"
              step="0.01"
              value={editingCard.monthlyPrice}
              onChange={(e) => setEditingCard({ ...editingCard, monthlyPrice: e.target.value, pricingModel: 'fixed' })}
              placeholder="500.00"
              className="flex-1 px-3.5 py-2.5 border border-g-200 rounded text-sm"
            />
          </div>
        </>
      )}
    </div>
  )

  const renderStep2 = () => {
    // Generate pricing summary
    const getPricingSummary = () => {
      if (state.isPaid === false) {
        return `Customers don't have to pay for this ${isAddon ? 'add-on' : 'offering'}.`
      }

      // For subscription, use editingCard to show live preview
      if (state.isPaid === true && state.monetizationStrategy === 'subscription') {
        const timing = editingCard.billingTiming ? ` (${editingCard.billingTiming === 'advance' ? 'in-advance' : 'in-arrears'})` : ''
        const formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

        if (state.pricingModel === 'fixed') {
          if (editingCard.billingPeriod === 'both' && editingCard.monthlyPrice && editingCard.annualPrice) {
            return `Customers pay $${formatPrice(editingCard.monthlyPrice)}/month or $${formatPrice(editingCard.annualPrice)}/year${timing}.`
          } else if (editingCard.billingPeriod === 'monthly' && editingCard.monthlyPrice) {
            return `Customers pay $${formatPrice(editingCard.monthlyPrice)}/month${timing}.`
          } else if (editingCard.billingPeriod === 'annual' && editingCard.annualPrice) {
            return `Customers pay $${formatPrice(editingCard.annualPrice)}/year${timing}.`
          }
        } else if (state.pricingModel === 'per-unit' && state.selectedFeature) {
          const [serviceId, featureSlug] = state.selectedFeature.split('_')
          const feature = SERVICE_FEATURES[serviceId]?.find(f => f.slug === featureSlug)
          const featureName = feature?.name?.toLowerCase() || 'unit'

          if (editingCard.billingPeriod === 'both' && editingCard.monthlyPrice && editingCard.annualPrice) {
            return `Customers pay $${formatPrice(editingCard.monthlyPrice)} per ${featureName} per month or $${formatPrice(editingCard.annualPrice)} per ${featureName} per year${timing}.`
          } else if (editingCard.billingPeriod === 'monthly' && editingCard.monthlyPrice) {
            return `Customers pay $${formatPrice(editingCard.monthlyPrice)} per ${featureName} per month${timing}.`
          } else if (editingCard.billingPeriod === 'annual' && editingCard.annualPrice) {
            return `Customers pay $${formatPrice(editingCard.annualPrice)} per ${featureName} per year${timing}.`
          }
        }
      }

      // For one-time, use editingCard
      if (state.isPaid === true && state.monetizationStrategy === 'one-time') {
        if (editingCard.monthlyPrice && editingCard.billingTiming) {
          const timing = editingCard.billingTiming === 'advance' ? 'in-advance' : 'in-arrears'
          const formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          return `Customers pay $${formatPrice(editingCard.monthlyPrice)} once (${timing}).`
        }
      }

      // For PAYG, check editingCard or rate cards
      if (state.isPaid === true && state.monetizationStrategy === 'payg') {
        const formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const totalResources = state.rateCards.length + (isPaygEditingCardValid() ? 1 : 0)

        if (totalResources > 0) {
          const timing = editingCard.billingTiming ? ` (${editingCard.billingTiming === 'advance' ? 'in-advance' : 'in-arrears'})` : ' (in-arrears)'
          return `Customers pay based on usage${totalResources > 1 ? ` across ${totalResources} metered resources` : ''}${timing}.`
        }
      }

      // For prepaid, use rate cards
      if (state.isPaid === true && state.monetizationStrategy === 'prepaid' && state.rateCards.length > 0) {
        const formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const card = state.rateCards[0]
        const timing = card.billingTiming ? ` (${card.billingTiming === 'immediate' ? 'immediate' : 'in-advance'})` : ''
        return `Customers purchase credits in blocks of ${card.blockSize.toLocaleString('en-US')} for $${formatPrice(card.blockPrice)}${timing}.`
      }

      return null
    }

    const pricingSummary = getPricingSummary()

    return (
      <div className="border border-g-200 rounded-md p-6 bg-white">
        <h3 className="text-base font-semibold text-g-900 mb-5">Pricing Configuration</h3>

        {/* Free/Paid Selection - Always Visible */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-3">
            Is this {isAddon ? 'add-on' : 'offering'} free or paid? <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <SelectCard
              title="Free"
              selected={state.isPaid === false}
              onClick={() => {
                dispatch({ type: 'SET_FIELD', field: 'isPaid', value: false })
                // Only add free rate card if none exist
                if (state.rateCards.length === 0) {
                  dispatch({
                    type: 'ADD_RATE_CARD',
                    card: { pricingModel: 'fixed', price: 0, billingTiming: 'advance', billingCycle: 'monthly' }
                  })
                }
              }}
            />
            <SelectCard
              title="Paid"
              selected={state.isPaid === true}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'isPaid', value: true })}
            />
          </div>
        </div>

        {/* Strategy Selection - Only show when Paid */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: state.isPaid === true ? '1500px' : '0',
            opacity: state.isPaid === true ? 1 : 0
          }}
        >
          {state.isPaid === true && (
            <>
              <div className="border-t border-g-200 my-5" />

            <div className="mb-5">
              <label className="block text-sm font-medium text-g-700 mb-2">
                Monetization strategy <span className="text-red">*</span>
              </label>
              <p className="text-xs text-g-500 mb-3">
                Choose how customers will be charged for this {isAddon ? 'add-on' : 'offering'}
              </p>
              <div className="space-y-1.5">
                {[
                  { value: 'subscription', label: 'Subscription', desc: 'Recurring charge (monthly or annual). Example: $20/user/month', pricingModel: '' },
                  { value: 'payg', label: 'Pay-as-you-go', desc: 'Charged based on usage at end of period. Example: $0.05 per build minute', billingTiming: 'arrears', pricingModel: '' },
                  { value: 'prepaid', label: 'Pre-paid with top-ups', desc: 'Customer buys blocks upfront and draws down. Example: 500 minutes for $25', billingTiming: 'immediate', pricingModel: 'block' },
                  { value: 'one-time', label: 'One-time', desc: 'Single payment with no recurrence. Example: $500 setup fee', pricingModel: 'fixed' }
                ].map(({ value, label, desc, billingTiming, pricingModel }) => {
                  const isSelected = state.monetizationStrategy === value
                  return (
                    <label
                      key={value}
                      onClick={() => {
                        dispatch({ type: 'SET_FIELD', field: 'monetizationStrategy', value })
                        // Clear rate cards when switching strategies
                        dispatch({ type: 'SET_RATE_CARDS', cards: [] })
                        // Set default billing timing and pricing model based on strategy
                        const defaults = {
                          ...(billingTiming && { billingTiming }),
                          ...(pricingModel && { pricingModel })
                        }
                        // Default to 'advance' for subscription and one-time
                        if (value === 'subscription' || value === 'one-time') {
                          defaults.billingTiming = 'advance'
                        }
                        setEditingCard(prev => ({ ...prev, ...defaults }))
                      }}
                      className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue bg-blue-light/20'
                          : 'border-g-200 hover:border-g-300'
                      }`}
                    >
                      <div className={`w-4 h-4 border-2 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? 'border-blue' : 'border-g-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-g-900">{label}</div>
                        <div className="text-xs text-g-500 mt-0.5">{desc}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* One-time pricing - show directly after strategy selection */}
            {state.monetizationStrategy === 'one-time' && (
              <>
                <div className="border-t border-g-200 my-5" />
                {renderOneTimeConfig()}
              </>
            )}

            {/* What is being charged for? - Critical question after strategy */}
            {/* Skip this section for one-time payments */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: state.monetizationStrategy && state.monetizationStrategy !== 'one-time' ? '2000px' : '0',
                opacity: state.monetizationStrategy && state.monetizationStrategy !== 'one-time' ? 1 : 0
              }}
            >
              {state.monetizationStrategy && state.monetizationStrategy !== 'one-time' && (
                <>
                  <div className="border-t border-g-200 my-5" />

                  <div className="mb-5">
                    {/* For Subscription: Pricing model first */}
                    {state.monetizationStrategy === 'subscription' && (
                      <>
                        <label className="block text-sm font-medium text-g-700 mb-3">
                          Pricing model <span className="text-red">*</span>
                        </label>
                        <p className="text-xs text-g-500 mb-3">Choose the pricing structure</p>
                        <div className="grid grid-cols-2 gap-2.5 mb-4">
                          <button
                            onClick={() => {
                              dispatch({ type: 'SET_FIELD', field: 'pricingModel', value: 'fixed' })
                              dispatch({ type: 'SET_FIELD', field: 'selectedFeature', value: '' })
                            }}
                            className={`p-4 border rounded text-left transition-all ${
                              state.pricingModel === 'fixed'
                                ? 'border-blue bg-blue-light/20'
                                : 'border-g-200 hover:border-g-300'
                            }`}
                          >
                            <div className="font-medium text-sm text-g-900 mb-1">Flat fee</div>
                            <div className="text-xs text-g-500">Fixed amount regardless of usage</div>
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'SET_FIELD', field: 'pricingModel', value: 'per-unit' })}
                            className={`p-4 border rounded text-left transition-all ${
                              state.pricingModel === 'per-unit'
                                ? 'border-blue bg-blue-light/20'
                                : 'border-g-200 hover:border-g-300'
                            }`}
                          >
                            <div className="font-medium text-sm text-g-900 mb-1">Per unit</div>
                            <div className="text-xs text-g-500">Price scales with quantity</div>
                          </button>
                        </div>

                        {/* Feature picker - only for per-unit */}
                        {state.pricingModel === 'per-unit' && (
                          <>
                            <div className="border-t border-g-200 my-5" />
                            <label className="block text-sm font-medium text-g-700 mb-1.5">
                              What is being charged for? <span className="text-red">*</span>
                            </label>
                            <select
                              value={state.selectedFeature}
                              onChange={(e) => {
                                dispatch({ type: 'SET_FIELD', field: 'selectedFeature', value: e.target.value })
                                dispatch({ type: 'SET_FIELD', field: 'selectedResource', value: '' })
                                setEditingCard({ ...editingCard, pricingModel: 'per-unit' })
                              }}
                              className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white"
                            >
                              <option value="">Select a feature...</option>
                              {SERVICES.map(service => {
                                const mutableFeatures = (SERVICE_FEATURES[service.id] || []).filter(f => f.mutable)
                                if (mutableFeatures.length === 0) return null
                                return (
                                  <optgroup key={service.id} label={service.name}>
                                    {mutableFeatures.map(feature => (
                                      <option key={`${service.id}_${feature.slug}`} value={`${service.id}_${feature.slug}`}>
                                        {feature.name} ({service.name})
                                      </option>
                                    ))}
                                  </optgroup>
                                )
                              })}
                            </select>

                            {/* Billing timing selector - shown after feature selection */}
                            {state.selectedFeature && (
                              <>
                                <div className="border-t border-g-200 my-5" />
                                <label className="block text-sm font-medium text-g-700 mb-2">Billing timing</label>
                                <div className="space-y-2 mb-3">
                                  {[
                                    { value: 'advance', label: 'In-advance', desc: 'Customer pays before the billing period starts' },
                                    { value: 'arrears', label: 'In-arrears', desc: 'Customer pays after the billing period ends' }
                                  ].map(({ value, label, desc }) => (
                                    <label
                                      key={value}
                                      className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all ${
                                        editingCard.billingTiming === value
                                          ? 'border-blue bg-blue-light/20'
                                          : 'border-g-200 hover:border-g-300'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                                        editingCard.billingTiming === value ? 'border-blue' : 'border-g-300'
                                      }`}>
                                        {editingCard.billingTiming === value && (
                                          <div className="w-2 h-2 bg-blue rounded-full" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-g-900">{label}</div>
                                        <div className="text-xs text-g-500 mt-0.5">{desc}</div>
                                      </div>
                                      <input
                                        type="radio"
                                        name="billing-timing-per-unit"
                                        value={value}
                                        checked={editingCard.billingTiming === value}
                                        onChange={() => setEditingCard({ ...editingCard, billingTiming: value })}
                                        className="sr-only"
                                      />
                                    </label>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Billing period and price inputs - shown after billing timing */}
                            {state.selectedFeature && editingCard.billingTiming && (
                              <>
                                <div className="border-t border-g-200 my-5" />
                                <label className="block text-sm font-medium text-g-700 mb-2">Billing cycles</label>
                                <div className="space-y-2 mb-3">
                                  {[
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'annual', label: 'Annual' },
                                    { value: 'both', label: 'Monthly & annual' }
                                  ].map(({ value, label }) => (
                                    <label
                                      key={value}
                                      className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${
                                        editingCard.billingPeriod === value
                                          ? 'border-blue bg-blue-light/20'
                                          : 'border-g-200 hover:border-g-300'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center ${
                                        editingCard.billingPeriod === value ? 'border-blue' : 'border-g-300'
                                      }`}>
                                        {editingCard.billingPeriod === value && (
                                          <div className="w-2 h-2 bg-blue rounded-full" />
                                        )}
                                      </div>
                                      <span className="text-sm text-g-900">{label}</span>
                                      <input
                                        type="radio"
                                        name="billing-period"
                                        value={value}
                                        checked={editingCard.billingPeriod === value}
                                        onChange={() => setEditingCard({ ...editingCard, billingPeriod: value })}
                                        className="sr-only"
                                      />
                                    </label>
                                  ))}
                                </div>

                                <div className="border-t border-g-200 my-5" />

                                {(() => {
                                  const featureName = (() => {
                                    if (!state.selectedFeature) return 'unit'
                                    const [serviceId, featureSlug] = state.selectedFeature.split('_')
                                    const service = SERVICES.find(s => s.id === serviceId)
                                    const feature = SERVICE_FEATURES[serviceId]?.find(f => f.slug === featureSlug)
                                    return feature?.name?.toLowerCase() || 'unit'
                                  })()

                                  return (
                                    <>
                                      {(editingCard.billingPeriod === 'monthly' || editingCard.billingPeriod === 'both') && (
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-g-700 mb-1.5">Price per {featureName} per month</label>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-g-500">$</span>
                                            <div className="flex-1 relative">
                                              <input
                                                type="number"
                                                step="0.01"
                                                value={editingCard.monthlyPrice}
                                                onChange={(e) => setEditingCard({ ...editingCard, monthlyPrice: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full px-3.5 py-2.5 pr-32 border border-g-200 rounded text-sm"
                                              />
                                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-g-400 pointer-events-none">/ {featureName} / month</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {(editingCard.billingPeriod === 'annual' || editingCard.billingPeriod === 'both') && (
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-g-700 mb-1.5">Price per {featureName} per year</label>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-g-500">$</span>
                                            <div className="flex-1 relative">
                                              <input
                                                type="number"
                                                step="0.01"
                                                value={editingCard.annualPrice}
                                                onChange={(e) => setEditingCard({ ...editingCard, annualPrice: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full px-3.5 py-2.5 pr-32 border border-g-200 rounded text-sm"
                                              />
                                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-g-400 pointer-events-none">/ {featureName} / year</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Price difference indicator */}
                                      {editingCard.billingPeriod === 'both' && editingCard.monthlyPrice && editingCard.annualPrice && (() => {
                                        const monthly = parseFloat(editingCard.monthlyPrice)
                                        const annual = parseFloat(editingCard.annualPrice)
                                        const monthlyAnnualized = monthly * 12
                                        const savings = monthlyAnnualized - annual
                                        const savingsPercent = Math.round((savings / monthlyAnnualized) * 100)
                                        const formatPrice = (price) => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

                                        if (savings > 0) {
                                          return (
                                            <div className="mb-4 p-3 bg-green/5 border border-green/20 rounded">
                                              <div className="text-sm text-green-dark font-medium">
                                                Save ${formatPrice(savings)} ({savingsPercent}%) with annual billing
                                              </div>
                                            </div>
                                          )
                                        } else if (savings < 0) {
                                          return (
                                            <div className="mb-4 p-3 bg-orange/5 border border-orange/20 rounded">
                                              <div className="text-sm text-orange-dark">
                                                Annual price is ${formatPrice(Math.abs(savings))} higher than monthly × 12
                                              </div>
                                            </div>
                                          )
                                        }
                                        return null
                                      })()}
                                    </>
                                  )
                                })()}
                              </>
                            )}
                          </>
                        )}

                        {/* Flat fee pricing - shown immediately after selecting flat fee */}
                        {state.pricingModel === 'fixed' && (
                          <>
                            <div className="border-t border-g-200 my-5" />
                            <label className="block text-sm font-medium text-g-700 mb-2">Billing timing</label>
                            <div className="space-y-2 mb-3">
                              {[
                                { value: 'advance', label: 'In-advance', desc: 'Customer pays before the billing period starts' },
                                { value: 'arrears', label: 'In-arrears', desc: 'Customer pays after the billing period ends' }
                              ].map(({ value, label, desc }) => (
                                <label
                                  key={value}
                                  className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all ${
                                    editingCard.billingTiming === value
                                      ? 'border-blue bg-blue-light/20'
                                      : 'border-g-200 hover:border-g-300'
                                  }`}
                                >
                                  <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                                    editingCard.billingTiming === value ? 'border-blue' : 'border-g-300'
                                  }`}>
                                    {editingCard.billingTiming === value && (
                                      <div className="w-2 h-2 bg-blue rounded-full" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-g-900">{label}</div>
                                    <div className="text-xs text-g-500 mt-0.5">{desc}</div>
                                  </div>
                                  <input
                                    type="radio"
                                    name="billing-timing-flat"
                                    value={value}
                                    checked={editingCard.billingTiming === value}
                                    onChange={() => setEditingCard({ ...editingCard, billingTiming: value })}
                                    className="sr-only"
                                  />
                                </label>
                              ))}
                            </div>

                            {editingCard.billingTiming && (
                              <>
                                <div className="border-t border-g-200 my-5" />
                                <label className="block text-sm font-medium text-g-700 mb-2">Billing cycles</label>
                                <div className="space-y-2 mb-3">
                                  {[
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'annual', label: 'Annual' },
                                    { value: 'both', label: 'Monthly & annual' }
                                  ].map(({ value, label }) => (
                                <label
                                  key={value}
                                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${
                                    editingCard.billingPeriod === value
                                      ? 'border-blue bg-blue-light/20'
                                      : 'border-g-200 hover:border-g-300'
                                  }`}
                                >
                                  <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center ${
                                    editingCard.billingPeriod === value ? 'border-blue' : 'border-g-300'
                                  }`}>
                                    {editingCard.billingPeriod === value && (
                                      <div className="w-2 h-2 bg-blue rounded-full" />
                                    )}
                                  </div>
                                  <span className="text-sm text-g-900">{label}</span>
                                  <input
                                    type="radio"
                                    name="billing-period-flat"
                                    value={value}
                                    checked={editingCard.billingPeriod === value}
                                    onChange={() => setEditingCard({ ...editingCard, billingPeriod: value, pricingModel: 'fixed' })}
                                    className="sr-only"
                                  />
                                </label>
                              ))}
                            </div>

                            <div className="border-t border-g-200 my-5" />

                            {(editingCard.billingPeriod === 'monthly' || editingCard.billingPeriod === 'both') && (
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-g-700 mb-1.5">Monthly price</label>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-g-500">$</span>
                                  <div className="flex-1 relative">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editingCard.monthlyPrice}
                                      onChange={(e) => setEditingCard({ ...editingCard, monthlyPrice: e.target.value })}
                                      placeholder="0.00"
                                      className="w-full px-3.5 py-2.5 pr-20 border border-g-200 rounded text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-g-400 pointer-events-none">/ month</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {(editingCard.billingPeriod === 'annual' || editingCard.billingPeriod === 'both') && (
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-g-700 mb-1.5">Annual price</label>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-g-500">$</span>
                                  <div className="flex-1 relative">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editingCard.annualPrice}
                                      onChange={(e) => setEditingCard({ ...editingCard, annualPrice: e.target.value })}
                                      placeholder="0.00"
                                      className="w-full px-3.5 py-2.5 pr-16 border border-g-200 rounded text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-g-400 pointer-events-none">/ year</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Price difference indicator */}
                            {editingCard.billingPeriod === 'both' && editingCard.monthlyPrice && editingCard.annualPrice && (() => {
                              const monthly = parseFloat(editingCard.monthlyPrice)
                              const annual = parseFloat(editingCard.annualPrice)
                              const monthlyAnnualized = monthly * 12
                              const savings = monthlyAnnualized - annual
                              const savingsPercent = Math.round((savings / monthlyAnnualized) * 100)
                              const formatPrice = (price) => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

                              if (savings > 0) {
                                return (
                                  <div className="p-3 bg-green/5 border border-green/20 rounded">
                                    <div className="text-sm text-green-dark font-medium">
                                      Save ${formatPrice(savings)} ({savingsPercent}%) with annual billing
                                    </div>
                                  </div>
                                )
                              } else if (savings < 0) {
                                return (
                                  <div className="p-3 bg-orange/5 border border-orange/20 rounded">
                                    <div className="text-sm text-orange-dark">
                                      Annual price is ${formatPrice(Math.abs(savings))} higher than monthly × 12
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })()}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* For Prepaid: Feature picker */}
                    {state.monetizationStrategy === 'prepaid' && (
                      <>
                        <label className="block text-sm font-medium text-g-700 mb-1.5">What is being sold?</label>
                        <select
                          value={state.selectedFeature}
                          onChange={(e) => {
                            dispatch({ type: 'SET_FIELD', field: 'selectedFeature', value: e.target.value })
                            dispatch({ type: 'SET_FIELD', field: 'selectedResource', value: '' })
                          }}
                          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white mb-4"
                        >
                          <option value="">Select a feature...</option>
                          {SERVICES.map(service => {
                            const mutableFeatures = (SERVICE_FEATURES[service.id] || []).filter(f => f.mutable)
                            if (mutableFeatures.length === 0) return null
                            return (
                              <optgroup key={service.id} label={service.name}>
                                {mutableFeatures.map(feature => (
                                  <option key={`${service.id}_${feature.slug}`} value={`${service.id}_${feature.slug}`}>
                                    {feature.name} ({service.name})
                                  </option>
                                ))}
                              </optgroup>
                            )
                          })}
                        </select>
                      </>
                    )}

                    {/* Resource picker - shows for prepaid when metered feature selected */}
                    {(['subscription', 'prepaid'].includes(state.monetizationStrategy) && state.selectedFeature === 'build_minutes') && (
                      <>
                        <label className="block text-sm font-medium text-g-700 mb-1.5">
                          Which resource?
                        </label>
                        <select
                          value={state.selectedResource}
                          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedResource', value: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm bg-white"
                        >
                          <option value="">Select a resource...</option>
                          {METERED_RESOURCES.filter(r =>
                            state.monetizationStrategy === 'payg'
                              ? r.meters.includes(state.selectedMeter)
                              : r.meters.some(m => METERS.find(meter => meter.id === m && meter.feature === state.selectedFeature))
                          ).map(resource => (
                            <option key={resource.id} value={resource.id}>
                              {resource.name} — {resource.desc}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Rate Cards Display - only for Prepaid (PAYG has its own in renderPaygConfig) */}
            {state.monetizationStrategy === 'prepaid' && state.rateCards.length > 0 && (
              <>
                <div className="border-t border-g-200 my-5" />
                <div className="mb-5">
                  <label className="block text-sm font-medium text-g-700 mb-3">
                    Pricing
                  </label>
                  {state.rateCards.map((card, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-g-200 rounded mb-2 bg-white hover:border-g-300 transition-all">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-g-900">
                          {card.feature && (
                            <span className="text-blue mr-2">
                              {card.feature === 'general_seats' && 'Seats'}
                              {card.feature === 'build_minutes' && 'Build Minutes'}
                              {card.feature === 'tc_minutes' && 'TC Runtime Minutes'}
                              {!['general_seats', 'build_minutes', 'tc_minutes'].includes(card.feature) && card.feature}
                            </span>
                          )}
                          {card.meter && (
                            <span className="text-blue mr-2">
                              {METERS.find(m => m.id === card.meter)?.name}
                              {card.resource && ` — ${METERED_RESOURCES.find(r => r.id === card.resource)?.name}`}
                            </span>
                          )}
                          {card.pricingModel === 'fixed' && `${card.price > 0 ? ` $${card.price}` : 'Free'}`}
                          {card.pricingModel === 'per-unit' && `$${card.perUnitPrice} per unit`}
                          {card.pricingModel === 'block' && `${card.blockSize} units for $${card.blockPrice}`}
                          {card.pricingModel === 'graduated' && '(graduated pricing)'}
                          {card.pricingModel === 'volume' && '(volume pricing)'}
                          {card.billingPeriod && (
                            <span className="text-g-500 text-xs ml-2">
                              ({card.billingPeriod === 'both' ? 'monthly & annual' : card.billingPeriod})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-g-400 mt-1">
                          {card.billingTiming} · {card.billingCycle}
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_RATE_CARD', index })}
                        className="w-7 h-7 border border-g-200 rounded flex items-center justify-center text-g-400 hover:border-g-300 hover:text-g-700"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Configuration Forms for non-subscription strategies */}
            {state.monetizationStrategy === 'payg' && (
              <>
                <div className="border-t border-g-200 my-5" />
                {renderPaygConfig()}
              </>
            )}
            {state.monetizationStrategy === 'prepaid' && (
              <>
                <div className="border-t border-g-200 my-5" />
                {renderPrepaidConfig()}
              </>
            )}
          </>
        )}
      </div>

        {/* Pricing Summary - Always at bottom */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: pricingSummary ? '200px' : '0',
            marginTop: pricingSummary ? '1.5rem' : '0',
            marginBottom: pricingSummary ? '1rem' : '0',
            opacity: pricingSummary ? 1 : 0
          }}
        >
          <div className="p-4 bg-blue-light/10 border border-blue/20 rounded">
            <div className="text-sm text-g-700">{pricingSummary || '\u00A0'}</div>
          </div>
        </div>

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
  }

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
