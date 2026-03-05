import React from 'react'

export default function TierBuilder({ tiers, onChange }) {
  const updateTier = (index, field, value) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    onChange(newTiers)
  }

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newFrom = lastTier.to === '∞' ? 0 : parseInt(lastTier.to) + 1
    onChange([
      ...tiers.slice(0, -1),
      { ...lastTier, to: newFrom - 1 },
      { from: newFrom, to: '∞', perUnit: '', fixed: '' }
    ])
  }

  const removeTier = (index) => {
    if (tiers.length <= 2) return
    const newTiers = tiers.filter((_, i) => i !== index)
    // Ensure last tier ends at ∞
    if (newTiers.length > 0) {
      newTiers[newTiers.length - 1].to = '∞'
    }
    onChange(newTiers)
  }

  return (
    <div>
      <table className="w-full border border-g-200 rounded">
        <thead>
          <tr className="bg-g-50">
            <th className="text-left text-xs font-medium text-g-600 px-3 py-2 border-b border-g-200">From</th>
            <th className="text-left text-xs font-medium text-g-600 px-3 py-2 border-b border-g-200">To</th>
            <th className="text-left text-xs font-medium text-g-600 px-3 py-2 border-b border-g-200">Per-unit ($)</th>
            <th className="text-left text-xs font-medium text-g-600 px-3 py-2 border-b border-g-200">Fixed ($)</th>
            <th className="w-10 border-b border-g-200"></th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, index) => (
            <tr key={index} className="bg-white">
              <td className="px-3 py-2 border-b border-g-100">
                <input
                  type="number"
                  value={tier.from}
                  onChange={(e) => updateTier(index, 'from', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-g-200 rounded focus:border-blue focus:outline-none"
                  disabled={index > 0}
                />
              </td>
              <td className="px-3 py-2 border-b border-g-100">
                <input
                  type="text"
                  value={tier.to}
                  onChange={(e) => updateTier(index, 'to', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-g-200 rounded focus:border-blue focus:outline-none"
                  disabled={index === tiers.length - 1}
                />
              </td>
              <td className="px-3 py-2 border-b border-g-100">
                <input
                  type="number"
                  step="0.01"
                  value={tier.perUnit}
                  onChange={(e) => updateTier(index, 'perUnit', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2 py-1 text-sm border border-g-200 rounded focus:border-blue focus:outline-none"
                />
              </td>
              <td className="px-3 py-2 border-b border-g-100">
                <input
                  type="number"
                  step="0.01"
                  value={tier.fixed}
                  onChange={(e) => updateTier(index, 'fixed', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2 py-1 text-sm border border-g-200 rounded focus:border-blue focus:outline-none"
                />
              </td>
              <td className="px-3 py-2 border-b border-g-100 text-center">
                {tiers.length > 2 && index < tiers.length - 1 && (
                  <button
                    onClick={() => removeTier(index)}
                    className="text-red text-sm hover:opacity-70"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addTier}
        className="mt-3 text-sm text-blue font-medium hover:opacity-80"
      >
        + Add tier
      </button>
    </div>
  )
}
