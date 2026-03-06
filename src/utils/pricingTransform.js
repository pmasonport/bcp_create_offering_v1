// Transform Pricing Playground component to data model-aligned format
export function transformComponentForExport(component) {
  const { type } = component

  // Add monetization_strategy field
  const monetization_strategy = type === 'onetime' ? 'one-time' :
                                 type === 'mfc' ? 'minimum_fee_commitment' : type

  switch (type) {
    case 'subscription':
      return transformSubscription({ ...component, monetization_strategy })
    case 'payg':
      return transformPayg({ ...component, monetization_strategy })
    case 'prepaid':
      return transformPrepaid({ ...component, monetization_strategy })
    case 'onetime':
      return transformOneTime({ ...component, monetization_strategy })
    case 'mfc':
      return transformMFC({ ...component, monetization_strategy })
    default:
      return { ...component, monetization_strategy }
  }
}

// Subscription transformation
function transformSubscription(sub) {
  const rateCards = []

  // Generate rate cards with formatted labels and prices
  if (sub.price) {
    rateCards.push({
      label: generateLabel(sub.feature || 'Subscription', 'fixed', sub.timing, 'monthly'),
      price: formatPrice(sub.price, 'month'),
      rawAmount: parseFloat(sub.price),
      cycle: 'monthly'
    })
  }

  if (sub.priceAnnual) {
    rateCards.push({
      label: generateLabel(sub.feature || 'Subscription', 'fixed', sub.timing, 'annual'),
      price: formatPrice(sub.priceAnnual, 'year'),
      rawAmount: parseFloat(sub.priceAnnual),
      cycle: 'annual'
    })
  }

  // Extract metered config if present
  const meteredConfig = sub.billingCycle ? {
    billingCycle: sub.billingCycle,
    recurrence: {
      ...(sub.recurrenceMonthly && { monthly: sub.recurrenceMonthly }),
      ...(sub.recurrenceAnnual && { annual: sub.recurrenceAnnual })
    },
    includedAmount: {
      ...(sub.includedAmountMonthly && { monthly: parseFloat(sub.includedAmountMonthly) }),
      ...(sub.includedAmountAnnual && { annual: parseFloat(sub.includedAmountAnnual) })
    },
    overage: {
      behavior: sub.overage,
      ...(sub.overageRate && { rate: parseFloat(sub.overageRate) })
    },
    ...(sub.rollover && {
      rollover: {
        enabled: true,
        capType: sub.rollCapType,
        cap: parseFloat(sub.rollCap)
      }
    })
  } : null

  return {
    type: 'subscription',
    monetization_strategy: sub.monetization_strategy,
    rateCards,
    ...(meteredConfig && { meteredConfig }),
    feature: sub.feature,
    featureType: sub.featureType,
    unitLabel: sub.unitLabel,
    timing: sub.timing,
    cycle: sub.cycle,
    _original: sub  // Preserve for editing
  }
}

// PAYG transformation
function transformPayg(payg) {
  const rateCards = []

  payg.resources.forEach(resource => {
    // Fix perunit → per_unit
    const model = resource.model === 'perunit' ? 'per_unit' : resource.model

    switch (model) {
      case 'per_unit':
        rateCards.push({
          label: generateLabel(resource.resource, 'per_unit', 'arrears', 'monthly'),
          price: formatPrice(resource.price, resource.resource.toLowerCase()),
          rawAmount: parseFloat(resource.price),
          model: 'per_unit',
          resource: resource.resource
        })
        break

      case 'block':
        rateCards.push({
          label: generateLabel(resource.resource, 'block', 'arrears', 'monthly'),
          price: `$${resource.blockPrice} per ${resource.blockSize} ${resource.resource.toLowerCase()}`,
          blockSize: parseInt(resource.blockSize),
          blockPrice: parseFloat(resource.blockPrice),
          model: 'block',
          resource: resource.resource
        })
        break

      case 'graduated':
      case 'volume':
        resource.tiers.forEach((tier, idx) => {
          const maxLabel = tier.max === 'Infinity' ? '∞' : tier.max
          rateCards.push({
            label: `${resource.resource} · ${model} · arrears · monthly · tier ${idx + 1}`,
            price: `${tier.min}-${maxLabel}: $${tier.price} per unit`,
            tierIndex: idx,
            tierMin: parseInt(tier.min),
            tierMax: tier.max === 'Infinity' ? Infinity : parseInt(tier.max),
            tierPrice: parseFloat(tier.price),
            model,
            resource: resource.resource
          })
        })
        break
    }
  })

  return {
    type: 'payg',
    monetization_strategy: payg.monetization_strategy,
    rateCards,
    resources: payg.resources.map(r => ({
      ...r,
      model: r.model === 'perunit' ? 'per_unit' : r.model
    })),
    _original: payg
  }
}

// Prepaid transformation
function transformPrepaid(prepaid) {
  const rateCards = prepaid.packs.map((pack, idx) => {
    const unitPrice = parseFloat(pack.price) / parseInt(pack.qty)
    return {
      label: generateLabel(prepaid.resource, 'pack', 'advance', 'one-time') + ` · ${pack.qty} units`,
      price: `$${pack.price} for ${pack.qty} ${prepaid.resource.toLowerCase()}`,
      packQty: parseInt(pack.qty),
      packPrice: parseFloat(pack.price),
      unitPrice: unitPrice.toFixed(4),
      packIndex: idx
    }
  })

  return {
    type: 'prepaid',
    monetization_strategy: prepaid.monetization_strategy,
    rateCards,
    packs: prepaid.packs.map(p => ({
      qty: parseInt(p.qty),
      price: parseFloat(p.price)
    })),
    expires: prepaid.expires,
    ...(prepaid.expires && { expiryMonths: parseInt(prepaid.expiryMonths) }),
    stackable: prepaid.stackable,
    resource: prepaid.resource,
    _original: prepaid
  }
}

// One-time transformation
function transformOneTime(onetime) {
  return {
    type: 'onetime',
    monetization_strategy: onetime.monetization_strategy,
    rateCards: [{
      label: generateLabel('One-time', 'fixed', onetime.timing, 'immediate'),
      price: formatPrice(onetime.price, 'one-time'),
      rawAmount: parseFloat(onetime.price)
    }],
    timing: onetime.timing,
    _original: onetime
  }
}

// MFC (Minimum Fee Commitment) transformation
function transformMFC(mfc) {
  return {
    type: 'mfc',
    monetization_strategy: 'minimum_fee_commitment',
    offerings: mfc.offerings,
    discounts: mfc.discounts,
    _original: mfc
  }
}

// Helper: Generate RATE_CARDS-style label
function generateLabel(metric, model, timing, cycle) {
  return `${metric} · ${model} · ${timing} · ${cycle}`
}

// Helper: Format price as display string
function formatPrice(amount, unit) {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return `$${num.toFixed(2)} / ${unit}`
}
